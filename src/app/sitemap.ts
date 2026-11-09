import type { MetadataRoute } from "next";
import { guideMeta } from "@/lib/content/guides";
import { site } from "@/lib/config";

const reviewed = new Date("2026-11-07T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: reviewed,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/xray`,
      lastModified: reviewed,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${site.url}/guides`,
      lastModified: reviewed,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...guideMeta.map((guide) => ({
      url: `${site.url}/guides/${guide.slug}`,
      lastModified: new Date(`${guide.reviewed}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${site.url}/method`,
      lastModified: reviewed,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${site.url}/about`,
      lastModified: reviewed,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${site.url}/privacy`,
      lastModified: reviewed,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/legal`,
      lastModified: reviewed,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
