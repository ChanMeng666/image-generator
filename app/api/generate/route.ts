import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Please enter a prompt" },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const response = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt,
      steps: 4,
    });

    return NextResponse.json(response.image);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error generating image" },
      { status: 500 }
    );
  }
}