import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.q8sportcar.com";
  const locales = ["ar", "en"];
  const pages = ["", "/cars", "/parts", "/requests", "/gallery"];

  const routes: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      routes.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "hourly",
        priority: page === "" ? 1 : 0.8,
      });
    }
  }

  return routes;
}
