import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
}

export default function SEO({ title, description, keywords, url }: SEOProps) {
  const siteTitle = "Collectif des Victimes de la MUTADAFP";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = "Plateforme officielle du Collectif des Victimes de la MUTADAFP - Ministère de l'économie et des finances de Côte d'Ivoire. Vente de terrains fictifs à Abidjan.";
  const defaultKeywords = "mutadafp, ministère de l'économie et des finances de Côte d'Ivoire, vente de terrains fictifs, Abidjan Côte d'Ivoire, collectif victimes";
  const siteUrl = "https://ais-pre-lri4hqsef6hmwnp7brg3bb-185480357685.europe-west2.run.app";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}
