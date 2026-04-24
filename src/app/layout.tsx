import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRAGMA | AI & Technology Solutions",
  description:
    "Pragmatic AI solutions for real-world impact. Custom AI, web development, automation, and consulting.",
};

const themeInitScript = `try{var t=localStorage.getItem("pragma-theme")||"space";document.documentElement.dataset.theme=t;var m=localStorage.getItem("pragma-motion")||"on";document.documentElement.dataset.motion=m;}catch(e){document.documentElement.dataset.theme="space";document.documentElement.dataset.motion="on"}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-pragma-bg text-pragma-text font-sans">
        {children}
      </body>
    </html>
  );
}
