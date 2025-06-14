// src/App.tsx
import { Routes, Route } from 'react-router-dom';

// Global components
import Header from '@/components/header';

// Page components
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Withdraw from './pages/Withdraw';
import LandingPage from './pages/LandingPage';
import GamesPage from './pages/GamesPage';
import Trust from './pages/Trust';
import Community from './pages/community';
import Dashboard from './pages/dashboard';



export default function App() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/GamesPage" element={<GamesPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/Withdraw" element={<Withdraw />} />
          <Route path="/community" element={<Community />} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/Trust" element={<Trust />} />
          


          {/* Swytch Onboarding Phases */}
          {/* Add them here if needed */}

          {/* Fallback (optional) */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </main>
    </div>
  );
}
