/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_AURA_API_URL: process.env.NEXT_PUBLIC_AURA_API_URL,
  },
}