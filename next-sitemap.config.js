/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.ktrix.ai',
  generateRobotsTxt: false, // On gère robots.txt manuellement
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/monitoring', '/api/*'],
  additionalPaths: async (config) => [
    await config.transform(config, '/'),
    await config.transform(config, '/privacy'),
    await config.transform(config, '/terms'),
  ],
  transform: async (config, path) => {
    const priorities = {
      '/': 1.0,
      '/features': 0.9,
      '/pricing': 0.9,
      '/about': 0.8,
      '/blog': 0.8,
      '/privacy': 0.3,
      '/terms': 0.3,
    }
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorities[path] ?? config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}
