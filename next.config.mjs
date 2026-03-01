/** @type {import('next').NextConfig} */
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public'
});

const nextConfig = {
  // your existing config here
};

export default withPWA(nextConfig);
