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

# Copy dependencies to dist for deployment
echo "Copying dependencies to dist..."
cp package.json dist/
cp -r node_modules dist/

echo "Build completed successfully!"
echo "Compiled JavaScript files are in src/dist/"
echo "Dependencies copied to src/dist/node_modules/"
echo "Ready for SAM deployment!"