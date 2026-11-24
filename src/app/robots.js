export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowbeautybd.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout/success', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
