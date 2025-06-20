// src/components/layout/OfflineLayout.tsx
import React from "react";
import { OfflineStatus } from "../pwa/offline/OfflineStatus";
import { SyncStatus } from "../pwa/offline/SyncStatus";

interface OfflineLayoutProps {
  children: React.ReactNode;
}

export const OfflineLayout: React.FC<OfflineLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineStatus />
      <div className="pt-0">{children}</div>
      <SyncStatus />
    </div>
  );
};
