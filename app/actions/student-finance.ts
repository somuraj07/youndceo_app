"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { invalidateStudentFinance } from "@/lib/cache";

export type FinanceActionState = {
  error?: string;
  success?: string;
};

async function requireStudent() {
  const session = await auth();

  if (!session?.user?.id || session.user.role === "ADMIN") {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

async function afterFinanceChange(userId: string) {
  await invalidateStudentFinance(userId);
  revalidatePath("/home");
  revalidatePath("/portfolio");
  revalidatePath("/spend");
  revalidatePath("/news");
}

export async function createGoal(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const title = formData.get("title")?.toString().trim();
    const targetAmount = Number(formData.get("targetAmount"));
    const currentAmount = Number(formData.get("currentAmount") ?? 0);
    const deadlineRaw = formData.get("deadline")?.toString().trim();

    if (!title || Number.isNaN(targetAmount) || targetAmount <= 0) {
      return { error: "Title and a valid target amount are required." };
    }

    await prisma.goal.create({
      data: {
        userId,
        title,
        targetAmount,
        currentAmount: Number.isNaN(currentAmount) ? 0 : Math.max(0, currentAmount),
        deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      },
    });

    await afterFinanceChange(userId);
    return { success: "Goal created." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create goal.",
    };
  }
}

export async function updateGoalProgress(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const goalId = formData.get("goalId")?.toString();
    const currentAmount = Number(formData.get("currentAmount"));

    if (!goalId || Number.isNaN(currentAmount) || currentAmount < 0) {
      return { error: "Valid goal and amount required." };
    }

    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      return { error: "Goal not found." };
    }

    await prisma.goal.update({
      where: { id: goalId },
      data: { currentAmount },
    });

    await afterFinanceChange(userId);
    return { success: "Goal updated." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update goal.",
    };
  }
}

export async function updateGoal(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const goalId = formData.get("goalId")?.toString();
    const title = formData.get("title")?.toString().trim();
    const targetAmount = Number(formData.get("targetAmount"));
    const currentAmount = Number(formData.get("currentAmount"));

    if (!goalId || !title || Number.isNaN(targetAmount) || targetAmount <= 0) {
      return { error: "Valid goal details required." };
    }

    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      return { error: "Goal not found." };
    }

    await prisma.goal.update({
      where: { id: goalId },
      data: {
        title,
        targetAmount,
        currentAmount: Number.isNaN(currentAmount)
          ? goal.currentAmount
          : Math.max(0, currentAmount),
      },
    });

    await afterFinanceChange(userId);
    return { success: "Goal saved." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to save goal.",
    };
  }
}

export async function deleteGoal(goalId: string) {
  const userId = await requireStudent();
  await prisma.goal.deleteMany({ where: { id: goalId, userId } });
  await afterFinanceChange(userId);
}

async function ensureCashWallet(userId: string) {
  return prisma.cashWallet.upsert({
    where: { userId },
    create: { userId, balance: 0 },
    update: {},
  });
}

export async function adjustCash(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const amount = Number(formData.get("amount"));
    const action = formData.get("action")?.toString() as "deposit" | "withdraw";

    if (Number.isNaN(amount) || amount <= 0 || !action) {
      return { error: "Enter a valid amount." };
    }

    const wallet = await ensureCashWallet(userId);

    if (action === "withdraw" && wallet.balance < amount) {
      return { error: "Not enough cash in piggy bank." };
    }

    await prisma.cashWallet.update({
      where: { userId },
      data: {
        balance:
          action === "deposit"
            ? { increment: amount }
            : { decrement: amount },
      },
    });

    await afterFinanceChange(userId);
    return {
      success: action === "deposit" ? "Cash deposited." : "Cash withdrawn.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Cash update failed.",
    };
  }
}

export async function createSavingsAccount(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const name = formData.get("name")?.toString().trim();

    if (!name) {
      return { error: "Account name is required." };
    }

    await prisma.savingsAccount.create({
      data: { userId, name, balance: 0 },
    });

    await afterFinanceChange(userId);
    return { success: "Savings account created." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create account.",
    };
  }
}

export async function adjustSavings(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const accountId = formData.get("accountId")?.toString();
    const amount = Number(formData.get("amount"));
    const action = formData.get("action")?.toString() as "deposit" | "withdraw";

    if (!accountId || Number.isNaN(amount) || amount <= 0 || !action) {
      return { error: "Valid account and amount required." };
    }

    const account = await prisma.savingsAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      return { error: "Savings account not found." };
    }

    if (action === "withdraw" && account.balance < amount) {
      return { error: "Insufficient savings balance." };
    }

    await prisma.savingsAccount.update({
      where: { id: accountId },
      data: {
        balance:
          action === "deposit"
            ? { increment: amount }
            : { decrement: amount },
      },
    });

    await afterFinanceChange(userId);
    return { success: "Savings updated." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Savings update failed.",
    };
  }
}

export async function deleteSavingsAccount(accountId: string) {
  const userId = await requireStudent();
  await prisma.savingsAccount.deleteMany({ where: { id: accountId, userId } });
  await afterFinanceChange(userId);
}

export async function createExpense(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const title = formData.get("title")?.toString().trim();
    const amount = Number(formData.get("amount"));
    const category = formData.get("category")?.toString().trim() || "General";
    const kindRaw = formData.get("kind")?.toString().trim().toUpperCase();
    const kind = kindRaw === "INCOME" ? "INCOME" : "EXPENSE";
    const spentAtRaw = formData.get("spentAt")?.toString().trim();

    if (!title || Number.isNaN(amount) || amount <= 0) {
      return { error: "Title and a valid amount are required." };
    }

    await prisma.expense.create({
      data: {
        userId,
        title,
        amount,
        category,
        kind,
        spentAt: spentAtRaw ? new Date(spentAtRaw) : new Date(),
      },
    });

    await afterFinanceChange(userId);
    return {
      success: kind === "INCOME" ? "Income added." : "Expense added.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to add entry.",
    };
  }
}

export async function deleteExpense(expenseId: string) {
  const userId = await requireStudent();
  await prisma.expense.deleteMany({ where: { id: expenseId, userId } });
  await afterFinanceChange(userId);
}

export async function updateExpense(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const expenseId = formData.get("expenseId")?.toString();
    const title = formData.get("title")?.toString().trim();
    const amount = Number(formData.get("amount"));
    const category = formData.get("category")?.toString().trim() || "General";

    if (!expenseId || !title || Number.isNaN(amount) || amount <= 0) {
      return { error: "Valid expense details required." };
    }

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!expense) {
      return { error: "Expense not found." };
    }

    await prisma.expense.update({
      where: { id: expenseId },
      data: { title, amount, category },
    });

    await afterFinanceChange(userId);
    return { success: "Expense updated." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update expense.",
    };
  }
}

export async function updateSavingsAccount(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const accountId = formData.get("accountId")?.toString();
    const name = formData.get("name")?.toString().trim();

    if (!accountId || !name) {
      return { error: "Account name required." };
    }

    const account = await prisma.savingsAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      return { error: "Account not found." };
    }

    await prisma.savingsAccount.update({
      where: { id: accountId },
      data: { name },
    });

    await afterFinanceChange(userId);
    return { success: "Account renamed." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to rename account.",
    };
  }
}

export async function createSipPlan(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const name = formData.get("name")?.toString().trim();
    const monthlyAmount = Number(formData.get("monthlyAmount"));
    const expectedRate = Number(formData.get("expectedRate") ?? 12);
    const years = Number(formData.get("years") ?? 10);
    const fundSymbol = formData.get("fundSymbol")?.toString().trim();

    if (!name || Number.isNaN(monthlyAmount) || monthlyAmount <= 0) {
      return { error: "SIP name and monthly amount required." };
    }

    await prisma.sipPlan.create({
      data: {
        userId,
        name,
        monthlyAmount,
        expectedRate: Number.isNaN(expectedRate) ? 12 : expectedRate,
        years: Number.isNaN(years) ? 10 : years,
        fundSymbol: fundSymbol || null,
      },
    });

    await afterFinanceChange(userId);
    return { success: "SIP plan added." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create SIP.",
    };
  }
}

export async function updateSipPlan(
  _prev: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  try {
    const userId = await requireStudent();
    const sipId = formData.get("sipId")?.toString();
    const name = formData.get("name")?.toString().trim();
    const monthlyAmount = Number(formData.get("monthlyAmount"));
    const expectedRate = Number(formData.get("expectedRate"));
    const years = Number(formData.get("years"));
    const fundSymbol = formData.get("fundSymbol")?.toString().trim();

    if (!sipId || !name || Number.isNaN(monthlyAmount) || monthlyAmount <= 0) {
      return { error: "Valid SIP details required." };
    }

    const sip = await prisma.sipPlan.findFirst({
      where: { id: sipId, userId },
    });

    if (!sip) {
      return { error: "SIP plan not found." };
    }

    await prisma.sipPlan.update({
      where: { id: sipId },
      data: {
        name,
        monthlyAmount,
        expectedRate: Number.isNaN(expectedRate) ? sip.expectedRate : expectedRate,
        years: Number.isNaN(years) ? sip.years : years,
        fundSymbol: fundSymbol || null,
      },
    });

    await afterFinanceChange(userId);
    return { success: "SIP plan updated." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update SIP.",
    };
  }
}

export async function deleteSipPlan(sipId: string) {
  const userId = await requireStudent();
  await prisma.sipPlan.deleteMany({ where: { id: sipId, userId } });
  await afterFinanceChange(userId);
}
