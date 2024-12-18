export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export class NotError extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, NotError.prototype);
    }
}

export function removeIndex(str: string) {
    if (/([\w]?\/*)index$/i.test(str)) {
        return str.replace(/[\/]*index/gi, '');
    }
    return str;
}

export function normalizePath(path: string) {
    if (path.startsWith('/')) {
        return path.replace(/^\/+/, '');
    }

    if (path.startsWith('.')) {
        return path;
    }

    return './' + path;
}

export function splitPath(path: string) {
    return normalizePath(path)
        .split('/')
        .map(part => part.trim())
        .filter(part => !!part.length && part !== '.');
}

export function getDir(path: string) {
    return path.substring(0, path.lastIndexOf('/') + 1).trim().replace(/\/$/, '');;
}

export function join(...paths: string[]) {
    const parts: string[] = [];

    paths.forEach(path => {
        if (typeof path !== 'string') {
            throw new TypeError('Path must be a string');
        }

        path.split('/').forEach(part => {
            if (part === '' || part === '.') {
                // Игнорируем пустые сегменты и '.'
                return;
            } else if (part === '..') {
                // '..' означает, что нужно перейти на уровень вверх
                if (parts.length > 0 && parts[parts.length - 1] !== '..') {
                    parts.pop();
                } else {
                    parts.push(part);
                }
            } else {
                // Обычная часть пути
                parts.push(part);
            }
        });
    });

    return parts.join('/');
}

export function relative(from: string, to: string) {
    from = normalizePath(from);
    to = normalizePath(to);
    const fromDir = from.substring(0, from.lastIndexOf('/') + 1).trim().replace(/\/$/, '');
    const path = [...splitPath(fromDir), ...splitPath(to)];

    let index = 0;
    while (index < path.length) {
        const value = path[index];
        if (value === '..') {
            if (index > 0 && path[index - 1] !== '..') {
                path.splice(index - 1, 2);
                continue;
            }
        }
        index++;
    }

    return path.join('/');
}

export function relativeKeys(keys: string[]) {
    let key = keys[0];
    for (let index = 1; index < keys.length; index++) {
        key = relative(key, keys[index]);
    }
    return key;
}

export function genClassName(className: any) {
    return String(className ?? '')
        .replace(/#\|/g, '[')
        .replace(/\|#/g, ']')
        .trim();
}

export function parseString(str: any) {
    let value: any = str?.trim().replace(/'/g, '"');

    if (value) {
        try {
            value = JSON.parse(value).toString();
        } catch (error) {
            console.log(error);
        }
    }

    return value;
}

export function parseJson(str: any) {
    let json: any = {};

    if (str) {
        try {
            json = JSON.parse(str?.trim());
        } catch (error) {
            //
        }
    }

    return json;
}