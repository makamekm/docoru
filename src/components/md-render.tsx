"use client";

import { Suspense } from 'react';
import parse from 'html-react-parser';

import { replace } from './md';
import { IConfig } from './menu-layout';

export function RenderHtml({
  value,
  config,
}: Readonly<{
  value?: string | null;
  config?: IConfig;
}>) {
  const context: any = {};

  const replaceFn = replace(context)({
    config,
    replace: (context: any) => replace(context),
  });

  const elements = value ? parse(value, {
    replace: replaceFn,
  }) : null;

  return <Suspense>
    {elements}
  </Suspense>;
}
