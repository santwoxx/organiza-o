import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import DemandShare from './pages/DemandShare';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const ALLOWED_EMAILS = [
    'brisasofc@gmail.com',
    'isaacbomfim.00@gmail.com'
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email && !ALLOWED_EMAILS.includes(currentUser.email)) {
        await auth.signOut();
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">Carregando...</div>;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Protected Dashboard Route */}
          <Route
            path="/"
            element={user ? <Dashboard /> : <Navigate to="/login" replace />}
          />

          {/* Login Route */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />

          {/* Public Shared Demand Route */}
          <Route
            path="/demand/:cardId"
            element={<DemandShare />}
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
