import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { generatedImages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { errors } from "@/lib/errors";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const image = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.id, id))
      .limit(1);

    if (!image[0]) {
      return errors.notFound("image");
    }

    return NextResponse.json(image[0]);
  } catch (error) {
    console.error(JSON.stringify({ error: "image_fetch_failed", detail: String(error) }));
    return errors.internalError();
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return errors.unauthorized();
    }

    const { id } = await params;
    const { isPublic } = await req.json();

    const db = getDb();
    const updated = await db
      .update(generatedImages)
      .set({ isPublic })
      .where(
        and(
          eq(generatedImages.id, id),
          eq(generatedImages.userId, session.user.id)
        )
      )
      .returning();

    if (!updated[0]) {
      return errors.notFound("image");
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(JSON.stringify({ error: "image_update_failed", detail: String(error) }));
    return errors.internalError();
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return errors.unauthorized();
    }

    const { id } = await params;
    const db = getDb();
    const deleted = await db
      .delete(generatedImages)
      .where(
        and(
          eq(generatedImages.id, id),
          eq(generatedImages.userId, session.user.id)
        )
      )
      .returning();

    if (!deleted[0]) {
      return errors.notFound("image");
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error(JSON.stringify({ error: "image_delete_failed", detail: String(error) }));
    return errors.internalError();
  }
}
