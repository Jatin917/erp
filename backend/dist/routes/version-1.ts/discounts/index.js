import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { sendError, sendSuccess } from "../../../lib/utils.js";
import { prisma } from "../../../server.js";
export const createDiscountPolicy = async (req, res) => {
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
    }
    catch (err) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
};
export const listDiscountPolicies = async (req, res) => {
    try {
        const branchId = req.params.branchId;
        if (!branchId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Branch required", success: false });
        }
        const policies = await prisma.discountPolicy.findMany({ where: { branchId },
            orderBy: { createdAt: "desc" },
        });
        return sendSuccess(res, "DiscountPolicies fetched", { policies }, HTTP_STATUS.OK);
    }
    catch (err) {
        return sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const applyDiscount = async (req, res) => {
    try {
        const { feeDocId, transactionId, feeTemplateId, policyId } = req.body;
        if (!policyId || (!feeDocId && !transactionId && !feeTemplateId)) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: "policyId and at least one of feeDocId, transactionId, or feeTemplateId required" });
        }
        const policy = await prisma.discountPolicy.findUnique({ where: { id: policyId } });
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
                    .json({ success: false, message: "DiscountPolicy usage limit reached" });
            }
        }
        // ---------- Applied Amount ----------
        let baseAmount = 0;
        if (feeDocId) {
            const feeDoc = await prisma.feeDoc.findUnique({ where: { id: feeDocId } });
            if (!feeDoc) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json({ success: false, message: "FeeDoc not found" });
            }
            baseAmount = feeDoc.amount ?? 0;
        }
        else if (feeTemplateId) {
            const template = await prisma.feeTemplate.findUnique({ where: { id: feeTemplateId } });
            if (!template) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json({ success: false, message: "FeeTemplate not found" });
            }
            baseAmount = template.amount ?? 0;
        }
        else if (transactionId) {
            const txn = await prisma.feeTransaction.findUnique({ where: { id: transactionId } });
            if (!txn) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json({ success: false, message: "Transaction not found" });
            }
            baseAmount = txn.amountPaid ?? 0;
        }
        let appliedAmount = 0;
        if (policy.discountType === "PERCENTAGE") {
            appliedAmount = (policy.percentage ?? 0) / 100 * baseAmount;
        }
        else if (policy.discountType === "FIXED") {
            appliedAmount = policy.amount ?? 0;
        }
        // ---------- Create Discount ----------
        const discount = await prisma.discount.create({
            data: {
                feeDocId,
                feeTemplateId,
                transactionId,
                policyId,
                appliedAmount,
            },
        });
        return res.json({
            success: true,
            message: "Discount applied successfully",
            data: { discount },
        });
    }
    catch (err) {
        return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: err.message });
    }
};
// -------------------- Get Discounts by Transaction --------------------
export const getDiscountsByTransaction = async (req, res) => {
    try {
        const { feeTransactionId } = req.params;
        const discounts = await prisma.discount.findMany({ where: { transactionId: feeTransactionId } });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Discounts fetched successfully",
            data: { discounts },
        });
    }
    catch (err) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
};
// -------------------- Update DiscountPolicy --------------------
export const updateDiscountPolicy = async (req, res) => {
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
    }
    catch (err) {
        return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: err.message });
    }
};
// -------------------- Delete DiscountPolicy --------------------
export const deleteDiscountPolicy = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.discountPolicy.delete({
            where: { id },
        });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "DiscountPolicy deleted successfully",
        });
    }
    catch (err) {
        return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: err.message });
    }
};
// -------------------- Delete Applied Discount --------------------
export const deleteAppliedDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.discount.delete({
            where: { id },
        });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Applied discount deleted successfully",
        });
    }
    catch (err) {
        return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: err.message });
    }
};
export const createLateFee = async (req, res) => {
    try {
        const { feeTransactionId, amount, reason } = req.body;
        if (!feeTransactionId || !amount) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "feeTransactionId and amount are required",
            });
        }
        const lateFee = await prisma.lateFee.create({
            data: { transactionId: feeTransactionId, amount, reason: reason || null },
        });
        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Late fee created successfully",
            data: { lateFee },
        });
    }
    catch (err) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
};
// -------------------- Get LateFees by Transaction --------------------
export const getLateFeesByTransaction = async (req, res) => {
    try {
        const { feeTransactionId } = req.params;
        const lateFees = await prisma.lateFee.findMany({ where: { transactionId: feeTransactionId } });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Late fees fetched successfully",
            data: { lateFees },
        });
    }
    catch (err) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
};
// -------------------- Update LateFee --------------------
export const updateLateFee = async (req, res) => {
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
    }
    catch (err) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
};
// -------------------- Delete LateFee --------------------
export const deleteLateFee = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.lateFee.delete({ where: { id } });
        return res.status(HTTP_STATUS.NO_CONTENT).json({
            success: true,
            message: "Late fee deleted successfully",
        });
    }
    catch (err) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
};
//# sourceMappingURL=index.js.map