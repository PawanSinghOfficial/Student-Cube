import { Link } from "react-router-dom";
import { Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">IK</span>
              </div>
              <div>
                <span className="font-bold text-xl">IPU KA</span>
                <span className="font-bold text-xl text-accent ml-1">ADDA</span>
              </div>
            </div>
            <p className="text-sm text-background/70">
              The trusted marketplace for GGSIPU students. Buy and sell college accessories safely.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background/10 hover:bg-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background/10 hover:bg-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: "Browse Products", href: "/browse" },
                { name: "Sell Item", href: "/sell" },
                { name: "How It Works", href: "/#how-it-works" },
                { name: "Safety Tips", href: "/#safety" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-background/70 hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Categories</h4>
            <ul className="space-y-2">
              {[
                "Books & Notes",
                "Calculators",
                "Drafters & Instruments",
                "Akash Materials",
                "Lab Coats & Uniforms",
              ].map((category) => (
                <li key={category}>
                  <Link to={`/browse?category=${encodeURIComponent(category)}`} className="text-sm text-background/70 hover:text-accent transition-colors">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Mail className="h-4 w-4 text-accent" />
                support@ipukaadda.com
              </li>
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="h-4 w-4 text-accent" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-2 text-sm text-background/70">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                GGSIPU, Dwarka, New Delhi
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/60">
              © 2024 IPU KA ADDA. All rights reserved. Made with ❤️ for GGSIPU students.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-background/60 hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-background/60 hover:text-accent transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
