import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const { lang } = router.query;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
    vn: { title: 'Đăng nhập', label: 'Mã truy cập', placeholder: 'KTRIX-XXXXX', btn: 'Đăng nhập', error: 'Mã không hợp lệ hoặc đã hết hạn', back: '← Trang chủ' },
    fr: { title: 'Connexion', label: "Code d'accès", placeholder: 'KTRIX-XXXXX', btn: 'Se connecter', error: 'Code invalide ou expiré', back: '← Accueil' },
    en: { title: 'Login', label: 'Access code', placeholder: 'KTRIX-XXXXX', btn: 'Login', error: 'Invalid or expired code', back: '← Home' },
  };
  const l = t[lang] || t['en'];

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/verify-beta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
    const data = await res.json();
    if (data.valid) {
      localStorage.setItem('ktrix_beta_code', code.trim().toUpperCase());
      router.push('/search');
    } else {
      setError(l.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
        <img src="https://raw.githubusercontent.com/f8902621-byte/traxhome-mvp/main/Ktrixlogo.png" alt="K Trix" className="w-16 h-16 object-contain mx-auto mb-6" />
        <h1 className="text-xl font-bold text-white text-center mb-6">{l.title}</h1>
        <label className="text-sm text-gray-400 mb-2 block">{l.label}</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder={l.placeholder}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 mb-4 font-mono text-center text-lg tracking-widest"
        />
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading || !code}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-500 hover:to-cyan-400 transition disabled:opacity-50"
        >
          {loading ? '...' : l.btn}
        </button>
        <button onClick={() => router.push('/')} className="w-full mt-4 text-gray-600 hover:text-gray-400 text-sm transition">
          {l.back}
        </button>
      </div>
    </div>
  );
}
