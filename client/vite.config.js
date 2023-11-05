import { defineConfig } from "vite";
import dotenv from 'dotenv';

import react from "@vitejs/plugin-react-swc";
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        secure: false,
      },
    },
  },
  plugins: [react()],
});
