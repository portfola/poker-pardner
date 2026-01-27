# Terraform Infrastructure

This directory contains Terraform configuration for deploying Poker Pardner to AWS.

## Architecture

- **S3**: Static website hosting for the built application
- **CloudFront**: CDN for global content delivery with HTTPS
- **Route53**: DNS configuration for poker.portfola.net
- **ACM**: SSL/TLS certificate for HTTPS

## Prerequisites

1. AWS account with appropriate permissions
2. Terraform installed (>= 1.0)
3. AWS CLI configured with credentials
4. Route53 hosted zone for `portfola.net` already exists

## Setup

1. Initialize Terraform:
```bash
cd terraform
terraform init
```

2. Review the planned changes:
```bash
terraform plan
```

3. Apply the infrastructure:
```bash
terraform apply
```

## Configuration

Variables can be customized in `variables.tf` or via command line:

```bash
terraform apply \
  -var="aws_region=us-east-1" \
  -var="environment=production" \
  -var="domain_name=poker.portfola.net"
```

## State Management

For production use, enable remote state storage by uncommenting the backend configuration in `main.tf` and creating:

1. S3 bucket for state storage:
```bash
aws s3api create-bucket \
  --bucket poker-pardner-terraform-state \
  --region us-east-1
```

2. DynamoDB table for state locking:
```bash
aws dynamodb create-table \
  --table-name poker-pardner-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Outputs

After applying, Terraform will output:
- S3 bucket name and ARN
- CloudFront distribution ID and domain
- Website URL
- ACM certificate ARN

## Deployment

The GitHub Actions workflow handles deployment automatically. Manual deployment:

```bash
# Build the application
npm run build

# Sync to S3
aws s3 sync dist/ s3://poker-pardner-website --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete the S3 bucket and all its contents.
