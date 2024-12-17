
"use client"

import { useContext } from "react";
import { SquareDashedText } from '@gravity-ui/icons';
import { Button, Icon } from "@gravity-ui/uikit";

import { LayoutContext } from "@/services/context";

import { useBS } from "@/hooks/rx";
import { RenderHtml } from "./md-render";
import { INavItem, Menu } from "./menu";
import MenuLayout, { IConfig, ILanguage } from "./menu-layout";
import { TopNav } from "./top-nav";
import { BottomNav } from "./bottom-nav";
import { Heading, IHeadingItem } from "./heading";

export function MdPage({
  nav,
  config,
  value,
  current,
  language,
  headings,
}: {
  nav: any;
  config: IConfig;
  value?: string;
  current?: INavItem;
  language?: ILanguage;
  headings: IHeadingItem[];
}) {
  const context = useContext(LayoutContext);
  const isFullscreen = useBS(context.isFullscreen);

  const content = <article className="prose w-full min-w-full">
    <RenderHtml key="content" value={value} />
  </article>;
  const bottom = <BottomNav key="bottom-nav" current={current} locale={nav?.locale} />;

  return (
    isFullscreen ? <div className="flex gap-3 min-w-[1px] max-w-full pl-3 lg:pl-9 pr-3">
      <div className="flex-1 flex flex-col relative min-h-[100%] gap-8 min-w-[1px] pt-6">
        {content}
        {bottom}
      </div>
      <div className="flex flex-col relative">
        <div className="flex flex-col gap-2 pb-3 pt-6 sticky top-0 max-w-[100vh]">
          <Button view="flat" size="m" className="!text-black/50" onClick={() => context.isFullscreen?.next(!context.isFullscreen.value)}>
            <Icon data={SquareDashedText} size={16} />
          </Button>
        </div>
      </div>
    </div> : <MenuLayout items={nav?.top} title={nav?.title} config={config} language={language} locale={nav?.locale}>
      <div className="flex-1 flex flex-row relative container mx-auto min-h-[100%] gap-8 min-w-[1px]">
        {nav?.left ? <Menu items={nav?.left} /> : null}
        <div className="flex-1 flex flex-col relative min-h-[100%] gap-8 min-w-[1px]">
          <TopNav items={nav?.left} current={current} />
          {content}
          {bottom}
        </div>
        <Heading
          items={headings}
          current={current}
          locale={nav?.locale}
        />
      </div>
    </MenuLayout>
  );
}
