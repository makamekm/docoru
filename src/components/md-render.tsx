"use client";

import { Suspense } from 'react';
import parse from 'html-react-parser';

import { replace } from './md';

export function RenderHtml({
  value,
}: Readonly<{
  value?: string | null;
}>) {

  const elements = value ? parse(value, {
    replace,
  }) : null;

  return <Suspense>
    {elements}
  </Suspense>;
}
