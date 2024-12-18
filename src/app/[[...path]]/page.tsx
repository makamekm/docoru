import React from "react";
import { getStorage } from "@/services/storage";
import { MdPage } from "@/components/page";
import { getConfig, getContentFn, getNavs, getPageContent, getRootConfig } from "@/services/content";
import { getHrefFromKey, join, removeIndex } from "@/services/utils";

export default async function Page({ params, searchParams }: any) {
  const props = await params;

  let args: any = {};

  if (!process.env.IS_STATIC) {
    args = await searchParams ?? {};
  }

  const rawKeys: string[] = (props.path ?? []).map(decodeURI);

  const storage = await getStorage();

  const {
    config,
    keys,
    language,
    languageApex,
  } = await getConfig(storage, rawKeys);

  const { getContent, getContentWithRedirectKey } = await getContentFn(storage, language?.code);

  const {
    nav,
    navs,
  } = await getNavs(getContent, config, languageApex);

  const keyRaw = join(...keys);

  const {
    content,
    key,
  } = await getContentWithRedirectKey(keyRaw + '.md');

  if (!navs.has(key)) {
    return "404";
  }

  config.languages?.forEach(item => {
    item.href = getHrefFromKey(key, item.code === config.language ? undefined : item.code, config.ext);
  });

  const {
    value,
    current,
    title,
    headings,
  } = await getPageContent(key, content, getContent, config, nav, language?.code, languageApex, args);

  return <>
    <title>{[title, current?.label].filter(Boolean).join(" | ")}</title>
    <MdPage
      nav={nav}
      config={config}
      value={value}
      current={current}
      headings={headings}
      language={language}
    />
  </>;
}

export async function generateStaticParams() {
  const storage = await getStorage();

  const config = await getRootConfig(storage);

  const pages: Set<string> = new Set();

  if (config.language) {
    const language = config.languages?.find(lang => lang.code === config.language);

    if (language) {
      const { getContent } = await getContentFn(storage, language.code);
      const { navs } = await getNavs(getContent, config);
      const items = await storage.glob('**/*.md', language.code);
      for (const item of items) {
        const key = item.replace(/\.md$/i, '');
        if (navs.has(key)) {
          pages.add(key === 'index' ? removeIndex(key) : key);
        }
      }
    }

    for (const language of (config.languages ?? [])) {
      if (config.language !== language.code) {
        const { getContent } = await getContentFn(storage, language.code);
        const { navs } = await getNavs(getContent, config, language.code);
        const items = await storage.glob('**/*.md', language.code);
        for (const item of items) {
          const key = item.replace(/\.md$/i, '');
          if (navs.has(key)) {
            pages.add(key + '.' + language.code);
          }
        }
      }
    }
  } else {
    const { getContent } = await getContentFn(storage);
    const { navs } = await getNavs(getContent, config);
    const items = await storage.glob('**/*.md');
    for (const item of items) {
      const key = item.replace(/\.md$/i, '');
      if (navs.has(key)) {
        pages.add(key === 'index' ? removeIndex(key) : key);
      }
    }
  }

  return [...pages.values()].map(page => ({
    path: page.split('/').filter(Boolean),
  }))
}
