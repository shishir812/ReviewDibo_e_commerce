/** @type {import('next').NextConfig} */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiImagePattern = apiBaseUrl
  ? (() => {
      const url = new URL(apiBaseUrl);
      return {
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        port: url.port,
        pathname: "/uploads/**"
      };
    })()
  : null;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/uploads/**"
      }
    ].concat(apiImagePattern ? [apiImagePattern] : [])
  }
};

export default nextConfig;
