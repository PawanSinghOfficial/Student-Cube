import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryCard } from "@/components/products/CategoryCard";
import { MOCK_PRODUCTS, CATEGORIES } from "@/data/mockData";
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
  TrendingUp,
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

const stats = [
  { value: "5000+", label: "Active Users" },
  { value: "10K+", label: "Items Sold" },
  { value: "50+", label: "GGSIPU Colleges" },
  { value: "₹10L+", label: "Saved by Students" },
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
    description: "Pay ₹5 to access seller contact. Chat with predefined keywords for safety before full payment.",
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
  const featuredProducts = MOCK_PRODUCTS.filter((p) => p.isFeatured);
  const recentProducts = MOCK_PRODUCTS.slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5 bg-primary-foreground/20 text-primary-foreground border-none">
              <Star className="w-4 h-4 mr-1 fill-accent text-accent" />
              Trusted by 5000+ GGSIPU Students
            </Badge>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Buy & Sell College
              <span className="block text-accent">Accessories Safely</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              The trusted marketplace for all GGSIPU students. Find books, calculators, 
              drafters, and more at amazing prices. Join IPU KA ADDA today!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button variant="accent" size="xl" className="w-full sm:w-auto">
                  Start Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/sell">
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                  Sell Your Items
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
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
                  count={Math.floor(Math.random() * 200) + 50}
                  color={categoryColors[index % categoryColors.length]}
                  href={`/browse?category=${category.id}`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="accent" className="mb-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                Hot Deals
              </Badge>
              <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
              <p className="text-muted-foreground mt-2">Hand-picked deals you don't want to miss</p>
            </div>
            <Link to="/browse?featured=true" className="hidden md:flex items-center text-primary font-medium hover:underline">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Join thousands of GGSIPU students buying and selling safely on IPU KA ADDA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} variant="elevated" className="p-6 text-center relative">
                  {/* Step number */}
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

      {/* Recent Listings */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Recent Listings</h2>
              <p className="text-muted-foreground mt-2">Fresh items added by fellow students</p>
            </div>
            <Link to="/browse" className="hidden md:flex items-center text-primary font-medium hover:underline">
              Browse All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/browse">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Safety Section */}
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
                    <strong className="text-accent"> Currently 80% of transactions complete safely!</strong>
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
