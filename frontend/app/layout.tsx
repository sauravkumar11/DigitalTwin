import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TwinCare AI",
  description: "AI-powered Digital Patient Twin platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
