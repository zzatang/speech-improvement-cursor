import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Speech Buddy",
    short_name: "SpeechBuddy",
    description: "Fun speech practice for young speakers",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/logo-icon.svg",
        sizes: "192x192",
        type: "image/svg+xml"
      }
    ]
  }
} 