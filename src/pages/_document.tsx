import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ishow.fit";
  
  return (
    <Html lang="en-AE" className="h-full antialiased">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "iShow Transformation",
              "description": "Personal training and fitness coaching in Dubai, UAE",
              "url": siteUrl,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Dubai",
                "addressCountry": "AE"
              },
              "founder": {
                "@type": "Person",
                "name": "Mohammed Sufiyan"
              },
              "priceRange": "$$",
              "areaServed": ["Dubai", "Abu Dhabi", "UAE"]
            })
          }}
        />
      </Head>
      <body className="min-h-full font-sans">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
