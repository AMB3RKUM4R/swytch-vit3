// src/App.tsx
import { Routes, Route } from 'react-router-dom';

// Global components
import HeaderComponent from '@/components/header';

// Page components
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Withdraw from './pages/Withdraw';
import LandingPage from './pages/LandingPage';
import GamesPage from './pages/GamesPage';
import Trust from './pages/Trust';
import Dashboard from './pages/dashboard';
import MembershipPage from './pages/Membership';


export default function App() {
  return (
    <div className="bg-background text-foreground">
      <HeaderComponent />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/membership" element={<MembershipPage />} />
        </Routes>
      </main>
    </div>
  );
}