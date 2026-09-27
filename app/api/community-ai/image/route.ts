import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { isOwnAiImageKey } from "@/lib/ai/communityImage";
import { getImagePlaybackUrl } from "@/lib/r2";

/**
 * Indirizzo stabile per un'immagine creata dall'AI nella chat Community. La chat resta salvata nel
 * browser fino al logout, mentre i link firmati di R2 scadono dopo un'ora: qui se ne genera uno
 * nuovo a ogni richiesta. Solo il proprietario può vedere le proprie immagini.
 */
export async function GET(request: NextRequest) {
  const { user } = await requireSession();
  const key = request.nextUrl.searchParams.get("key");
  if (!key || !isOwnAiImageKey(user.id, key)) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.redirect(await getImagePlaybackUrl(key));
}
