import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  dts: true,
  // keep the 2.x file names, so CDN links such as /npm/password-strength-meter/dist/password.min.js keep working
  copy: [
    '../jquery/dist/password.min.js',
    { from: '../core/src/styles.css', rename: 'password.min.css' },
    '../core/src/passwordstrength.jpg',
  ],
})
