import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { FrameScreen } from "@/pages/FrameScreen";
import DashboardScreen from "@/pages/DashboardScreen";
import MealPlanScreen from "@/pages/MealPlanScreen";
import WorkoutScreen from "@/pages/WorkoutScreen";
import SignUpScreen from "@/pages/SignUpScreen";
import BMICalculatorScreen from "@/pages/BMICalculatorScreen";
import LoginScreen from "@/pages/LoginScreen";
import CreateAccountScreen from "@/pages/CreateAccountScreen";
import ForgotPasswordScreen from "@/pages/ForgotPasswordScreen";
import ResetPasswordScreen from "@/pages/ResetPasswordScreen";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProgressPage } from "@/components/ProgressPage";
import { ChatProvider } from "@/context/ChatContext";

// Initialize Query Client at file level
const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={FrameScreen} />
      <Route path="/login" component={LoginScreen} />
      <Route path="/create-account" component={CreateAccountScreen} />
      <Route path="/forgot-password" component={ForgotPasswordScreen} />
      <Route path="/reset-password" component={ResetPasswordScreen} />

      {/* Protected App Routes */}
      <Route path="/signup">
        <ProtectedRoute>
          <SignUpScreen />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardScreen />
        </ProtectedRoute>
      </Route>
      <Route path="/meal-plan">
        <ProtectedRoute>
          <MealPlanScreen />
        </ProtectedRoute>
      </Route>
      <Route path="/workouts">
        <ProtectedRoute>
          <WorkoutScreen />
        </ProtectedRoute>
      </Route>
      <Route path="/bmi">
        <ProtectedRoute>
          <BMICalculatorScreen />
        </ProtectedRoute>
      </Route>
      <Route path="/progress">
        <ProtectedRoute>
          <ProgressPage />
        </ProtectedRoute>
      </Route>

      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ChatProvider>
    </QueryClientProvider>
  );
}