import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CompareProvider } from "@/contexts/CompareContext";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ProductDetail from "./pages/ProductDetail";
import Sell from "./pages/Sell";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CompareProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CompareProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
