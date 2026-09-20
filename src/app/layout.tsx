import type { Metadata } from "next";
import { DM_Mono, Manrope, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "xoxod33p store | COD4 servers and mods",
  description: "Private COD4 servers, custom mods, and direct operator support.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: ["/icon.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", manrope.variable, dmMono.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
