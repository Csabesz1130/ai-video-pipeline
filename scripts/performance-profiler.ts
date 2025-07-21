#!/usr/bin/env ts-node

import * as fs from 'fs/promises';
import * as os from 'os';
import { execSync, spawn } from 'child_process';
import { Logger } from '../src/utils/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
  recommendation?: string;
}

interface ResourceUsage {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network?: {
    bytesIn: number;
    bytesOut: number;
  };
}

interface BenchmarkResult {
  operation: string;
  duration: number;
  iterations: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  throughput: number;
}

class PerformanceProfiler {
  private logger: Logger;
  private metrics: PerformanceMetric[] = [];
  private benchmarks: BenchmarkResult[] = [];

  constructor() {
    this.logger = new Logger('Profiler');
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    const emoji = metric.status === 'good' ? '🟢' : metric.status === 'warning' ? '🟡' : '🔴';
    console.log(`${emoji} ${metric.name}: ${metric.value}${metric.unit}`);
    if (metric.recommendation) {
      console.log(`   💡 ${metric.recommendation}`);
    }
  }

  private async getSystemResources(): Promise<ResourceUsage> {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Get CPU usage
    const cpus = os.cpus();
    const cpuUsage = await this.getCpuUsage();

    // Get disk usage
    let diskUsage = { used: 0, total: 0, percentage: 0 };
    try {
      const dfOutput = execSync('df -h .', { encoding: 'utf8' });
      const lines = dfOutput.split('\n')[1];
      const parts = lines.split(/\s+/);
      const total = this.parseSize(parts[1]);
      const used = this.parseSize(parts[2]);
      diskUsage = {
        used,
        total,
        percentage: (used / total) * 100
      };
    } catch (error) {
      this.logger.warn('Could not get disk usage', { error });
    }

    return {
      cpu: cpuUsage,
      memory: {
        used: usedMem,
        total: totalMem,
        percentage: (usedMem / totalMem) * 100
      },
      disk: diskUsage
    };
  }

  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startMeasure = this.cpuAverage();
      setTimeout(() => {
        const endMeasure = this.cpuAverage();
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;
        const percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
        resolve(percentageCPU);
      }, 1000);
    });
  }

  private cpuAverage() {
    const cpus = os.cpus();
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
    
    for (const cpu of cpus) {
      user += cpu.times.user;
      nice += cpu.times.nice;
      sys += cpu.times.sys;
      idle += cpu.times.idle;
      irq += cpu.times.irq;
    }
    
    return {
      idle: idle / cpus.length,
      total: (user + nice + sys + idle + irq) / cpus.length
    };
  }

  private parseSize(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGT]?)$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    const multipliers = { K: 1024, M: 1024**2, G: 1024**3, T: 1024**4 };
    return value * (multipliers[unit as keyof typeof multipliers] || 1);
  }

  private async measureNodejsPerformance(): Promise<void> {
    console.log('\n⚡ Measuring Node.js Performance...');

    // Memory usage
    const memUsage = process.memoryUsage();
    const heapUsed = memUsage.heapUsed / 1024 / 1024;
    const heapTotal = memUsage.heapTotal / 1024 / 1024;
    const external = memUsage.external / 1024 / 1024;

    this.addMetric({
      name: 'Heap Memory Used',
      value: Math.round(heapUsed),
      unit: 'MB',
      threshold: 100,
      status: heapUsed > 200 ? 'critical' : heapUsed > 100 ? 'warning' : 'good',
      recommendation: heapUsed > 100 ? 'Consider optimizing memory usage or increasing heap size' : undefined
    });

    this.addMetric({
      name: 'Heap Memory Total',
      value: Math.round(heapTotal),
      unit: 'MB',
      status: 'good'
    });

    // Event loop lag
    const eventLoopLag = await this.measureEventLoopLag();
    this.addMetric({
      name: 'Event Loop Lag',
      value: eventLoopLag,
      unit: 'ms',
      threshold: 10,
      status: eventLoopLag > 50 ? 'critical' : eventLoopLag > 10 ? 'warning' : 'good',
      recommendation: eventLoopLag > 10 ? 'Event loop is blocked, consider async optimization' : undefined
    });

    // V8 compilation time
    const v8CompileTime = await this.measureV8CompileTime();
    this.addMetric({
      name: 'V8 Compile Time',
      value: v8CompileTime,
      unit: 'ms',
      status: v8CompileTime > 1000 ? 'warning' : 'good',
      recommendation: v8CompileTime > 1000 ? 'Consider code splitting or reducing bundle size' : undefined
    });
  }

  private async measureEventLoopLag(): Promise<number> {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
        resolve(Math.round(lag * 100) / 100);
      });
    });
  }

  private async measureV8CompileTime(): Promise<number> {
    const start = Date.now();
    try {
      // Simulate some V8 compilation work
      execSync('node -e "require(\'./package.json\')"', { timeout: 5000 });
    } catch (error) {
      // Ignore errors, we just want timing
    }
    return Date.now() - start;
  }

  private async measureDatabasePerformance(): Promise<void> {
    console.log('\n🗄️  Measuring Database Performance...');
    
    // Since this is a video pipeline, we'll measure file I/O performance instead
    const testFile = '/tmp/perf-test.dat';
    const testSize = 10 * 1024 * 1024; // 10MB
    const testData = Buffer.alloc(testSize, 'x');

    try {
      // Write performance
      const writeStart = Date.now();
      await fs.writeFile(testFile, testData);
      const writeTime = Date.now() - writeStart;
      const writeThroughput = (testSize / 1024 / 1024) / (writeTime / 1000); // MB/s

      this.addMetric({
        name: 'File Write Speed',
        value: Math.round(writeThroughput * 100) / 100,
        unit: 'MB/s',
        threshold: 50,
        status: writeThroughput < 10 ? 'critical' : writeThroughput < 50 ? 'warning' : 'good',
        recommendation: writeThroughput < 50 ? 'Slow disk I/O detected, consider SSD upgrade' : undefined
      });

      // Read performance
      const readStart = Date.now();
      await fs.readFile(testFile);
      const readTime = Date.now() - readStart;
      const readThroughput = (testSize / 1024 / 1024) / (readTime / 1000); // MB/s

      this.addMetric({
        name: 'File Read Speed',
        value: Math.round(readThroughput * 100) / 100,
        unit: 'MB/s',
        threshold: 100,
        status: readThroughput < 20 ? 'critical' : readThroughput < 100 ? 'warning' : 'good',
        recommendation: readThroughput < 100 ? 'Slow disk read performance detected' : undefined
      });

      // Cleanup
      await fs.unlink(testFile);
    } catch (error) {
      this.logger.error('File I/O performance test failed', { error });
    }
  }

  private async measureNetworkPerformance(): Promise<void> {
    console.log('\n🌐 Measuring Network Performance...');

    // Test DNS resolution speed
    const dnsStart = Date.now();
    try {
      execSync('nslookup google.com', { timeout: 5000 });
      const dnsTime = Date.now() - dnsStart;
      
      this.addMetric({
        name: 'DNS Resolution',
        value: dnsTime,
        unit: 'ms',
        threshold: 100,
        status: dnsTime > 500 ? 'critical' : dnsTime > 100 ? 'warning' : 'good',
        recommendation: dnsTime > 100 ? 'Slow DNS resolution, check DNS settings' : undefined
      });
    } catch (error) {
      this.addMetric({
        name: 'DNS Resolution',
        value: 9999,
        unit: 'ms',
        status: 'critical',
        recommendation: 'DNS resolution failed, check network connectivity'
      });
    }

    // Test HTTP response time to a reliable endpoint
    try {
      const axios = require('axios');
      const httpStart = Date.now();
      await axios.get('https://httpbin.org/get', { timeout: 10000 });
      const httpTime = Date.now() - httpStart;

      this.addMetric({
        name: 'HTTP Response Time',
        value: httpTime,
        unit: 'ms',
        threshold: 500,
        status: httpTime > 2000 ? 'critical' : httpTime > 500 ? 'warning' : 'good',
        recommendation: httpTime > 500 ? 'Slow HTTP responses, check internet connection' : undefined
      });
    } catch (error) {
      this.addMetric({
        name: 'HTTP Response Time',
        value: 9999,
        unit: 'ms',
        status: 'critical',
        recommendation: 'HTTP request failed, check internet connectivity'
      });
    }
  }

  private async runBenchmarks(): Promise<void> {
    console.log('\n🏃 Running Performance Benchmarks...');

    // CPU intensive benchmark
    await this.runCpuBenchmark();
    
    // JSON parsing benchmark
    await this.runJsonBenchmark();
    
    // Regex benchmark
    await this.runRegexBenchmark();
    
    // Array processing benchmark
    await this.runArrayBenchmark();
  }

  private async runCpuBenchmark(): Promise<void> {
    const iterations = 100000;
    const times: number[] = [];

    for (let i = 0; i < 10; i++) {
      const start = process.hrtime.bigint();
      
      // CPU intensive operation
      let result = 0;
      for (let j = 0; j < iterations; j++) {
        result += Math.sqrt(j) * Math.sin(j);
      }
      
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000); // Convert to ms
    }

    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = iterations / (avgTime / 1000); // ops/sec

    this.benchmarks.push({
      operation: 'CPU Math Operations',
      duration: avgTime,
      iterations,
      averageTime: avgTime,
      minTime,
      maxTime,
      throughput
    });

    console.log(`🧮 CPU Benchmark: ${Math.round(throughput).toLocaleString()} ops/sec`);
  }

  private async runJsonBenchmark(): Promise<void> {
    const testObject = {
      users: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        metadata: { lastLogin: new Date(), preferences: { theme: 'dark' } }
      }))
    };

    const iterations = 100;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      const json = JSON.stringify(testObject);
      JSON.parse(json);
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000);
    }

    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const throughput = iterations / (avgTime / 1000);

    this.benchmarks.push({
      operation: 'JSON Serialize/Deserialize',
      duration: avgTime,
      iterations,
      averageTime: avgTime,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      throughput
    });

    console.log(`📄 JSON Benchmark: ${Math.round(avgTime * 100) / 100}ms average`);
  }

  private async runRegexBenchmark(): Promise<void> {
    const testString = 'email@domain.com ' + 'not-an-email ' + 'another@test.org';
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const iterations = 10000;
    const times: number[] = [];

    for (let i = 0; i < 10; i++) {
      const start = process.hrtime.bigint();
      
      for (let j = 0; j < iterations; j++) {
        testString.match(emailRegex);
      }
      
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000);
    }

    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const throughput = iterations / (avgTime / 1000);

    this.benchmarks.push({
      operation: 'Regex Pattern Matching',
      duration: avgTime,
      iterations,
      averageTime: avgTime,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      throughput
    });

    console.log(`🔍 Regex Benchmark: ${Math.round(throughput).toLocaleString()} ops/sec`);
  }

  private async runArrayBenchmark(): Promise<void> {
    const testArray = Array.from({ length: 100000 }, (_, i) => i);
    const iterations = 100;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      
      testArray
        .filter(x => x % 2 === 0)
        .map(x => x * 2)
        .reduce((acc, x) => acc + x, 0);
      
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000);
    }

    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const throughput = iterations / (avgTime / 1000);

    this.benchmarks.push({
      operation: 'Array Processing Pipeline',
      duration: avgTime,
      iterations,
      averageTime: avgTime,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      throughput
    });

    console.log(`📊 Array Benchmark: ${Math.round(avgTime * 100) / 100}ms average`);
  }

  private async checkSystemLimits(): Promise<void> {
    console.log('\n🚧 Checking System Limits...');

    try {
      // Check file descriptor limits
      const ulimitOutput = execSync('ulimit -n', { encoding: 'utf8' });
      const fdLimit = parseInt(ulimitOutput.trim());
      
      this.addMetric({
        name: 'File Descriptor Limit',
        value: fdLimit,
        unit: '',
        threshold: 1024,
        status: fdLimit < 1024 ? 'critical' : fdLimit < 4096 ? 'warning' : 'good',
        recommendation: fdLimit < 4096 ? 'Consider increasing file descriptor limit' : undefined
      });

      // Check process limits
      const maxProc = execSync('ulimit -u', { encoding: 'utf8' });
      const procLimit = parseInt(maxProc.trim());
      
      this.addMetric({
        name: 'Process Limit',
        value: procLimit,
        unit: '',
        threshold: 1024,
        status: procLimit < 1024 ? 'warning' : 'good'
      });

    } catch (error) {
      this.logger.warn('Could not check system limits', { error });
    }
  }

  private generatePerformanceReport(): void {
    console.log('\n📊 Performance Analysis Report');
    console.log('='.repeat(50));

    // System resource summary
    console.log('\n💻 System Resources:');
    const resourceMetrics = this.metrics.filter(m => 
      m.name.includes('Memory') || m.name.includes('CPU') || m.name.includes('Disk')
    );
    resourceMetrics.forEach(metric => {
      const status = metric.status === 'good' ? '🟢' : metric.status === 'warning' ? '🟡' : '🔴';
      console.log(`   ${status} ${metric.name}: ${metric.value}${metric.unit}`);
    });

    // Performance benchmarks
    console.log('\n🏃 Benchmark Results:');
    this.benchmarks.forEach(bench => {
      console.log(`   • ${bench.operation}:`);
      console.log(`     Average: ${Math.round(bench.averageTime * 100) / 100}ms`);
      console.log(`     Throughput: ${Math.round(bench.throughput).toLocaleString()} ops/sec`);
    });

    // Critical issues
    const criticalMetrics = this.metrics.filter(m => m.status === 'critical');
    if (criticalMetrics.length > 0) {
      console.log('\n🚨 Critical Performance Issues:');
      criticalMetrics.forEach(metric => {
        console.log(`   • ${metric.name}: ${metric.value}${metric.unit}`);
        if (metric.recommendation) {
          console.log(`     💡 ${metric.recommendation}`);
        }
      });
    }

    // Performance score
    const totalMetrics = this.metrics.length;
    const goodMetrics = this.metrics.filter(m => m.status === 'good').length;
    const perfScore = Math.round((goodMetrics / totalMetrics) * 100);
    
    console.log(`\n🎯 Performance Score: ${perfScore}%`);
    
    if (perfScore >= 90) {
      console.log('   🟢 Excellent performance');
    } else if (perfScore >= 70) {
      console.log('   🟡 Good performance with room for improvement');
    } else if (perfScore >= 50) {
      console.log('   🟠 Fair performance, optimization recommended');
    } else {
      console.log('   🔴 Poor performance, immediate optimization required');
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      performanceScore: perfScore,
      metrics: this.metrics,
      benchmarks: this.benchmarks,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpuCount: os.cpus().length
      }
    };

    const reportPath = `performance-report-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed performance report saved to: ${reportPath}`);
  }

  public async run(): Promise<void> {
    console.log('⚡ AI Video Pipeline Performance Profiler');
    console.log('=========================================\n');

    try {
      // System resource monitoring
      const resources = await this.getSystemResources();
      
      this.addMetric({
        name: 'CPU Usage',
        value: Math.round(resources.cpu),
        unit: '%',
        threshold: 80,
        status: resources.cpu > 90 ? 'critical' : resources.cpu > 80 ? 'warning' : 'good',
        recommendation: resources.cpu > 80 ? 'High CPU usage detected, check for resource-intensive processes' : undefined
      });

      this.addMetric({
        name: 'Memory Usage',
        value: Math.round(resources.memory.percentage),
        unit: '%',
        threshold: 80,
        status: resources.memory.percentage > 90 ? 'critical' : resources.memory.percentage > 80 ? 'warning' : 'good',
        recommendation: resources.memory.percentage > 80 ? 'High memory usage, consider optimization or scaling' : undefined
      });

      this.addMetric({
        name: 'Disk Usage',
        value: Math.round(resources.disk.percentage),
        unit: '%',
        threshold: 80,
        status: resources.disk.percentage > 90 ? 'critical' : resources.disk.percentage > 80 ? 'warning' : 'good',
        recommendation: resources.disk.percentage > 80 ? 'Low disk space, cleanup recommended' : undefined
      });

      // Performance measurements
      await this.measureNodejsPerformance();
      await this.measureDatabasePerformance();
      await this.measureNetworkPerformance();
      await this.checkSystemLimits();
      
      // Run benchmarks
      await this.runBenchmarks();
      
      // Generate report
      this.generatePerformanceReport();

    } catch (error) {
      console.error('❌ Performance profiling failed:', error);
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const profiler = new PerformanceProfiler();
  profiler.run();
}

export { PerformanceProfiler };