import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // or whatever port your backend runs on
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui-vendor'
            }
            if (id.includes('quill')) {
              return 'quill-vendor'
            }
            if (id.includes('@clerk')) {
              return 'clerk-vendor'
            }
            if (id.includes('moment')) {
              return 'moment-vendor'
            }
            if (id.includes('axios')) {
              return 'axios-vendor'
            }
            return 'vendor'
          }
          // Feature chunks
          if (id.includes('ResumeAnalyzer')) {
            return 'resume-analyzer'
          }
          if (id.includes('CoverLetter')) {
            return 'cover-letter'
          }
          if (id.includes('Dashboard') || id.includes('AddJob') || id.includes('ManageJobs') || id.includes('ViewApplications')) {
            return 'dashboard'
          }
          if (id.includes('Applications') || id.includes('ApplyJobs')) {
            return 'applications'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: false, // Disable sourcemaps for production
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
