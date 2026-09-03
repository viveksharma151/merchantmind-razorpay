'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, BarChart3, Megaphone, Shield, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/checkout', label: 'Checkout Agent', icon: ShoppingCart },
  { href: '/catalog', label: 'Catalog', icon: Package },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/audit', label: 'Audit Trail', icon: Shield },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-sm border-b border-[#1E1E2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold">R</div>
            <div>
              <span className="font-bold text-white text-sm">MerchantMind</span>
              <span className="ml-2 text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">Buildathon Track 01</span>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  path === href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1E1E2E]'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:block">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
