import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your Name - Portfolio",
  description: "A vibrant, minimalistic portfolio showcasing my work, thoughts, and passions",
  keywords: ["portfolio", "developer", "designer", "web development"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Your Name - Portfolio",
    description: "A vibrant, minimalistic portfolio showcasing my work, thoughts, and passions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
