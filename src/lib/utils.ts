// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a Firebase Timestamp into a "time ago" string.
 * e.g., "5m ago", "2h ago", "3d ago"
 */
export function timeAgo(timestamp: Timestamp): string {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return 'just now';
  }
  
  const now = new Date();
  const date = timestamp.toDate();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000; // Years
  if (interval > 1) {
    return Math.floor(interval) + "y ago";
  }
  interval = seconds / 2592000; // Months
  if (interval > 1) {
    return Math.floor(interval) + "mo ago";
  }
  interval = seconds / 86400; // Days
  if (interval > 1) {
    return Math.floor(interval) + "d ago";
  }
  interval = seconds / 3600; // Hours
  if (interval > 1) {
    return Math.floor(interval) + "h ago";
  }
  interval = seconds / 60; // Minutes
  if (interval > 1) {
    return Math.floor(interval) + "m ago";
  }
  if (seconds < 10) {
    return "just now";
  }
  return Math.floor(seconds) + "s ago";
}

