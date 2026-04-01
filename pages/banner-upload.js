import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Upload, CheckCircle, Loader, X, Monitor, Smartphone } from 'lucide-react';

function UploadZone({ preview, label, hint, warning, onSelect, onRemove }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
      {preview ? (
        <div className="relative">
          <img src={preview} alt="preview"
            className="w-full rounded-lg border border-gray-700 object-contain bg-gray-900"
            style={{ maxHeight: 120 }} />
          <button type="button" onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition">
            <X className="w-3 h-3" />
          </button>
          <label className="absolute bottom-2 right-2 px-2 py-1 bg-gray-900/80 text-gray-300 text-xs rounded cursor-pointer hover:bg-gray-800 transition">
            Changer
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => onSelect(e.target.files[0])} />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition">
          <Upload className="w-6 h-6 text-gray-600 mb-2" />
          <span className="text-gray-500 text-sm font-medium">Cliquer pour uploader</span>
          <span className="text-gray-600 text-xs mt-0.5">{hint}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={e => onSelect(e.target.files[0])} />
        </label>
      )}
      <p className="text-amber-500/70 text-xs mt-1">{warning}</p>
    </div>
  );
}

function BannerUploadPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('vn');
  const [code, setCode] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const t = {
    vn: {
      title: 'Upload bannière quảng cáo',
      subtitle: 'Nhập mã đối tác để tải lên bannière của bạn',
      code_label: 'Mã đối tác *', code_ph: 'KTRIX-FB-XXXX',
      verify: 'Xác minh', verifying: 'Đang xác minh...',
      code_error: 'Mã không hợp lệ hoặc đã hết hạn.', code_success: 'Mã hợp lệ!',
      desktop_label: 'Bannière Desktop (728×90 px) *',
      mobile_label: 'Bannière Mobile (320×100 px) *',
      upload_hint: 'JPG, PNG, WebP — tối đa 5MB',
      size_d: '⚠️ Khuyến nghị: 728×90 px', size_m: '⚠️ Khuyến nghị: 320×100 px',
      submit: 'Tải lên bannière', uploading: 'Đang tải lên...',
      done_title: '✅ Bannière đã được tải lên!',
      done_desc: 'Bannière của bạn sẽ xuất hiện trên K Trix trong vài phút.',
      done_back: 'Về trang chủ',
    },
    en: {
      title: 'Upload your ad banner',
      subtitle: 'Enter your partner code to upload your banners',
      code_label: 'Partner code *', code_ph: 'KTRIX-FB-XXXX',
      verify: 'Verify', verifying: 'Verifying...',
      code_error: 'Invalid or expired partner code.', code_success: 'Valid code!',
      desktop_label: 'Desktop banner (728×90 px) *',
      mobile_label: 'Mobile banner (320×100 px) *',
      upload_hint: 'JPG, PNG, WebP — max 5MB',
      size_d: '⚠️ Recommended: 728×90 px', size_m: '⚠️ Recommended: 320×100 px',
      submit: 'Upload banners', uploading: 'Uploading...',
      done_title: '✅ Banners uploaded!',
      done_desc: 'Your banners will appear on K Trix within a few minutes.',
      done_back: 'Back to home',
    },
    fr: {
      title: 'Uploader votre bannière publicitaire',
      subtitle: 'Entrez votre code partenaire pour uploader vos bannières',
      code_label: 'Code partenaire *', code_ph: 'KTRIX-FB-XXXX',
      verify: 'Vérifier', verifying: 'Vérification...',
      code_error: 'Code partenaire invalide ou expiré.', code_success: 'Code valide !',
      desktop_label: 'Bannière Desktop (728×90 px) *',
      mobile_label: 'Bannière Mobile (320×100 px) *',
      upload_hint: 'JPG, PNG, WebP — max 5MB',
      size_d: '⚠️ Recommandé : 728×90 px', size_m: '⚠️ Recommandé : 320×100 px',
      submit: 'Uploader les bannières', uploading: 'Upload en cours...',
      done_title: '✅ Bannières uploadées !',
      done_desc: 'Vos bannières apparaîtront sur K Trix dans quelques minutes.',
      done_back: "Retour à l'accueil",
    },
  }[language];

  const verifyCode = async () => {
    if (!code.trim()) return;
    setVerifying(true); setCodeError('');
    try {
      const res = await fetch('/api/verify-beta', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.valid && data.isPartner) { setCodeValid(true); }
      else { setCodeError(t.code_error); }
    } catch { setCodeError(t.code_error); }
    setVerifying(false);
  };

  const handleFileSelect = (file, type) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image too large (max 5MB)'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'desktop') { setDesktopFile(file); setDesktopPreview(e.target.result); }
      else { setMobileFile(file); setMobilePreview(e.target.result); }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!desktopFile || !mobileFile) { setError('Please upload both images.'); return; }
    setUploading(true); setError('');
    try {
      const res = await fetch('/api/banner-upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beta_code: code.toUpperCase(),
          image_desktop_base64: desktopPreview,
          image_mobile_base64: mobilePreview,
          image_desktop_type: desktopFile.type,
          image_mobile_type: mobileFile.type,
        }),
      });
      const data = await res.json();
      if (data.success) { setDone(true); }
      else {
        const errMap = { invalid_code: t.code_error, expired_code: 'Partner code expired.' };
        setError(errMap[data.error] || 'Upload failed.');
      }
    } catch { setError('Network error.'); }
    setUploading(false);
  };

  if (!mounted) return null;

  const expiryDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/Ktrixlogo.png" alt="K Trix" className="w-10 h-10 object-contain" />
            <span className="text-white font-bold">K Trix</span>
          </div>
          <div className="flex items-center gap-1">
            {['vn', 'en', 'fr'].map(lang => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${language === lang ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {done ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-bold text-white mb-3">{t.done_title}</h1>
            <p className="text-gray-400 mb-8">{t.done_desc}</p>
            <button onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition">
              {t.done_back}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{t.title}</h1>
              <p className="text-gray-400">{t.subtitle}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">{t.code_label}</label>
              <div className="flex gap-3">
                <input type="text" value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError(''); setCodeValid(false); }}
                  onKeyDown={e => e.key === 'Enter' && verifyCode()}
                  placeholder={t.code_ph} disabled={codeValid}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono tracking-wider focus:border-blue-500 focus:outline-none transition placeholder-gray-600 disabled:opacity-60" />
                {!codeValid && (
                  <button type="button" onClick={verifyCode} disabled={verifying || !code.trim()}
                    className="px-5 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 transition flex items-center gap-2">
                    {verifying ? <Loader className="w-4 h-4 animate-spin" /> : t.verify}
                  </button>
                )}
              </div>
              {codeError && <p className="mt-2 text-red-400 text-sm">⚠️ {codeError}</p>}
              {codeValid && (
                <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" /> {t.code_success}
                </div>
              )}
            </div>

            {codeValid && (
              <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Monitor className="w-4 h-4 text-blue-400" />
                    <span>Desktop : <strong className="text-gray-300">728×90 px</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>Mobile : <strong className="text-gray-300">320×100 px</strong></span>
                  </div>
                </div>

                <UploadZone
                  preview={desktopPreview}
                  label={t.desktop_label}
                  hint={t.upload_hint}
                  warning={t.size_d}
                  onSelect={file => handleFileSelect(file, 'desktop')}
                  onRemove={() => { setDesktopFile(null); setDesktopPreview(null); }}
                />

                <UploadZone
                  preview={mobilePreview}
                  label={t.mobile_label}
                  hint={t.upload_hint}
                  warning={t.size_m}
                  onSelect={file => handleFileSelect(file, 'mobile')}
                  onRemove={() => { setMobileFile(null); setMobilePreview(null); }}
                />

                {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}

                <button type="button" onClick={handleSubmit}
                  disabled={uploading || !desktopFile || !mobileFile}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 transition shadow-lg shadow-blue-500/20">
                  {uploading ? <><Loader className="w-5 h-5 animate-spin" />{t.uploading}</> : t.submit}
                </button>

                <p className="text-center text-xs text-gray-600">
                  Bannière active 6 mois · Expire le {expiryDate}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 mt-12 py-8 text-center">
        <p className="text-gray-600 text-sm">© 2026 K Trix — <a href="/" className="hover:text-gray-400 transition">ktrix.ai</a></p>
      </footer>
    </div>
  );
}

export default BannerUploadPage;
