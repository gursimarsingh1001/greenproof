"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecentScanItem } from "./types";

interface ScanStoreState {
  recentScans: RecentScanItem[];
  addRecentScan: (scan: RecentScanItem) => void;
}

/**
 * Stores recent scan history locally for the landing page and quick recall.
 */
export const useScanStore = create<ScanStoreState>()(
  persist(
    (set) => ({
      recentScans: [],
      addRecentScan: (scan) =>
        set((state) => ({
          recentScans: [scan, ...state.recentScans.filter((item) => item.productId !== scan.productId)].slice(0, 6)
        }))
    }),
    {
      name: "greenproof-recent-scans"
    }
  )
);
