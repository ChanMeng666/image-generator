import { getDb } from "./db";
import { credits, creditTransactions } from "./db/schema";
import { eq, sql, desc } from "drizzle-orm";

export { CREDIT_PACKAGES, getPackageById } from "./credit-packages";
export type { CreditPackageId } from "./credit-packages";

export async function checkBalance(userId: string): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ balance: credits.balance })
    .from(credits)
    .where(eq(credits.userId, userId))
    .limit(1);

  return result[0]?.balance ?? 0;
}

export async function deductCredit(
  userId: string,
  imageId: string
): Promise<{ success: boolean; newBalance: number }> {
  const db = getDb();

  // Atomic: check balance >= 1, deduct, record transaction
  const currentBalance = await checkBalance(userId);
  if (currentBalance < 1) {
    return { success: false, newBalance: currentBalance };
  }

  // Update balance
  const updated = await db
    .update(credits)
    .set({
      balance: sql`${credits.balance} - 1`,
      updatedAt: new Date(),
    })
    .where(eq(credits.userId, userId))
    .returning({ balance: credits.balance });

  if (!updated[0] || updated[0].balance < 0) {
    // Race condition: restore and fail
    await db
      .update(credits)
      .set({
        balance: sql`${credits.balance} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(credits.userId, userId));
    return { success: false, newBalance: 0 };
  }

  // Record transaction
  await db.insert(creditTransactions).values({
    userId,
    amount: -1,
    type: "generation",
    imageId,
  });

  return { success: true, newBalance: updated[0].balance };
}

export async function addCredits(
  userId: string,
  amount: number,
  stripeSessionId: string
): Promise<{ success: boolean; newBalance: number }> {
  const db = getDb();

  // Idempotency: check if this stripe session was already processed
  const existing = await db
    .select({ id: creditTransactions.id })
    .from(creditTransactions)
    .where(eq(creditTransactions.stripeSessionId, stripeSessionId))
    .limit(1);

  if (existing.length > 0) {
    const balance = await checkBalance(userId);
    return { success: true, newBalance: balance };
  }

  // Upsert credits balance
  await db
    .insert(credits)
    .values({ userId, balance: amount })
    .onConflictDoUpdate({
      target: credits.userId,
      set: {
        balance: sql`${credits.balance} + ${amount}`,
        updatedAt: new Date(),
      },
    });

  // Record transaction
  await db.insert(creditTransactions).values({
    userId,
    amount,
    type: "purchase",
    stripeSessionId,
  });

  const newBalance = await checkBalance(userId);
  return { success: true, newBalance };
}

export async function getRecentTransactions(userId: string, limit = 20) {
  const db = getDb();
  return db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit);
}
