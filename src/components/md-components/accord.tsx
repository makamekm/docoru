"use client";

import { Fragment, useState } from "react";
import { DOMNode, domToReact, Element } from 'html-react-parser';
import cl from "classnames";
import { Icon } from "@gravity-ui/uikit";
import { ChevronDown } from '@gravity-ui/icons';

export function Accord({
    children,
    class: className,
    replace,
}: {
    children: DOMNode[];
    class?: string;
    open?: boolean;
    replace?: any;
}) {
    const childrenTabs = children.filter(node => node instanceof Element && node.attribs && node.name === 'tab') as Element[];

    const [active, setActive] = useState(() => {
        const index = childrenTabs.findIndex(node => node.attribs.selected != null);
        return index;
    });

    return <div className={cl("flex flex-col my-6", className)}>
        {childrenTabs.map((node, index) => <Fragment key={index}>
            <div
                className="border-b-[1px] border-b-black/10 flex gap-2 items-center cursor-pointer py-2" onClick={() => setActive(prev => {
                    return index === prev ? -1 : index;
                })}>
                <Icon data={ChevronDown} size={"1.25rem"} className={"transition-translate duration-200 " + (active === index ? " rotate-0" : " -rotate-90")} />
                <div className={cl("text-lg", { 'font-semibold': active === index })}>{node.attribs.label}</div>
            </div>
            <div key={index} className={cl(node.attribs.class, "first:[&>*]:mt-2 last:[&>*]:mb-2", active === index ? "block" : "hidden")}>{domToReact(node.children as DOMNode[], { replace })}</div>
        </Fragment>)}
    </div>
}
