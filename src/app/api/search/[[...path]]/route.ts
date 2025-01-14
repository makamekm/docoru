import { type NextRequest } from 'next/server';
import { getStorage } from '@/services/storage';
import { getRootConfig } from '@/services/content';
import { getPageIndex } from "@/services/search";

export async function GET(req: NextRequest) {
  try {
    return Response.json(
      await getPageIndex(req.nextUrl.pathname?.replace(/^\/api\/search/g, '') ?? ''),
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { success: false, message: error?.toString() },
      { status: 404 },
    );
  }
}

export async function generateStaticParams() {
  const storage = await getStorage();

  const config = await getRootConfig(storage);

  const pages: Set<string> = new Set();

  pages.add('default');

  for (const language of (config.languages ?? [])) {
    pages.add(language.code);
  }

  return [...pages.values()].map(page => ({
    path: [page],
  }));
}
