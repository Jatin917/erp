import { HTTP_STATUS } from "@src/lib/http-codes.js";
import { sendError, sendSuccess } from "@src/lib/utils.js";
import { prisma } from "@src/server.js";


export const createDiscountPolicy = async (req: any, res: any) => {
  try {
    const { name, description, discountType, percentage, amount, usageLimit, expiryDate, branchId } = req.body;

    if (!name || !discountType || !branchId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Name and discountType and branchId required" });
    }

    if (discountType === "PERCENTAGE" && !percentage) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Percentage required for percentage discount" });
    }

    if (discountType === "FIXED" && !amount) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Amount required for fixed discount" });
    }

    const policy = await prisma.discountPolicy.create({
      data: {
        branchId,
        name,
        description,
        discountType,
        percentage,
        amount,
        usageLimit,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({ success: true, message: "DiscountPolicy created", data: { policy } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const listDiscountPolicies = async (req: any, res: any) => {
  try {
    const { branchId } = req.params;

    if (!branchId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Branch required", success: false });
    }

    const policies = await prisma.discountPolicy.findMany({
      where: { branchId },
      orderBy: { createdAt: "desc" },
      include: { discounts: true },
    });

    const currTime = new Date();

    const formattedDiscounts = policies.filter((policy) => {
      const expiryValid = policy.expiryDate
        ? new Date(policy.expiryDate) >= currTime
        : true; // if no expiry, always valid

      const usageValid = policy.usageLimit
        ? policy.usageLimit > policy.discounts.length
        : true; // if no limit, always valid

      return expiryValid && usageValid;
    });

    return sendSuccess(
      res,
      "DiscountPolicies fetched",
      { policies:formattedDiscounts },
      HTTP_STATUS.OK
    );
  } catch (err: any) {
    return sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};


export const applyDiscount = async (req: any, res: any) => {
  try {
    const { feeDocId, transactionId, feeTemplateId, policyId } = req.body;

    if (!policyId || (!feeDocId && !transactionId && !feeTemplateId)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({
          success: false,
          message:
            "policyId and at least one of feeDocId, transactionId, or feeTemplateId required",
        });
    }
    const policy = await prisma.discountPolicy.findUnique({
      where: { id: policyId },
    });
    if (!policy) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "DiscountPolicy not found" });
    }

    // ---------- Validation ----------
    if (policy.expiryDate && new Date(policy.expiryDate) < new Date()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "DiscountPolicy expired" });
    }

    if (policy.usageLimit !== null) {
      const usedCount = await prisma.discount.count({ where: { policyId } });
      if (usedCount >= policy.usageLimit) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({
            success: false,
            message: "DiscountPolicy usage limit reached",
          });
      }
    }

    // ---------- Applied Amount ----------
    let baseAmount = 0;

    if (feeDocId) {
      const feeDoc = await prisma.feeDoc.findUnique({
        where: { id: feeDocId },
        include: { discounts: true },
      });
      if (!feeDoc) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ success: false, message: "FeeDoc not found" });
      }

      // isAlreadyApplied check
      const isAlreadyApplied = feeDoc.discounts.some(
        (d) => d.policyId === policyId
      );
      if (isAlreadyApplied) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ success: false, message: "Discount already applied" });
      }

      baseAmount = feeDoc.amount ?? 0;
    } else if (feeTemplateId) {
      const template = await prisma.feeTemplate.findUnique({
        where: { id: feeTemplateId },
        include: { discounts: true },
      });
      if (!template) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ success: false, message: "FeeTemplate not found" });
      }

      // isAlreadyApplied check
      const isAlreadyApplied = template.discounts.some(
        (d) => d.policyId === policyId
      );
      if (isAlreadyApplied) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ success: false, message: "Discount already applied" });
      }

      baseAmount = template.amount ?? 0;
    } else if (transactionId) {
      const txn = await prisma.feeTransaction.findUnique({
        where: { id: transactionId },
        include: { discounts: true },
      });
      if (!txn) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ success: false, message: "Transaction not found" });
      }

      // isAlreadyApplied check
      const isAlreadyApplied = txn.discounts.some(
        (d) => d.policyId === policyId
      );
      if (isAlreadyApplied) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json({ success: false, message: "Discount already applied" });
      }

      baseAmount = txn.amountPaid ?? 0;
    }

    // ---------- Calculate Discount ----------
    let appliedAmount = 0;
    if (policy.discountType === "PERCENTAGE") {
      appliedAmount = ((policy.percentage ?? 0) / 100) * baseAmount;
    } else if (policy.discountType === "FIXED") {
      appliedAmount = policy.amount ?? 0;
    }

    // ---------- Create Discount ----------
    const discount = await prisma.discount.create({
      data: {
        feeDocId:feeDocId?feeDocId:null,
        feeTemplateId:feeTemplateId?feeTemplateId:null,
        transactionId:transactionId?transactionId:null,
        policyId,
        appliedAmount,
      },
    });

    return res.json({
      success: true,
      message: "Discount applied successfully",
      data: { discount },
    });
  } catch (err: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};




// -------------------- Get Discounts by Transaction --------------------
export const getDiscountsById = async (req: any, res: any) => {
  try {
    const { transactionId, feeTemplateId, feeDocId } = req.query;
    if(!feeDocId && !feeTemplateId && !transactionId){
        return sendError(res, "Id is required", HTTP_STATUS.BAD_REQUEST);
    }
    const discounts = await prisma.discount.findMany({ where: { transactionId:transactionId?transactionId:null, feeTemplateId:feeTemplateId?feeTemplateId:null, feeDocId:feeDocId?feeDocId:null } });
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Discounts fetched successfully",
      data: { discounts },
    });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

// -------------------- Update DiscountPolicy --------------------
export const updateDiscountPolicy = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, description, discountType, percentage, amount, usageLimit, expiryDate } = req.body;

    const policy = await prisma.discountPolicy.update({
      where: { id },
      data: {
        name,
        description,
        discountType,
        percentage,
        amount,
        usageLimit,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "DiscountPolicy updated successfully",
      data: { policy },
    });
  } catch (err: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};

// -------------------- Delete DiscountPolicy --------------------
export const deleteDiscountPolicy = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    await prisma.discountPolicy.delete({
      where: { id },
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "DiscountPolicy deleted successfully",
    });
  } catch (err: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};

// -------------------- Delete Applied Discount --------------------
export const deleteAppliedDiscount = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    await prisma.discount.delete({
      where: { id },
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Applied discount deleted successfully",
    });
  } catch (err: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};


export const createLateFee = async (req: any, res: any) => {
  try {
    const { templateId, feeDocId, amount, reason } = req.body;

    if (!(feeDocId || templateId) || !amount) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "feeDocId or templateId and amount are required",
      });
    }

    const lateFee = await prisma.lateFee.create({
      data: { feeDocId:feeDocId, feeTemplateId:templateId, amount, reason: reason || null },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Late fee created successfully",
      data: { lateFee },
    });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

// -------------------- Get LateFees by ID --------------------
export const getLateFeeById = async (req: any, res: any) => {
  try {
    const { feeDocId, templateId, feeTransactionId } = req.query;
    if(!feeDocId && !templateId && !feeTransactionId){
        return sendError(res, "Id is required", HTTP_STATUS.BAD_REQUEST);
    }
    const lateFees = await prisma.lateFee.findMany({where:{feeDocId:feeDocId??null, feeTemplateId:templateId??null, transactionId:feeTransactionId??null}});
    return sendSuccess(res, "Late Fee Feteched Successfully", lateFees)
  } catch (err: any) {
    return sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
};

// -------------------- Update LateFee --------------------
export const updateLateFee = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const lateFee = await prisma.lateFee.update({
      where: { id },
      data: { amount, reason },
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Late fee updated successfully",
      data: { lateFee },
    });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

// -------------------- Delete LateFee --------------------
export const deleteLateFee = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    await prisma.lateFee.delete({ where: { id } });

    return res.status(HTTP_STATUS.NO_CONTENT).json({
      success: true,
      message: "Late fee deleted successfully",
    });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};