# GitHub OIDC Provider for GitHub Actions authentication
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]

  tags = {
    Name        = "GitHub Actions OIDC Provider"
    Environment = var.environment
    Project     = "poker-pardner"
  }
}

# IAM role for GitHub Actions to assume
resource "aws_iam_role" "github_actions" {
  name               = "poker-pardner-github-actions"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            # Allow any ref from the repository (branches, tags, pull requests)
            "token.actions.githubusercontent.com:sub" = "repo:portfola/poker-pardner:*"
          }
        }
      }
    ]
  })

  tags = {
    Name        = "GitHub Actions Deployment Role"
    Environment = var.environment
    Project     = "poker-pardner"
  }
}

# IAM policy for S3 access
resource "aws_iam_policy" "s3_deployment" {
  name        = "poker-pardner-s3-deployment"
  description = "Allow GitHub Actions to deploy to S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Resource = [
          aws_s3_bucket.website.arn,
          "${aws_s3_bucket.website.arn}/*",
        ]
      }
    ]
  })

  tags = {
    Name        = "S3 Deployment Policy"
    Environment = var.environment
    Project     = "poker-pardner"
  }
}

# IAM policy for CloudFront cache invalidation
resource "aws_iam_policy" "cloudfront_invalidation" {
  name        = "poker-pardner-cloudfront-invalidation"
  description = "Allow GitHub Actions to invalidate CloudFront cache"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
        ]
        Resource = aws_cloudfront_distribution.website.arn
      }
    ]
  })

  tags = {
    Name        = "CloudFront Invalidation Policy"
    Environment = var.environment
    Project     = "poker-pardner"
  }
}

# Attach S3 policy to role
resource "aws_iam_role_policy_attachment" "s3_deployment" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.s3_deployment.arn
}

# Attach CloudFront policy to role
resource "aws_iam_role_policy_attachment" "cloudfront_invalidation" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.cloudfront_invalidation.arn
}
