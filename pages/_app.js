import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>K Trix — Recherche Immobilière IA au Vietnam</title>
        <meta name="description" content="Plateforme de recherche immobilière intelligente pour le marché vietnamien. Agrégation multi-sources, analyse IA, détection d'opportunités." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#030712" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
