import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server';

const size = {
    width: 32,
    height: 32,
};

export async function GET(req: NextRequest) {
    const _path = req.nextUrl.pathname?.replace(/^\/api\/icons\//g, '') ?? '';

    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '8px',
                }}
            >
                D
            </div>
        ),
        {
            ...size,
            headers: {
                'Content-Type': 'image/png',
            },
        }
    )
}

export async function generateStaticParams() {
    return [{
        slug: 'icon.png',
    }];
}
