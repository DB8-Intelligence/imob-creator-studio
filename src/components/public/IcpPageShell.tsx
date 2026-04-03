import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface IcpPageShellProps {
  children: ReactNode;
}

/**
 * Shared wrapper for all ICP landing pages.
 * Provides Header, dark ds background, and Footer.
 */
export function IcpPageShell({ children }: IcpPageShellProps) {
  return (
    <div className="min-h-screen bg-ds">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
