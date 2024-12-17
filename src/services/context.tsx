"use client"

import { createContext, useMemo, ReactNode } from 'react';
import { BehaviorSubject } from "rxjs";

export const LayoutContext = createContext<{
    isOpenPageMenu?: BehaviorSubject<boolean>;
    isFullscreen?: BehaviorSubject<boolean>;
}>({});

export function LayoutContextOverlay({
    children,
}: {
    children: ReactNode;
}) {
    const context = useMemo(() => ({
        isOpenPageMenu: new BehaviorSubject(false),
        isFullscreen: new BehaviorSubject(false),
    }), []);

    return (
        <LayoutContext.Provider value={context}>
            {children}
        </LayoutContext.Provider>
    );
}
