# V2U Production Automation Guide

## 🎯 **Complete Workflow Process**

### **Prerequisites**
- [x] R2 bucket configured with proper credentials
- [x] Vercel deployment connected to GitHub
- [x] V2U theme implemented with hover effects
- [x] R2 integration replacing mock data
- [x] Responsive grid layout working

---

## **📋 AUTOMATION WORKFLOWS**

### **1. Episode Upload & Deploy**
```bash
# Complete end-to-end automation
./production-workflow.sh "path/to/episode.mp4" landscape "Episode Title"
```

**This workflow automatically:**
- ✅ Validates environment and files
- ✅ Uploads with canonical normalization
- ✅ Tests local integration
- ✅ Builds for production
- ✅ Commits changes to git
- ✅ Triggers Vercel deployment

### **2. Production Testing**
```bash
# Test live production environment
./test-production.sh your-domain.vercel.app
```

**Tests performed:**
- ✅ Main site accessibility
- ✅ Podcast dashboard functionality
- ✅ Episodes API response
- ✅ Performance metrics
- ✅ R2 bucket connectivity

---

## **🔧 MANUAL COMMANDS (Backup)**

### **Individual Upload Scripts**
```bash
# Landscape episodes
./up-landscape.sh "episode.mp4" landscape

# Portrait episodes  
./up-p.sh "episode.mp4" portrait

# Mobile optimized
./up-m.sh "episode.mp4" mobile
```

### **Quick Development**
```bash
# Fast development cycle
./dev-workflow.sh

# Quick upload without full workflow
./quick-upload.sh "episode.mp4"
```

---

## **📊 MONITORING & VALIDATION**

### **Environment Checks**
```bash
# Verify R2 credentials
./test-r2-integration.sh

# Check canonical normalization
./test-canonical.sh

# Test private access
./test-private-access.md
```

### **Deployment Status**
- **Vercel Dashboard**: Monitor build logs and deployment status
- **Local Testing**: `npm run dev` → http://localhost:3000/podcast-dashboard
- **Production Testing**: Use `test-production.sh` with your domain

---

## **🚀 DEPLOYMENT CHECKLIST**

### **Before Upload**
- [ ] Episode file exists and is valid
- [ ] Environment variables configured
- [ ] Local development server working
- [ ] Git repository clean

### **During Upload**
- [ ] Upload script completes successfully
- [ ] Canonical path generated correctly
- [ ] Local API test passes
- [ ] Production build succeeds

### **After Deploy**
- [ ] Vercel deployment completes
- [ ] Production site accessible
- [ ] Episode appears in dashboard
- [ ] Hover effects working
- [ ] Mobile responsive

---

## **⚡ QUICK REFERENCE**

### **Most Common Commands**
```bash
# Full production workflow
./production-workflow.sh "episode.mp4" landscape "Title"

# Test production after deploy
./test-production.sh your-domain.vercel.app

# Emergency manual upload
./up-landscape.sh "episode.mp4" landscape
```

### **Troubleshooting**
```bash
# Check environment
cat .env.local

# Verify R2 connection
./test-r2-integration.sh

# Clear build cache
rm -rf .next && npm run build

# Check git status
git status
```

---

## **📈 AUTOMATION STATUS**

### **✅ COMPLETED FEATURES**
- V2U theme with consistent styling
- R2 integration with real data
- Responsive 1,3,4 column grid
- Smooth hover effects on all cards
- Canonical URL normalization
- Automated upload scripts
- Production testing suite
- Git integration with auto-commit

### **🎯 PRODUCTION READY**
- Complete workflow automation
- Environment validation
- Error handling and rollback
- Performance monitoring
- Multi-platform testing

### **🔄 NEXT PROJECT READY**
Foundation is solid for:
- Advanced podcast player features
- Premium content gating
- Mobile-first optimizations
- Analytics integration
- User authentication systems

---

## **📞 EMERGENCY PROCEDURES**

### **If Upload Fails**
1. Check `.env.local` credentials
2. Verify episode file exists
3. Run `./test-r2-integration.sh`
4. Check Vercel environment variables

### **If Deployment Fails**
1. Check Vercel dashboard for build logs
2. Run `npm run build` locally
3. Verify all files committed to git
4. Check for TypeScript/ESLint errors

### **If Site Down**
1. Check Vercel status page
2. Verify domain configuration
3. Test with `./test-production.sh`
4. Rollback last deployment if needed

---

**🎉 AUTOMATION COMPLETE - READY FOR NEXT PROJECT! 🎉**