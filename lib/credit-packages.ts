export const CREDIT_PACKAGES = [
  { id: "starter", name: "Starter", credits: 30, priceInCents: 149 },
  { id: "standard", name: "Standard", credits: 100, priceInCents: 399 },
  { id: "pro", name: "Pro", credits: 300, priceInCents: 999 },
  { id: "mega", name: "Mega", credits: 1000, priceInCents: 2499 },
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]["id"];

export function getPackageById(id: string) {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}
