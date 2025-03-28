
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Calendar from "./pages/Calendar";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import WorkoutForm from "./pages/WorkoutForm";
import WorkoutSession from "./pages/WorkoutSession";
import WorkoutHistory from "./pages/WorkoutHistory";
import WorkoutMetrics from "./pages/WorkoutMetrics";
import DataBackup from "./pages/DataBackup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Navbar is outside the Routes component to remain static during route changes */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/exercise-library" element={<ExerciseLibrary />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/workout/new" element={<WorkoutForm />} />
          <Route path="/workout/:id" element={<WorkoutForm />} />
          <Route path="/workout-session/:id" element={<WorkoutSession />} />
          <Route path="/workout-history" element={<WorkoutHistory />} />
          <Route path="/workout-metrics" element={<WorkoutMetrics />} />
          <Route path="/backup" element={<DataBackup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
