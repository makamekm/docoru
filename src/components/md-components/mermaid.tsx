"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import cl from "classnames";
import { type MermaidConfig } from "mermaid";

const DEFAULT_CONFIG = {
    startOnLoad: true,
    theme: "forest",
    logLevel: "fatal",
    securityLevel: "strict",
    arrowMarkerAbsolute: false,
    flowchart: {
        htmlLabels: true,
        curve: "linear",
    },
    sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        useMaxWidth: true,
        rightAngles: false,
        showSequenceNumbers: false,
    },
    gantt: {
        titleTopMargin: 25,
        barHeight: 20,
        barGap: 4,
        topPadding: 50,
        leftPadding: 75,
        gridLineStartPadding: 35,
        fontSize: 11,
        fontFamily: '"Inter", "sans-serif"',
        numberSectionStyles: 4,
        axisFormat: "%Y-%m-%d",
    },
}

export function Mermaid({
    class: className,
    node,
}: {
    class?: string;
    node?: any;
}) {
    const [inited, setInited] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const children = node?.children[0];
    const code = children?.data;
    const text = useMemo(() => atob(code), [code]);

    const load = async () => {
        if (typeof window !== 'undefined') {
            const mermaid: any = (await import("mermaid")).default;
            mermaid.initialize({ ...DEFAULT_CONFIG } as MermaidConfig);
            mermaid.contentLoaded();
            setTimeout(() => setInited(true));
        }
    }

    useEffect(() => {
        load();
    }, []);

    return <div className={cl("relative min-w-full flex justify-center", className)}>
        <div ref={ref} className={cl("mermaid inline transition-opacity duration-100", {
            'opacity-0': !inited,
            'opacity-100': inited,
        })}>
            {text}
        </div>
        <div className={cl("flex items-center justify-center absolute top-0 left-0 right-0 bottom-0 pointer-events-none", {
            'opacity-0 !hidden': inited,
            'opacity-100': !inited,
        })}>
            <div className="flex items-center justify-center max-w-full h-full bg-gray-300 rounded animate-pulse aspect-square p-10">
                <svg className="w-10 h-10 text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                </svg>
            </div>
        </div>
    </div>;
}
