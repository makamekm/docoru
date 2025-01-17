
"use client"

import { Button, Icon, Sheet } from "@gravity-ui/uikit";
import { SquareDashed, Pencil, ThumbsUp, ThumbsDown, ArrowRight, ArrowLeft } from '@gravity-ui/icons';
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import cl from "classnames";
import { debounce } from "lodash";

import { LayoutContext } from "@/services/context";

import { useBS } from "@/hooks/rx";
import { INavItem } from "./menu";
import Link from "next/link";

export interface IHeadingItem {
  id: string;
  label: string;
}

function HeadingItem({
  id,
  label,
  active,
  onClick,
}: {
  id: string;
  label: string;
  active?: boolean;
  chevron?: boolean;
  onClick?: ((id: string, label: string) => void) | undefined;
}) {
  return (
    <Link className={
      "inline px-5 py-3 md:px-4 md:py-2 text-lg md:text-base text-ellipsis min-w-[1px] border-l-2 hover:text-purple-500 focus:text-purple-500 active:text-purple-500 cursor-pointer"
      + (active ? ' border-black/60' : ' border-black/10 text-black/60')
    } onClick={() => {
      onClick?.(id, label);
    }} href={"#" + id} data-heading-nav={id}>
      <span className="inline">{label}</span>
    </Link>
  );
}

export function Heading({
  items,
  current,
  locale,
}: {
  items: IHeadingItem[];
  current?: INavItem;
  locale?: any;
}) {
  const context = useContext(LayoutContext);
  const isOpenPageMenu = useBS(context.isOpenPageMenu);

  const scroller = useRef<HTMLDivElement>(null);
  const [currentHeading, setCurrentHeading] = useState('');
  const [shakeId, setShakeId] = useState<null | string>(null);
  const state = useRef<{
    blockScroll: boolean;
    timeout: number | null;
  }>({
    blockScroll: false,
    timeout: null,
  });

  const onClick = useCallback<(id: string, label: string) => void>((id) => {
    setCurrentHeading(id);
    context.isOpenPageMenu?.next(false);

    state.current.blockScroll = true;

    if (state.current.timeout != null) {
      window.clearTimeout(state.current.timeout);
      state.current.timeout = null;
    }

    state.current.timeout = window.setTimeout(() => {
      state.current.blockScroll = false;
      state.current.timeout = null;
    }, 1000);

    window.setTimeout(() => {
      setShakeId(id);
    }, 200);
  }, [setCurrentHeading, context.isOpenPageMenu]);

  useEffect(() => {
    if (shakeId != null) {
      const element = document.querySelector(`[data-heading-id="${shakeId}"]`);
      element?.classList.add('strong-hover-shake');
      setTimeout(() => {
        element?.classList.remove('strong-hover-shake');
        setShakeId(null);
      }, 300);
    }
  }, [shakeId]);

  const updateFocused = useCallback((hash?: string) => {
    if (!hash) {
      const headings: any = document.querySelectorAll('article .heading > [data-heading="1"]');
      const y = window.scrollY;
      let minDist = Number.POSITIVE_INFINITY;
      hash = headings[0]?.id;
      const hashes = [];

      for (const targetNode of headings) {
        const distance: number = ((targetNode.offsetParent?.offsetTop ?? 0)) - y;

        if (distance <= 0) {
          hashes.push(targetNode?.id);
        }

        if (distance >= 0 && distance < minDist) {
          minDist = distance;
          hash = targetNode?.id;
        }
      }

      const ind = hashes.indexOf(hash);
      hash = hashes[ind - 1] ?? hashes[hashes.length - 1] ?? hash;
    }

    setCurrentHeading(id => {
      if (hash && id !== hash && !state.current.blockScroll) {
        const element: any = document.querySelector(`[data-heading-nav="${hash}"]`);
        if (element) {
          scroller.current?.scrollTo({
            left: 0,
            top: (element?.offsetTop ?? 0) - 100,
            behavior: "smooth",
          });
        }
        return hash;
      }
      return id;
    });
  }, [setCurrentHeading]);

  const debounceUpdateFocused = useCallback(debounce(() => updateFocused(), 200), [updateFocused, debounce]);

  useEffect(() => {
    const hashes = window.location.hash.split("#");
    updateFocused(hashes[hashes.length - 1]);
    document.addEventListener('scroll', debounceUpdateFocused);
    return () => {
      document.removeEventListener('scroll', debounceUpdateFocused);
    };
  }, [updateFocused, debounceUpdateFocused]);

  return (
    <>
      <div className="hidden lg:flex flex-col min-h-[100%] w-[20rem] min-w-[20rem] max-w-[20rem]">
        <div ref={scroller} className="flex flex-col w-[20rem] min-w-[20rem] max-w-[20rem] sticky top-[4rem] bottom-0 max-h-[calc(100vh-4rem)] overflow-x-hidden overflow-y-auto py-2 scrollbar-min gap-4 -mx-2 px-2">
          <div className="flex gap-2 -mx-2">
            <Button view="flat" size="m" className="!text-black/50" onClick={() => context.isFullscreen?.next(!context.isFullscreen.value)}>
              <Icon data={SquareDashed} size={16} />
            </Button>
            {/* <Tooltip content="Content" openDelay={0} placement="bottom">
              <Button view="flat" size="m" className="!text-black/50">
                <Icon data={Pencil} size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Content" openDelay={0} placement="bottom">
              <Button view="flat" size="m" className="!text-black/50">
                <Icon data={ThumbsUp} size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Content" openDelay={0} placement="bottom">
              <Button view="flat" size="m" className="!text-black/50">
                <Icon data={ThumbsDown} size={16} />
              </Button>
            </Tooltip> */}
          </div>
          {current?.next && <Link href={current.next.href ?? ""} className="flex flex-col gap-1 hover:text-purple-500 focus:text-purple-500 active:text-purple-500">
            <div className="flex flex-wrap items-center gap-2 !text-black/50">
              <Icon data={ArrowRight} size={14} />
              {locale?.next && <div>{locale?.next}</div>}
            </div>
            <div>{current.next.label}</div>
          </Link>}
          {current?.prev && <Link href={current.prev.href ?? ""} className="flex flex-col gap-1 hover:text-purple-500 focus:text-purple-500 active:text-purple-500">
            <div className="flex flex-wrap items-center gap-2 !text-black/50">
              <Icon data={ArrowLeft} size={14} />
              {locale?.prev && <div>{locale?.prev}</div>}
            </div>
            <div>{current.prev.label}</div>
          </Link>}
          {!!locale?.heading && !!items?.length && <div className="font-semibold text-[1.1rem] text-black/80">{locale?.heading}</div>}
          {!!items?.length && <div className="flex flex-col px-2">
            {items?.map((item, index) => <HeadingItem key={index} id={item.id} label={item.label} active={currentHeading === item.id} onClick={onClick} />)}
          </div>}
        </div>
      </div>
      <Sheet visible={isOpenPageMenu} onClose={() => context.isOpenPageMenu?.next(false)}>
        <div className="flex flex-col w-full min-w-full max-w-full pb-4 gap-4">
          {/* <div className="flex gap-2 justify-end">
            <Tooltip content="Content" openDelay={0} placement="bottom">
              <Button view="flat" size="m" className="!text-black/50">
                <Icon data={Pencil} size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Content" openDelay={0} placement="bottom">
              <Button view="flat" size="m" className="!text-black/50">
                <Icon data={ThumbsUp} size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Content" openDelay={0} placement="bottom">
              <Button view="flat" size="m" className="!text-black/50">
                <Icon data={ThumbsDown} size={16} />
              </Button>
            </Tooltip>
          </div> */}
          {locale?.heading && !!items?.length && <div className="font-semibold text-lg md:text-[1.1rem] text-black/80 px-2">{locale?.heading}</div>}
          {!!items?.length && <div className="flex flex-col px-2">
            {items?.map((item, index) => <HeadingItem key={index} id={item.id} label={item.label} active={currentHeading === item.id} onClick={onClick} />)}
          </div>}
        </div>
      </Sheet>
    </>
  );
}
