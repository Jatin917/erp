import { prisma } from "@src/server.js";

export async function processFeePayment(
  tx: any,
  feePaymentId: string,
  amount: number,
  mode: string,
  referenceId: string | null,
  remarks: string | null,
  createdById: string
) {
  const feePayment = await tx.feePayment.findUnique({
    where: { id: feePaymentId },
    include: {
      feeDoc: { include: { eenrollment: true } },
      lateFees: true,
    },
  });

  if (!feePayment) {
    throw new Error("FeePayment not found");
  }

  if (feePayment.isPaid) {
    throw new Error("This payment is already fully paid");
  }

  const lateFeesOfCurrentFeeDoc = await tx.lateFee.findMany({
    where: { feeDocId: feePayment.feeDocId },
  });
  const alreadyAppliedLateFees = feePayment.lateFees;
  const appliedIds = new Set(alreadyAppliedLateFees.map((f:any) => f.id));
  const newLateFees = lateFeesOfCurrentFeeDoc.filter(
    (fee:any) => !appliedIds.has(fee.id)
  );

  let totalLateFeeAmt = 0;
  const alreadyPaid = feePayment.paidAmount || 0;
  let remaining = feePayment.amount - alreadyPaid;

  // check due date
  const currentDate = new Date();
  const dueDate = new Date(feePayment.dueDate);
  if (dueDate < currentDate) {
    for (const lateFee of newLateFees) {
      totalLateFeeAmt += lateFee.amount;
    }
    remaining += totalLateFeeAmt;
    await tx.feePayment.update({
      where: { id: feePayment.id },
      data: {
        fineAmount: totalLateFeeAmt,
        lateFees: { set: newLateFees.map((fee:any) => ({ id: fee.id })) },
      },
    });
    await tx.feeDoc.update({where:{id:feePayment.feeDocId}, data:{afterAmount:{increment:totalLateFeeAmt}}})
  }

  // Round remaining and requested amount to 2 decimals to avoid floating-point precision issues
  const remainingRounded = Number(remaining.toFixed(2));
  const requestedRounded = Number(amount.toFixed(2));

  if (requestedRounded > remainingRounded) {
    throw new Error(`You can pay max ${remainingRounded.toFixed(2)} for this payment`);
  }

  const receiptNo = `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // 1. Create transaction
  const txn = await tx.feeTransaction.create({
    data: {
      enrollmentId: feePayment.feeDoc!.enrollmentId,
      amountPaid: amount,
      returnedAmt: 0,
      mode,
      referenceId,
      remarks,
      receiptNo,
      createdById,
    },
  });

  // create feePaymentAllocation-> to track which transaction cleared which payment
  await tx.feePaymentAllocation.create({data:{feePaymentId, transactionId:txn.id, allocatedAmount:txn.amountPaid}})

  // 2. Update feePayment
  const updatedPayment = await tx.feePayment.update({
    where: { id: feePaymentId },
    data: {
      paidAmount: { increment: amount },
      fineAmount: totalLateFeeAmt,
      isPaid:
        alreadyPaid + amount >= feePayment.amount + totalLateFeeAmt,
    },
  });

  // 3. Create FeeTransactionItem
  const txnItem = await tx.feeTransactionItem.create({
    data: {
      transactionId: txn.id,
      feeDocId: feePayment.feeDocId,
      paidAmount: amount,
    },
  });

  // 4. Update FeeDoc status based on all related payments
  const allPayments = await tx.feePayment.findMany({
    where: { feeDocId: feePayment.feeDocId },
  });
  const allPaid = allPayments.length > 0 && allPayments.every((p: any) => p.isPaid);

  const doc = await tx.feeDoc.update({
    where: { id: feePayment.feeDocId },
    data: {
      status: allPaid ? "PAID" : "PARTIAL",
    },
  });

  return { txn, txnItem, updatedPayment, doc };
}

export const getStudentFeeDocs = async (where:any, include:any) =>{
  const feeDocs = await prisma.feeDoc.findMany({where, include});
  return feeDocs;
}