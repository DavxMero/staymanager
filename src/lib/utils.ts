import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatCurrency as formatCurrencyCompat } from "./database-compatibility";

/**
 * Format angka menjadi format mata uang Rupiah (IDR)
 * @param amount - Jumlah yang akan diformat
 * @returns String dalam format mata uang Rupiah
 */
export function formatCurrency(amount: number): string {
  return formatCurrencyCompat(amount);
}

/**
 * Menggabungkan class names dengan tailwind-merge
 * @param inputs - Class names yang akan digabungkan
 * @returns String class names yang telah digabungkan
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


import {
  Message,
  ToolInvocation,
} from "ai";

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data.",
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}