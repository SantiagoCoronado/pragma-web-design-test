import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pragma.agency";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en`,
          es: `${BASE_URL}/es`,
        },
      },
    },
    {
      url: `${BASE_URL}/es`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en`,
          es: `${BASE_URL}/es`,
        },
      },
    },
  ];
}
