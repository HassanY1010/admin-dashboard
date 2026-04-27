import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Decimal from "decimal.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number | Decimal, currency: string = "YER"): string {
  try {
    const num = new Decimal(amount || 0);
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num.toNumber());
  } catch (e) {
    return `0 ${currency}`;
  }
}

export function formatDate(date: Date | string, locale: string = "ar-YE"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  if (minutes > 0) return `منذ ${minutes} دقيقة`;
  return "الآن";
}