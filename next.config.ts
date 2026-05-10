import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Tree-shake heavy "icon-bag" packages so the client bundle only ships the
  // icons we actually import. lucide-react has 1500+ icons; without this the
  // whole index can leak into chunks. Big perceived perf win on first paint.
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],
  },
};

export default withNextIntl(nextConfig);
