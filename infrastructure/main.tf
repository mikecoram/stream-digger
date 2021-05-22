resource "aws_s3_bucket" "site" {
  bucket = var.site_domain
  acl    = "public-read"
  policy = ""

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = [
          aws_s3_bucket.site.arn,
          "${aws_s3_bucket.site.arn}/*",
        ]
      },
    ]
  })
}

resource "aws_s3_bucket" "www" {
  bucket = "www.${var.site_domain}"
  acl    = "private"
  policy = ""

  website {
    redirect_all_requests_to = "https://${var.site_domain}"
  }
}

module "cloudfront_site" {
  source = "./s3-cloudfront"

  alias       = var.site_domain
  aws_region  = var.aws_region
  cert_arn    = var.cert_arn
  domain_name = aws_s3_bucket.site.bucket_regional_domain_name
  origin_id   = "S3-${var.site_domain}"
}

module "cloudfront_www" {
  source = "./s3-cloudfront"

  alias       = "www.${var.site_domain}"
  aws_region  = var.aws_region
  cert_arn    = var.cert_arn
  domain_name = aws_s3_bucket.www.bucket_regional_domain_name
  origin_id   = "S3-www.${var.site_domain}"
}
