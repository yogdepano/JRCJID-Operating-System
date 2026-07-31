import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JRC Industrial Sales ERP — Operating System",
  description: "Enterprise Resource Planning & Operational Intelligence for Chemical Manufacturing and Pest Control Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0b0f19] text-slate-100 selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
