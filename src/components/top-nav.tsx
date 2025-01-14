"use client"

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumbs, BreadcrumbsItem, Button, FirstDisplayedItemsCount, Icon, LastDisplayedItemsCount } from "@gravity-ui/uikit";
import { Bars, File } from '@gravity-ui/icons';

import { LayoutContext } from "@/services/context";

import { INavItem, MenuPopup } from "./menu";
import { IHeadingItem } from "./heading";

export function TopNav({
  current,
  items,
  headings,
}: {
  current?: INavItem;
  items?: INavItem[];
  headings?: IHeadingItem[];
}) {
  const boxRef = useRef(null);
  const context = useContext(LayoutContext);
  const [open, setOpen] = useState(false);

  const breads = useMemo(() => [
    ...(current?.deep?.map(item => ({
      text: item.label,
      href: item.href,
    })) ?? []),
    (!!current?.label && !!current?.href) ? {
      text: current?.label,
      href: current?.href,
    } : null,
  ].filter(item => !!item && !!item?.href) as BreadcrumbsItem[],
    [current],
  );

  const [currentHeading, setCurrentHeading] = useState('');
  const [selectedHeading, setSelectedHeading] = useState<IHeadingItem | null>(null);

  const updateFocused = useCallback(() => {
    const headings: any = document.querySelectorAll('article .heading > [data-heading="1"]');
    const y = window.scrollY;
    let minDist = Number.POSITIVE_INFINITY;
    let hash = headings[0]?.id;

    for (const targetNode of headings) {
      const distance: number = ((targetNode.offsetParent?.offsetTop ?? 0)) - y;
      if (distance >= 0 && distance < minDist) {
        minDist = distance;
        hash = targetNode?.id;
      }
    }

    setCurrentHeading(id => {
      if (hash && id !== hash) {
        return hash;
      }
      return id;
    });
  }, [setCurrentHeading]);

  useEffect(() => {
    updateFocused();
    document.addEventListener('scroll', updateFocused);
    return () => {
      document.removeEventListener('scroll', updateFocused);
    };
  }, [updateFocused]);

  useEffect(() => {
    const headingIndex = headings?.findIndex(item => currentHeading === item.id);

    if (headingIndex != null && headingIndex > 0) {
      setSelectedHeading(headings?.[headingIndex] ?? headings?.[0] ?? null);
    } else {
      setSelectedHeading(headings?.[0] ?? null);
    }
  }, [currentHeading]);

  return (
    <div className="flex sticky top-[4rem] bottom-0 z-[1] max-w-full overflow-auto scrollbar-min gap-2 py-3 bg-white border-b border-black/10">
      {!!current ? <Breadcrumbs
        className="flex-1 overflow-auto hidden md:flex items-center text-lg md:text-base min-w-[1px]"
        items={breads}
        firstDisplayedItemsCount={FirstDisplayedItemsCount.One}
        lastDisplayedItemsCount={LastDisplayedItemsCount.One}
      /> : <div className="flex-1 flex md:hidden" />}
      {!!selectedHeading
        ? <div className="flex-1 flex md:hidden items-center min-w-[1px]">
          <div className="overflow-hidden text-ellipsis text-nowrap text-lg md:text-base">
            {selectedHeading?.label}
          </div>
        </div>
        : <div className="flex-1 hidden md:flex" />}
      {!!items?.length && <div className="inline xl:hidden">
        <Button ref={boxRef} view="flat" className="!text-black/50 flex items-center justify-center !w-auto !h-auto !p-1" onClick={() => setOpen(value => !value)}>
          <Icon data={Bars} size={"100%"} className="w-8 md:w-6" />
        </Button>
        <MenuPopup anchorRef={boxRef} items={items} setOpen={setOpen} open={open} />
      </div>}
      <div className="inline md:hidden">
        <Button view="flat" className="!text-black/50 flex items-center justify-center !w-auto !h-auto !p-1" onClick={() => context.isOpenPageMenu?.next(!context.isOpenPageMenu?.value)}>
          <Icon data={File} size={"100%"} className="w-8 md:w-6" />
        </Button>
      </div>
    </div>
  );
}
