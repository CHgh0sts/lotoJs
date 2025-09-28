/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Désactiver ESLint pendant le build pour éviter l'erreur de serialization
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build si nécessaire
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
