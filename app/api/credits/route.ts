import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkBalance, getRecentTransactions } from "@/lib/credits";
import { errors } from "@/lib/errors";

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return errors.unauthorized();
    }

    const [balance, transactions] = await Promise.all([
      checkBalance(session.user.id),
      getRecentTransactions(session.user.id),
    ]);

    return NextResponse.json({ balance, transactions });
  } catch (error) {
    console.error(JSON.stringify({ error: "credits_fetch_failed", detail: String(error) }));
    return errors.internalError();
  }
}
