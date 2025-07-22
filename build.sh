#!/bin/bash

echo "Building TypeScript serverless application..."

# Change to src directory
cd src

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "Compiling TypeScript..."
npm run build

echo "Build completed successfully!"
echo "Compiled JavaScript files are in src/dist/"
echo "Ready for SAM deployment!"