"use client";

import { Suspense } from 'react';
import parse from 'html-react-parser';

import { replace } from './md';
import { IConfig } from './menu-layout';

export function RenderHtml({
  value,
  context,
  config,
}: Readonly<{
  value?: string | null;
  context?: any;
  config?: IConfig;
}>) {
  const replaceFn = replace({
    config,
    context: context ?? {},
    replace: () => replaceFn,
  });
  const elements = value ? parse(value, {
    replace: replaceFn,
  }) : null;

  return <Suspense>
    {elements}
  </Suspense>;
}
