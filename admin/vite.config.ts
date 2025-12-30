import react from '@vitejs/plugin-react';
import path from "path";
import { defineConfig, loadEnv } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [
      react(),
      viteCompression({ algorithm: 'gzip' })
    ],
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") },
    },  
    server: {
      port: 5175,
      proxy: {
        '/api': { target: env.VITE_SERVER_URI || 'http://localhost:3000', changeOrigin: true, secure: true },
        '/public': { target: env.VITE_SERVER_URI || 'http://localhost:3000', changeOrigin: true, secure: true },
        "/socket.io": {
          target: env.VITE_SERVER_URI || 'http://localhost:3000',
          changeOrigin: true,
          secure: true,
          ws: true
        }
      },
    },
  };
});
