import { createElement, Fragment } from 'react';
import { DOMNode, domToReact, Element } from 'html-react-parser';

import { Cut } from './md-components/cut';
import { Tabs } from './md-components/tabs';
import { Accord } from './md-components/accord';
import { CopyButton } from './md-components/copy-button';
import { Note } from './md-components/note';
import { Popup } from './md-components/popup';
import { Tooltip } from './md-components/tooltip';
import { Link } from './md-components/link';
import { Mermaid } from './md-components/mermaid';
import { IConfig } from './menu-layout';

const defaultTags = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'div', 'b', 'strong', 'figure', 'button', 'code', 'pre', 'img', 'video',
  'blockquote', 'strikethrough', 's', 'del',
  'br', 'em', 'li', 'ul', 'ol', 'hr',
  'iframe',
  'mermaid',
  'sup', 'sub', 'samp', 'u',
  'table', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th',
];

export const renderTags = [
  'cut',
  'tabs', 'tab',
  'accord', 'tab',
  'copy-button',
  'note',
  'popup', 'content',
  'tooltip',
  'icon',
  'iconify-icon',
];

export const tags = [
  ...renderTags,
  ...defaultTags,
];

export const attributes = [
  'id',
  'placement',
  'content',
  'style',
  'aria-hidden',
  'aria-describedby',
  'type',
  'class',
  'label',
  'copy-code',
  'selected',
  'open',
  'src',
  'alt',
  'iframe',
  'href',
  'autoplay',
  'align',
  'muted',
  'dir',
  'frameborder', 'allow', 'allowfullscreen',
  'xmlns', 'linebreak', 'display',
  'width', 'height', 'viewBox', 'preserveAspectRatio',
];

export const renderElements: {
  [key: string]: any;
} = {
  'copy-button': CopyButton,
  'cut': Cut,
  'tabs': Tabs,
  'accord': Accord,
  'popup': Popup,
  'tooltip': Tooltip,
  'note': Note,
  'a': Link,
  'mermaid': Mermaid,
};

export const headElements = ['h1', 'h2'];

const checkIFrameHeadingCut = (node: DOMNode, input: {
  replace: typeof replace;
  config?: IConfig;
}, context: any) => {
  if (input.config?.headerOnly != null && !context?.subHeaderOnly) {
    if (context.headerCutIndex >= 1) {
      return createElement(Fragment);
    }

    if (node instanceof Element) {
      if (headElements.includes(node.name) && node.attribs?.['data-heading-id']) {
        const anchor = node.attribs?.['data-heading-id'];

        if (context.headerCutIndex != null) {
          context.headerCutIndex += 1;
        }

        if (anchor === input.config?.headerOnly && context.headerCutIndex == null) {
          context.headerCutIndex = 0;
        }

        if (anchor !== input.config?.headerOnly) {
          return createElement(Fragment);
        }

        return domToReact(node.children as any, {
          replace: replace({
            ...context,
            subHeaderOnly: true,
          })(input),
        });
      }
    }

    if (context.headerCutIndex == null) {
      return createElement(Fragment);
    }

    if (node instanceof Element) {
      return domToReact(node.children as any, {
        replace: replace({
          ...context,
          subHeaderOnly: true,
        })(input),
      });
    }
  }
}

export const replace = (context: any) => (input: {
  replace: typeof replace;
  config?: IConfig;
}) => (node: DOMNode, index: number): JSX.Element | string | null | boolean | object | void => {
  const heading = checkIFrameHeadingCut(node, input, context);
  if (heading != null) return heading;

  if (node instanceof Element && node.attribs) {
    if (renderElements[node.name]) {
      return createElement(renderElements[node.name], {
        ...node.attribs,
        node: node,
        replace: replace(context)(input),
        context,
        config: input.config,
      }, node.children as any);
    }
  }
};