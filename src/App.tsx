import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import Admin from "./pages/Admin";
import Articles from "./pages/Articles";
import AIAssistant from "./pages/AIAssistant";
import Categories from "./pages/Categories";
import DietPlans from "./pages/DietPlans";
import ExercisePlans from "./pages/ExercisePlans";
import Courses from "./pages/Courses";
import Products from "./pages/Products";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/diet-plans" element={<DietPlans />} />
            <Route path="/exercise-plans" element={<ExercisePlans />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/products" element={<Products />} />
            <Route path="/community" element={<Community />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
