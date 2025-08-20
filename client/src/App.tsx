import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import BookReader from "@/pages/BookReader";
import Profile from "@/pages/Profile";
import Checkout from "@/pages/Checkout";
import PaymentInfo from "@/pages/PaymentInfo";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/books/:id" component={BookReader} />
          <Route path="/payment-info" component={PaymentInfo} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/discover" component={Home} />
          <Route path="/books/:id" component={BookReader} />
          <Route path="/profile" component={Profile} />
          <Route path="/my-books" component={Profile} />
          <Route path="/bookmarks" component={Profile} />
          <Route path="/authors/:id" component={Profile} />
          <Route path="/checkout/:bookId" component={Checkout} />
          <Route path="/payment-info" component={PaymentInfo} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            <Navigation />
            <Router />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
