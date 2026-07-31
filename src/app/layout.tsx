import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JRC Industrial Sales ERP — Operating System",
  description: "Enterprise Resource Planning & Operational Intelligence for Chemical Manufacturing and Pest Control Services",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "JRC ERP",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090d16] text-slate-100 selection:bg-sky-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
