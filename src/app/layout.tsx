import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'MerchantMind | AI Growth & Agentic Commerce (Razorpay Buildathon)',
  description:
    'Track 01 - Autonomous Commerce Agent built on Razorpay APIs with explainable, bounded, and gated money actions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0A0F] text-white antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
