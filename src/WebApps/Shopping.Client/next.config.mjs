/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        unoptimized: true,
        domains: ['res.cloudinary.com']
    },
};

export default nextConfig;
