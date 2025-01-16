const { $ } = require('zx');
const { resolve } = require('path');
const { writeFile } = require('fs/promises');

const tmps = {
    'simple': {
        files: [
            {
                name: 'run.sh',
                content: `#!/bin/sh

rm -rf ./build/* && npx -y docoru build --out ./build && npx -y http-server ./build --port=3000 --host=0.0.0.0 --cors
`,
            },
            {
                name: 'config.yaml',
                content: `assets: "**/*.{svg,png,jpg,jpeg}"
`,
            },
            {
                name: 'nav.yaml',
                content: `title:
  href: "/"
  image: "/api/assets/images/logo.svg"

locale:
  heading: "In the article:"
  prev: "Next"
  next: "Previous"
  search: "Search..."

top:
  - label: Github
    href: https://github.com/makamekm/docoru

left:
  - label: Overview
    href: index
`,
            },
            {
                name: 'index.md',
                content: `# Hello world!

This is the best documentation in the world!
`,
            },
            {
                name: 'images/logo.svg',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 107.31 27.32">
  <defs>
    <style>
      .cls-1 {
        font-family: Kankin, Kankin;
        font-size: 24px;
      }

      .cls-1, .cls-2 {
        fill: #662d91;
      }

      .cls-2 {
        stroke-width: 0px;
      }
    </style>
  </defs>
  <g>
    <path class="cls-2" d="m16.57,16.48l-.35.35.24.47-.47-.12-.35.24-.35-.24-.05-.45-.56-.06-.07-.07-.58.03-.18-.64-.15,1.26-.24-.11.22.67.76.43h-.46s-.11.47-.11.47l-.59-.24-.24.24-.13-.36.14-.27-.19-.85-.23.52-.25-1.16-.46-.25-.77.09.68-.53-3.4.67,2.01-.85-4.08.39,1.68-.79-3.36-.29,7.13-2.15-1.19-.56,2.46-.14-4.84-1.84,2.71.11-3.18-.9-1.96-2.53,1.86.61-2.75-2.99-.56-2.56,2.95,2.53L4.88,0l11.49,10.03.3.05,1.43-.61,2.23.58-.07.54.53.16.34,1.11-1.79-.31-3.42,3-.53,1.56.23.36h.94Z"/>
    <polygon class="cls-2" points="13.26 20.76 25.65 17.16 26.26 17.69 13.26 23.76 0 17.58 .61 17.16 13.26 20.76"/>
    <polygon class="cls-2" points="14.38 4.47 15.43 6.38 14.75 3.68 15.33 2.29 15.84 3.95 16.12 1.01 19.06 7.67 18.65 8.97 16.49 9.29 14.2 6.36 14.38 4.47 14.38 4.47"/>
  </g>
  <text class="cls-1" transform="translate(31.26 20.89)"><tspan x="0" y="0">DOCORU</tspan></text>
</svg>
`,
            },
        ],
    },
    'langs': {
        files: [
            {
                name: 'run.sh',
                content: `#!/bin/sh

rm -rf ./build/* && npx -y docoru build --out ./build && npx -y http-server ./build --port=3000 --host=0.0.0.0 --cors
`,
            },
            {
                name: 'config.yaml',
                content: `languages:
  - label: Русский
    flag: ru
    code: ru
  - label: English
    flag: en
    code: en

assets: "**/*.{svg,png,jpg,jpeg}"

redirects:
  - from: /
    to: hello.en
    normalize: false
  - from: /
    to: hello
`,
            },
            {
                name: 'en/nav.yaml',
                content: `title:
  href: "/"
  image: "/api/assets/images/logo.svg"

locale:
  heading: "In the article:"
  prev: "Next"
  next: "Previous"
  search: "Search..."

top:
  - label: Github
    href: https://github.com/makamekm/docoru

left:
  - label: Overview
    href: hello
`,
            },
            {
                name: 'en/hello.md',
                content: `# Hello world!

This is the best documentation in the world!
`,
            },
            {
                name: 'ru/nav.yaml',
                content: `title:
  href: "/"
  image: "/api/assets/images/logo.svg"

locale:
  heading: "В этой статье:"
  prev: "Предыдущая"
  next: "Следующая"
  search: "Поиск..."

top:
  - label: Github
    href: https://github.com/makamekm/docoru

left:
  - label: Overview
    href: hello
`,
            },
            {
                name: 'ru/hello.md',
                content: `# Привет Мир!

Это лучшая документация в мире!
`,
            },
            {
                name: 'images/logo.svg',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 107.31 27.32">
  <defs>
    <style>
      .cls-1 {
        font-family: Kankin, Kankin;
        font-size: 24px;
      }

      .cls-1, .cls-2 {
        fill: #662d91;
      }

      .cls-2 {
        stroke-width: 0px;
      }
    </style>
  </defs>
  <g>
    <path class="cls-2" d="m16.57,16.48l-.35.35.24.47-.47-.12-.35.24-.35-.24-.05-.45-.56-.06-.07-.07-.58.03-.18-.64-.15,1.26-.24-.11.22.67.76.43h-.46s-.11.47-.11.47l-.59-.24-.24.24-.13-.36.14-.27-.19-.85-.23.52-.25-1.16-.46-.25-.77.09.68-.53-3.4.67,2.01-.85-4.08.39,1.68-.79-3.36-.29,7.13-2.15-1.19-.56,2.46-.14-4.84-1.84,2.71.11-3.18-.9-1.96-2.53,1.86.61-2.75-2.99-.56-2.56,2.95,2.53L4.88,0l11.49,10.03.3.05,1.43-.61,2.23.58-.07.54.53.16.34,1.11-1.79-.31-3.42,3-.53,1.56.23.36h.94Z"/>
    <polygon class="cls-2" points="13.26 20.76 25.65 17.16 26.26 17.69 13.26 23.76 0 17.58 .61 17.16 13.26 20.76"/>
    <polygon class="cls-2" points="14.38 4.47 15.43 6.38 14.75 3.68 15.33 2.29 15.84 3.95 16.12 1.01 19.06 7.67 18.65 8.97 16.49 9.29 14.2 6.36 14.38 4.47 14.38 4.47"/>
  </g>
  <text class="cls-1" transform="translate(31.26 20.89)"><tspan x="0" y="0">DOCORU</tspan></text>
</svg>
`,
            },
        ],
    },
    'lang': {
        files: [
            {
                name: 'run.sh',
                content: `#!/bin/sh

rm -rf ./build/* && npx -y docoru build --out ./build && npx -y http-server ./build --port=3000 --host=0.0.0.0 --cors
`,
            },
            {
                name: 'config.yaml',
                content: `language: ru

languages:
  - label: Русский
    flag: ru
    code: ru
  - label: English
    flag: en
    code: en

assets: "**/*.{svg,png,jpg,jpeg}"
`,
            },
            {
                name: 'en/nav.yaml',
                content: `title:
  href: "/"
  image: "/api/assets/images/logo.svg"

locale:
  heading: "In the article:"
  prev: "Next"
  next: "Previous"
  search: "Search..."

top:
  - label: Github
    href: https://github.com/makamekm/docoru

left:
  - label: Overview
    href: index
`,
            },
            {
                name: 'en/index.md',
                content: `# Hello world!

This is the best documentation in the world!
`,
            },
            {
                name: 'ru/nav.yaml',
                content: `title:
  href: "/"
  image: "/api/assets/images/logo.svg"

locale:
  heading: "В этой статье:"
  prev: "Предыдущая"
  next: "Следующая"
  search: "Поиск..."

top:
  - label: Github
    href: https://github.com/makamekm/docoru

left:
  - label: Overview
    href: index
`,
            },
            {
                name: 'ru/index.md',
                content: `# Привет Мир!

Это лучшая документация в мире!
`,
            },
            {
                name: 'images/logo.svg',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 107.31 27.32">
  <defs>
    <style>
      .cls-1 {
        font-family: Kankin, Kankin;
        font-size: 24px;
      }

      .cls-1, .cls-2 {
        fill: #662d91;
      }

      .cls-2 {
        stroke-width: 0px;
      }
    </style>
  </defs>
  <g>
    <path class="cls-2" d="m16.57,16.48l-.35.35.24.47-.47-.12-.35.24-.35-.24-.05-.45-.56-.06-.07-.07-.58.03-.18-.64-.15,1.26-.24-.11.22.67.76.43h-.46s-.11.47-.11.47l-.59-.24-.24.24-.13-.36.14-.27-.19-.85-.23.52-.25-1.16-.46-.25-.77.09.68-.53-3.4.67,2.01-.85-4.08.39,1.68-.79-3.36-.29,7.13-2.15-1.19-.56,2.46-.14-4.84-1.84,2.71.11-3.18-.9-1.96-2.53,1.86.61-2.75-2.99-.56-2.56,2.95,2.53L4.88,0l11.49,10.03.3.05,1.43-.61,2.23.58-.07.54.53.16.34,1.11-1.79-.31-3.42,3-.53,1.56.23.36h.94Z"/>
    <polygon class="cls-2" points="13.26 20.76 25.65 17.16 26.26 17.69 13.26 23.76 0 17.58 .61 17.16 13.26 20.76"/>
    <polygon class="cls-2" points="14.38 4.47 15.43 6.38 14.75 3.68 15.33 2.29 15.84 3.95 16.12 1.01 19.06 7.67 18.65 8.97 16.49 9.29 14.2 6.36 14.38 4.47 14.38 4.47"/>
  </g>
  <text class="cls-1" transform="translate(31.26 20.89)"><tspan x="0" y="0">DOCORU</tspan></text>
</svg>
`,
            },
        ],
    },
};

async function initProject(dir, type) {
    const project = tmps[type] ?? tmps['simple'];
    for (const { name, content } of project.files) {
        await $`mkdir -p ${resolve(dir, name, '..')}`;
        await writeFile(resolve(dir, name), content, 'utf-8');
    }
}

module.exports = {
    initProject,
};
