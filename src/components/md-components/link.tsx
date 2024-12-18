"use client";

import { DOMNode, domToReact } from 'html-react-parser';
import LinkNative from 'next/link';

export function Link({
    children,
    class: className,
    href,
    replace,
    ...props
}: {
    children: DOMNode[];
    class?: string;
    href?: string;
    replace?: any;
}) {
    return href != null
        ? <LinkNative className={className} href={href} {...props}>
            {domToReact(children as DOMNode[], { replace }) as JSX.Element}
        </LinkNative>
        : <a className={className} href={href || ""} {...props}>{domToReact(children as DOMNode[], { replace }) as JSX.Element}</a>;
}
