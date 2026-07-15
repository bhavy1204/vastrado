import { Link } from "react-router-dom";
import {
  InstagramLogo,
  WhatsappLogo,
  EnvelopeSimple,
} from "@phosphor-icons/react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <p className="text-lg font-bold text-primary mb-2">clothMarkets</p>
          <p className="text-sm text-text-muted leading-relaxed">
            Discover local clothing shops near you and enquire directly on
            WhatsApp.
          </p>
        </div>

        <FooterColumn
          title="Explore"
          links={[
            { to: "/products", label: "All products" },
            { to: "/nearby", label: "Shops near me" },
          ]}
        />

        <FooterColumn
          title="Sell with us"
          links={[
            { to: "/seller/register", label: "Register your shop" },
            { to: "/login", label: "Seller login" },
          ]}
        />

        <div>
          <p className="text-sm font-semibold text-text mb-3">Get in touch</p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:support@clothmarkets.in"
              aria-label="Email"
              className="text-text-muted hover:text-primary"
            >
              <EnvelopeSimple size={20} />
            </a>
            <a
              href="https://wa.me/910000000000"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-text-muted hover:text-primary"
            >
              <WhatsappLogo size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-text-muted hover:text-primary"
            >
              <InstagramLogo size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-4 px-4 sm:px-6">
        <p className="text-xs text-text-muted text-center">
          © {year} clothMarket. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-sm font-semibold text-text mb-3">{title}</p>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="text-sm text-text-muted hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


