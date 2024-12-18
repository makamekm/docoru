import { createElement } from 'react';
import { Element } from 'html-react-parser';

import { Cut } from './md-components/cut';
import { Tabs } from './md-components/tabs';
import { Accord } from './md-components/accord';
import { CopyButton } from './md-components/copy-button';
import { Note } from './md-components/note';
import { Popup } from './md-components/popup';
import { Tooltip } from './md-components/tooltip';
import { Link } from './md-components/link';

const defaultTags = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'div', 'b', 'strong', 'figure', 'button', 'code', 'pre', 'img', 'video',
  'blockquote', 'strikethrough', 's', 'del',
  'br', 'em', 'li', 'ul', 'ol', 'hr',
  'iframe',
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
};

export const replace = (node: any) => {
  if (node instanceof Element && node.attribs) {
    if (renderElements[node.name]) {
      return createElement(renderElements[node.name], {
        ...node.attribs,
        node: node,
        replace,
      }, node.children as any);
    }
  }
};