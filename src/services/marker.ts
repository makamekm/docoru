import { Marked, MarkedOptions } from "marked";
import { createDirectives, DirectiveConfig, presetDirectiveConfigs } from "marked-directive";
import markedSequentialHooks from "marked-sequential-hooks";
import markedHookFrontmatter from "marked-hook-frontmatter";
import markedShiki from 'marked-shiki';
import { codeToHtml } from 'shiki';
import Mustache from "mustache";

import { genClassName, join, NotError, parseJson, parseString, PartialBy, relativeKeys } from "./utils";

export type MarkerOpts = {
  keys: string[];
  key: string;
  keysPath: string[];
  resolveKey(key: string, opts?: {
    removeExtension: boolean;
  }): string;
} & MarkedOptions & {
  async: true;
}

export type MarkerContext = {
  key: string;

  assetsPrefix: string;
  getContent: (key: string) => Promise<string>;
  getHrefFromKey: (key: string) => string;
  vars: any | Mustache.Context;

  onlyTitle?: boolean;
  title?: {
    id: string;
    label: string;
  };

  headings: {
    id: string;
    label: string;
  }[];
  headingsMap: Map<string, string>;
}

export type MarkerContextBuilder = PartialBy<PartialBy<MarkerContext, 'headings'>, 'headingsMap'>;

export class Marker {

  marked = new Marked();

  data: any = null;
  includeData: any = null;

  private opts: MarkerOpts;

  constructor(
    public readonly context: MarkerContext,
    opts?: MarkerOpts,
  ) {
    this.opts = opts ?? this.getOpts();
    this.init();
  }

  init() {
    const marker = this;

    this.marked.use({
      extensions: [
        {
          name: 'include',
          level: 'inline',
          tokenizer(src, tokens) {
            const rule = /^\{%\s*include\s+(.+)\s*%\}$/;
            const match = rule.exec(src);

            if (match) {
              const path: any = parseString(match[1]);
              const prevKeys = (this.lexer.options as any).keys ?? [];
              const keys = [...prevKeys, path];
              const key = relativeKeys(keys);
              const opts = this.lexer.options as MarkerOpts;
              const keysPath: string[] = [...(opts.keysPath ?? []), key];

              return {
                type: 'include',
                raw: match[0],
                path,
                html: '',
                tokens: [],
                opt: {
                  ...marker.marked.defaults,
                  ...marker.opts,
                  keys,
                  key,
                  keysPath,
                } as MarkedOptions,
              };
            }
          },
          renderer({ tokens, opt }: any) {
            return marker.marked.parser(tokens, opt);
          },
        },
      ],
      async: true,
      async walkTokens(token) {
        if (token.type === 'include') {
          // Генерация ключа
          const key = relativeKeys(token.opt.keys);

          const circularIndex = token.opt.keysPath.indexOf(key);
          if (circularIndex >= 0 && circularIndex < token.opt.keysPath.length - 1) {
            throw new Error('Circular dependency detected');
          }

          const text = await marker.context.getContent(key);

          // Чтение зависимости
          const content: string = text && Mustache.render(
            text,
            marker.context.vars,
          );

          // Генерация токенов
          token.tokens = await Promise.resolve(token.opt.hooks ? token.opt.hooks.preprocess(content) : content)
            .then(src => marker.marked.lexer(src, token.opt))
            .then(tokens => token.opt.hooks ? token.opt.hooks.processAllTokens(tokens) : tokens)
            .then(tokens => token.opt.walkTokens ? Promise.all(marker.marked.walkTokens(tokens, token.opt.walkTokens)).then(() => tokens) : tokens);
        }
      },
    });

    // const myAsyncHook: MarkdownHook = async (markdown, data) => {
    //   // const res = await fetch('https://dummyjson.com/posts/2')
    //   // Object.assign(data, await res.json())
    //   return markdown;
    // }

    this.marked.use(
      markedSequentialHooks({
        markdownHooks: [
          markedHookFrontmatter(),
          // myAsyncHook,
        ],
        htmlHooks: [
          (html, data) => {
            marker.data = marker.data ?? data ?? {};
            marker.includeData = {
              ...(marker.includeData ?? {}),
              ...(data ?? {}),
            };
            // return html
            //   .replace('{title}', data.title)
            //   .replace('{author}', data.author)
            return html;
          }
        ],
      })
    );

    const youtubeDirective: DirectiveConfig = {
      level: 'block',
      marker: '::',
      renderer(token) {
        if (token.meta.name === 'youtube') {
          const className = genClassName(token.attrs?.class);
          return `<iframe class="max-w-full${className ? ` ${className}` : ''}" src="https://www.youtube.com/embed/${token.attrs?.vid || ''
            }" title="${token.text
            }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
        }
        return false;
      },
    }

    // const mentionDirective: DirectiveConfig = {
    //   level: 'inline',
    //   marker: '@',
    //   renderer(token) {
    //     return `<a class="user-mention notranslate" href="/users/${token.meta.name}">${token.meta.name}</a>`;
    //   },
    // }

    // const hashtagDirective: DirectiveConfig = {
    //   level: 'inline',
    //   marker: '#',
    //   renderer(token) {
    //     return `<a class="hashtag" href="/tags/${token.meta.name}">${token.meta.name}</a>`;
    //   },
    // }

    this.marked.use(
      createDirectives([
        ...presetDirectiveConfigs,
        youtubeDirective,
        // mentionDirective,
        // hashtagDirective,
      ])
    );

    this.marked.use({
      breaks: true,
      renderer: {
        heading({ tokens, depth }) {
          const text = this.parser.parseInline(tokens);
          const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
          const heading = depth <= 3;

          if (heading && !marker.context.headingsMap.has(escapedText)) {
            marker.context.headingsMap.set(escapedText, text);
            marker.context.headings.push({
              id: escapedText,
              label: text,
            });

            if (marker.context.title == null) {
              marker.context.title = {
                id: escapedText,
                label: text,
              };
            } else if (marker.context.onlyTitle) {
              throw new NotError();
            }
          }

          return `<h${depth} class="${heading ? 'relative group heading' : ''}" ${heading ? `tabindex="-1" heading="${escapedText}"` : ''}>
          ${heading ? `<a id="${escapedText}" class="absolute top-[-9.5rem] pointer-events-none" data-heading="1"></a>` : ''}
          ${text}
          ${heading ? `<a class="inline xl:absolute xl:left-0 xl:translate-x-[calc(-100%-0.125rem)] scale-[80%] no-underline transition-colors duration-150 text-black/0 group-hover:text-purple-500 group-focus:text-purple-500 group-active:text-purple-500 hover:text-purple-500 focus:text-purple-500 active:text-purple-500 cursor-pointer" href="#${escapedText}">#</a>` : ''}
          </h${depth}>`;
        },
      },
      async: true,
    });

    const reIsAbsolute = /^[\w+]+:\/\//;

    this.marked.use({
      async walkTokens(token: any) {
        if (!['link', 'image'].includes(token.type)) {
          return;
        }

        if (reIsAbsolute.test(token.href)) {
          return;
        }

        token.isLocal = true;
      },
      async: true,
    });

    this.marked.use({
      extensions: [
        {
          name: 'image',
          level: 'inline',
          tokenizer(src) {
            const rule = /!(\[(.*)\])?\((\S+)\s*(.*)?\)(\{.+\})?/;
            const match = rule.exec(src);

            if (match) {
              const json: any = parseJson(match[5]);
              const alt: any = parseString(match[4]);

              return {
                ...json,
                type: 'image',
                raw: match[0],
                text: match[2],
                alt: alt,
                src: match[3],
              };
            }
          },
          renderer({ src, text, alt, isLocal, width, height, class: className, classText: classTextName, opt }: any) {
            if (isLocal) {
              const opts = this.parser.options as MarkerOpts;
              src = opts.resolveKey(src);
              src = join(marker.context.assetsPrefix, src);
            }

            className = genClassName(className);
            classTextName = genClassName(classTextName);

            const img = `<img class="max-w-full${className ? ` ${className}` : ''}${text ? ` not-prose` : ''}" style="width: ${width || 'auto'}; height: ${height || 'auto'};" src="${src}" alt="${alt}">`;

            if (!text) {
              return img;
            }

            return `<div class="flex flex-col w-full text-center gap-4 items-center">
            ${img}
            ${text ? `<div class="opacity-80${classTextName ? ` ${classTextName}` : ''}">${text}</div>` : ''}
            </div>`;
          },
        },
      ],
      // async: true, // needed to tell marked to return a promise
      // async walkTokens(token: any) {
      //   if (token.type === 'image') {
      //     // const res = await fetch(token.url);
      //     // token.html = await res.text();
      //   }
      // },
    });

    // this.marked.use({
    //   renderer: {
    //     image({ tokens, href, text, title, isLocal }: any) {
    //       if (isLocal) {
    //         href = join(marker.context.assetsPrefix, href);
    //       }

    //       return `<img class="max-w-full" src="${href}">`;
    //     },
    //   },
    //   async walkTokens(token) {
    //     if (token.type === 'image') {
    //       try {
    //         // await fetch(token.href);
    //         // token.title = 'valid';
    //       } catch (ex) {
    //         // token.title = 'invalid';
    //       }
    //     }
    //   },
    //   async: true,
    // });

    this.marked.use({
      renderer: {
        link({ href, text, title, isLocal }: any) {
          if (isLocal) {
            const opts = this.parser.options as MarkerOpts;
            href = opts.resolveKey(href, {
              removeExtension: true,
            });
          }

          return `<a target="${isLocal ? '_self' : '_blank'}" href="${marker.context.getHrefFromKey(href)}" class="no-underline text-purple-500 hover:underline hover:text-purple-800 focus:text-purple-800 active:text-purple-800 cursor-pointer">${text} (${title})</a>`;
        },
      },
      async walkTokens(token) {
        if (token.type === 'link') {
          const text = token.text.trim();
          const href = token.href.trim();
          if (text === '{#T}') {
            // Генерация ключа
            const key = relativeKeys([href]);

            const circularIndex = marker.opts.keysPath.indexOf(key);
            if (circularIndex >= 0 && circularIndex < marker.opts.keysPath.length - 1) {
              throw new Error('Circular dependency detected');
            }

            // Чтение зависимости
            const content: string = await marker.context.getContent(key);

            const subMarker = Marker.build({
              ...marker.context,
              key,
              onlyTitle: true,
            }, {
              ...marker.opts,
              keysPath: [...marker.opts.keysPath, key],
            });
            const title = await subMarker.parseTitle(content);
            token.text = title?.label ?? '<EMPTY>';
          }

          try {
            // await fetch(token.href);
            token.title = 'valid';
          } catch (ex) {
            token.title = 'invalid';
          }
        }
      },
      async: true,
    });

    this.marked.use({
      breaks: true,
      renderer: {
        codespan({ text, code }: any) {
          return `<span class="font-mono bg-green-500/10 px-1">${code}</span>`;
        },
      },
      async: true,
      async walkTokens(token: any) {
        if (!['codespan'].includes(token.type)) {
          return;
        }

        const match = /^(.+)({:(\w+)})$/mi.exec(token.text);

        if (match?.[3]) {
          token.text = match[1];
          token.lang = match[3];
        }

        token.code = await codeToHtml(token.text, { lang: token.lang || 'text', theme: 'min-light', structure: 'inline' });
      },
    });

    this.marked.use(
      markedShiki({
        async highlight(code, lang) {
          return `
            <div copy-code class="hidden">${btoa(code)}</div>
            ${await codeToHtml(code, { lang, theme: 'min-light' })}
          `;
        },
        container: `<figure class="relative group">
          <copy-button></copy-button>
          %s
        </figure>`
      }),
    );
  }

  getOpts(): MarkerOpts {
    return {
      key: this.context.key,
      keys: [],
      keysPath: [this.context.key],
      async: true,
      resolveKey(key: string, opts?: {
        removeExtension: boolean;
      }) {
        let rest: string[];
        [key, ...rest] = key.split('#');

        const keys = (this as any).keys ?? [];
        key = relativeKeys([...keys, key]);

        if (opts?.removeExtension && /\.(md|html)$/i.test(key)) {
          key = key.replace(/\.\w+$/i, '');
        }

        if (rest.length) {
          key = [key, ...rest].filter(s => s?.trim()?.length).join('#');
        }

        return key;
      },
    };
  }

  static build(context: MarkerContextBuilder, opts?: MarkerOpts) {
    return new Marker({
      ...context,
      title: undefined,
      headings: [],
      headingsMap: new Map(),
    }, opts);
  }

  async parse(text: string) {
    text = text && Mustache.render(text, this.context.vars);
    return await this.marked.parse(
      text,
      this.opts,
    );
  }

  async parseTitle(text: string) {
    text = text && Mustache.render(text, this.context.vars);
    try {
      await this.marked.parse(
        text,
        this.opts,
      );
    } catch (error: any) {
      if (!(error instanceof NotError)) {
        throw error;
      }
    }
    return this.context.title;
  }
}