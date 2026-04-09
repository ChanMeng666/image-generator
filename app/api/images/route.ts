import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { generatedImages } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { errors } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return errors.unauthorized();
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    const db = getDb();
    const images = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.userId, session.user.id))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ images, page });
  } catch (error) {
    console.error(JSON.stringify({ error: "images_fetch_failed", detail: String(error) }));
    return errors.internalError();
  }
}
