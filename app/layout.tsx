import type { Metadata } from "next";
import { Hind_Siliguri, Orbitron } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "নূরে রমজান | রমজান ও দৈনিক সালাত সার্ভিস",
  description: "লাইভ সেহরি, ইফতার কাউন্টডাউন, সালাত সময়সূচী এবং রমজান ক্যালেন্ডার",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`dark ${hindSiliguri.variable} ${orbitron.variable}`}>
      <body className="min-h-screen bg-[#020d0b] text-[#e6f4f1] font-sans antialiased flex flex-col selection:bg-yellow-400/20 selection:text-yellow-300">
        {children}
      </body>
    </html>
  );
}