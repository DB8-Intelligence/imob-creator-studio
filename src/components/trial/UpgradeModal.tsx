"use client";

import { ReactNode } from "react";

interface UpgradeModalProviderProps {
  children: ReactNode;
}

export const UpgradeModalProvider = ({ children }: UpgradeModalProviderProps) => {
  return <>{children}</>;
};
