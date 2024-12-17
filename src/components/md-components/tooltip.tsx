"use client";

import { DOMNode, domToReact, Element } from 'html-react-parser';
import cl from "classnames";
import { Tooltip as TooltipUI } from "@gravity-ui/uikit";

export function Tooltip({
    children,
    class: className,
    content,
    placement,
    replace,
}: {
    children: DOMNode[];
    class?: string;
    content?: string;
    placement?: any;
    replace?: any;
}) {
    const childrenTabs = children.filter(node => node instanceof Element && node.attribs && node.name === 'content')
        .flatMap(e => (e as Element).children ?? [e]) as Element[] ?? [];
    const childrenBox = children.filter(node => !(node instanceof Element) || !node.attribs || node.name !== 'content') as Element[] ?? [];

    return <TooltipUI placement={placement || "auto"} content={
        <div className="p-3">
            {content || domToReact(childrenTabs as DOMNode[], { replace })}
        </div>
    } openDelay={0}>
        <span className={cl("underline decoration-dotted cursor-default", className)}>
            {domToReact(childrenBox as DOMNode[], { replace }) as JSX.Element}
        </span>
    </TooltipUI>;
}
