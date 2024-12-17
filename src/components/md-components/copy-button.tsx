"use client";

import { useMemo, useState } from "react";
import cl from "classnames";
import { Icon } from "@gravity-ui/uikit";
import { Copy, CopyCheck, CopyCheckXmark } from '@gravity-ui/icons';
import copy from 'copy-text-to-clipboard';

export function CopyButton({
    class: className,
    node,
}: {
    class?: string;
    node?: any;
}) {
    const [isCopied, setCopied] = useState(0);
    const context = useMemo(() => ({
        timeout: null
    } as {
        timeout: number | null;
    }), []);
    const children = node?.parent?.children;
    const copyBlock = (children?.children as any)?.find((node: any) => node.attribs?.['copy-code'] != null) as Element;
    const codeTextBlock: any = copyBlock?.children?.[0];
    const code = codeTextBlock?.data;

    const text = useMemo(() => {
        let text = '';
        try {
            text = atob(code);
        } catch (error) {
            //
        }
        return text;
    }, [code]);

    const setCopiedTimeout = (state: number) => {
        setCopied(state);
        if (context.timeout != null) window.clearTimeout(context.timeout);
        context.timeout = window.setTimeout(() => setCopied(0), 2000);
    };

    return <button onClick={() => {
        if (copy(text)) {
            setCopiedTimeout(1);
        } else {
            setCopiedTimeout(-1);
        }
    }} tabIndex={-1} className={cl(className, {
        'text-green-500': isCopied === 1,
        'text-red-500': isCopied === -1,
    }, "absolute right-3 top-3 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 active:opacity-100")}>
        <Icon data={isCopied === 0 ? Copy : (
            isCopied === 1 ? CopyCheck : CopyCheckXmark
        )} size={"1.25rem"} />
    </button>
}
