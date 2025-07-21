#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 AI Video Pipeline Advanced Debugger');
console.log('=====================================\n');

try {
  // Check if ts-node is available
  try {
    execSync('npx ts-node --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('📦 Installing ts-node...');
    execSync('npm install -g ts-node typescript', { stdio: 'inherit' });
  }

  // Run the TypeScript debugger
  const debuggerPath = path.join(__dirname, 'debug.ts');
  execSync(`npx ts-node ${debuggerPath}`, { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Failed to run debugger:', error.message);
  
  // Fallback to basic checks
  console.log('\n🔄 Running basic system checks...');
  
  try {
    console.log('Node.js version:', process.version);
    console.log('Platform:', process.platform);
    console.log('Memory usage:', Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB');
    
    // Check basic files
    const fs = require('fs');
    const requiredFiles = ['package.json', 'src/index.ts', 'src/config.ts'];
    
    console.log('\n📁 File checks:');
    requiredFiles.forEach(file => {
      const exists = fs.existsSync(file);
      console.log(`${exists ? '✅' : '❌'} ${file}`);
    });
    
    // Check environment variables
    console.log('\n🔍 Environment variables:');
    const envVars = ['OPENAI_API_KEY', 'AWS_ACCESS_KEY_ID', 'CLOUDINARY_CLOUD_NAME'];
    envVars.forEach(varName => {
      const exists = !!process.env[varName];
      console.log(`${exists ? '✅' : '❌'} ${varName}`);
    });
    
    console.log('\n💡 For detailed debugging, install ts-node: npm install -g ts-node typescript');
    
  } catch (fallbackError) {
    console.error('❌ Basic checks also failed:', fallbackError.message);
  }
}