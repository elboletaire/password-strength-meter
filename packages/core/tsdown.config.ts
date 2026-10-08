import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  dts: true,
  copy: ['src/styles.css', 'src/passwordstrength.jpg'],
})
