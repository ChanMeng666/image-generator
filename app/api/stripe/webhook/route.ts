import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { addCredits } from "@/lib/credits";
import { errors } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return errors.webhookError("missing_signature");
    }

    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch {
      return errors.webhookError("invalid_signature");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const creditAmount = parseInt(session.metadata?.creditAmount || "0");

      if (!userId || !creditAmount) {
        return errors.webhookError("missing_metadata");
      }

      await addCredits(userId, creditAmount, session.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(JSON.stringify({ error: "webhook_failed", detail: String(error) }));
    return errors.internalError();
  }
}
