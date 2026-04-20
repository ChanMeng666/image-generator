import { NextResponse } from "next/server";
import { getStripeMode } from "@/lib/stripe";

export async function GET() {
  try {
    return NextResponse.json({ mode: getStripeMode() });
  } catch {
    return NextResponse.json({ mode: "test" });
  }
}
