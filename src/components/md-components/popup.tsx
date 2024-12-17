"use client";

import { useRef, useState } from 'react';
import { DOMNode, domToReact, Element } from 'html-react-parser';
import cl from "classnames";
import { Popup as PopupUI } from "@gravity-ui/uikit";

export function Popup({
    children,
    class: className,
    placement,
    replace,
}: {
    children: DOMNode[];
    class?: string;
    placement?: any;
    replace?: any;
}) {
    const boxRef = useRef(null);
    const [open, setOpen] = useState(false);
    const childrenTabs = children.filter(node => node instanceof Element && node.attribs && node.name === 'content')
        .flatMap(e => (e as Element).children ?? [e]) as Element[];
    const childrenBox = children.filter(node => !(node instanceof Element) || !node.attribs || node.name !== 'content') as Element[];

    return <>
        <span ref={boxRef} className={cl("underline decoration-dotted cursor-pointer", className)} onClick={() => {
            setOpen(true);
        }}>
            {domToReact(childrenBox as DOMNode[], { replace })}
        </span>
        <PopupUI anchorRef={boxRef} placement={placement || "auto"} hasArrow onBlur={() => setOpen(false)} onClose={() => setOpen(false)} onOutsideClick={() => setOpen(false)} onEscapeKeyDown={() => setOpen(false)} open={open}>
            <div className="p-3">
                {domToReact(childrenTabs as DOMNode[], { replace })}
            </div>
        </PopupUI>
    </>;
}
