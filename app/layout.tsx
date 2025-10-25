import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientNavigation from "@/components/layout/ClientNavigation";
import StyledComponentsRegistry from "@/lib/styled-components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UrbanSwap",
  description: "AI-powered marketplace for creating and selling products",
  icons: {
    icon: "/images/Screenshot 2025-09-20 165808.png",
    shortcut: "/images/Screenshot 2025-09-20 165808.png",
    apple: "/images/Screenshot 2025-09-20 165808.png",
  },
  manifest: "/manifest.json"
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Translate Element script - loads once, non-blocking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if (typeof window !== 'undefined') {
                  if (!window.__gt_script_loading) {
                    window.__gt_script_loading = true;
                    window.googleTranslateElementInit = function() {
                      try {
                        if (window.__gt_inited) return;
                        if (!window.google || !window.google.translate) return;
                        new window.google.translate.TranslateElement({
                          pageLanguage: 'en',
                          includedLanguages: 'en,hi,bn,te,mr,ta,gu,ur,kn,ml,pa,or,as',
                          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                          autoDisplay: false
                        }, 'google_translate_element');
                        window.__gt_inited = true;
                      } catch (e) { console.error('GT init error', e); }
                    };
                    var gt = document.createElement('script');
                    gt.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                    gt.async = true; gt.defer = true;
                    document.head.appendChild(gt);

                    // Observe for Google banner and adjust body offset so navbar sits below it
                    var adjustOffset = function(){
                      var bannerFrame = document.querySelector('.goog-te-banner-frame');
                      var banner = bannerFrame && bannerFrame.parentElement ? bannerFrame.parentElement : null;
                      var h = 0;
                      try {
                        if (bannerFrame && bannerFrame.style && bannerFrame.style.display !== 'none') {
                          h = bannerFrame.offsetHeight || 0;
                        }
                      } catch(e) {}
                      document.documentElement.style.setProperty('--gt-banner-height', h + 'px');
                    };
                    var mo = new MutationObserver(adjustOffset);
                    mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
                    window.addEventListener('load', function(){ setTimeout(adjustOffset, 500); });
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StyledComponentsRegistry>
          <ClientNavigation />
          <main>
            {children}
          </main>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
