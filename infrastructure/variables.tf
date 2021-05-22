variable "aws_region" {
  type        = string
  description = "The AWS region to put the bucket into"
  default     = "eu-west-1"
}

variable "cert_arn" {
  type        = string
  default     = "arn:aws:acm:us-east-1:704256762269:certificate/632c5395-0f11-4139-87e5-7533f81e3534"
}

variable "site_domain" {
  type        = string
  description = "The domain name to use for the static site"
  default     = "spotifydigger.app"
}
