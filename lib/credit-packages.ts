export const CREDIT_PACKAGES = [
  { id: "starter", name: "Starter", credits: 10, priceInCents: 199 },
  { id: "standard", name: "Standard", credits: 50, priceInCents: 799 },
  { id: "pro", name: "Pro", credits: 200, priceInCents: 2499 },
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]["id"];

export function getPackageById(id: string) {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}
