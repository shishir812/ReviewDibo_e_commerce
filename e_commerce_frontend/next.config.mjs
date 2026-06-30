/** @type {import('next').NextConfig} */
function normalizeApiBaseUrl(value) {
  const trimmedValue = value.trim().replace(/\/+$/, "");

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(trimmedValue)) {
    return `http://${trimmedValue}`;
  }

  return `https://${trimmedValue}`;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  ? normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)
  : null;

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
