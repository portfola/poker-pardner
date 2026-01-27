# Deployment Guide

This document describes how to deploy Poker Pardner to production on AWS.

## Architecture Overview

The application is deployed as a static website with the following AWS services:

- **S3**: Hosts the static build files
- **CloudFront**: Provides CDN, HTTPS, and global distribution
- **Route53**: DNS management for poker.portfola.net
- **ACM**: SSL/TLS certificate for HTTPS
- **GitHub Actions**: Automated CI/CD pipeline

## Prerequisites

### AWS Account Setup

1. AWS account with appropriate IAM permissions
2. Route53 hosted zone for `portfola.net` (must exist before running Terraform)
3. AWS CLI installed and configured locally

### GitHub Repository Setup

1. GitHub repository with Actions enabled
2. Required GitHub secrets (see Configuration section)

### Local Development Tools

- Node.js 20+
- Terraform >= 1.0
- AWS CLI configured with credentials

## Initial Infrastructure Setup

### Step 1: Configure AWS OIDC Provider for GitHub Actions

This allows GitHub Actions to authenticate with AWS without storing long-lived credentials.

1. Create OIDC provider in AWS:
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

2. Create IAM role with trust policy for GitHub Actions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:USERNAME/poker:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

3. Attach policies to the role:
   - S3 read/write access to the bucket
   - CloudFront cache invalidation
   - Route53 record management (if needed)

### Step 2: Deploy Infrastructure with Terraform

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply the configuration
terraform apply
```

Note the outputs from Terraform - you'll need these values for GitHub secrets.

### Step 3: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

- `AWS_ROLE_ARN`: IAM role ARN for GitHub Actions (from Step 1)
- `S3_BUCKET_NAME`: S3 bucket name (from Terraform output)
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID (from Terraform output)

### Step 4: Set Up GitHub Environment

1. Go to repository Settings > Environments
2. Create a "production" environment
3. Optionally add protection rules:
   - Required reviewers
   - Deployment branches (limit to main)

## Automated Deployment

Once configured, deployments happen automatically:

1. Push to `main` branch
2. GitHub Actions runs:
   - Runs tests and linting
   - Builds the application
   - Syncs files to S3
   - Invalidates CloudFront cache

The workflow can also be triggered manually from the Actions tab.

## Manual Deployment

If you need to deploy manually:

```bash
# Build the application
npm run build

# Sync to S3
aws s3 sync dist/ s3://poker-pardner-website --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"
```

## Deployment Verification

After deployment, verify:

1. **Website loads**: Visit https://poker.portfola.net
2. **HTTPS works**: Check for valid SSL certificate
3. **All assets load**: Check browser console for errors
4. **Routing works**: Navigate to different states, refresh the page
5. **Performance**: Run Lighthouse audit

## Cache Management

### CloudFront Cache Behavior

- **HTML files** (index.html): No cache (`max-age=0`)
- **Static assets** (/assets/*): 1 year cache with immutable flag
- **Other files**: 1 hour default cache

### Cache Invalidation

The GitHub Action automatically invalidates the entire CloudFront cache on each deployment. For manual invalidation:

```bash
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"
```

## Rollback Procedure

### Option 1: Revert Git Commit

```bash
git revert HEAD
git push origin main
```

This triggers a new deployment with the previous code.

### Option 2: Use S3 Versioning

S3 bucket has versioning enabled. To restore previous version:

```bash
# List versions
aws s3api list-object-versions --bucket poker-pardner-website

# Restore specific version
aws s3api copy-object \
  --copy-source poker-pardner-website/index.html?versionId=VERSION_ID \
  --bucket poker-pardner-website \
  --key index.html
```

Then invalidate CloudFront cache.

## Monitoring and Logs

### CloudFront Logs

Enable CloudFront logging for access logs:

```bash
aws cloudfront update-distribution \
  --id DISTRIBUTION_ID \
  --logging-config Enabled=true,Bucket=logs-bucket.s3.amazonaws.com,Prefix=cloudfront/
```

### Cost Monitoring

Set up AWS Budgets to monitor costs:
- CloudFront data transfer
- S3 storage and requests
- Route53 hosted zone

Expected monthly cost: $1-5 for low traffic

## Troubleshooting

### Issue: Certificate validation stuck

**Solution**: Check Route53 records for ACM validation. DNS propagation can take up to 30 minutes.

### Issue: CloudFront serves old content

**Solution**: Invalidate cache or wait for TTL to expire.

### Issue: 403 errors on S3 files

**Solution**: Check S3 bucket policy allows CloudFront OAC access.

### Issue: GitHub Actions fails AWS authentication

**Solution**:
- Verify OIDC provider is configured
- Check IAM role trust policy matches repository
- Ensure GitHub secrets are set correctly

## Infrastructure Updates

To modify infrastructure:

```bash
cd terraform
# Edit .tf files as needed
terraform plan
terraform apply
```

Terraform tracks state, so it will only apply changes.

## Disaster Recovery

### Backup Strategy

- **Code**: Stored in GitHub repository
- **Infrastructure**: Terraform state (consider remote backend)
- **S3 files**: Versioning enabled on bucket

### Recovery Process

1. If S3 bucket is deleted, re-run `terraform apply`
2. Run GitHub Actions workflow to redeploy application
3. DNS changes may take up to 48 hours to propagate

## Security Considerations

- CloudFront OAC prevents direct S3 access
- HTTPS enforced (HTTP redirects to HTTPS)
- TLS 1.2+ required
- S3 bucket not publicly accessible
- GitHub Actions uses OIDC, not long-lived credentials

## Cost Optimization

Current setup uses:
- CloudFront PriceClass_100 (US, Canada, Europe)
- S3 Standard storage class
- No data transfer charges between S3 and CloudFront

For lower traffic, this is optimal. For higher traffic, consider:
- CloudFront Reserved Capacity
- S3 Intelligent-Tiering

## Support

For issues with deployment:
1. Check GitHub Actions logs
2. Review CloudFront and S3 in AWS Console
3. Check Terraform state and plan output
4. Verify GitHub secrets are correct
