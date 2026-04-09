import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generatedImages } from "@/lib/db/schema";
import { eq, desc, like, and } from "drizzle-orm";
import { errors } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const q = url.searchParams.get("q") || "";
    const limit = 20;
    const offset = (page - 1) * limit;

    const db = getDb();

    const conditions = [eq(generatedImages.isPublic, true)];
    if (q) {
      conditions.push(like(generatedImages.prompt, `%${q}%`));
    }

    const images = await db
      .select({
        id: generatedImages.id,
        prompt: generatedImages.prompt,
        cloudinaryUrl: generatedImages.cloudinaryUrl,
        width: generatedImages.width,
        height: generatedImages.height,
        createdAt: generatedImages.createdAt,
      })
      .from(generatedImages)
      .where(and(...conditions))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ images, page });
  } catch (error) {
    console.error(JSON.stringify({ error: "gallery_fetch_failed", detail: String(error) }));
    return errors.internalError();
  }
}
