# AI Video Pipeline Advanced Debugger

A comprehensive debugging tool that helps identify issues quickly across your AI video pipeline application.

## 🚀 Quick Start

```bash
# Run the main debugger
npm run debug

# Run advanced TypeScript debugger directly
npm run debug:advanced

# Quick health check (minimal dependencies)
npm run debug:quick
```

## 🔍 What It Checks

### 🌍 Environment Variables
- **Required**: OpenAI API key, AWS credentials, Cloudinary credentials
- **Optional**: Social media platform APIs (YouTube, TikTok, Twitter, Instagram)
- **Temporal**: Workflow engine connection settings

### 📁 Project Structure
- Core files: `package.json`, `tsconfig.json`, main entry points
- Directory structure: `src/`, `src/api/`, `src/services/`, etc.
- Frontend structure: React components and Vite configuration

### 📦 Dependencies
- Critical packages: Express, OpenAI, AWS SDK, Cloudinary, Temporal, React, Vite
- Installation verification: Checks if packages are actually installed
- Version compatibility checks

### 🔗 Service Connectivity
- **OpenAI**: API connection and available models
- **AWS S3**: Bucket access and permissions
- **Cloudinary**: Image/video service availability
- **Temporal**: Workflow engine connectivity

### 🔨 Build Process
- **TypeScript**: Compilation without errors
- **Frontend**: Vite build process and output verification
- **Output**: Dist directory structure validation

### 🚪 System Resources
- **Ports**: Availability of common ports (3000, 4000, 7233, 8080)
- **Disk Space**: Available storage and usage warnings
- **Memory**: Current usage and availability

### 📋 Logging & Health
- Log file discovery and analysis
- Application syntax validation
- Runtime health checks

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