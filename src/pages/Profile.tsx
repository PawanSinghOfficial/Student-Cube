import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, ShoppingBag, Tag, Star, CreditCard, Gift, Settings, LogOut } from "lucide-react";

const ProfilePage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-4xl font-bold text-primary-foreground">G</span>
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl font-bold">Guest User</h1>
                  <Badge variant="pending">Not Verified</Badge>
                </div>
                <p className="text-muted-foreground">@guest123</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                  <div className="flex items-center gap-1"><Star className="h-4 w-4 text-accent" /><span className="font-medium">0.0</span></div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">0 items sold</span>
                </div>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: ShoppingBag, label: "Purchases", value: "0" },
              { icon: Tag, label: "Listings", value: "0" },
              { icon: CreditCard, label: "Wallet", value: "₹0" },
              { icon: Gift, label: "Points", value: "0" },
            ].map((stat) => (
              <Card key={stat.label} className="p-4 text-center">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start gap-3 h-12">
                <User className="h-5 w-5" /> My Profile
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-12">
                <Tag className="h-5 w-5" /> My Listings
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-12">
                <Gift className="h-5 w-5" /> Referral Code
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-12">
                <Settings className="h-5 w-5" /> Settings
              </Button>
            </div>
            <Button variant="destructive" className="w-full mt-4 gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
