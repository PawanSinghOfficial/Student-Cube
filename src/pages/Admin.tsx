import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Package, CreditCard, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";

const AdminPage = () => {
  const stats = [
    { icon: Users, label: "Total Users", value: "5,234", trend: "+12%" },
    { icon: Package, label: "Active Listings", value: "1,847", trend: "+8%" },
    { icon: CreditCard, label: "Revenue", value: "₹45,230", trend: "+23%" },
    { icon: AlertTriangle, label: "Pending Reviews", value: "23", trend: "-5%" },
  ];

  const pendingListings = [
    { id: 1, title: "Engineering Drawing Set", seller: "rahul45", college: "MSIT", submitted: "2 hours ago" },
    { id: 2, title: "Data Structures Book", seller: "priya12", college: "USICT", submitted: "5 hours ago" },
    { id: 3, title: "Scientific Calculator", seller: "amit99", college: "BPIT", submitted: "1 day ago" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="accent" className="mb-2">Admin Portal</Badge>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          </div>
          <Button variant="outline">View Reports</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} variant="elevated" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="success" className="text-xs">{stat.trend}</Badge>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Pending Listings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Pending Approvals</h2>
            <Badge variant="pending">{pendingListings.length} pending</Badge>
          </div>
          <div className="space-y-4">
            {pendingListings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-sm text-muted-foreground">by @{listing.seller} • {listing.college} • {listing.submitted}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                  <Button variant="success" size="icon"><CheckCircle className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon"><XCircle className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminPage;
