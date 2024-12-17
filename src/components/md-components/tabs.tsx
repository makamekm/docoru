"use client";

import { useState } from "react";
import { DOMNode, domToReact, Element } from 'html-react-parser';
import cl from "classnames";

export function Tabs({
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
        return index >= 0 ? index : 0;
    });

    return <div className={cl("my-6", className)}>
        <div className="border-b-[1px] border-b-black/10 flex items-center">
            {childrenTabs.map((node, index) => <div key={index}
                className={cl("font-semibold text-lg cursor-pointer py-2 px-4 duration-200 transition-all", active === index ? "shadow-[inset_0_-2px_0_0px_#a855f7]" : "")}
                onClick={() => setActive(index)}
            >
                {node.attribs.label}
            </div>)}
        </div>
        {childrenTabs.map((node, index) => <div key={index} className={cl(node.attribs.class, "first:[&>*]:mt-2 last:[&>*]:mb-2", active === index ? "block" : "hidden")}>
            {domToReact(node.children as DOMNode[], { replace })}
        </div>)}
    </div>
}
