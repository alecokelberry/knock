import type { MetadataRoute } from "next"

/** Knock installs to a phone's home screen (Safari → Share → Add to Home Screen) and opens with no browser chrome */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Knock",
    short_name: "Knock",
    description: "A door-to-door sales CRM.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
