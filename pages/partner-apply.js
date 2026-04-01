import { useState } from 'react';
import { useRouter } from 'next/router';
import { Facebook, CheckCircle, Loader, ArrowRight, Users, Globe, Star, TrendingUp } from 'lucide-react';

export default function PartnerApply() {
  const router = useRouter();
  const [language, setLanguage] = useState('vn');
  const [form, setForm] = useState({
    group_name: '',
    group_url: '',
    member_count: '',
    admin_name: '',
    email: '',
    city: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const t = {
    vn: {
      badge: 'Chương trình Đối tác',
      title: 'Đăng ký làm đối tác K Trix',
      subtitle: 'Miễn phí · Duyệt trong 24h · Tiếp cận hàng nghìn người mua',
      group_name: 'Tên nhóm Facebook *',
      group_name_ph: 'Cộng đồng BĐS Hồ Chí Minh',
      group_url: 'Link nhóm Facebook *',
      group_url_ph: 'https://www.facebook.com/groups/...',
      member_count: 'Số thành viên *',
      member_count_ph: 'Ex: 48000',
      admin_name: 'Tên quản trị viên *',
      admin_name_ph: 'Nguyễn Văn A',
      email: 'Email liên hệ *',
      email_ph: 'admin@email.com',
      city: 'Thành phố',
      city_ph: 'Hồ Chí Minh',
      submit: 'Gửi đơn đăng ký',
      submitting: 'Đang gửi...',
      done_title: '✅ Đơn đã được gửi!',
      done_desc: 'Chúng tôi sẽ xem xét và gửi mã truy cập qua email trong vòng 24 giờ.',
      done_back: 'Về trang chủ',
      error_required: 'Vui lòng điền đầy đủ các trường bắt buộc.',
      error_email: 'Email không hợp lệ.',
      error_url: 'URL nhóm Facebook không hợp lệ.',
      benefit1: 'Tin đăng hiển thị ngoài nhóm FB',
      benefit2: 'Tự động dịch VN / EN / FR',
      benefit3: 'Hoàn toàn miễn phí 1 năm',
      benefit4: 'Bannière quảng bá miễn phí 6 tháng',
    },
    en: {
      badge: 'Partner Program',
      title: 'Apply to become a K Trix partner',
      subtitle: 'Free · Reviewed within 24h · Reach thousands of buyers',
      group_name: 'Facebook group name *',
      group_name_ph: 'Ho Chi Minh Real Estate Community',
      group_url: 'Facebook group URL *',
      group_url_ph: 'https://www.facebook.com/groups/...',
      member_count: 'Number of members *',
      member_count_ph: 'e.g. 48000',
      admin_name: 'Admin name *',
      admin_name_ph: 'John Doe',
      email: 'Contact email *',
      email_ph: 'admin@email.com',
      city: 'City',
      city_ph: 'Ho Chi Minh City',
      submit: 'Submit application',
      submitting: 'Submitting...',
      done_title: '✅ Application sent!',
      done_desc: 'We will review your application and send your access code by email within 24 hours.',
      done_back: 'Back to home',
      error_required: 'Please fill in all required fields.',
      error_email: 'Invalid email address.',
      error_url: 'Invalid Facebook group URL.',
      benefit1: 'Listings visible beyond your FB group',
      benefit2: 'Auto-translated VN / EN / FR',
      benefit3: 'Completely free for 1 year',
      benefit4: 'Free promotional banner for 6 months',
    },
    fr: {
      badge: 'Programme Partenaire',
      title: 'Demande de partenariat K Trix',
      subtitle: 'Gratuit · Validé sous 24h · Atteignez des milliers d\'acheteurs',
      group_name: 'Nom du groupe Facebook *',
      group_name_ph: 'Communauté Immobilière Ho Chi Minh',
      group_url: 'URL du groupe Facebook *',
      group_url_ph: 'https://www.facebook.com/groups/...',
      member_count: 'Nombre de membres *',
      member_count_ph: 'Ex : 48000',
      admin_name: 'Nom de l\'administrateur *',
      admin_name_ph: 'Jean Dupont',
      email: 'Email de contact *',
      email_ph: 'admin@email.com',
      city: 'Ville',
      city_ph: 'Hô Chi Minh-Ville',
      submit: 'Envoyer la demande',
      submitting: 'Envoi en cours...',
      done_title: '✅ Demande envoyée !',
      done_desc: 'Nous examinerons votre demande et vous enverrons votre code d\'accès par email sous 24 heures.',
      done_back: 'Retour à l\'accueil',
      error_required: 'Veuillez remplir tous les champs obligatoires.',
      error_email: 'Adresse email invalide.',
      error_url: 'URL du groupe Facebook invalide.',
      benefit1: 'Annonces visibles au-delà de votre groupe FB',
      benefit2: 'Traduction automatique VN / EN / FR',
      benefit3: 'Entièrement gratuit pendant 1 an',
      benefit4: 'Bannière promotionnelle offerte 6 mois',
    },
  }[language];

  const handleSubmit = async () => {
    setError('');
    if (!form.group_name || !form.group_url || !form.member_count || !form.admin_name || !form.email) {
      setError(t.error_required);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t.error_email);
      return;
    }
    if (!form.group_url.includes('facebook.com/groups/')) {
      setError(t.error_url);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/partner-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, language }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError(data.error || 'Error');
      }
    } catch {
      setError('Network error');
    }
    setSubmitting(false);
  };

  const benefits = [
    { icon: <Users className="w-5 h-5 text-blue-400" />, text: t.benefit1 },
    { icon: <Globe className="w-5 h-5 text-emerald-400" />, text: t.benefit2 },
    { icon: <Star className="w-5 h-5 text-yellow-400" />, text: t.benefit3 },
    { icon: <TrendingUp className="w-5 h-5 text-orange-400" />, text: t.benefit4 },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/Ktrixlogo.png" alt="K Trix" className="w-12 h-12 object-contain" />
            <span className="text-white font-bold text-lg">K Trix</span>
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

      <main className="max-w-5xl mx-auto px-4 py-12">
        {done ? (
          <div className="max-w-lg mx-auto text-center py-20">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-bold text-white mb-3">{t.done_title}</h1>
            <p className="text-gray-400 mb-8">{t.done_desc}</p>
            <button onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition">
              {t.done_back}
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left — benefits */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium mb-6">
                <Facebook className="w-4 h-4" />{t.badge}
              </span>
              <h1 className="text-3xl font-bold text-white mb-3 leading-tight">{t.title}</h1>
              <p className="text-gray-400 mb-8">{t.subtitle}</p>
              <div className="space-y-4">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">{b.icon}</div>
                    <span className="text-gray-300 text-sm">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
              <div className="space-y-4">
                {/* Group name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">{t.group_name}</label>
                  <input type="text" value={form.group_name} onChange={e => setForm({...form, group_name: e.target.value})}
                    placeholder={t.group_name_ph}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition placeholder-gray-600 text-sm" />
                </div>

                {/* Group URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">{t.group_url}</label>
                  <input type="url" value={form.group_url} onChange={e => setForm({...form, group_url: e.target.value})}
                    placeholder={t.group_url_ph}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition placeholder-gray-600 text-sm" />
                </div>

                {/* Member count + City */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">{t.member_count}</label>
                    <input type="number" value={form.member_count} onChange={e => setForm({...form, member_count: e.target.value})}
                      placeholder={t.member_count_ph}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition placeholder-gray-600 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1.5">{t.city}</label>
                    <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                      placeholder={t.city_ph}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition placeholder-gray-600 text-sm" />
                  </div>
                </div>

                {/* Admin name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">{t.admin_name}</label>
                  <input type="text" value={form.admin_name} onChange={e => setForm({...form, admin_name: e.target.value})}
                    placeholder={t.admin_name_ph}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition placeholder-gray-600 text-sm" />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">{t.email}</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder={t.email_ph}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition placeholder-gray-600 text-sm" />
                </div>

                {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}

                <button onClick={handleSubmit} disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 transition shadow-lg shadow-blue-500/20">
                  {submitting
                    ? <><Loader className="w-5 h-5 animate-spin" />{t.submitting}</>
                    : <>{t.submit}<ArrowRight className="w-5 h-5" /></>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 mt-12 py-8 text-center">
        <p className="text-gray-600 text-sm">© 2026 K Trix — <a href="/" className="hover:text-gray-400 transition">ktrix.ai</a></p>
      </footer>
    </div>
  );
}
