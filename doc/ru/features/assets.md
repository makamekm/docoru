# Ассеты проекта

Система может отдавать файлы, картинки, видео и прочее в виде ассетов. Для этого достаточно прописать в файле конфигурации `config.yaml` пункт `assets`

```yaml
assets: "**/*.svg"
```

Этот формат указывается как glob, поэтому можно указать как папки, так и расширения, например:

```yaml
assets: "**/*.{svg,png,jpg,jpeg}"
```

Для получения картинки, достаточно указать относительный путь, например:

```
![Наше лого](../images/eagle.svg "Docoru"){"width": "200px"}
```

Тогда как абсолютная ссылка будет соответствующей:

```
/api/assets/images/eagle.svg
```