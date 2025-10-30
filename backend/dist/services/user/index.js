import { defaultPassword, prisma } from "../../server.js";
import bcrypt from "bcrypt";
export const getUserService = async (where, include) => {
    const user = await prisma.user.findFirst({
        where,
        include
    });
    return user;
};
export async function findOrCreateUser({ name, email, phone, role, tx, }) {
    const db = tx || prisma; // ✅ choose between tx or global client
    if (!email)
        return null;
    // 1️⃣ Check if user exists
    let user = await db.user.findFirst({
        where: { OR: [{ email }, { phone }] },
    });
    // 2️⃣ If exists → update role list if not already added
    if (user) {
        if (!user.role.includes(role)) {
            user = await db.user.update({
                where: { id: user.id },
                data: { role: { push: role } },
            });
        }
        return user;
    }
    // 3️⃣ If not found → create new user
    const hashedPwd = await bcrypt.hash(defaultPassword, 10);
    return db.user.create({
        data: {
            name,
            email,
            phone,
            password: hashedPwd,
            role: [role],
            isEmailVerified: false,
            isPhoneVerified: false,
        },
    });
}
//# sourceMappingURL=index.js.map