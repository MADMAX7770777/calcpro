import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { homeMetadata } from '@/lib/seo';
import './globals.css';

export const metadata: Metadata = homeMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
