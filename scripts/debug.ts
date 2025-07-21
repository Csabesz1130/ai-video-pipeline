#!/usr/bin/env ts-node

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import { Logger } from '../src/utils/logger';

interface DebugResult {
  component: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: Record<string, any>;
  recommendation?: string;
}

interface SystemInfo {
  nodeVersion: string;
  npmVersion: string;
  platform: string;
  memory: string;
  cpus: number;
}

class AdvancedDebugger {
  private logger: Logger;
  private results: DebugResult[] = [];
  private startTime: number;

  constructor() {
    this.logger = new Logger('Debugger');
    this.startTime = Date.now();
  }

  private addResult(result: DebugResult): void {
    this.results.push(result);
    const emoji = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
    console.log(`${emoji} ${result.component}: ${result.message}`);
    if (result.recommendation) {
      console.log(`   💡 ${result.recommendation}`);
    }
  }

  private async getSystemInfo(): Promise<SystemInfo> {
    const os = require('os');
    return {
      nodeVersion: process.version,
      npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim(),
      platform: `${os.type()} ${os.release()}`,
      memory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      cpus: os.cpus().length
    };
  }

  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async readJsonFile(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read ${filePath}: ${error}`);
    }
  }

  private async checkEnvironmentVariables(): Promise<void> {
    console.log('\n🔍 Checking Environment Variables...');
    
    const requiredVars = [
      'OPENAI_API_KEY',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_REGION',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];

    const optionalVars = [
      'TEMPORAL_ADDRESS',
      'YOUTUBE_API_KEY',
      'TIKTOK_API_KEY',
      'TWITTER_API_KEY',
      'INSTAGRAM_ACCESS_TOKEN'
    ];

    let missingRequired = 0;
    let missingOptional = 0;

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingRequired++;
        this.addResult({
          component: 'Environment',
          status: 'fail',
          message: `Missing required environment variable: ${varName}`,
          recommendation: `Add ${varName} to your .env file`
        });
      }
    }

    for (const varName of optionalVars) {
      if (!process.env[varName]) {
        missingOptional++;
        this.addResult({
          component: 'Environment',
          status: 'warn',
          message: `Missing optional environment variable: ${varName}`,
          recommendation: `Add ${varName} to enable ${varName.split('_')[0]} integration`
        });
      }
    }

    if (missingRequired === 0) {
      this.addResult({
        component: 'Environment',
        status: 'pass',
        message: `All ${requiredVars.length} required environment variables are set`
      });
    }
  }

  private async checkProjectStructure(): Promise<void> {
    console.log('\n📁 Checking Project Structure...');
    
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'src/index.ts',
      'src/config.ts',
      'src/utils/logger.ts',
      'src/config/services.ts'
    ];

    const requiredDirs = [
      'src',
      'src/api',
      'src/services',
      'src/utils',
      'src/config',
      'src/frontend'
    ];

    for (const file of requiredFiles) {
      const exists = await this.checkFileExists(file);
      this.addResult({
        component: 'Project Structure',
        status: exists ? 'pass' : 'fail',
        message: `${file} ${exists ? 'exists' : 'missing'}`,
        recommendation: exists ? undefined : `Create ${file} file`
      });
    }

    for (const dir of requiredDirs) {
      const exists = await this.checkFileExists(dir);
      this.addResult({
        component: 'Project Structure',
        status: exists ? 'pass' : 'fail',
        message: `${dir}/ ${exists ? 'exists' : 'missing'}`,
        recommendation: exists ? undefined : `Create ${dir} directory`
      });
    }
  }

  private async checkDependencies(): Promise<void> {
    console.log('\n📦 Checking Dependencies...');
    
    try {
      const packageJson = await this.readJsonFile('package.json');
      const nodeModulesExists = await this.checkFileExists('node_modules');
      
      if (!nodeModulesExists) {
        this.addResult({
          component: 'Dependencies',
          status: 'fail',
          message: 'node_modules directory not found',
          recommendation: 'Run "npm install" to install dependencies'
        });
        return;
      }

      const criticalDeps = [
        'express',
        'openai',
        'aws-sdk',
        'cloudinary',
        '@temporalio/client',
        'react',
        'react-dom',
        'vite'
      ];

      for (const dep of criticalDeps) {
        const hasDepInPackage = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
        const depPath = path.join('node_modules', dep);
        const installed = await this.checkFileExists(depPath);
        
        if (!hasDepInPackage) {
          this.addResult({
            component: 'Dependencies',
            status: 'warn',
            message: `${dep} not found in package.json`,
            recommendation: `Add ${dep} to package.json if needed`
          });
        } else if (!installed) {
          this.addResult({
            component: 'Dependencies',
            status: 'fail',
            message: `${dep} not installed`,
            recommendation: 'Run "npm install" to install missing dependencies'
          });
        } else {
          this.addResult({
            component: 'Dependencies',
            status: 'pass',
            message: `${dep} is properly installed`
          });
        }
      }
    } catch (error) {
      this.addResult({
        component: 'Dependencies',
        status: 'fail',
        message: `Failed to check dependencies: ${error}`,
        recommendation: 'Check package.json syntax and run npm install'
      });
    }
  }

  private async checkServiceConnectivity(): Promise<void> {
    console.log('\n🔗 Checking Service Connectivity...');
    
    // Check OpenAI API
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await axios.get('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
          timeout: 10000
        });
        
        this.addResult({
          component: 'OpenAI Service',
          status: 'pass',
          message: `Connected successfully (${response.data.data?.length || 0} models available)`,
          details: { models: response.data.data?.slice(0, 3).map((m: any) => m.id) }
        });
      } catch (error: any) {
        this.addResult({
          component: 'OpenAI Service',
          status: 'fail',
          message: `Connection failed: ${error.message}`,
          recommendation: 'Check OPENAI_API_KEY and network connectivity'
        });
      }
    }

    // Check AWS S3
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const AWS = require('aws-sdk');
        AWS.config.update({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1'
        });
        
        const s3 = new AWS.S3();
        await s3.listBuckets().promise();
        
        this.addResult({
          component: 'AWS S3 Service',
          status: 'pass',
          message: 'Connected successfully'
        });
      } catch (error: any) {
        this.addResult({
          component: 'AWS S3 Service',
          status: 'fail',
          message: `Connection failed: ${error.message}`,
          recommendation: 'Check AWS credentials and permissions'
        });
      }
    }

    // Check Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const response = await axios.get(
          `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/sample.jpg`,
          { timeout: 10000 }
        );
        
        this.addResult({
          component: 'Cloudinary Service',
          status: 'pass',
          message: 'Connected successfully'
        });
      } catch (error: any) {
        this.addResult({
          component: 'Cloudinary Service',
          status: 'fail',
          message: `Connection failed: ${error.message}`,
          recommendation: 'Check CLOUDINARY_CLOUD_NAME and API credentials'
        });
      }
    }

    // Check Temporal
    if (process.env.TEMPORAL_ADDRESS) {
      try {
        const { Connection } = require('@temporalio/client');
        const connection = await Connection.connect({
          address: process.env.TEMPORAL_ADDRESS
        });
        
        this.addResult({
          component: 'Temporal Service',
          status: 'pass',
          message: 'Connected successfully'
        });
        
        connection.close();
      } catch (error: any) {
        this.addResult({
          component: 'Temporal Service',
          status: 'fail',
          message: `Connection failed: ${error.message}`,
          recommendation: 'Check TEMPORAL_ADDRESS and ensure Temporal server is running'
        });
      }
    }
  }

  private async checkBuildProcess(): Promise<void> {
    console.log('\n🔨 Checking Build Process...');
    
    try {
      // Check TypeScript compilation
      execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
      this.addResult({
        component: 'TypeScript',
        status: 'pass',
        message: 'TypeScript compilation successful'
      });
    } catch (error: any) {
      this.addResult({
        component: 'TypeScript',
        status: 'fail',
        message: `TypeScript compilation failed: ${error.message.split('\n')[0]}`,
        recommendation: 'Fix TypeScript errors before deployment'
      });
    }

    try {
      // Check frontend build
      execSync('npm run build:frontend', { encoding: 'utf8', stdio: 'pipe' });
      const distExists = await this.checkFileExists('dist/frontend');
      
      this.addResult({
        component: 'Frontend Build',
        status: distExists ? 'pass' : 'fail',
        message: distExists ? 'Frontend build successful' : 'Frontend build failed',
        recommendation: distExists ? undefined : 'Check frontend build configuration'
      });
    } catch (error: any) {
      this.addResult({
        component: 'Frontend Build',
        status: 'fail',
        message: `Frontend build failed: ${error.message.split('\n')[0]}`,
        recommendation: 'Check Vite configuration and React components'
      });
    }
  }

  private async checkPortAvailability(): Promise<void> {
    console.log('\n🚪 Checking Port Availability...');
    
    const net = require('net');
    const ports = [3000, 4000, 7233, 8080];
    
    for (const port of ports) {
      try {
        await new Promise((resolve, reject) => {
          const server = net.createServer();
          server.listen(port, () => {
            server.close();
            resolve(true);
          });
          server.on('error', reject);
        });
        
        this.addResult({
          component: 'Port Availability',
          status: 'pass',
          message: `Port ${port} is available`
        });
      } catch (error) {
        this.addResult({
          component: 'Port Availability',
          status: 'warn',
          message: `Port ${port} is in use`,
          recommendation: `Stop service using port ${port} or configure different port`
        });
      }
    }
  }

  private async checkDiskSpace(): Promise<void> {
    console.log('\n💾 Checking Disk Space...');
    
    try {
      const stats = await fs.stat('.');
      const { execSync } = require('child_process');
      const dfOutput = execSync('df -h .', { encoding: 'utf8' });
      const lines = dfOutput.split('\n')[1];
      const parts = lines.split(/\s+/);
      const used = parts[4];
      
      const usedPercentage = parseInt(used.replace('%', ''));
      
      if (usedPercentage > 90) {
        this.addResult({
          component: 'Disk Space',
          status: 'fail',
          message: `Disk usage is ${used} (critical)`,
          recommendation: 'Free up disk space immediately'
        });
      } else if (usedPercentage > 80) {
        this.addResult({
          component: 'Disk Space',
          status: 'warn',
          message: `Disk usage is ${used} (high)`,
          recommendation: 'Consider freeing up disk space'
        });
      } else {
        this.addResult({
          component: 'Disk Space',
          status: 'pass',
          message: `Disk usage is ${used} (healthy)`
        });
      }
    } catch (error) {
      this.addResult({
        component: 'Disk Space',
        status: 'warn',
        message: 'Could not check disk space',
        recommendation: 'Manually check available disk space'
      });
    }
  }

  private async checkLogFiles(): Promise<void> {
    console.log('\n📋 Checking Log Files...');
    
    const logPaths = ['logs', 'tmp', '.logs'];
    let foundLogs = false;
    
    for (const logPath of logPaths) {
      const exists = await this.checkFileExists(logPath);
      if (exists) {
        foundLogs = true;
        try {
          const files = await fs.readdir(logPath);
          const logFiles = files.filter(f => f.endsWith('.log'));
          
          this.addResult({
            component: 'Log Files',
            status: 'pass',
            message: `Found ${logFiles.length} log files in ${logPath}/`,
            details: { files: logFiles.slice(0, 5) }
          });
        } catch (error) {
          this.addResult({
            component: 'Log Files',
            status: 'warn',
            message: `Could not read log directory: ${logPath}`,
            recommendation: 'Check directory permissions'
          });
        }
      }
    }
    
    if (!foundLogs) {
      this.addResult({
        component: 'Log Files',
        status: 'warn',
        message: 'No log directories found',
        recommendation: 'Consider implementing structured logging'
      });
    }
  }

  private async performHealthCheck(): Promise<void> {
    console.log('\n🏥 Performing Application Health Check...');
    
    // Check if app can start (syntax check)
    try {
      const { spawn } = require('child_process');
      const child = spawn('node', ['-c', 'src/index.ts'], { stdio: 'pipe' });
      
      await new Promise((resolve, reject) => {
        child.on('close', (code: number) => {
          if (code === 0) {
            resolve(true);
          } else {
            reject(new Error(`Syntax check failed with code ${code}`));
          }
        });
        child.on('error', reject);
      });
      
      this.addResult({
        component: 'App Health',
        status: 'pass',
        message: 'Application syntax is valid'
      });
    } catch (error: any) {
      this.addResult({
        component: 'App Health',
        status: 'fail',
        message: `Application has syntax errors: ${error.message}`,
        recommendation: 'Fix syntax errors before running the application'
      });
    }
  }

  private generateReport(): void {
    console.log('\n📊 Debugging Report');
    console.log('='.repeat(50));
    
    const systemInfo = this.getSystemInfo();
    console.log(`\n🖥️  System Information:`);
    console.log(`   Node.js: ${process.version}`);
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warn').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total Checks: ${this.results.length}`);
    
    const healthScore = Math.round((passed / this.results.length) * 100);
    console.log(`   🎯 Health Score: ${healthScore}%`);
    
    if (failed > 0) {
      console.log(`\n🚨 Critical Issues (${failed}):`);
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`   • ${r.component}: ${r.message}`));
    }
    
    if (warnings > 0) {
      console.log(`\n⚠️  Warnings (${warnings}):`);
      this.results
        .filter(r => r.status === 'warn')
        .forEach(r => console.log(`   • ${r.component}: ${r.message}`));
    }
    
    const duration = Date.now() - this.startTime;
    console.log(`\n⏱️  Debug completed in ${duration}ms`);
    
    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      healthScore,
      summary: { passed, warnings, failed, total: this.results.length },
      results: this.results
    };
    
    const reportPath = `debug-report-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  public async run(): Promise<void> {
    console.log('🔍 Advanced AI Video Pipeline Debugger');
    console.log('=====================================\n');
    
    try {
      await this.checkEnvironmentVariables();
      await this.checkProjectStructure();
      await this.checkDependencies();
      await this.checkServiceConnectivity();
      await this.checkBuildProcess();
      await this.checkPortAvailability();
      await this.checkDiskSpace();
      await this.checkLogFiles();
      await this.performHealthCheck();
      
      this.generateReport();
      
      const failed = this.results.filter(r => r.status === 'fail').length;
      process.exit(failed > 0 ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Debug process failed:', error);
      process.exit(1);
    }
  }
}

// Run the debugger
if (require.main === module) {
  const debugger = new AdvancedDebugger();
  debugger.run();
}

export { AdvancedDebugger };