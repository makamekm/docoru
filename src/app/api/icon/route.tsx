import { ImageResponse } from 'next/og'

const size = {
    width: 32,
    height: 32,
};

export async function GET() {
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
        }
    )
}

export async function generateStaticParams() {
    return [{}];
}
