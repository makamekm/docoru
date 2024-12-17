"use client";

import { useState } from "react";
import cl from "classnames";
import { Icon } from "@gravity-ui/uikit";
import { ChevronDown } from '@gravity-ui/icons';
import { DOMNode, domToReact } from "html-react-parser";

export function Cut({
    children,
    label,
    class: className,
    open,
    replace,
}: {
    children?: DOMNode[];
    label?: string;
    class?: string;
    open?: boolean;
    replace?: any;
}) {
    const [isOpen, setIsOpen] = useState(() => open != null);
    return <div>
        <div className="border-b-[1px] border-b-black/10 flex gap-2 items-center cursor-pointer py-2" onClick={() => setIsOpen(c => !c)}>
            <Icon data={ChevronDown} size={"1.25rem"} className={"transition-translate duration-200 " + (isOpen ? " rotate-0" : " -rotate-90")} />
            <div className="text-lg">{label}</div>
        </div>
        <div className={cl(className, "pl-7", "first:[&>*]:mt-2 last:[&>*]:mb-2", isOpen ? "block" : "hidden")}>
            {domToReact(children as DOMNode[], { replace })}
        </div>
    </div>
}
