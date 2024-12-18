"use client";

import { Magnifier, CircleXmark, Globe, Bars } from '@gravity-ui/icons';
import { Button, Icon, Popup, Sheet, TextInput } from "@gravity-ui/uikit";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Highlighter from "react-highlight-words";
import cl from 'classnames';
import lunr from "lunr";
import countryFlag from 'country-flag-svg';

import { INavItem, MenuItems } from './menu';
import { debounce } from 'lodash';
import Link from 'next/link';

const MenuItem = ({
  item,
}: {
  item: INavItem;
}) => {
  const boxRef = useRef(null);
  const [open, setOpen] = useState(false);

  const onLink = useCallback((e: any, item: INavItem) => {
    if (item.items?.length) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
    }
  }, []);

  return <>
    <Link ref={boxRef}
      className="text-lg hover:text-purple-600 focus:text-purple-600 active:text-purple-600 cursor-pointer block overflow-hidden text-ellipsis whitespace-nowrap max-w-full min-w-[4rem]"
      href={item.href ?? ""}
      onClick={(e) => onLink(e, item)}
    >
      {item.label}
    </Link>
    {!!item.items?.length && <Popup
      anchorRef={boxRef}
      placement={"auto"}
      className="max-w-[100%] lg:max-w-[calc(100%-2rem)] w-[100%] lg:w-[35rem]"
      hasArrow
      onBlur={() => setOpen(false)}
      onClose={() => setOpen(false)}
      onOutsideClick={() => setOpen(false)}
      onEscapeKeyDown={() => setOpen(false)}
      open={open}
    >
      <div className="p-2 w-full max-w-full max-h-[80vh] overflow-auto">
        <div className="flex flex-col w-full min-w-full max-w-full gap-[1px]">
          {!!item.href && <MenuItems item={item} />}
          {!item.href && item.items?.map((item, index) => <MenuItems key={index} item={item} />)}
        </div>
      </div>
    </Popup>}
  </>
}

export interface ITitle {
  href?: string;
  image: string;
}

export interface ILanguage {
  label: string;
  flag?: string;
  code: string;
  href?: string;
}

export interface IRedirect {
  from: string;
  to: string;
}

export interface IConfig {
  key?: string;
  href?: string;
  ext?: string;
  language?: string;
  languages?: ILanguage[];
  assets?: string;
  redirects?: IRedirect[];
}

const Language = ({
  config,
  language,
}: {
  config?: IConfig;
  language?: ILanguage;
}) => {
  const boxRef = useRef(null);
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => setOpen(false), [setOpen]);

  return <>
    <Button ref={boxRef} view="flat" className="!text-black/50 flex items-center justify-center !w-auto !h-auto !p-1" onClick={() => setOpen(true)}>
      <Icon data={Globe} size={"100%"} className="w-8 md:w-6" />
    </Button>
    <Popup
      anchorRef={boxRef}
      placement={"auto"}
      className="max-w-[100%] w-[15rem]"
      hasArrow
      onBlur={onClose}
      onClose={onClose}
      onOutsideClick={onClose}
      onEscapeKeyDown={onClose}
      open={open}
    >
      <div className="p-2 w-full max-w-full max-h-[80vh] overflow-auto">
        <div className="flex flex-col w-full min-w-full max-w-full gap-[1px]">
          {config?.languages?.map((item, index) => {
            return <Link key={item.code ?? index} className={cl("inline px-5 py-3 md:px-4 md:py-2 text-xl md:text-base rounded text-ellipsis min-w-[1px]", {
              "bg-purple-500/10": language?.code === item.code,
              "hover:bg-black/5 focus:bg-black/10 active:bg-black/10 cursor-pointer": language?.code !== item.code,
            })} href={item.href ?? ""}>
              <span className="flex gap-3 items-center">
                {!!item.flag && !!countryFlag(item.flag) && <img className="max-w-[1.5rem]" src={countryFlag(item.flag)} alt={item.label} />}
                {item.label}
              </span>
            </Link>
          })}
        </div>
      </div>
    </Popup>
  </>
}

function getLunrSearchQuery(query: string) {
  if (!query.trim()) return "";

  const searchTerms = query?.toLocaleLowerCase()?.split(" ");
  if (searchTerms.length === 1) {
    return `${query}~1`;
  }

  return searchTerms.filter(Boolean).map(s => `+${s}~1`).join(' ').trim();
}

export default function MenuLayout({
  children,
  items,
  title,
  config,
  locale,
  language,
}: Readonly<{
  children: React.ReactNode;
  items?: INavItem[];
  title?: ITitle;
  config?: IConfig;
  locale?: any;
  language?: ILanguage;
}>) {
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState<string | null>(null);
  const [index, setIndex] = useState<lunr.Index | null>(null);
  const [result, setResult] = useState<string[]>([]);
  const [dict, setDict] = useState<{
    [href: string]: any;
  }>([]);

  const getSearchResults = (query: string) => {
    return index?.search(query);
  }

  const search = debounce(async () => {
    const text = searching?.trim();
    if (index && text) {
      const query = getLunrSearchQuery(text);
      const result = getSearchResults(query);
      setResult(result?.map(res => res.ref) ?? []);
    }
  }, 100);

  useEffect(() => {
    search();
  }, [searching]);

  useLayoutEffect(() => {
    if (searching === '') {
      (inputRef.current as any)?.querySelector("input")?.focus();
    }
  }, [searching]);

  const loadIndex = useCallback(async () => {
    const res = await fetch("/api/search/" + (language?.code || 'default'));
    const { index, dict } = await res.json();
    setIndex(lunr.Index.load(index));
    setDict(dict);
  }, [setIndex, setDict]);

  useEffect(() => {
    loadIndex();
  }, [loadIndex]);

  return (
    <div className={cl("flex flex-col min-w-[1px] max-w-full group/searching", {
      'searching': searching != null,
    })}>
      <div className="flex flex-col border-b border-black/10 bg-white h-[4rem] sticky top-0 z-[1] px-3 min-w-[1px] max-w-full">
        <div className="flex-1 flex container mx-auto justify-start items-center gap-4">
          <div className="flex justify-start items-center gap-8 min-w-[1px] max-w-full group-[.searching]/searching:hidden md:group-[.searching]/searching:flex">
            {title && <Link className="text-lg hover:text-purple-600 focus:text-purple-600 active:text-purple-600 cursor-pointer" href={title?.href ?? ""}>
              {title.image && <img src={title.image} className="h-[2.5rem]" alt="Logo" />}
              {/* <Logo className="h-[2.5rem]" /> */}
            </Link>}
            <div className="hidden md:flex justify-start items-center gap-6 min-w-[1px] max-w-full overflow-scroll no-scrollbar group-[.searching]/searching:hidden">
              {items?.map((item, index) => <MenuItem key={index} item={item} />)}
            </div>
          </div>
          <div className="flex-1 flex justify-end items-center gap-2">
            {<div className="flex justify-start items-center gap-2 group-[.searching]/searching:hidden">
              {/* <Button view="flat" size="l" className="!text-black/50">
              <Icon data={Archive} size={20} />
            </Button> */}
              {/* <Button view="flat" size="l" className="!text-black/50">
              <Icon data={Gear} size={20} />
            </Button> */}
              {(config?.languages?.length ?? 0) > 1 && <Language config={config} language={language} />}
            </div>}
            <div className={cl("flex justify-start items-center gap-2", {
              'flex-1': searching != null,
            })}>
              <div className={cl("min-w-[15rem] w-full", {
                'hidden xl:inline': searching == null,
                'inline': searching != null,
              })}>
                <TextInput ref={inputRef} placeholder={locale.search} size="l" value={searching ?? ""} onChange={e => {
                  setSearching(e.currentTarget.value);
                }} onBlur={e => {
                  if (!e.currentTarget.value) {
                    setSearching(null);
                  }
                }} onFocus={e => {
                  setSearching("");
                }} />
                <Popup
                  anchorRef={inputRef}
                  placement={"bottom-start"}
                  className="max-w-[100%] lg:max-w-[calc(100%-2rem)] w-[100%] lg:w-[100rem]"
                  open={searching != null && searching !== '' && !!result?.length}
                  onOutsideClick={() => {
                    setSearching(null);
                  }}
                >
                  <div className="p-2 w-full max-w-full max-h-[80vh] overflow-auto">
                    <div className="flex flex-col w-full min-w-full max-w-full gap-1">
                      {result?.map(href => {
                        const arr = dict?.[href] ?? [];
                        const title = arr[0];
                        let second = arr[1];
                        const query = searching?.toLocaleLowerCase()?.split(' ').filter(Boolean) ?? [];
                        let found = false;

                        for (let index = 2; index < arr.length; index++) {
                          const element = arr[index];
                          const elementLower = element.toLocaleLowerCase();
                          for (const str of query) {
                            if (elementLower.includes(str)) {
                              second = element;
                              found = true;
                              break;
                            }
                          }

                          if (found) {
                            break;
                          }
                        }
                        return <Link key={href} className={cl("flex flex-col gap-2 px-4 py-2 rounded text-ellipsis min-w-[1px]", {
                          "bg-purple-500/10": false,
                          "hover:bg-black/5 focus:bg-black/10 active:bg-black/10 cursor-pointer": true,
                        })} href={href}>
                          <div className="opacity-60 font-semibold">{title || href}</div>
                          {!!second && <div className="text-lg">
                            <Highlighter searchWords={query} textToHighlight={second} highlightClassName='bg-purple-200' caseSensitive={false} />
                          </div>}
                        </Link>;
                      })}
                    </div>
                  </div>
                </Popup>
              </div>
              <Button view="flat" size="l" className="!text-black/50 flex items-center justify-center !w-auto !h-auto !p-1" onClick={() => {
                setSearching(value => {
                  return value == null ? "" : null;
                });
              }}>
                <Icon data={searching == null ? Magnifier : CircleXmark} size={"100%"} className="w-8 md:w-6" />
              </Button>
            </div>
            <div className="flex group-[.searching]/searching:hidden lg:hidden">
              <Button view="flat" size="l" className="!text-black/50 flex items-center justify-center !w-auto !h-auto !p-1" onClick={() => setOpen(value => !value)}>
                <Icon data={Bars} size={"100%"} className="w-8 md:w-6" />
              </Button>
              {!!items?.length && <Sheet visible={open} onClose={() => setOpen(false)}
              >
                <div className="flex flex-col w-full min-w-full max-w-full gap-[1px]">
                  {items?.map((item, index) => <MenuItems key={index} item={item} />)}
                </div>
              </Sheet>}
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex-1 z-0 px-3">{children}</div>
    </div>
  );
}
