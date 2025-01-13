import * as mime from 'mime-types';
import { type NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/services/storage';
import { join } from '@/services/utils';
import { getRootConfig } from '@/services/content';

export async function GET(req: NextRequest) {
  const path = req.nextUrl.pathname?.replace(/^\/api\/assets\//g, '') ?? '';

  if (!path) {
    return Response.json(
      { success: false, message: 'no path' },
      { status: 404 },
    );
  }

  const storage = await getStorage();

  try {
    const stream = await storage.read(join(path));

    const headers = new Headers();

    const meme = mime.lookup(path)
    if (meme) headers.set("Content-Type", meme);
    // if (cmd.LastModified) headers.set("Last-Modified", cmd.LastModified.toString());
    // if (cmd.ContentLength) headers.set("Content-Length", cmd.ContentLength.toString());

    return new NextResponse(stream as any, {
      status: 200,
      statusText: "OK",
      headers,
    });
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

  if (config.language) {
    const items = await storage.glob(config.assets ?? '**/*', config.language);
    for (const item of items) {
      pages.add(join(config.language, item));
    }
  } else if (!config.languages?.length) {
    const items = await storage.glob(config.assets ?? '**/*');
    for (const item of items) {
      pages.add(item);
    }
  }

  for (const language of (config.languages ?? [])) {
    const items = await storage.glob(config.assets ?? '**/*', language.code);
    for (const item of items) {
      pages.add(join(language.code, item));
    }
  }

  return [...pages.values()].map(page => ({
    path: page.split('/').filter(Boolean),
  }))
}
