import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function BetaPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    if (typeof window !== 'undefined') {
      const betaCode = localStorage.getItem('ktrix_beta_code');
      if (betaCode) {
        router.push(`/search?lang=${language}`);
        return;
      }
      const saved = localStorage.getItem('ktrix_language');
      if (saved && ['vn', 'en', 'fr'].includes(saved)) setLanguage(saved);
    }
    if (router.query.lang && ['vn', 'en', 'fr'].includes(router.query.lang)) {
      setLanguage(router.query.lang);
    }
  }, [router.query.lang]);

  const t = {
    vn: {
      title: 'Truy cập Beta',
      subtitle: 'Nhập mã truy cập Beta của bạn để sử dụng K Trix',
      placeholder: 'KTRIX-XXXXXX',
      button: 'Xác nhận',
      checking: 'Đang kiểm tra...',
      errorInvalid: 'Mã không hợp lệ. Vui lòng thử lại.',
      errorEmpty: 'Vui lòng nhập mã truy cập.',
      backHome: 'Quay lại trang chủ',
      noCode: 'Chưa có mã? Liên hệ',
    },
    en: {
      title: 'Beta Access',
      subtitle: 'Enter your Beta access code to use K Trix',
      placeholder: 'KTRIX-XXXXXX',
      button: 'Submit',
      checking: 'Checking...',
      errorInvalid: 'Invalid code. Please try again.',
      errorEmpty: 'Please enter an access code.',
      backHome: 'Back to Home',
      noCode: 'No code? Contact',
    },
    fr: {
      title: 'Accès Beta',
      subtitle: 'Entrez votre code d\'accès Beta pour utiliser K Trix',
      placeholder: 'KTRIX-XXXXXX',
      button: 'Valider',
      checking: 'Vérification...',
      errorInvalid: 'Code invalide. Veuillez réessayer.',
      errorEmpty: 'Veuillez entrer un code d\'accès.',
      backHome: 'Retour à l\'accueil',
      noCode: 'Pas de code ? Contactez',
    }
  }[language];

  const handleSubmit = async () => {
    setError('');
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      setError(t.errorEmpty);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/verify-beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (data.valid) {
        localStorage.setItem('ktrix_beta_code', trimmed);
        router.push(`/search?lang=${language}`);
      } else {
        setError(t.errorInvalid);
      }
    } catch (err) {
      setError(t.errorInvalid);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>

        {/* Language selector */}
        <div className="flex justify-center mb-6">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-300 text-sm">
            <option value="vn">🇻🇳 VN</option>
            <option value="en">🇬🇧 EN</option>
            <option value="fr">🇫🇷 FR</option>
          </select>
        </div>

        {/* Code input */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-xl">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            maxLength={13}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-xl font-mono tracking-widest placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            autoFocus
          />

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.checking}
              </>
            ) : (
              t.button
            )}
          </button>
        </div>

        {/* Footer links */}
        <div className="text-center mt-6 space-y-3">
<button onClick={() => router.push(`/beta-register?lang=${language}`)} className="text-blue-400 text-sm hover:underline transition">
            {language === 'vn' ? 'Chưa có mã? Đăng ký tại đây' : language === 'en' ? 'No code? Register here' : 'Pas de code ? Inscrivez-vous ici'}
          </button>
          <button onClick={() => router.push('/')} className="text-gray-500 text-sm hover:text-gray-300 transition">
            ← {t.backHome}
          </button>
        </div>
      </div>
    </div>
  );
}
