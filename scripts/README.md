# AI Video Pipeline Advanced Debugging Suite

A comprehensive debugging, monitoring, and analysis suite that helps identify issues quickly across your AI video pipeline application. This toolkit includes health checking, performance profiling, security scanning, and integrated monitoring.

## 🚀 Quick Start

```bash
# 🎯 RECOMMENDED: Comprehensive analysis dashboard
npm run debug:dashboard

# Individual tools
npm run debug                    # Basic health check
npm run debug:performance        # Performance profiling
npm run debug:security          # Security scanning
npm run debug:advanced          # Advanced health check

# Quick checks
npm run debug:quick             # Minimal health check
npm run debug:all               # Same as dashboard

# Production monitoring
npm run monitor                 # Start continuous monitoring
npm run monitor:check           # Single health check
```

## 🔍 What It Analyzes

### 🏥 Health Monitoring
- **Environment Variables**: Required/optional API keys and configuration
- **Project Structure**: Core files, directories, and dependencies
- **Service Connectivity**: OpenAI, AWS S3, Cloudinary, Temporal connections
- **Build Process**: TypeScript compilation and frontend builds
- **System Resources**: Ports, disk space, memory usage
- **Application Health**: Syntax validation and runtime checks

### ⚡ Performance Profiling
- **System Resources**: CPU, memory, and disk usage monitoring
- **Node.js Performance**: Heap memory, event loop lag, V8 compilation
- **I/O Performance**: File read/write speeds and throughput
- **Network Performance**: DNS resolution, HTTP response times
- **Benchmarking**: CPU, JSON processing, regex, array operations
- **System Limits**: File descriptors, process limits

### 🔒 Security Scanning
- **Dependency Vulnerabilities**: NPM audit and known CVEs
- **Source Code Analysis**: Hardcoded secrets, injection vulnerabilities
- **Environment Security**: Sensitive data exposure checks
- **File Permissions**: Overly permissive files
- **Network Security**: HTTPS usage, CORS configuration
- **Authentication**: JWT/session secret strength
- **Input Validation**: Request size limits, query safety

### 📊 Integrated Dashboard
- **Unified Analysis**: Combines health, performance, and security
- **HTML Reports**: Beautiful, interactive web reports
- **Risk Assessment**: Overall system health scoring
- **Actionable Recommendations**: Prioritized improvement suggestions
- **Next Steps**: Clear action plans based on findings

## 🛠️ Tool Suite Overview

### 🔍 `debug-dashboard.ts` - Master Dashboard (RECOMMENDED)
The ultimate debugging tool that combines all analysis into a single, comprehensive report.

**Features:**
- Runs health, performance, and security analysis in parallel
- Generates beautiful HTML reports with interactive visualizations
- Provides overall system health score (0-100%)
- Actionable recommendations and next steps
- Can be customized to run specific analysis modules

**Usage:**
```bash
npm run debug:dashboard

# Customize analysis
npx ts-node scripts/debug-dashboard.ts --no-performance  # Skip performance
npx ts-node scripts/debug-dashboard.ts --no-security     # Skip security
npx ts-node scripts/debug-dashboard.ts --no-html         # Skip HTML report
```

### 🏥 `debug.ts` - Advanced Health Checker
Comprehensive health monitoring for all application components.

**Checks:**
- Environment variables and configuration
- Project structure and dependencies
- Service connectivity (OpenAI, AWS, Cloudinary, Temporal)
- Build processes and compilation
- System resources and availability

### ⚡ `performance-profiler.ts` - Performance Analyzer
Deep performance analysis and benchmarking.

**Measures:**
- System resource usage (CPU, memory, disk)
- Node.js specific metrics (heap, event loop, V8)
- I/O performance (file read/write speeds)
- Network performance (DNS, HTTP response times)
- Performance benchmarks (CPU, JSON, regex, arrays)

### 🔒 `security-scanner.ts` - Security Vulnerability Scanner
Comprehensive security analysis to identify vulnerabilities.

**Scans for:**
- Dependency vulnerabilities and CVEs
- Hardcoded secrets and credentials
- Code injection vulnerabilities
- File permission issues
- Network security misconfigurations
- Authentication weaknesses

### 📊 `monitor.ts` - Production Monitor
Continuous monitoring for production environments.

**Features:**
- Periodic health checks with configurable intervals
- Automatic retry logic with exponential backoff
- Alert system with webhook support (Slack, Discord, etc.)
- Health history tracking and analysis
- Graceful shutdown handling

## 📊 Output Format

The debugger provides:
- **Real-time feedback** with emojis and color coding
- **Actionable recommendations** for each issue found
- **Health score** (0-100%) based on passing checks
- **Detailed JSON report** saved to file
- **Summary statistics** with categorized issues

## 🎯 Usage Examples

### Development Environment Setup
```bash
# Check if development environment is ready
npm run debug

# If issues found, follow the recommendations:
# - Add missing environment variables to .env
# - Run npm install for missing dependencies
# - Fix TypeScript compilation errors
```

### Production Deployment
```bash
# Pre-deployment health check
npm run debug:advanced

# Verify all critical services are accessible
# Ensure build process works correctly
# Check resource availability
```

### Troubleshooting Issues
```bash
# Quick status check
npm run debug:quick

# Full diagnostic when app won't start
npm run debug

# Check specific component connectivity
npm run debug:advanced | grep "Service"
```

## 🔧 Debugging Specific Issues

### Environment Variables Missing
```bash
❌ Environment: Missing required environment variable: OPENAI_API_KEY
💡 Add OPENAI_API_KEY to your .env file
```
**Solution**: Create or update `.env` file with missing variables.

### Service Connection Failures
```bash
❌ OpenAI Service: Connection failed: Request failed with status code 401
💡 Check OPENAI_API_KEY and network connectivity
```
**Solution**: Verify API keys and network access.

### Build Failures
```bash
❌ TypeScript: TypeScript compilation failed: error TS2307
💡 Fix TypeScript errors before deployment
```
**Solution**: Address TypeScript compilation errors.

### Port Conflicts
```bash
⚠️ Port Availability: Port 3000 is in use
💡 Stop service using port 3000 or configure different port
```
**Solution**: Stop conflicting services or change port configuration.

## 📈 Health Score Interpretation

- **90-100%**: 🟢 Excellent - Ready for production
- **70-89%**: 🟡 Good - Minor issues to address
- **50-69%**: 🟠 Fair - Several issues need attention
- **Below 50%**: 🔴 Poor - Critical issues must be fixed

## 🛠️ Advanced Features

### JSON Report Generation
Each run generates a timestamped JSON report:
```json
{
  "timestamp": "2024-01-21T17:30:00.000Z",
  "duration": 1250,
  "healthScore": 85,
  "summary": {
    "passed": 15,
    "warnings": 3,
    "failed": 1,
    "total": 19
  },
  "results": [...]
}
```

### Custom Checks
The debugger can be extended with custom checks:

```typescript
import { AdvancedDebugger } from './scripts/debug';

const debugger = new AdvancedDebugger();
// Add custom checks here
debugger.run();
```

### CI/CD Integration
Use in automated pipelines:
```yaml
# GitHub Actions example
- name: Health Check
  run: npm run debug
  continue-on-error: false
```

## 🚨 Common Issues & Solutions

### "ts-node not found"
```bash
npm install -g ts-node typescript
# or use the fallback JavaScript version
node scripts/debug.js
```

### "Permission denied"
```bash
chmod +x scripts/debug.js
chmod +x scripts/debug.ts
```

### "Module not found"
```bash
npm install  # Ensure all dependencies are installed
```

### "Network timeout"
- Check internet connectivity
- Verify firewall settings
- Confirm service URLs are accessible

## 🔄 Automated Monitoring

Set up periodic health checks:

```bash
# Cron job example (run every hour)
0 * * * * cd /path/to/project && npm run debug:quick

# PM2 ecosystem (for production monitoring)
{
  "name": "health-check",
  "script": "npm run debug",
  "cron_restart": "0 */4 * * *"
}
```

## 📞 Support

If the debugger itself has issues:
1. Run `npm run debug:quick` for basic checks
2. Check Node.js version compatibility
3. Verify npm install completed successfully
4. Review the generated JSON report for details

The debugger is designed to be self-diagnosing and will provide specific recommendations for any issues it encounters.