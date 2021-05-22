resource "aws_route53_zone" "primary" {
  name = var.site_domain
}

resource "aws_route53_record" "ns" {
  name            = var.site_domain
  ttl             = 172800
  type            = "NS"
  zone_id         = aws_route53_zone.primary.zone_id

  records = [
    aws_route53_zone.primary.name_servers[0],
    aws_route53_zone.primary.name_servers[1],
    aws_route53_zone.primary.name_servers[2],
    aws_route53_zone.primary.name_servers[3],
  ]
}

resource "aws_route53_record" "soa" {
  name            = var.site_domain
  ttl             = 900
  type            = "SOA"
  zone_id         = aws_route53_zone.primary.zone_id

  records = [
    "${aws_route53_zone.primary.name_servers[0]}. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
  ]
}
