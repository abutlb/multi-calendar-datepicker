import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'MultiCalendarDatepicker',
      formats: ['umd', 'es'],
      fileName: (format) =>
        format === 'es'
          ? 'multi-calendar-datepicker.esm.js'
          : 'multi-calendar-datepicker.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: (info) =>
          info.name === 'style.css'
            ? 'multi-calendar-datepicker.css'
            : info.name,
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
