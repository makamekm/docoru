import { getRootConfig } from '@/services/content';
import { getStorage } from '@/services/storage';
import { getHrefFromKey } from '@/services/utils';
import Link from 'next/link'
import { redirect, RedirectType } from 'next/navigation';

export default async function NotFound() {
    const storage = await getStorage();

    const config = await getRootConfig(storage);

    const redirected = config.redirects?.find(r => r.from === "");

    if (redirected) {
        return redirect(getHrefFromKey(redirected.to ?? '/'), RedirectType.replace);
    }

    return (
        <div className='container gap-3 px-3 pt-[25rem] pb-[10rem] prose mx-auto'>
            <h2>Not Found</h2>
            <p>Could not find requested resource</p>
            <Link href="/">Return Home</Link>
        </div>
    )
}
