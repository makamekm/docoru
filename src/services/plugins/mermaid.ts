// import { memoize } from 'lodash';
import { MarkedExtension } from 'marked';
// import Mermaid from 'mermaid';

// const defaultOptions: any = {
//     mermaid: {},
//     container: undefined,
//     callback: undefined
// };
// const isBrowser = global.document !== undefined && global.window !== undefined;

export default function markedMermaid(options: any = {}): MarkedExtension {
    // let initialized = false;

    // // Make sure we have access to the document and window object (client-side rendering)
    // if (isBrowser) {
    //     // Initialize Mermaid, but do not automatically start
    //     Mermaid.initialize({
    //         ...options.mermaid,
    //         startOnLoad: false
    //     });

    //     initialized = true;
    // }

    // // We memoize mermaid.render here to optimize performance
    // const renderMermaid = memoize(async (code, container: any = undefined) => {
    //     const id = Math.floor(Math.random() * 100);
    //     try {
    //         return `<pre id="mermaid-${id}" class="mermaid" data-processed="true">${await Mermaid.render(`mermaid-${id}`, code, container)}</pre>`;
    //     } catch (ex) {
    //         return `<pre><code>${ex}</code></pre>`;
    //     }
    // });

    // options = {
    //     ...defaultOptions,
    //     ...options
    // };

    return {
        extensions: [
            {
                name: 'mermaid',
                level: 'inline',
                tokenizer(src) {
                    const rule = /^\{%\s*mermaid\s+(.+)\s*%\}$/gmi;
                    const match = rule.exec(src);

                    if (match) {
                        return {
                            type: 'mermaid',
                            raw: match[0],
                            text: match[1],
                        };
                    }
                },
                renderer({ mermaid }: any) {
                    return mermaid;
                },
            },
        ],
        async walkTokens(token: any) {
            if (!['mermaid'].includes(token.type)) {
                return;
            }

            token.mermaid = `<div class="flex justify-center"><mermaid>${btoa(token.text)}</mermaid></div>`;
        },
        async: true,
    };
}