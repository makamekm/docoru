"use client"

import { Icon } from "@gravity-ui/uikit";
import { ArrowRight, ArrowLeft } from '@gravity-ui/icons';

import { INavItem } from "./menu";

export function BottomNav({
  current,
  locale,
}: {
  current?: INavItem;
  locale: any;
}) {
  return (current?.prev || current?.next) && <div className="flex flex-wrap items-stretch justify-between gap-2 pb-6 w-full min-w-[1px] max-w-full">
    {current?.prev && <a href={current.prev.href} className="flex-1 min-w-[1px] w-auto flex px-9 py-3 items-center justify-start text-lg rounded-md border border-transparent cursor-pointer hover:bg-purple-500/20 hover:border-purple-500/20 focus:bg-purple-500/20 focus:border-purple-500/20 active:bg-purple-500/20 active:border-purple-500/20">
      <div className="flex items-end justify-stretch gap-5 min-w-[1px]">
        <div className="flex justify-end items-center min-w-[1px]">
          <Icon data={ArrowLeft} size={22} />
        </div>
        <div className="flex-1 flex flex-col gap-1 min-w-[1px]">
          {locale.prev && <div className="text-black/40">{locale.prev}</div>}
          <div className="flex-1 block overflow-hidden text-ellipsis whitespace-nowrap min-w-[1px] max-w-full">
            {current.prev.label}
          </div>
        </div>
      </div>
    </a>}
    {current?.next && <a href={current.next.href} className="flex-1 min-w-[1px] w-auto flex px-9 py-3 items-center justify-end text-lg rounded-md border border-transparent cursor-pointer hover:bg-purple-500/20 hover:border-purple-500/20 focus:bg-purple-500/20 focus:border-purple-500/20 active:bg-purple-500/20 active:border-purple-500/20">
      <div className="flex items-end justify-stretch gap-5 min-w-[1px]">
        <div className="flex-1 flex flex-col gap-1 items-end min-w-[1px]">
          {locale.next && <div className="text-black/40">{locale.next}</div>}
          <div className="flex-1 block overflow-hidden text-ellipsis whitespace-nowrap min-w-[1px] max-w-full">
            {current.next.label}
          </div>
        </div>
        <div className="flex justify-start items-center min-w-[1px]">
          <Icon data={ArrowRight} size={22} />
        </div>
      </div>
    </a>}
  </div>;
}
