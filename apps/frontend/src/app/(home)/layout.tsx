import { getLocale, getMessages } from 'next-intl/server';
import ClientRootLayout from './ClientRootLayout';
import '@/css/fonts-optimized.css';
import '@/css/fonts.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
})  {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="font-display" content="swap" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful');
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                });
              }
            `
          }}
        />
      </head>
      <body suppressHydrationWarning={true} style={{ backgroundColor: "var(--color-mainbg)" }}>
        <ClientRootLayout messages={messages} locale={locale}>
          {children}
        </ClientRootLayout>
      </body>
    </html>
  )
}
