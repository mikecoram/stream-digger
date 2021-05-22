resource "aws_acm_certificate" "cert" {
  domain_name       = var.site_domain
  validation_method = "DNS"

  subject_alternative_names = ["www.${var.site_domain}"]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cname1" {
  name    = "_a7f9ded7ceaeb6c261936fcefe7a76e7.spotifydigger.app"
  ttl     = 300
  type    = "CNAME"
  zone_id = aws_route53_zone.primary.zone_id

  records = [
    "_5b9655f0903017b180b29d5803c2c98b.jddtvkljgg.acm-validations.aws."
  ]
}

resource "aws_route53_record" "cname2" {
  name    = "_616846f6a0ae9a4d31679a73d781e1c0.www.spotifydigger.app"
  ttl     = 300
  type    = "CNAME"
  zone_id = aws_route53_zone.primary.zone_id

  records = [
    "_7e62798ddb6345b12df13b9f3a63125f.jddtvkljgg.acm-validations.aws."
  ]
}
