import { ReactNode } from "react";
import MarketingHeader from "./MarketingHeader";
import MarketingFooter from "./MarketingFooter";

interface MarketingLayoutProps {
  children: ReactNode;
}

const MarketingLayout = ({ children }: MarketingLayoutProps) => (
  <div className="min-h-screen bg-background">
    <MarketingHeader />
    <main>{children}</main>
    <MarketingFooter />
  </div>
);

export default MarketingLayout;
