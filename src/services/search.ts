import lunr from "lunr";
import { convert } from "html-to-text";
import { getStorage } from '@/services/storage';
import { getContentFn, getNavs, getPageContent, getRootConfig } from '@/services/content';

export async function getPageIndex(pathname: string) {
    let languageAppex: string | undefined = pathname;
    languageAppex = languageAppex.replace(/^\//, '').trim();
    if (languageAppex === 'default') languageAppex = undefined;

    const storage = await getStorage();

    const config = await getRootConfig(storage);

    if (languageAppex === config.language) {
        languageAppex = undefined;
    }

    const languageCode = languageAppex || config.language;
    const language = config.languages?.find(laguage => laguage.code === languageCode);

    const pages: Set<string> = new Set();

    async function createIndex() {
        const dict: any = {};
        const builder = new lunr.Builder();
        builder.pipeline.add(
            lunr.trimmer,
            lunr.stemmer,
        );
        builder.searchPipeline.add(
            lunr.trimmer,
            lunr.stemmer,
        );

        builder.field('text');
        builder.ref('key');

        await addObjectsToIndex(builder, dict);

        return {
            index: builder.build(),
            dict,
        };
    }

    async function addObjectsToIndex(builder: lunr.Builder, dict: any): Promise<void> {
        if (language || !config.language) {
            const items = await storage.glob('**/*.md', language?.code);
            for (const item of items) {
                pages.add(item);
            }

            const { getContent } = await getContentFn(storage, language?.code);

            const { nav, navs } = await getNavs(getContent, config, languageAppex);

            await Promise.all([...pages.values()].map(async page => {
                const key = page.replace(/\.md$/i, '');

                if (navs.has(key)) {
                    const href = '/' + key + (languageAppex ? `.${languageAppex}` : '') + config.ext;

                    const content = await getContent(page);

                    const {
                        value,
                    } = await getPageContent(key, content, getContent, config, nav, language?.code, languageAppex);

                    const text = convert(value || "").replace(/\n\n+/gim, "\n").replace(/[#/s]+$/gim, '');

                    dict[href] = text.split('\n').filter(text => Boolean(text.trim()));

                    if (text) {
                        builder.add({
                            key: href,
                            text: text.toLocaleLowerCase(),
                        });
                    }
                }
            }));
        }
    }

    const { index, dict } = await createIndex();

    return {
        index: index.toJSON(),
        dict: dict,
    };
}