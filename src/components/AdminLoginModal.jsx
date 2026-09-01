import React, { useState } from 'react';

export default function AdminLoginModal({ isOpen, onClose, onSuccess, login }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!login) throw new Error('Login function not available');

      await login({ email, password });

      if (onSuccess) onSuccess();
    } catch (err) {
      alert('Gagal login: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-navy mb-4">Login Superadmin</h2>
        
        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="block font-semibold mb-1 text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal outline-none"
              placeholder="email@domain.com"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-navy text-white text-sm rounded-lg hover:opacity-90 font-bold"
            >
              {loading ? 'Memproses...' : 'Masuk Panel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}