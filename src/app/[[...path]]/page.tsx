import React from "react";
import { getStorage } from "@/services/storage";
import { MdPage } from "@/components/page";
import { getConfig, getContentFn, getNavs, getPageContent, getRootConfig } from "@/services/content";
import { getHrefFromKey, join, removeIndex } from "@/services/utils";
import { notFound, redirect, RedirectType } from "next/navigation";
import { getPageIndex } from "@/services/search";

export default async function Page({ params, searchParams }: any) {
  const props = await params;

  let args: any = {};

  let isStatic = process.env.IS_STATIC;
  if (isStatic === 'undefined') isStatic = '/';
  if (!isStatic) {
    args = await searchParams ?? {};
  }

  const rawKeys: string[] = (props.path ?? []).map(decodeURI);

  const storage = await getStorage();

  const {
    config,
    keys,
    mode,
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

  const redirectNonNormilizedKey = keyRaw || props.path || '/';
  const redirectKey = normalizeRedirect(redirectNonNormilizedKey);

  const redirected = nav?.redirects?.find(r => {
    if (r.normalize === false) {
      return r.from === redirectNonNormilizedKey;
    }
    return normalizeRedirect(r.from) === redirectKey;
  }) || config.redirects?.find(r => {
    if (r.normalize === false) {
      return r.from === redirectNonNormilizedKey;
    }
    return normalizeRedirect(r.from) === redirectKey;
  });

  if (redirected) {
    return redirect(getHrefFromKey(redirected.to ?? '/', languageApex, mode, config.ext), RedirectType.replace);
  }

  if (!navs.has(key)) {
    notFound();
  }

  config.languages?.forEach(item => {
    item.href = getHrefFromKey(key, (item.code === config.language && !mode) ? undefined : item.code, mode, config.ext);
  });

  const {
    value,
    current,
    title,
    headings,
  } = await getPageContent(key, content, getContent, config, nav, language?.code, languageApex, args);

  let base = process.env.BASE ?? '/';
  if (base === 'undefined') base = '/';

  let preloadSearchIndexes = process.env.PRELOAD_SEARCH_INDEXES;
  if (preloadSearchIndexes === 'undefined') preloadSearchIndexes = undefined;

  const searchData = !!preloadSearchIndexes ? JSON.stringify(await getPageIndex(language?.code || 'default')) : null;

  return <>
    <title>{[title, current?.label].filter(Boolean).join(" | ")}</title>
    <link rel="icon" href={"/ico" + (isStatic ? '' : '?<generated>')} type="image/png" sizes="32x32" />
    <MdPage
      nav={nav}
      config={config}
      value={value}
      current={current}
      headings={headings}
      language={language}
      base={base}
      searchData={searchData || undefined}
    />
  </>;
}

let modes = !!process.env.MODE ? process.env.MODE.split(',') : ['default', 'iframe'];
if (modes[0] === 'undefined') modes = ['default', 'iframe'];

function normalizeRedirect(value: string) {
  if (value === 'index') {
    return '';
  }
  if (value === '/') {
    return '';
  }
  return value;
}

function addRedirect(redirects: Set<string>, ...values: string[]) {
  const [from, ...rest] = values;
  const fromNormal = normalizeRedirect(from);
  const restNormal = rest.filter(Boolean);
  redirects.add([restNormal?.length > 0 ? (fromNormal || 'index') : fromNormal, ...restNormal].filter(Boolean).join('.'));
}

export async function generateStaticParams() {
  const storage = await getStorage();

  const config = await getRootConfig(storage);
  const configRedirects = config.redirects ?? [];
  const redirects = new Set([...configRedirects.map(r => r.from)]);

  const pages: Set<string> = new Set();

  for (let mode of modes) {
    if (mode === 'default') {
      mode = '';
    }

    config.mode = mode;

    for (const redirect of configRedirects) {
      addRedirect(redirects, redirect.from, mode);
    }

    for (const redirect of configRedirects) {
      addRedirect(redirects, redirect.from);
    }

    if (config.language || !!config.languages?.length) {
      const language = config.languages?.find(lang => lang.code === config.language);

      if (language && !mode) {
        const { getContent } = await getContentFn(storage, language.code);
        const { navs, nav } = await getNavs(getContent, config, mode ? language.code : undefined);
        const items = await storage.glob('**/*.md', language.code);
        for (const item of items) {
          const key = item.replace(/\.md$/i, '');
          if (navs.has(key)) {
            pages.add(key === 'index' ? removeIndex(key) : key);
          }
        }

        for (const redirect of configRedirects) {
          addRedirect(redirects, redirect.from, mode, language.code);
        }

        for (const redirect of (nav.redirects ?? [])) {
          addRedirect(redirects, redirect.from, mode, language.code);
        }
      }

      for (const language of (config.languages ?? [])) {
        if (config.language !== language.code || !!mode) {
          const { getContent } = await getContentFn(storage, language.code);
          const { navs, nav } = await getNavs(getContent, config, language.code);
          const items = await storage.glob('**/*.md', language.code);
          for (const item of items) {
            const key = item.replace(/\.md$/i, '');
            if (navs.has(key)) {
              pages.add([key, mode, language.code].filter(Boolean).join('.'));
            }
          }

          for (const redirect of configRedirects) {
            addRedirect(redirects, redirect.from, mode, language.code);
          }

          for (const redirect of (nav.redirects ?? [])) {
            addRedirect(redirects, redirect.from, mode, language.code);
          }
        }
      }
    } else {
      const { getContent } = await getContentFn(storage);
      const { navs, nav } = await getNavs(getContent, config);
      const items = await storage.glob('**/*.md');
      for (const item of items) {
        const key = item.replace(/\.md$/i, '');
        if (navs.has(key)) {
          pages.add((key === 'index' && !mode) ? removeIndex(key) : [key, '_', mode].filter(Boolean).join('.'));
        }
      }

      for (const redirect of (nav.redirects ?? [])) {
        addRedirect(redirects, redirect.from, mode);
      }
    }

    for (const redirect of redirects) {
      pages.add(redirect);
    }
  }

  return [...pages.values()].map(page => ({
    path: page.split('/').filter(Boolean),
  }))
}
