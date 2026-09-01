import React, { useState, useEffect } from 'react';
import JobBoard from './components/JobBoard';
import AdminLoginModal from './components/AdminLoginModal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdminLoggedIn');
    if (adminStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('isAdminLoggedIn', 'true');
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsLoggedIn(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      
      {/* Tombol Admin Melayang (Floating) - Tidak akan merusak layout asli */}
      <div className="absolute top-4 right-6 z-50">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Logout Admin
          </button>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition opacity-50 hover:opacity-100"
          >
            Login Admin
          </button>
        )}
      </div>

      {/* Komponen Utama Anda (Desain Asli Pintukarier) */}
      <JobBoard isAdmin={isLoggedIn} />

      {/* Modal Login Admin */}
      {showLoginModal && (
        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}