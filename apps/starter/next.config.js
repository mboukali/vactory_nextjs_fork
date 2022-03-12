const withPlugins = require("next-compose-plugins")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})
const withModulesPlugin = require("@vactory/next/webpack-modules-loader")
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin")
const path = require("path")

// @todo: move this outside ? no need to reload dev server
const i18n = {
  default: "fr",
  enabled: ["fr", "ar"],
  labels: [
    { code: "fr", label: "Français" },
    { code: "ar", label: "العربية" },
  ],
}
// @todo: move this outside ? no need to reload dev server
const menus = ["main", "footer"]

const overrides = (alias) => {
  alias["@vactory/ui/button"] = "@/components/button/button.js"
  alias["@vactory/ui/link"] = "@/components/link/link.js"
  return alias
}

const nextConfig = {
  i18n: {
    locales: [...i18n.enabled, "default"],
    defaultLocale: "default",
    localeDetection: true,
  },
  images: {
    domains: ["localhost"],
    dangerouslyAllowSVG: true,
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
  },
  publicRuntimeConfig: {
    i18n: i18n,
    menus: menus,
  },
  reactStrictMode: true,
  // distDir: "build",
  // swcMinify: true,
  poweredByHeader: false,
  trailingSlash: false,
  webpack: (config) => {
    config.resolve.alias = overrides(config.resolve.alias)
    config.resolve.alias["classnames"] = "clsx"

    // Bundle size tweaks.
    config.resolve.alias["regenerator-runtime"] = path.resolve(
      __dirname,
      "../..",
      "node_modules",
      "next/dist/compiled/regenerator-runtime/runtime.js"
    )

    config.resolve.alias["react-is"] = path.resolve(
      __dirname,
      "../..",
      "node_modules",
      "next/dist/compiled/react-is"
    )

    config.plugins.push(new DuplicatePackageCheckerPlugin())
    return config
  },
  // async redirects() {
  //   // All redirections are handled by Drupal redirect module except for this one.
  //   return [
  //     {
  //       source: "/",
  //       destination: "/" + i18n.default,
  //       permanent: true,
  //     },
  //   ]
  // },
  async rewrites() {
    // @todo: download rewrites
    return [
      {
        source: "/fr/actualites/:pays/:theme",
        destination: "/fr/actualites",
        locale: false,
      },
    ]
  },
  experimental: {
    externalDir: true,
  },
}

module.exports = withPlugins(
  [
    [withBundleAnalyzer],
    [
      withModulesPlugin,
      {
        enabledModules: ["next-page", "next-news", "next-user"],
      },
    ],
  ],
  nextConfig
)
