variable "aws_region" {
  type        = string
  description = "The AWS region to put the bucket into"
  default     = "eu-west-1"
}

variable "cert_arn" {
  type        = string
  default     = "arn:aws:acm:us-east-1:704256762269:certificate/dea1392d-9aed-460f-a28d-e0ff2d81a8b7"
}

variable "site_domain" {
  type        = string
  description = "The domain name to use for the static site"
  default     = "streamdigger.app"
}
