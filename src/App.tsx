import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import DemandShare from './pages/DemandShare';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">Carregando...</div>;
  }

  return (
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
  );
}
