variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
  default     = "production"
}

variable "bucket_name" {
  description = "S3 bucket name for website hosting"
  type        = string
  default     = "poker-pardner-website"
}

variable "domain_name" {
  description = "Domain name for the website"
  type        = string
  default     = "poker.portfola.net"
}

variable "hosted_zone_name" {
  description = "Route53 hosted zone name (must already exist)"
  type        = string
  default     = "portfola.net"
}
