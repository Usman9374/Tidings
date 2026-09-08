import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The paper photographs and cut-outs are large; inlining them as data URIs is
  // what made the original single file 6 MB. Always emit them as real files.
  build: { assetsInlineLimit: 0 },
});
