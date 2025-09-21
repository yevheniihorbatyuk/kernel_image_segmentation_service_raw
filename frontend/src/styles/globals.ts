// src/styles/globals.ts
import { css } from '@emotion/react';

export const globalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
      'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
      'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  /* Image upload drop zone */
  .dropzone-active {
    border-color: #1976d2 !important;
    background-color: rgba(25, 118, 210, 0.04) !important;
  }

  /* Loading animations */
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  .loading-pulse {
    animation: pulse 2s infinite;
  }

  /* Custom grid layout */
  .image-grid {
    display: grid;
    gap: 16px;
  }

  .image-grid.single {
    grid-template-columns: 1fr;
  }

  .image-grid.split {
    grid-template-columns: 1fr 1fr;
  }

  .image-grid.grid-2x2 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .image-grid.split,
    .image-grid.grid-2x2 {
      grid-template-columns: 1fr;
    }
  }
`;