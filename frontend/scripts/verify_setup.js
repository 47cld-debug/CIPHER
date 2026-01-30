/**
 * Frontend setup verification script
 * Run with: node scripts/verify_setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(50));
console.log('Frontend Setup Verification');
console.log('='.repeat(50));
console.log();

let allPassed = true;

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('✓ .env file exists');
  
  // Check if VITE_API_BASE_URL is set
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_API_BASE_URL')) {
    console.log('✓ VITE_API_BASE_URL is configured');
  } else {
    console.log('✗ VITE_API_BASE_URL not found in .env');
    console.log('  Please add: VITE_API_BASE_URL=http://localhost:8000');
    allPassed = false;
  }
} else {
  console.log('✗ .env file not found');
  console.log('  Please create frontend/.env file with:');
  console.log('  VITE_API_BASE_URL=http://localhost:8000');
  allPassed = false;
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✓ node_modules directory exists');
} else {
  console.log('✗ node_modules not found');
  console.log('  Please run: npm install');
  allPassed = false;
}

// Check if package.json exists
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('✓ package.json exists');
} else {
  console.log('✗ package.json not found');
  allPassed = false;
}

console.log();
console.log('='.repeat(50));
if (allPassed) {
  console.log('✓ All checks passed! Frontend is ready to run.');
  console.log('  Start the dev server with: npm run dev');
} else {
  console.log('✗ Some checks failed. Please fix the issues above.');
}
console.log('='.repeat(50));
