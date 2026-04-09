import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth";
import { createId } from "@paralleldrive/cuid2";
import { uploadImage } from "@/lib/cloudinary";
import { checkBalance, deductCredit } from "@/lib/credits";
import { getDb } from "@/lib/db";
import { generatedImages } from "@/lib/db/schema";
import { errors } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const { data: session } = await auth.getSession();
    if (!session) {
      return errors.unauthorized();
    }

    // 2. Validate prompt
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return errors.promptRequired();
    }

    // 3. Check credit balance
    const balance = await checkBalance(session.user.id);
    if (balance < 1) {
      return errors.insufficientCredits(balance);
    }

    // 4. Generate image via Cloudflare Workers AI
    const { env } = getCloudflareContext();
    const aiResponse = await env.AI.run(
      "@cf/black-forest-labs/flux-1-schnell",
      {
        prompt: prompt.trim(),
        steps: 4,
      }
    );

    if (!aiResponse?.image) {
      return errors.generationFailed();
    }

    const base64Image = aiResponse.image;
    const imageId = createId();

    // 5. Upload to Cloudinary
    let uploadResult;
    try {
      uploadResult = await uploadImage(base64Image, session.user.id, imageId);
    } catch {
      return errors.uploadFailed();
    }

    // 6. Save to database
    const db = getDb();
    await db.insert(generatedImages).values({
      id: imageId,
      userId: session.user.id,
      prompt: prompt.trim(),
      cloudinaryUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      width: uploadResult.width,
      height: uploadResult.height,
    });

    // 7. Deduct credit
    const deductResult = await deductCredit(session.user.id, imageId);
    if (!deductResult.success) {
      return errors.insufficientCredits(deductResult.newBalance);
    }

    // 8. Return result
    return NextResponse.json({
      id: imageId,
      url: uploadResult.url,
      prompt: prompt.trim(),
      creditsRemaining: deductResult.newBalance,
    });
  } catch (error) {
    console.error(JSON.stringify({ error: "generate_failed", detail: String(error) }));
    return errors.internalError();
  }
}
