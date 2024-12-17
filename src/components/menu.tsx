"use client"

import { MouseEventHandler, useCallback, useState } from "react";
import cl from "classnames";
import { Icon, Sheet } from '@gravity-ui/uikit';
import { ChevronRight } from '@gravity-ui/icons';

export interface INavItem {
  title?: string;
  label: string;
  active?: boolean;
  open?: boolean;
  expanded?: boolean;
  hasActive?: boolean;
  href?: string;
  key?: string;
  items?: INavItem[];
  prev?: INavItem;
  next?: INavItem;
  deep?: INavItem[];
}

function MenuItem({
  label,
  href,
  open,
  active,
  chevron,
  onClick,
}: {
  label: string;
  href?: string;
  open?: boolean;
  active?: boolean;
  chevron?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
}) {
  return (
    <a className={cl("inline px-5 py-3 md:px-4 md:py-2 text-lg md:text-base rounded text-ellipsis min-w-[1px]", {
      "bg-purple-500/10": active,
      "hover:bg-black/5 focus:bg-black/10 active:bg-black/10 cursor-pointer": !active,
    })} onClick={onClick} href={href}>
      {chevron ? <Icon className={"inline mt-[0.15rem] mr-1 transition-transform duration-200" + (open ? ' rotate-90' : '')} data={ChevronRight} size={16} /> : null}
      <span className="inline">{label}</span>
    </a>
  );
}

export function MenuItems({
  item,
}: {
  item: INavItem;
}) {
  const [open, setIsOpen] = useState(() => item.hasActive || item.active || item.open);

  const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>((e) => {
    if (!!item.items?.length && !e.currentTarget.getAttribute('href')) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(value => !value);
    }
  }, [item.items?.length])

  return (
    <>
      {item.title != null ? <div className="font-semibold text-ellipsis px-4 pb-2 pt-4 border-b border-black/10">{item.title}</div> : null}
      <MenuItem label={item.label} href={item.href} chevron={!!item.items?.length} open={open} active={item.active} onClick={onClick} />
      <div className="flex flex-col pl-5 gap-[1px]">
        {
          open ? item.items?.map((item, index) => <MenuItems key={index} item={item} />) : null
        }
      </div>
    </>
  );
}

export function Menu({
  items,
}: {
  items: INavItem[];
}) {
  return (
    <>
      <div className="hidden xl:flex flex-col min-h-[100%] w-[20rem] min-w-[20rem] max-w-[20rem]">
        <div className="flex flex-col w-[20rem] min-w-[20rem] max-w-[20rem] sticky top-[4rem] bottom-0 max-h-[calc(100vh-4rem)] overflow-auto py-2 scrollbar-min gap-[1px]">
          {items?.map((item, index) => <MenuItems key={index} item={item} />)}
        </div>
      </div>
    </>
  );
}

export const MenuPopup = ({
  items,
  open,
  setOpen,
}: {
  items: INavItem[];
  open: boolean;
  setOpen: (value: boolean) => void;
  anchorRef: any;
}) => {
  return !!items?.length &&
    <Sheet visible={open} onClose={() => setOpen(false)}>
      <div className="flex flex-col w-full min-w-full max-w-full gap-[1px]">
        {items?.map((item, index) => <MenuItems key={index} item={item} />)}
      </div>
    </Sheet>;
}

