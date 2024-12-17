"use client"

import { useContext, useMemo, useRef, useState } from "react";
import { Breadcrumbs, BreadcrumbsItem, Button, FirstDisplayedItemsCount, Icon, LastDisplayedItemsCount } from "@gravity-ui/uikit";
import { Bars, File } from '@gravity-ui/icons';

import { LayoutContext } from "@/services/context";

import { INavItem, MenuPopup } from "./menu";

export function TopNav({
  current,
  items,
}: {
  current?: INavItem;
  items?: INavItem[];
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

  return (
    <div className="flex sticky top-[4rem] bottom-0 z-[1] max-w-full overflow-auto scrollbar-min gap-2 py-3 bg-white border-b border-black/10">
      {!!current ? <Breadcrumbs
        className="flex-1 overflow-auto flex items-center text-lg md:text-base"
        items={breads}
        firstDisplayedItemsCount={FirstDisplayedItemsCount.One}
        lastDisplayedItemsCount={LastDisplayedItemsCount.One}
      /> : <div className="flex-1" />}
      {!!items?.length && <div className="inline xl:hidden">
        <Button ref={boxRef} view="flat" size="m" className="!text-black/50" onClick={() => setOpen(value => !value)}>
          <Icon data={Bars} size={16} />
        </Button>
        <MenuPopup anchorRef={boxRef} items={items} setOpen={setOpen} open={open} />
      </div>}
      <div className="inline md:hidden">
        <Button view="flat" size="m" className="!text-black/50" onClick={() => context.isOpenPageMenu?.next(!context.isOpenPageMenu?.value)}>
          <Icon data={File} size={16} />
        </Button>
      </div>
    </div>
  );
}
