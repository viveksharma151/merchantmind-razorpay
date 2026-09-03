import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'SUCCESS': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'FAILED': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'PARTIAL': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
}
