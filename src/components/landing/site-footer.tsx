import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType, SVGProps } from "react";

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "@/components/icons/socials";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { NewsletterForm } from "@/components/landing/newsletter-form";

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>;

type FooterLink = { key: string; href: string };

const SERVICE_LINKS: FooterLink[] = [
  { key: "express", href: "#services" },
  { key: "international", href: "#services" },
  { key: "ecommerce", href: "#services" },
  { key: "custom", href: "#services" },
];

const SUPPORT_LINKS: FooterLink[] = [
  { key: "track", href: "/track" },
  { key: "faq", href: "#faq" },
  { key: "contact", href: "#contact" },
  { key: "terms", href: "/terms" },
  { key: "privacy", href: "/privacy" },
];

const COMPANY_LINKS: FooterLink[] = [
  { key: "about", href: "#why-us" },
  { key: "careers", href: "#" },
  { key: "press", href: "#" },
];

const SOCIAL: Array<{ key: string; href: string; icon: SocialIcon }> = [
  { key: "twitter", href: "#", icon: TwitterIcon },
  { key: "linkedin", href: "#", icon: LinkedinIcon },
  { key: "facebook", href: "#", icon: FacebookIcon },
  { key: "instagram", href: "#", icon: InstagramIcon },
];

export function SiteFooter() {
  const t = useTranslations("footer");
  const tInfo = useTranslations("landing.contact.info");
  const tSocial = useTranslations("footer.social");
  const tLinks = useTranslations("footer.links");
  const tColumns = useTranslations("footer.columns");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border/60">
      <div className="container mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* About */}
          <div className="lg:col-span-4">
            <Logo width={150} height={36} />
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              {t("about.description")}
            </p>
            <ul className="text-muted-foreground mt-5 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="text-primary h-3.5 w-3.5" />
                {tInfo("emailValue")}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="text-primary h-3.5 w-3.5" />
                {tInfo("phoneValue")}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{tInfo("addressValue")}</span>
              </li>
            </ul>
            <div className="mt-5 flex gap-2">
              {SOCIAL.map(({ key, href, icon: Icon }) => (
                <a
                  key={key}
                  href={href}
                  aria-label={tSocial(key)}
                  className="bg-background text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold">{tColumns("services")}</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {SERVICE_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <FooterAnchor href={href} label={tLinks(key)} />
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold">{tColumns("support")}</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {SUPPORT_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <FooterAnchor href={href} label={tLinks(key)} />
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-semibold">{t("newsletter.title")}</h4>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {t("newsletter.body")}
            </p>
            <NewsletterForm className="mt-4" />
            <h4 className="mt-6 text-sm font-semibold">{tColumns("company")}</h4>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {COMPANY_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <FooterAnchor href={href} label={tLinks(key)} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 md:flex-row">
          <p className="text-muted-foreground text-xs">
            © {year} Trackship. {t("rights")}
          </p>
          <Link
            href="/legal"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            {t("legal")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterAnchor({ href, label }: { href: string; label: string }) {
  // Internal locale-aware navigation for /track, anchor links handled natively.
  if (href.startsWith("#") || href === "#") {
    return (
      <a
        href={href}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {label}
      </a>
    );
  }
  return (
    <Link
      href={href as "/" | "/track" | "/terms" | "/privacy" | "/legal"}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
    </Link>
  );
}
