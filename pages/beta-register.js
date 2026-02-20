import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserPlus, ArrowLeft, CheckCircle, AlertCircle, Loader2, Copy, Check } from 'lucide-react';

export default function BetaRegisterPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignedCode, setAssignedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    last_name: '',
    first_name: '',
    email: '',
    age: '',
    sector: 'immobilier',
    device: 'desktop',
  });

  useEffect(() => {
    if (router.query.lang && ['vn', 'en', 'fr'].includes(router.query.lang)) {
      setLanguage(router.query.lang);
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ktrix_language');
      if (saved && ['vn', 'en', 'fr'].includes(saved)) setLanguage(saved);
    }
  }, [router.query.lang]);

  const t = {
    vn: {
      title: 'Đăng ký Beta Tester',
      subtitle: 'Điền thông tin để nhận mã truy cập Beta K Trix',
      lastName: 'Họ',
      firstName: 'Tên',
      email: 'Email',
      age: 'Tuổi',
      sector: 'Lĩnh vực hoạt động',
      sectorRE: 'Bất động sản',
      sectorOther: 'Khác',
      device: 'Thiết bị sử dụng',
      desktop: 'Máy tính',
      mobile: 'Điện thoại',
      both: 'Cả hai',
      submit: 'Đăng ký',
      submitting: 'Đang xử lý...',
      required: 'bắt buộc',
      successTitle: 'Đăng ký thành công!',
      successDesc: 'Đây là mã truy cập Beta của bạn:',
      successNote: 'Hãy lưu mã này cẩn thận. Bạn sẽ cần nhập mã để truy cập K Trix.',
      goToApp: 'Truy cập K Trix',
      alreadyRegistered: 'Email đã đăng ký. Đây là mã của bạn:',
      betaFull: 'Beta đã đầy. Vui lòng liên hệ contact@ktrix.ai',
      errorGeneric: 'Đã xảy ra lỗi. Vui lòng thử lại.',
      backToBeta: 'Đã có mã? Đăng nhập',
      copyCode: 'Sao chép mã',
      copiedCode: 'Đã sao chép!',
    },
    en: {
      title: 'Beta Tester Registration',
      subtitle: 'Fill in your details to receive your K Trix Beta access code',
      lastName: 'Last Name',
      firstName: 'First Name',
      email: 'Email',
      age: 'Age',
      sector: 'Activity Sector',
      sectorRE: 'Real Estate',
      sectorOther: 'Other',
      device: 'Device',
      desktop: 'Desktop',
      mobile: 'Mobile',
      both: 'Both',
      submit: 'Register',
      submitting: 'Processing...',
      required: 'required',
      successTitle: 'Registration successful!',
      successDesc: 'Here is your Beta access code:',
      successNote: 'Please save this code carefully. You will need it to access K Trix.',
      goToApp: 'Access K Trix',
      alreadyRegistered: 'Email already registered. Here is your code:',
      betaFull: 'Beta is full. Please contact contact@ktrix.ai',
      errorGeneric: 'An error occurred. Please try again.',
      backToBeta: 'Already have a code? Login',
      copyCode: 'Copy code',
      copiedCode: 'Copied!',
    },
    fr: {
      title: 'Inscription Beta Testeur',
      subtitle: 'Remplissez vos informations pour recevoir votre code d\'accès Beta K Trix',
      lastName: 'Nom',
      firstName: 'Prénom',
      email: 'Email',
      age: 'Âge',
      sector: 'Secteur d\'activité',
      sectorRE: 'Immobilier',
      sectorOther: 'Autre',
      device: 'Appareil',
      desktop: 'Ordinateur',
      mobile: 'Mobile',
      both: 'Les deux',
      submit: 'S\'inscrire',
      submitting: 'En cours...',
      required: 'obligatoire',
      successTitle: 'Inscription réussie !',
      successDesc: 'Voici votre code d\'accès Beta :',
      successNote: 'Conservez ce code précieusement. Vous en aurez besoin pour accéder à K Trix.',
      goToApp: 'Accéder à K Trix',
      alreadyRegistered: 'Email déjà inscrit. Voici votre code :',
      betaFull: 'La Beta est complète. Contactez contact@ktrix.ai',
      errorGeneric: 'Une erreur est survenue. Veuillez réessayer.',
      backToBeta: 'Déjà un code ? Connexion',
      copyCode: 'Copier le code',
      copiedCode: 'Copié !',
    }
  }[language];

  const handleSubmit = async () => {
    setError('');
    if (!form.last_name.trim()) { setError(`${t.lastName} — ${t.required}`); return; }
    if (!form.email.trim()) { setError(`${t.email} — ${t.required}`); return; }
    if (!form.sector) { setError(`${t.sector} — ${t.required}`); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/beta-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success && data.code) {
        setAssignedCode(data.code);
        if (data.message === 'already_registered') {
          setError(t.alreadyRegistered);
        }
      } else if (data.error?.includes('full') || data.error?.includes('No codes')) {
        setError(t.betaFull);
      } else {
        setError(data.error || t.errorGeneric);
      }
    } catch (err) {
      setError(t.errorGeneric);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(assignedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToApp = () => {
    localStorage.setItem('ktrix_beta_code', assignedCode);
    router.push(`/search?lang=${language}`);
  };

  // Success screen
  if (assignedCode) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t.successTitle}</h1>
          <p className="text-gray-400 mb-6">{t.successDesc}</p>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
            <p className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-widest mb-4">
              {assignedCode}
            </p>
            <button onClick={handleCopy} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? t.copiedCode : t.copyCode}
            </button>
          </div>

          <p className="text-gray-500 text-sm mb-6">{t.successNote}</p>

          <button onClick={handleGoToApp} className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-lg hover:opacity-90 transition">
            {t.goToApp} →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <UserPlus className="w-8 h-8 text-white" />
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

        {/* Form */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t.lastName} <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm({...form, last_name: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.firstName}</label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm({...form, first_name: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t.email} <span className="text-orange-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.age}</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({...form, age: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
              min="18" max="99"
            />
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t.sector} <span className="text-orange-400">*</span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setForm({...form, sector: 'immobilier'})}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm border transition ${form.sector === 'immobilier' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'}`}
              >
                🏠 {t.sectorRE}
              </button>
              <button
                onClick={() => setForm({...form, sector: 'autre'})}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm border transition ${form.sector === 'autre' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'}`}
              >
                💼 {t.sectorOther}
              </button>
            </div>
          </div>

          {/* Device */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.device}</label>
            <div className="flex gap-3">
              {[
                { value: 'desktop', label: `🖥 ${t.desktop}` },
                { value: 'mobile', label: `📱 ${t.mobile}` },
                { value: 'both', label: `🔄 ${t.both}` },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm({...form, device: opt.value})}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm border transition ${form.device === opt.value ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t.submitting}</>
            ) : (
              t.submit
            )}
          </button>
        </div>

        {/* Back to beta login */}
        <div className="text-center mt-6">
          <button onClick={() => router.push(`/beta?lang=${language}`)} className="text-gray-500 text-sm hover:text-gray-300 transition">
            ← {t.backToBeta}
          </button>
        </div>
      </div>
    </div>
  );
}
