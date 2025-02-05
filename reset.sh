#!/bin/bash

# Clean up existing files
rm -rf node_modules
rm -rf dist
rm -rf .mf
rm -rf app/lib/core

# Create necessary directories
mkdir -p app/lib/core
mkdir -p app/components/ui
mkdir -p app/routes

# Initialize fresh package.json
npm init -y

# Update package.json with necessary fields
npm pkg set type="module"
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="vite build"
npm pkg set scripts.preview="wrangler dev"
npm pkg set scripts.deploy="wrangler deploy"

# Install minimal dependencies
npm install --save react react-dom react-router-dom
npm install --save-dev vite @vitejs/plugin-react typescript @types/react @types/react-dom @cloudflare/workers-types wrangler @types/node

# Fetch core files from orange-js
curl -o app/lib/core/durable-object.ts https://raw.githubusercontent.com/zebp/orange-js/main/packages/core/src/durable-object.ts
curl -o app/lib/core/websocket.ts https://raw.githubusercontent.com/zebp/orange-js/main/packages/core/src/websocket.ts
curl -o app/lib/core/util.ts https://raw.githubusercontent.com/zebp/orange-js/main/packages/core/src/util.ts

# Create base Vite config
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app')
    }
  },
  build: {
    target: 'esnext',
    minify: true
  }
});
EOF

# Create base wrangler.toml
cat > wrangler.toml << 'EOF'
name = "birdie"
main = "dist/worker.js"
compatibility_date = "2024-02-04"

[durable_objects]
bindings = [
  { name = "LLAMA_COORDINATOR", class_name = "LlamaCoordinator" }
]

[[migrations]]
tag = "v1"
new_classes = ["LlamaCoordinator"]

[build]
command = "npm run build"
watch_dir = "app"

[site]
bucket = "./dist/client"
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    }
  },
  "include": ["app"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create tsconfig.node.json
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

# Create minimal environment types
cat > app/env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface Env {
  LLAMA_COORDINATOR: DurableObjectNamespace;
}
EOF

# Install additional UI dependencies for the dashboard
npm install --save lucide-react @radix-ui/react-progress clsx tailwind-merge
npm install --save-dev tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p

# Create base CSS file
cat > app/root.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

echo "Setup complete! Run 'npm run dev' to start development server."