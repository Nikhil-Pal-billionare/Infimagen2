import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Infimagen",
  description: "Content creation platform optimized for content creators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
    <html lang="en">
      <body className="min-h-screen bg-[#0D0D0D] text-white">
        {children}
        <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "wuljhk1k5o");
        </script>
      </body>
    </html>
  );
}
