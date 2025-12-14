import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Cashout from "@/pages/Cashout";
import { AppProvider } from "@/context/AppContext";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<LandingPage />} />
          <Route path="/about" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cashout" element={<Cashout />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
