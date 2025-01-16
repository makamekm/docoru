// import type { Metadata } from "next";
// import localFont from "next/font/local";
import { getRootClassName } from '@gravity-ui/uikit/server';
import "./globals.css";
import "./theme.scss";

const theme = 'light';
const rootClassName = getRootClassName({ theme });

import { configure, ThemeProvider, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import { LayoutContextOverlay } from '@/services/context';

configure({
  lang: 'en',
});

// const geistSans = localFont({
//   src: "../fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });

// const geistMono = localFont({
//   src: "../fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// export const metadata: Metadata = {
//   title: "Docoru",
//   description: "Docoru",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider theme={theme}>
      <LayoutContextOverlay>
        <html lang="en" className={rootClassName}>
          <body
            className="bg-white break-words flex flex-col justify-stretch max-dvh"
          // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ToasterProvider>
              {children}
              <ToasterComponent />
            </ToasterProvider>
          </body>
        </html>
      </LayoutContextOverlay>
    </ThemeProvider>
  );
}
