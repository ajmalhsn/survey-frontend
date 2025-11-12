# Deployment Guide

This document provides instructions for deploying the Survey Frontend application to various platforms.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Docker (for containerized deployments)

## Build Configuration

The application uses Vite for bundling and React for the UI framework. The build process:

- Minifies and optimizes code
- Chunks vendor dependencies separately
- Removes console logs and debugger statements in production
- Generates optimized assets in the `dist/` directory

### Building Locally

```bash
npm run build
npm run preview  # Preview production build locally
```

## Environment Variables

Create `.env` files based on the deployment environment:

- `.env.development` - Local development
- `.env.production` - Production environment
- `.env.staging` - Staging environment (optional)

Key environment variables:
- `VITE_API_URL` - Backend API endpoint
- `VITE_API_TIMEOUT` - API request timeout in milliseconds
- `VITE_LOG_LEVEL` - Logging level (debug, info, warn, error)
- `VITE_ENABLE_ANALYTICS` - Enable analytics tracking
- `VITE_ENABLE_ERROR_REPORTING` - Enable error reporting

## Deployment Platforms

### 1. Vercel (Recommended)

Vercel provides automatic deployments from Git and excellent Next.js/Vite support.

#### Setup:
1. Push your code to GitHub/GitLab/Bitbucket
2. Visit [vercel.com](https://vercel.com) and sign up
3. Import your project
4. Set environment variables in Project Settings
5. Deploy automatically on every push to main

#### Manual Deployment:
```bash
npm install -g vercel
vercel
```

### 2. Netlify

Netlify offers continuous deployment and serverless functions.

#### Setup:
1. Connect your Git repository on [netlify.com](https://netlify.com)
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set environment variables
4. Deploy on push to main

#### Manual Deployment:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### 3. Heroku

Heroku provides easy deployment with automatic scaling.

#### Setup:
1. Install Heroku CLI: `brew tap heroku/brew && brew install heroku`
2. Authenticate: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables: `heroku config:set VITE_API_URL=...`
5. Deploy:

```bash
git push heroku main
```

### 4. AWS S3 + CloudFront

For static site hosting with CDN.

#### Build and Deploy:
```bash
npm run build

# Install AWS CLI if not already installed
# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name/

# Invalidate CloudFront distribution (if using CloudFront)
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### 5. GitHub Pages

Free hosting directly from GitHub repository.

#### Setup:
1. Update `vite.config.js` base path if needed
2. Create GitHub Actions workflow (included in `.github/workflows/deploy.yml`)
3. Update workflow to deploy to GitHub Pages
4. Push to trigger automatic deployment

### 6. Docker Deployment

Deploy containerized application to any Docker-compatible platform.

#### Build Docker Image:
```bash
docker build -t survey-frontend:latest .
```

#### Run Locally:
```bash
docker run -p 3000:3000 survey-frontend:latest
```

#### Using Docker Compose:
```bash
docker-compose up
```

#### Deploy to Docker Registry:
```bash
docker tag survey-frontend:latest your-registry/survey-frontend:latest
docker push your-registry/survey-frontend:latest
```

### 7. Kubernetes

For enterprise deployments.

#### Example Deployment:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: survey-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: survey-frontend
  template:
    metadata:
      labels:
        app: survey-frontend
    spec:
      containers:
      - name: survey-frontend
        image: your-registry/survey-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: VITE_API_URL
          value: "https://api.example.com"
        - name: VITE_LOG_LEVEL
          value: "warn"
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## CI/CD Pipelines

### GitHub Actions

Automated testing and deployment on push to main branch.

Configuration: `.github/workflows/deploy.yml`

### CircleCI

Included configuration: `.circleci/config.yml`

Setup on [circleci.com](https://circleci.com):
1. Connect GitHub repository
2. Select project
3. Pipelines run automatically on push

## Production Checklist

- [ ] Environment variables properly configured
- [ ] API endpoints point to production backend
- [ ] Analytics and error tracking enabled (if applicable)
- [ ] Console logs and debuggers removed
- [ ] Build process tested locally
- [ ] SSL/TLS certificate configured
- [ ] CORS settings configured on backend
- [ ] CDN configured (if applicable)
- [ ] Health checks working
- [ ] Logging and monitoring enabled
- [ ] Backup and disaster recovery plan

## Performance Optimization

The build is already optimized with:
- Code splitting for vendor dependencies
- Terser minification with console log removal
- Asset optimization
- Tree shaking of unused code

Additional steps:
- Use CDN for static assets
- Enable Gzip compression on server
- Set appropriate cache headers
- Monitor Core Web Vitals

## Troubleshooting

### Build Fails
```bash
npm ci  # Clean install dependencies
npm run build  # Try building again
```

### Environment Variables Not Loading
- Ensure `.env.production` is in root directory
- Check variable names start with `VITE_`
- Restart build process after environment changes

### API Connection Issues
- Verify `VITE_API_URL` is correct
- Check CORS configuration on backend
- Verify network connectivity

## Support

For platform-specific issues, refer to:
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- Platform-specific documentation (Vercel, Netlify, etc.)
