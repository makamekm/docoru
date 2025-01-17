import Yaml from "yaml";
import DOMPurify from 'isomorphic-dompurify';

import { INavItem } from "@/components/menu";
import { attributes, tags } from "@/components/md";
import { IConfig, ILanguage, INav } from "@/components/menu-layout";

import { getHrefFromKey, join, removeIndex } from "./utils";
import { Marker } from "./marker";
import { IStorage } from "./storage";

export async function getContentFn(storage: IStorage, languageCode?: string) {
    const contentCache = new Map<string, string>();

    const getContent = async (key: string) => {
        key = join(languageCode ?? '', key);
        let content: string | undefined;
        if (contentCache.has(key)) {
            content = contentCache.get(key)!;
        } else {
            content = await storage.readString(key);
            content && contentCache.set(key, content);
        }
        return content;
    };

    const readContentByKeys = async (keys: string[], ext: string) => {
        for (const key of keys) {
            const content = await getContent(`${key}.${ext}`);
            if (content) {
                return {
                    content,
                    key,
                };
            }
        }
    };

    const getContentWithRedirectKey = async (key: string) => {
        const match = /^(.*)\.(md)$/i.exec(key);
        const isMdExt = !!match;
        let newKey: string = match?.[1] || key;

        key = join(languageCode ?? '', key);

        let content: string | undefined;
        if (contentCache.has(key)) {
            content = contentCache.get(key)!;
        } else {
            if (isMdExt) {
                const result = await readContentByKeys([match[1], join(match[1], `index`), join(match[1], `/index`)], match[2]);
                content = result?.content;
                newKey = result?.key ?? newKey;
            } else {
                content = await storage.readString(key);
            }
            content && contentCache.set(key, content);
        }

        return {
            content,
            key: newKey,
        };
    };

    return {
        getContent,
        getContentWithRedirectKey,
    };
}

export async function getNavs(getContent: (key: string) => Promise<string | undefined>, config: IConfig, languageAppex?: string) {
    const navContent = await getContent('nav.yaml');
    const nav: INav = navContent && Yaml.parse(navContent);

    const flattedLeft = prepareNavItems(nav?.left, languageAppex, config.mode, config.ext);
    const flattedTop = prepareNavItems(nav?.top, languageAppex, config.mode, config.ext);

    const navs = [
        ...flattedLeft,
        ...flattedTop,
    ].filter(item => !!item.key).reduce((set, item) => {
        if (item.key) {
            set.add(item.key);
        }
        return set;
    }, new Set<string>());

    for (const path of (nav?.hidden ?? [])) {
        navs.add(path);
    }

    const folders = new Set<string>();

    for (const nav of navs) {
        folders.add(removeIndex(nav));
    }

    for (const index of folders) {
        navs.add(index);
    }

    return {
        config,
        nav,
        getContent,
        flattedLeft,
        flattedTop,
        navs,
        folders,
    };
}

export async function getRootConfig(storage: IStorage) {
    const configContent = await storage.readString('config.yaml');
    const config: IConfig = configContent && Yaml.parse(configContent);
    config.ext = config.ext ?? (process.env.IS_STATIC ? '.html' : '');
    return config;
}

export async function getConfig(storage: IStorage, rawKeys: string[] = [], lang?: string) {
    const config = await getRootConfig(storage);

    const {
        keys,
        mode,
        language,
        apex,
    } = getLanguage(rawKeys, config, lang);

    return {
        config,
        keys,
        mode,
        language,
        languageApex: apex,
    };
}

export async function getPageContent(key: string, content: string | undefined, getContent: (key: string) => Promise<string | undefined>, config: IConfig, nav: any, languageCode?: string, languageAppex?: string, args: any = {}) {
    config.key = key;
    config.href = getHrefFromKey(key, languageAppex, config.mode, config.ext);

    prepareNavActive(key, nav?.left);
    prepareNavActive(key, nav?.top);

    let current = itemsFlatMapWithDeep(nav?.left ?? nav?.top).find(item => item.active);

    const marker = Marker.build({
        key,
        assetsPrefix: join('./api/assets', languageCode ?? ''),
        getContent,
        getHrefFromKey: (key) => getHrefFromKey(key, languageAppex, config.mode, config.ext),
        vars: {
            ...(nav?.vars ?? {}),
            ...args,
        },
    }, config);

    const text = content && await marker.parse(content);
    const value = text ? DOMPurify.sanitize(
        text,
        {
            ADD_TAGS: tags,
            ADD_ATTR: attributes,
            USE_PROFILES: { html: true, svg: true, mathMl: true, svgFilters: true, },
        },
    ) : undefined;

    if (current == null && marker.context.title) {
        current = {
            label: marker.context.title?.label,
            key: key,
            href: getHrefFromKey(key, languageAppex, config.mode, config.ext),
            active: true,
            deep: [],
        }
    }

    return {
        value,
        current,
        title: marker.context.title?.label,
        headings: marker.context.headings,
        config,
        nav,
    };
}

function buildActive(key: string, item: INavItem): boolean {
    item.active = key === item.key;
    item.hasActive = item.items ? item.items.reduce((arr, item) => buildActive(key, item) || arr, false) : false;
    return item.active || item.hasActive || !!item.expanded;
}

function itemsFlatMap(items?: INavItem[]): INavItem[] {
    return items?.flatMap(item => [item, ...itemsFlatMap(item.items) ?? []]) ?? [];
}

function itemsFlatMapWithDeep(items?: INavItem[], deep: INavItem[] = []): INavItem[] {
    return items?.flatMap(item => {
        item.deep = deep;
        return [item, ...itemsFlatMapWithDeep(item.items, [...deep, item]) ?? []];
    }) ?? [];
}

function prepareNavItems(items?: INavItem[], language?: string, mode?: string, ext?: string) {
    const flatted = itemsFlatMap(items).filter(item => !!item.href);

    for (let index = 0; index < flatted.length; index++) {
        if (index > 0) {
            for (let k = index - 1; k >= 0; k--) {
                if (!flatted[k].skip) {
                    flatted[index].prev = flatted[k];
                    break;
                }
            }
        }

        if (index < flatted.length - 1) {
            flatted[index].next = flatted[index + 1];
            for (let k = index + 1; k < flatted.length; k++) {
                if (!flatted[k].skip) {
                    flatted[index].next = flatted[k];
                    break;
                }
            }
        }
    }

    for (const item of flatted) {
        item.key = item.href;
        item.href = getHrefFromKey(item.href ?? "", language, mode, ext);
    }

    return flatted;
}

function prepareNavActive(key: string, items?: INavItem[]) {
    items?.forEach((item: INavItem) => buildActive(key, item));
}

function getLanguage(keys: string[], config: IConfig, lang?: string) {
    const folderKeys = [...keys];
    const lastKey = folderKeys.pop();

    const elements = lastKey?.split('.') ?? [];
    const ext = elements.pop();
    const mode = elements.length > 1 ? elements.pop() : undefined;
    config.mode = mode;

    if (mode) {
        const match = /^iframe-([^\s]+)$/gi.exec(mode);

        if (match) {
            config.mode = 'iframe';
            config.headerOnly = match[1];
        }
    }

    let language: ILanguage | undefined;
    let removeExt = false;

    if (ext) {
        language = config.languages?.find(l => l.code === ext);

        if (language != null) {
            removeExt = true;
        }
    }

    if (!language && lang) {
        language = config.languages?.find(l => l.code === lang);
    }

    if (!language && config.language) {
        language = config.languages?.find(l => l.code === config.language);
    }

    const lastKeyFixed = [...elements];

    if (!removeExt && ext) {
        lastKeyFixed.push(ext);
    }

    return {
        keys: [...folderKeys, lastKeyFixed.join('.')],
        language,
        mode,
        apex: removeExt ? language?.code : undefined,
    };
}
