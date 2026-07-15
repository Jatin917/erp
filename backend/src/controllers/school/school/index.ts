import { error } from "console";
import { type PrismaClient, type Prisma, Role as rolesAre, customFieldType } from "../../../../generated/prisma/index.js";
import type { DefaultArgs } from "../../../../generated/prisma/runtime/library.js";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { defaultPassword, prisma } from "../../../server.js";
import path from "path";
import bcrypt from 'bcrypt';

import fs from "fs";
import { OTP_TYPE } from "@src/lib/types.js";
import { isEmailVerified } from "@src/services/otp.js";
import { sendError, sendSuccess } from "@src/lib/utils.js";
import { createCustomFieldService, getBranchesService, getBranchService, getCustomFieldsService, getSchoolsWithBranchesService } from "@src/services/school/index.js";
import { getUserService } from "@src/services/user/index.js";
import { createSchoolDays } from "@src/services/attendance/index.js";
import { syncCustomFieldsToRegistry } from "@src/registry/seed/sync-custom-fields.js";
import { mergeRolePermissions } from "@src/lib/apply-role-permissions.js";
import {
	normalizeEmail,
	SCHOOL_FACULTY_ROLES,
	validateDistinctDirectorAndPrincipals,
	validateNoSelfAssignment,
} from "@src/lib/role-grant.js";

const formatBranchOption = (branch: {
  name: string;
  address: string;
  id: string;
  logoUrl: string | null;
  softwareCharge?: number;
}) => ({
  name: `${branch.name} ${branch.address}`,
  id: branch.id,
  logo: branch.logoUrl,
  ...(branch.softwareCharge !== undefined ? { softwareCharge: branch.softwareCharge } : {}),
});

// Updated createBranch to accept tx for transactions
const createBranch = async (tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">, address: any, principalId: any, name: any, schoolId: string, softwareCharge:string) => {
    try {
        const branch = await tx.branch.create({
            data: {
                principal:{connect:{id:principalId}},
                name,
                school:{connect:{id:schoolId}},
                address,
                softwareCharge:parseFloat(softwareCharge)
            }
        });
        return branch;
    } catch (error) {
        console.log(error)
        return null;
    }
};
// ---------- Helper: director/principal must be brand-new users ----------
const createNewLeadershipUser = async (
  role: rolesAre,
  userData: { email: string; name: string; contact: string },
  tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
) => {
  const existingUser = await tx.user.findUnique({
    where: { email: userData.email },
    select: { id: true },
  });
  if (existingUser) {
    throw new Error(
      `${role} must be a new user. An account already exists for ${userData.email}.`,
    );
  }

  const verified = await isEmailVerified(userData.email, OTP_TYPE.VERIFY_OTP);
  if (!verified) {
    throw new Error(`${role} email is not verified. Please verify first.`);
  }

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  const newUser = await tx.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: [role],
      isEmailVerified: true,
      isPhoneVerified: false,
      phone: userData.contact,
      permissions: { set: mergeRolePermissions([], role) },
    },
  });
  return newUser.id;
};

export const createSchool = async (req: any, res: any) => {
  const file = req.file;

  try {
    const {
      schoolName,
      name,
      currentSession,
      softwareCharge,
      startMonthName,
      endMonthName,
    } = req.body;

    const director = req.body.directors ? JSON.parse(req.body.directors) : null;
    const principals = req.body.principals ? JSON.parse(req.body.principals) : null;
    const academicMonths = req.body.academicMonths ? JSON.parse(req.body.academicMonths) : [];

    const finalSchoolName = schoolName || name;
    if (!director || !principals || !finalSchoolName || !currentSession || academicMonths.length === 0) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const directorEmail = director.email?.trim();
    const principalEmails = principals
      .map((p: { email?: string }) => p.email?.trim())
      .filter(Boolean) as string[];

    if (!directorEmail || principalEmails.length !== principals.length) {
      return res.status(400).json({ success: false, message: "Director and principal emails are required" });
    }

    const selfAssignmentError = validateNoSelfAssignment(req.user?.email, [
      directorEmail,
      ...principalEmails,
    ]);
    if (selfAssignmentError) {
      return res.status(400).json({ success: false, message: selfAssignmentError.message });
    }

    const roleSeparationError = validateDistinctDirectorAndPrincipals(
      directorEmail,
      principalEmails,
    );
    if (roleSeparationError) {
      return res.status(400).json({ success: false, message: roleSeparationError.message });
    }

    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [directorEmail, ...principalEmails].map((email) => ({
          email: { equals: email, mode: "insensitive" as const },
        })),
      },
      select: { email: true },
    });

    if (existingUsers.length > 0) {
      const emails = existingUsers.map((u) => u.email).join(", ");
      return res.status(400).json({
        success: false,
        message: `Director and principal must be new users. Account already exists for: ${emails}`,
      });
    }

    let schoolId = "";
    const branchIds: string[] = [];

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Create director (new user only)
      const directorId = await createNewLeadershipUser("DIRECTOR", director, tx);

      // Block duplicate: same director + school name + principal
      const normalizedPrincipalEmails = principalEmails.map((email) => normalizeEmail(email));

      const existingSchool = await tx.school.findFirst({
        where: {
          name: { equals: finalSchoolName.trim(), mode: "insensitive" },
          createdById: directorId,
        },
        include: {
          branches: {
            include: {
              principal: { select: { email: true } },
            },
          },
        },
      });

      if (existingSchool && normalizedPrincipalEmails.length > 0) {
        const existingPrincipalEmails = new Set(
          existingSchool.branches
            .map((b) => b.principal?.email?.trim().toLowerCase())
            .filter(Boolean),
        );
        const duplicatePrincipal = normalizedPrincipalEmails.find((email) => existingPrincipalEmails.has(email));
        if (duplicatePrincipal) {
          throw new Error(
            `A school named "${finalSchoolName}" with this director and principal already exists.`,
          );
        }
      }

      // 2️⃣ Create school
      const school = await tx.school.create({
        data: { name: finalSchoolName, createdById: directorId },
      });
      schoolId = school.id;

      // 3️⃣ Create branches + academic sessions
      for (const principal of principals) {
        const principalId = await createNewLeadershipUser("PRINCIPAL", principal, tx);

        const branch = await createBranch(
          tx,
          principal.branch.address,
          principalId,
          finalSchoolName,
          school.id,
          softwareCharge
        );
        if(!branch){
          throw new Error("Branch don't exist");
        }
        branchIds.push(branch.id);

        // 🔹 Create academic months first
        const session = await tx.academicSession.create({
          data: { name: currentSession,  branch: { connect: { id: branch.id } }, isCurrent: true },
        });

        const createdMonths = await Promise.all(
          academicMonths.map((m: any) =>
            tx.academicMonth.create({
              data: {
                name: m.name,
                startDate: new Date(m.startDate),
                endDate: new Date(m.endDate),
                sessionId: session.id,
              },
            })
          )
        );

        // 🔹 Link start and end months correctly
        const startMonth = createdMonths.find((m) => m.name === startMonthName);
        const endMonth = createdMonths.find((m) => m.name === endMonthName);

        if (!startMonth || !endMonth) throw new Error("Start or End month not found");

        // 🔹 Create school days within session duration
        await createSchoolDays({
          tx,
          sessionId: session.id,
          startDate: startMonth.startDate,
          endDate: endMonth.endDate,
          workingDays: [1, 2, 3, 4, 5, 6],
        });

        // 🔹 Update academic session after month creation
        await tx.academicSession.update({
          where: { id: session.id },
          data: {
            startMonthId: startMonth.id,
            endMonthId: endMonth.id,
          },
        });
      }

      if (!file) throw new Error("Logo file missing");
    });

    // 4️⃣ File upload (outside transaction)
    for (const branchId of branchIds) {
      const uploadDir = path.join("uploads", schoolId, branchId);
      fs.mkdirSync(uploadDir, { recursive: true });

      const ext = path.extname(file.originalname);
      const destPath = path.join(uploadDir, `logo${ext}`);

      fs.renameSync(file.path, destPath);

      await prisma.branch.update({
        where: { id: branchId },
        data: { logoUrl: destPath },
      });
    }

    res.status(201).json({
      success: true,
      message: "School, branches, session & academic months created successfully",
    });
  } catch (error: any) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(400).json({ success: false, message: error.message });
  }
};



  
export const getSchools = async (req: any, res: any) => {
  try {
    console.log("req.user", req.user)
    const { email } = req.user; // email of the "guy"
    console.log("email is ", email)
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: email",
      });
    }

    // find user by email
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let schools: any[] = [];

    if (user.role.includes(rolesAre.SUPERADMIN)) {
      // SUPERADMIN → return all schools
      schools = await prisma.school.findMany({
        include: {
          branches: {
            select: {
              id: true,
              logoUrl: true,
              softwareCharge:true
            },
          },
        },
      });
    } else if (user.role.includes(rolesAre.DIRECTOR)) {
      // DIRECTOR → only schools created by this user
      schools = await prisma.school.findMany({
        where: { createdById: user.id },
        include: {
          branches: {
            select: {
              id: true,
              logoUrl: true,
              softwareCharge:true,
            },
          },
        },
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized to fetch schools",
      });
    }

    const formatted = schools.map((school) => {
      const branchCount = school.branches.length;
      const logo = branchCount > 0 ? school.branches[0].logoUrl : null;
      const softwareCharge = branchCount > 0 ? school.branches[0].softwareCharge : 0;
      console.log(school.branches.length, softwareCharge, school.branches);
      return {
        sid: school.id,
        id: school.id, // same as sid
        logo,
        branchCount,
        softwareCharge
      };
    });

    return res.status(200).json({
      success: true,
      message: "Schools fetched successfully",
      data: {schools:formatted},
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteSchool = async (req:any, res:any) =>{
  try {
    
  } catch (error) {
    
  }
}

export const editSchool = async (req:any, res:any) =>{
  try {
    
  } catch (error) {
    
  }
}

export const getBranches = async (req: any, res: any) => {
  let { email:createdBy } = req.user;
  if (!createdBy) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ success: false, message: "Fill required fields" });
  }
  let schools: any[] = [];
  try {

    const user = await getUserService({ email:createdBy })
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "User not found" });
    }
    const roles = user.role;
    // SUPERADMIN: return all branches
    if (roles.includes(rolesAre.SUPERADMIN)) {
      const branches = await getBranchesService({},{academicSession:true});
      schools = branches.map((branch) => formatBranchOption(branch));
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Found All Branches",
        data:{schools},
      });
    }

    // DIRECTOR: get schools + their branches
    if (roles.includes(rolesAre.DIRECTOR)) {
      const foundSchools = await getSchoolsWithBranchesService({ createdById: user.id });

      // Flatten all branches from all schools and format them
      foundSchools.forEach((school) => {
        if (school.branches?.length) {
          school.branches.forEach((branch) => {
            schools.push(formatBranchOption(branch));
          });
        }
      });
    }

    // PRINCIPAL: get branches directly assigned
    if (roles.includes(rolesAre.PRINCIPAL)) {
      const foundBranches = await getBranchesService({ principalId: user.id });
      schools = foundBranches.map((branch) => formatBranchOption(branch));
    }

    const hasSchoolFacultyRole = roles.some((role) =>
      (SCHOOL_FACULTY_ROLES as readonly rolesAre[]).includes(role),
    );
    if (hasSchoolFacultyRole && schools.length === 0) {
      const faculty = await prisma.schoolFaculty.findUnique({
        where: { userId: user.id },
        include: { branch: true },
      });

      if (faculty?.branch) {
        schools = [formatBranchOption(faculty.branch)];
      }
    }
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Found All Branches",
      data:{schools},
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
  
export const createCustomFields = async (req: any, res: any) => {
  try {
    const { name, label, entityType, type, options, required, branchId } = req.body;
    const createdById = req.user.id;
    if (!branchId || !name || !label || !entityType || !type || !createdById) {
      return sendError(res, "Missing required fields", HTTP_STATUS.BAD_REQUEST);
    }
    if((type===customFieldType.MULTISELECT || type===customFieldType.SELECT || type===customFieldType.RADIO || type===customFieldType.CHECKBOX) && !options){
      return sendError(res, "Options are required with this fields", HTTP_STATUS.BAD_REQUEST)
    }

    const branch = await getBranchService({id:branchId});
    if (!branch) {
      return sendError(res, "Branch not found", HTTP_STATUS.NOT_FOUND);
    }

    const alreadyCustomField = await getCustomFieldsService({name, branchId});
    if(alreadyCustomField.length>0){
      return sendError(res, "Custom field with this name already exist", HTTP_STATUS.CONFLICT);
    }
    const customField = await createCustomFieldService(name, label, entityType, type, options, required, branchId, createdById)
    if(!customField){
      return sendError(res, "Error Creating Custom Field", HTTP_STATUS.SERVICE_UNAVAILABLE);
    }
    await syncCustomFieldsToRegistry();
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: customField,
    });
  } catch (error) {
    console.error("Error creating custom field:", (error as Error).message);
    return sendError(res, (error as Error).message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export const getCustomFields = async (req:any, res:any) =>{
  try {
    const branchId = req.query.branchId;
    const entityType = req.query.entityType;
    if(!branchId){
      return sendError(res, "Missing Fields", HTTP_STATUS.BAD_REQUEST)
    }
    const customFields = await getCustomFieldsService({branchId, entityType});
    return sendSuccess(res, "Successfully Fetched Data", {fields:customFields}, HTTP_STATUS.OK)
  } catch (error) {
    return sendError(res, (error as Error).message, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

