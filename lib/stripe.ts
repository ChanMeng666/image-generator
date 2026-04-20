import Stripe from "stripe";

export type StripeMode = "test" | "live";

export function getStripeMode(): StripeMode {
  const raw = (process.env.STRIPE_MODE || "test").toLowerCase();
  if (raw !== "test" && raw !== "live") {
    throw new Error(
      `Invalid STRIPE_MODE="${raw}". Must be "test" or "live".`
    );
  }
  return raw;
}

function readKey(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env.local (dev) or via "wrangler secret put ${name}" (prod).`
    );
  }
  return value;
}

function assertKeyMatchesMode(mode: StripeMode, key: string, name: string) {
  const expectedPrefix = mode === "live" ? "sk_live_" : "sk_test_";
  if (!key.startsWith(expectedPrefix)) {
    throw new Error(
      `STRIPE_MODE="${mode}" but ${name} does not start with "${expectedPrefix}". ` +
        `Refusing to start — this prevents accidentally using the wrong account/mode.`
    );
  }
}

const stripeInstances: Partial<Record<StripeMode, Stripe>> = {};

export function getStripe(): Stripe {
  const mode = getStripeMode();
  const cached = stripeInstances[mode];
  if (cached) return cached;

  const keyName = mode === "live" ? "STRIPE_LIVE_SECRET_KEY" : "STRIPE_TEST_SECRET_KEY";
  const secretKey = readKey(keyName);
  assertKeyMatchesMode(mode, secretKey, keyName);

  const instance = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  stripeInstances[mode] = instance;
  return instance;
}

export function getStripeWebhookSecret(): string {
  const mode = getStripeMode();
  const name = mode === "live" ? "STRIPE_LIVE_WEBHOOK_SECRET" : "STRIPE_TEST_WEBHOOK_SECRET";
  return readKey(name);
}
