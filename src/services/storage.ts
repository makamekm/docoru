import * as AWS from "@aws-sdk/client-s3";
import { Upload, Progress } from "@aws-sdk/lib-storage";
import { glob } from 'glob'
import { $ } from 'zx';
import { createReadStream, createWriteStream } from "node:fs";
import { readFile, writeFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";

let storage: IStorage;

export async function getStorage() {
    storage = storage ?? new LocalStorage();
    return storage;
}

// return new AWS.S3({
//     endpoint: process.env.STORAGE_ENDPOINT,
//     region: process.env.STORAGE_REGION ?? 'eu-central-1',
//     credentials: {
//         accessKeyId: process.env.STORAGE_KEY_ID!,
//         secretAccessKey: process.env.STORAGE_KEY!,
//     },
// });

// export async function uploadS3(params: AWS.PutObjectCommandInput, onProgress: (progress: Progress) => void) {
//     const client = await getS3();
//     const parallelUploads3 = new Upload({
//         client: client,
//         // queueSize: 4, // optional concurrency configuration
//         // partSize: 5MB, // optional size of each part
//         leavePartsOnError: false, // optional manually handle dropped parts
//         params: params,
//     });

//     parallelUploads3.on("httpUploadProgress", onProgress);

//     await parallelUploads3.done();
// }

export interface IStorage {
    exist(key: string): Promise<boolean>;
    read(key: string): Promise<Readable>;
    readString(key: string): Promise<string>;
    readJSON<T = any>(key: string, defaultValue: T): Promise<T>;
    write(key: string, stream: Readable): Promise<boolean>;
    writeJSON<T = any>(key: string, value: T): Promise<void>;
    writeString<T = any>(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
    list(key: string): Promise<string[]>;
    glob(pattern: string, sub?: string): Promise<string[]>;
}

export class LocalStorage implements IStorage {
    path = resolve(process.env.DOCS ?? './');

    exist = async (key: string) => {
        try {
            await stat(resolve(this.path, key));
        } catch (error) {
            // console.log(error);
        }
        return false;
    }

    read = async (key: string) => {
        return createReadStream(resolve(this.path, key));
    }

    readString = async (key: string) => {
        let text: any = undefined;
        try {
            text = await readFile(resolve(this.path, key), "utf-8");
        } catch (error) {
            // console.log(error);
        }
        return text;
    }

    readJSON = async <T = any>(key: string, defaultValue: T): Promise<T> => {
        let json: any = undefined;
        try {
            const text = await readFile(resolve(this.path, key), "utf-8");
            json = JSON.parse(text ?? "{}");
        } catch (error) {
            // console.log(error);
        }
        return json ?? defaultValue;
    }

    write = async (key: string, stream: Readable) => {
        return new Promise<boolean>(async (r, e) => {
            await $`mkdir -p ${dirname(resolve(this.path, key))}`;
            const ws = createWriteStream(resolve(this.path, key));
            stream.pipe(ws);
            ws.on("finish", () => { r(true); });
            ws.on("error", e);
        });
    }

    writeString = async (key: string, value: string) => {
        writeFile(resolve(this.path, key), value);
    }

    writeJSON = async <T = any>(key: string, value: T) => {
        writeFile(resolve(this.path, key), JSON.stringify(value));
    }

    remove = async (key: string) => {
        await $`rm -rf ${resolve(this.path, key)} || true`;
    }

    list = async (key: string) => {
        const files = (await $`ls ${resolve(this.path, key)}`).toString().split('\n').filter(Boolean);
        return files.map(file => join(key, file.trim()));
    }

    glob = async (pattern: string, sub?: string) => {
        return await glob([pattern], {
            nodir: true,
            cwd: resolve(this.path, sub ?? ''),
        });
    }
}