import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import Backdrop from "./components/ui/Backdrop";
import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Debug from "./pages/Debug";
import Diagnosis from "./pages/Diagnosis";
import Register from "./pages/Register";
import Success from "./pages/Success";
import League from "./pages/League";
import CollegePage from "./pages/CollegePage";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import GrowthPlan from "./pages/GrowthPlan";
import NotFound from "./pages/NotFound";
import { LoadingState } from "./components/ui/StateViews";

// Admin dashboard pulls in recharts — code-split so it doesn't bloat the
// recruiter-facing first load.
const Admin = lazy(() => import("./pages/Admin"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Backdrop />
      <ScrollToTop />
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          <Route path="/league" element={<League />} />
          <Route path="/college/:id" element={<CollegePage />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<LoadingState label="Loading Growth Command Center..." />}>
                <Admin />
              </Suspense>
            }
          />
          <Route path="/growth-plan" element={<GrowthPlan />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
