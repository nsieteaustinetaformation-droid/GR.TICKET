"use client";

import { useSyncExternalStore } from "react";

let version = 0;
const listeners = new Set<() => void>();

export function notifyStoreChange(): void {
  version += 1;
  listeners.forEach((listener) => listener());
}

export function subscribeStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStoreVersion(): number {
  return version;
}

export function useStoreVersion(): number {
  return useSyncExternalStore(subscribeStore, getStoreVersion, getStoreVersion);
}
