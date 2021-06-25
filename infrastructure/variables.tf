variable "aws_region" {
  type        = string
  description = "The AWS region to put the bucket into"
  default     = "eu-west-1"
}

variable "cert_arn" {
  type        = string
  default     = "arn:aws:acm:us-east-1:704256762269:certificate/7e8b7357-ec1e-4f92-b705-cf071370c153"
}

variable "site_domain" {
  type        = string
  description = "The domain name to use for the static site"
  default     = "streamdigger.app"
}
