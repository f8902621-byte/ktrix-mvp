import Head from 'next/head'
import { useRouter } from 'next/router'

const BASE_URL = 'https://www.ktrix.ai'

const PAGE_META = {
  '/': {
    title: 'K Trix — Tìm kiếm bất động sản AI tại Việt Nam',
    description:
      'K Trix là nền tảng tìm kiếm bất động sản AI đầu tiên tại Việt Nam. Tìm nhà, căn hộ, đất nền nhanh và thông minh hơn bao giờ hết.',
  },
  '/privacy': {
    title: 'Chính sách bảo mật — K Trix',
    description: 'Chính sách bảo mật dữ liệu của K Trix.',
  },
  '/terms': {
    title: 'Điều khoản sử dụng — K Trix',
    description: 'Điều khoản và điều kiện sử dụng nền tảng K Trix.',
  },
  '/search': {
    title: 'Tìm kiếm bất động sản — K Trix',
    description: 'Tìm kiếm nhà, căn hộ, đất nền tại Việt Nam với AI.',
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'K Trix',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.webp`,
        width: 200,
        height: 60,
      },
      description: 'Nền tảng tìm kiếm bất động sản AI hàng đầu Việt Nam.',
      areaServed: { '@type': 'Country', name: 'Vietnam' },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'K Trix',
      publisher: { '@id': `${BASE_URL}/#organization` },
      inLanguage: ['vi', 'en', 'fr'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${BASE_URL}/#software`,
      name: 'K Trix',
      url: BASE_URL,
      applicationCategory: 'RealEstateApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'VND',
        description: 'Dùng thử miễn phí',
      },
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
  ],
}

export default function SeoHead({ path, ogImage = '/og-image.png' }) {
  const router = useRouter()
  const currentPath = path ?? router.pathname
  const canonical = `${BASE_URL}${currentPath === '/' ? '' : currentPath}`
  const meta = PAGE_META[currentPath] ?? PAGE_META['/']
  const ogImageUrl = `${BASE_URL}${ogImage}`

  return (
    <Head>
      {/* Basic */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />

      {/* hreflang */}
      <link rel="alternate" hrefLang="vi" href={canonical} />
      <link rel="alternate" hrefLang="en" href={`${BASE_URL}/en${currentPath}`} />
      <link rel="alternate" hrefLang="fr" href={`${BASE_URL}/fr${currentPath}`} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:site_name" content="K Trix" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />
    </Head>
  )
}
