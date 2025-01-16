# Структура

Структура можеть быть с языками, или же без них:

1. Без языков
    - `config.yaml{:js}`
    - `nav.yaml{:js}`
    - Ассеты (картинки и прочее)
    - Файлы документации `.md{:js}`

2. С языками
    - `config.yaml{:js}`
    - Общие ассеты (картинки и прочее)
    - Папка языка ru,en,...
    - - `nav.yaml{:js}`
    - - Ассеты (картинки и прочее)
    - - Файлы документации `.md{:js}`

## Содержание файлов

Система генерирует документацию по следующим 4ем типам файлов:

### config.yaml

- Корневой файл конфигурации `config.yaml{:js}`, например:

```yaml
language: en

languages:
  - label: English
    flag: en
    code: en
  - label: Русский
    flag: ru
    code: ru

assets: "**/*.svg"

redirects:
  - from: subfolder/test2
    to: /test2
  - from: subfolder/test3
    to: /test3
  - from: subfolder/tables/multiline
    to: /index
  - from: subfolder/tables/gfm
    to: /index
```

### Ассеты .jpeg, ...

- Далее идут файлы ассетов, указанные в `config.yaml{:js}`

### Файлы документации Markdown .md

- Файлы документации в формате `.md{:js}`

### nav.yaml

- Файл навигации в корне `nav.yaml{:js}`, или внутри папки каждого языка  `ru/nav.yaml{:js}`, например:

```yaml
title:
  href: "/"
  image: "/api/assets/images/logo.svg"

locale:
  heading: "In the article:"
  prev: "Next"
  next: "Previous"
  search: "Search..."

vars:
  canSeeExamples: true

top:
  - label: Google
    href: https://google.com
  - label: Overview
    href: index
  - label: Quick start
    href: quick

left:
  - label: Quick start
    href: quick
  - label: Markdown
    href: markdown
    items:
      - label: Syntax
        expanded: true
        open: true
        items:
          - label: Index
            href: subfolder/index
          - label: Overview
            href: subfolder/test
          - label: Tables
            open: true
            items:
              - label: Overview
                href: subfolder/tables/overview
              - label: Examples
                href: subfolder/tables/examples
      - label: Settings
        href: settings

hidden:
  - subfolder/tables/multiline
```

Все страницы генерируются исключительно по описанию их в `nav.yaml{:js}` файлах. Для того, чтобы страницу из навигации, достаточно добавить маршрут в `hidden` поле.
