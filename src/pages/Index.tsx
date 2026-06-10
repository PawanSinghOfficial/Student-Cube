import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { CategoryCard } from "@/components/products/CategoryCard";
import { RecentlyViewedSection } from "@/components/products/RecentlyViewedSection";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { CATEGORIES } from "@/data/mockData";
import logo from "@/assets/logo.png";
import heroCalculator from "@/assets/hero-calculator.png";
import heroBook from "@/assets/hero-book.png";
import heroDrafter from "@/assets/hero-drafter.png";
import heroTsquare from "@/assets/hero-tsquare.png";
import heroPouch from "@/assets/hero-pouch.png";
import heroBlueprint from "@/assets/hero-blueprint.png";
import heroLabcoat from "@/assets/hero-labcoat.png";
import { Sparkles } from "lucide-react";

import {
  ArrowRight,
  BookOpen,
  Calculator,
  Ruler,
  FileText,
  Shirt,
  Laptop,
  Briefcase,
  Package,
  Shield,
  Zap,
  Users,
  BadgeCheck,
  ChevronRight,
  Star,
  
} from "lucide-react";

const iconMap: Record<string, any> = {
  BookOpen,
  Calculator,
  Ruler,
  FileText,
  Shirt,
  Laptop,
  Briefcase,
  Package,
};

const categoryColors = [
  "gradient-primary",
  "bg-accent",
  "bg-success",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-slate-500",
];


const howItWorks = [
  {
    step: 1,
    title: "Create Account",
    description: "Sign up with your phone number and email. Verify your identity to join the trusted community.",
    icon: Users,
  },
  {
    step: 2,
    title: "List or Browse",
    description: "Sellers list items with photos and videos. Buyers browse by category, college, or search.",
    icon: Zap,
  },
  {
    step: 3,
    title: "Connect Safely",
    description: "Pay ₹9 to access seller contact. Chat with predefined keywords for safety before full payment.",
    icon: Shield,
  },
  {
    step: 4,
    title: "Complete Deal",
    description: "Meet, verify the item, complete the transaction. Rate each other and get your invoice.",
    icon: BadgeCheck,
  },
];

const Index = () => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  return (
    <Layout>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 40%, #58c4b8 0%, #3a8da0 38%, #2a5d8f 75%, #1e3f6b 100%)",
        }}
      >
        {/* Subtle dotted noise pattern */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        {/* Soft color blobs */}
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-cyan-300/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-[26rem] h-[26rem] rounded-full bg-teal-200/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-[24rem] h-[24rem] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 pt-12 pb-28 lg:pt-16 lg:pb-36">
          {/* Top text block */}
          <div className="max-w-3xl mx-auto text-center text-primary-foreground relative z-10 animate-[slideUp_0.7s_ease-out]">
            <Badge
              variant="secondary"
              className="mb-6 text-sm px-4 py-1.5 bg-white/15 backdrop-blur-md text-primary-foreground border border-white/20"
            >
              <Star className="w-4 h-4 mr-1 fill-accent text-accent" />
              The GGSIPU Student Marketplace
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">
              Buy &amp; Sell College
              <span className="block text-accent">Accessories Safely</span>
            </h1>

            <p className="text-base md:text-lg text-primary-foreground/85 max-w-2xl mx-auto">
              The trusted marketplace for all GGSIPU students. Find books, calculators,
              drafters, and more at amazing prices. Join IPU KA ADDA today!
            </p>
          </div>

          {/* Floating illustration stage */}
          <div className="relative mx-auto mt-12 md:mt-16 lg:mt-20 h-[480px] md:h-[560px] lg:h-[620px] max-w-6xl">
            {/* Sparkles */}
            {[
              { top: "6%", left: "30%", delay: "0s", size: 18 },
              { top: "18%", left: "70%", delay: "0.6s", size: 14 },
              { top: "52%", left: "32%", delay: "1.1s", size: 16 },
              { top: "55%", left: "66%", delay: "0.3s", size: 14 },
              { top: "82%", left: "38%", delay: "0.9s", size: 18 },
              { top: "78%", left: "60%", delay: "1.4s", size: 12 },
            ].map((s, i) => (
              <Sparkles
                key={i}
                className="absolute text-white/80 animate-twinkle pointer-events-none"
                style={{
                  top: s.top,
                  left: s.left,
                  width: s.size,
                  height: s.size,
                  animationDelay: s.delay,
                }}
              />
            ))}

            {/* Floating objects — real illustrated items, kept clear of the center logo */}
            {[
              { src: heroCalculator, alt: "Calculator", top: "0%",   left: "0%",     rot: "-10deg", delay: "0s",   size: "w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40" },
              { src: heroBook,       alt: "Textbook",   top: "0%",   right: "0%",    rot: "12deg",  delay: "0.4s", size: "w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40" },
              { src: heroDrafter,    alt: "Drafter",    top: "38%",  left: "-2%",    rot: "-8deg",  delay: "0.8s", size: "w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48" },
              { src: heroTsquare,    alt: "T-square",   top: "40%",  right: "-2%",   rot: "14deg",  delay: "0.2s", size: "w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44" },
              { src: heroPouch,      alt: "Pencil pouch", bottom: "0%", left: "2%",  rot: "-6deg",  delay: "1.0s", size: "w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48" },
              { src: heroBlueprint,  alt: "Blueprint",  bottom: "2%", left: "50%",   rot: "4deg",   delay: "0.6s", size: "w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40", translateX: "-50%" },
              { src: heroLabcoat,    alt: "Lab coat",   bottom: "0%", right: "2%",   rot: "8deg",   delay: "0.3s", size: "w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44" },
            ].map(({ src, alt, rot, delay, size, translateX, ...pos }, i) => (
              <div
                key={i}
                className="absolute animate-float-y pointer-events-none"
                style={{
                  ...pos,
                  // @ts-expect-error css var
                  "--rot": rot,
                  animationDelay: delay,
                  transform: translateX ? `translateX(${translateX})` : undefined,
                }}
              >
                <img
                  src={src}
                  alt={alt}
                  loading="lazy"
                  className={`${size} object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]`}
                  style={{ transform: `rotate(${rot})` }}
                />
              </div>
            ))}

            {/* Center logo with glowing halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              {/* Outer rotating glow ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-80 md:h-80 rounded-full animate-spin-slow"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(125,233,255,0) 0deg, rgba(125,233,255,0.55) 90deg, rgba(255,255,255,0) 180deg, rgba(125,233,255,0.55) 270deg, rgba(125,233,255,0) 360deg)",
                  filter: "blur(18px)",
                  opacity: 0.7,
                }}
              />
              {/* Pulsing halo */}
              <div className="absolute top-1/2 left-1/2 w-56 h-56 md:w-64 md:h-64 rounded-full animate-halo"
                style={{
                  background:
                    "radial-gradient(circle, rgba(180,255,245,0.85) 0%, rgba(125,233,255,0.45) 40%, rgba(125,233,255,0) 70%)",
                }}
              />
              {/* Logo disc */}
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-white/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/60 flex items-center justify-center">
                <img
                  src={logo}
                  alt="IPU KA ADDA"
                  className="w-24 h-24 md:w-28 md:h-28 object-contain"
                />
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center mt-10 md:mt-12 animate-[slideUp_0.9s_ease-out]">
            <Link to="/browse">
              <Button variant="accent" size="xl" className="w-full sm:w-auto shadow-2xl">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/sell">
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto backdrop-blur-md bg-white/10">
                Sell Your Items
              </Button>
            </Link>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Browse Categories</h2>
              <p className="text-muted-foreground mt-2">Find exactly what you need for your courses</p>
            </div>
            <Link to="/browse" className="hidden md:flex items-center text-primary font-medium hover:underline">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.map((category, index) => {
              const Icon = iconMap[category.icon] || Package;
              return (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  icon={Icon}
                  color={categoryColors[index % categoryColors.length]}
                  href={`/browse?category=${category.id}`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Join fellow GGSIPU students buying and selling safely on IPU KA ADDA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} variant="elevated" className="p-6 text-center relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full gradient-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mt-4 mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <RecentlyViewedSection
              products={recentlyViewed}
              onClear={clearRecentlyViewed}
              title="Continue Where You Left Off"
            />
          </div>
        </section>
      )}
      <section id="safety" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card variant="glass" className="p-8 lg:p-12 border-primary/20">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shrink-0 shadow-glow">
                  <Shield className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                    Your Safety is Our Priority
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    We verify all sellers with video proof, use escrow-style contact access,
                    and provide warning systems to protect you from scams.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <Badge variant="verified" className="text-sm py-1.5">
                      <BadgeCheck className="w-4 h-4 mr-1" />
                      Verified Sellers
                    </Badge>
                    <Badge variant="verified" className="text-sm py-1.5">
                      <Shield className="w-4 h-4 mr-1" />
                      Secure Payments
                    </Badge>
                    <Badge variant="verified" className="text-sm py-1.5">
                      <FileText className="w-4 h-4 mr-1" />
                      Invoice Generation
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Join the Community?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Start buying or selling today and save money on your college essentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button variant="accent" size="xl">
                Create Free Account
              </Button>
            </Link>
            <Link to="/browse">
              <Button variant="heroOutline" size="xl">
                Browse as Guest
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
