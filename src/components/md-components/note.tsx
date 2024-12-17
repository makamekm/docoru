"use client";

import { DOMNode, domToReact } from 'html-react-parser';
import cl from "classnames";
import { Icon } from "@gravity-ui/uikit";
import { CircleInfoFill, TriangleExclamationFill } from '@gravity-ui/icons';

export function Note({
    children,
    class: className,
    type,
    replace,
}: {
    children: DOMNode[];
    class?: string;
    type?: string;
    open?: boolean;
    replace?: any;
}) {
    type = type ?? 'info';

    let icon = CircleInfoFill;

    if (['alert', 'warning'].includes(type)) {
        icon = TriangleExclamationFill;
    }

    return <div className={cl("flex my-6 rounded-lg px-6 py-4 gap-3 items-start", {
        'bg-gray-400/10': type === 'note',
        'bg-blue-400/10': type === 'info',
        'bg-red-400/10': type === 'alert',
        'bg-yellow-400/10': type === 'prewarning',
        'bg-orange-400/10': type === 'warning',
    }, className)}>
        <div
            className="flex items-center">
            <Icon data={icon} size={"2.25rem"} className={cl("mt-1", {
                '!text-gray-500': type === 'note',
                '!text-blue-500': type === 'info',
                '!text-red-500': type === 'alert',
                '!text-yellow-500': type === 'prewarning',
                '!text-orange-500': type === 'warning',
            }, className)} />
        </div>
        <div className={"first:[&>*]:mt-2 last:[&>*]:mb-2"}>{domToReact(children as DOMNode[], { replace })}</div>
    </div>
}
