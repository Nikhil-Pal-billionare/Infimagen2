import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infimagen",
  description: "Content creation platform optimized for content creators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
    <html lang="en">
      <body className="min-h-screen bg-[#0D0D0D] text-white">
        {children}
      </body>
    </html>
  );
}
