import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getPackageById } from "@/lib/credit-packages";
import { getDb } from "@/lib/db";
import { stripeCustomers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { errors } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return errors.unauthorized();
    }

    const { packageId } = await req.json();
    const pkg = getPackageById(packageId);
    if (!pkg) {
      return errors.invalidPackage();
    }

    const stripe = getStripe();
    const db = getDb();

    // Get or create Stripe customer
    let customerId: string;
    const existing = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, session.user.id))
      .limit(1);

    if (existing[0]) {
      customerId = existing[0].stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      });
      await db.insert(stripeCustomers).values({
        userId: session.user.id,
        stripeCustomerId: customer.id,
      });
      customerId = customer.id;
    }

    // Create checkout session
    const origin = req.headers.get("origin") || process.env.BETTER_AUTH_URL || "";
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pkg.name} - ${pkg.credits} Credits`,
              description: `${pkg.credits} image generation credits`,
            },
            unit_amount: pkg.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        packageId: pkg.id,
        creditAmount: pkg.credits.toString(),
      },
      success_url: `${origin}/credits?success=true`,
      cancel_url: `${origin}/credits?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error(JSON.stringify({ error: "checkout_failed", detail: String(error) }));
    return errors.internalError();
  }
}
