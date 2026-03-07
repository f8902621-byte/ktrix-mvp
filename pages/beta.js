import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const T = {
  en: {
    pageTitle: 'Beta Program — K Trix',
    badge: 'Private Beta · Limited to 20 professionals',
    title: 'Apply for Free Access',
    subtitle: 'Priority given to candidates with the most proof of professional real estate activity.',
    s1: 'Personal Information',
    firstName: 'First Name *', lastName: 'Last Name', age: 'Age *', city: 'City *', email: 'Email Address',
    s2: 'Professional Activity',
    sectorLabel: 'Sector *',
    re: 'Real Estate', other: 'Other',
    typeLabel: 'Type *', agency: 'Agency', indep: 'Independent Agent',
    expLabel: 'Years of Experience *',
    proofLabel: 'Proof of Activity * (check all that apply)',
    w: 'Website', li: 'LinkedIn', fb: 'Facebook', ig: 'Instagram', op: 'Other',
    linksLabel: 'Link(s)', linksPlaceholder: 'https://...',
    otherSpec: 'Specify your activity',
    cgu: 'I confirm I have read the Terms & Conditions and I accept them. *',
    cguLink: 'Read T&C',
    submit: 'Submit My Application',
    submitting: 'Sending...',
    req: '* Required field',
    successTitle: '🎉 Application Received!',
    successMsg: 'Thank you! We will review your application and send your access code within 48 hours at the email provided.',
    errorMsg: 'An error occurred. Please try again.',
    fullMsg: 'The beta program is full. Thank you for your interest.',
    alreadyMsg: 'This email is already registered.',
    backHome: '← Back to home',
    note: 'Priority will be given to candidates presenting the most proof of professional activity in the real estate sector.',
  },
  fr: {
    pageTitle: 'Programme Beta — K Trix',
    badge: 'Beta Privée · Limitée à 20 professionnels',
    title: 'Candidatez pour un Accès Gratuit',
    subtitle: "Priorité aux candidats présentant le plus de preuves d'activité professionnelle dans l'immobilier.",
    s1: 'Informations Personnelles',
    firstName: 'Prénom *', lastName: 'Nom', age: 'Âge *', city: 'Ville *', email: 'Adresse email',
    s2: 'Activité Professionnelle',
    sectorLabel: 'Secteur *',
    re: 'Immobilier', other: 'Autre',
    typeLabel: 'Type *', agency: 'Agence', indep: 'Agent indépendant',
    expLabel: "Années d'expérience *",
    proofLabel: "Preuves d'activité * (cocher tout ce qui s'applique)",
    w: 'Site web', li: 'LinkedIn', fb: 'Facebook', ig: 'Instagram', op: 'Autre',
    linksLabel: 'Lien(s)', linksPlaceholder: 'https://...',
    otherSpec: 'Précisez votre activité',
    cgu: 'Je confirme avoir lu les CGU et je les accepte. *',
    cguLink: 'Lire les CGU',
    submit: 'Envoyer ma Candidature',
    submitting: 'Envoi en cours...',
    req: '* Champ obligatoire',
    successTitle: '🎉 Candidature reçue !',
    successMsg: "Merci ! Nous examinerons votre candidature et vous enverrons votre code d'accès sous 48h à l'adresse indiquée.",
    errorMsg: 'Une erreur est survenue. Veuillez réessayer.',
    fullMsg: 'Le programme beta est complet. Merci pour votre intérêt.',
    alreadyMsg: 'Cet email est déjà enregistré.',
    backHome: "← Retour à l'accueil",
    note: "Seront retenus en priorité les candidats présentant le plus de preuves d'activité professionnelle dans le secteur immobilier.",
  },
  vi: {
    pageTitle: 'Chương trình Beta — K Trix',
    badge: 'Beta Riêng Tư · Giới hạn 20 chuyên gia',
    title: 'Đăng Ký Truy Cập Miễn Phí',
    subtitle: 'Ưu tiên cho các ứng viên có nhiều bằng chứng hoạt động chuyên nghiệp nhất trong lĩnh vực bất động sản.',
    s1: 'Thông Tin Cá Nhân',
    firstName: 'Tên *', lastName: 'Họ', age: 'Tuổi *', city: 'Thành phố *', email: 'Địa chỉ email',
    s2: 'Hoạt Động Nghề Nghiệp',
    sectorLabel: 'Lĩnh vực *',
    re: 'Bất động sản', other: 'Khác',
    typeLabel: 'Loại *', agency: 'Công ty môi giới', indep: 'Môi giới độc lập',
    expLabel: 'Số năm kinh nghiệm *',
    proofLabel: 'Bằng chứng hoạt động * (chọn tất cả những gì phù hợp)',
    w: 'Website', li: 'LinkedIn', fb: 'Facebook', ig: 'Instagram', op: 'Khác',
    linksLabel: 'Liên kết', linksPlaceholder: 'https://...',
    otherSpec: 'Ghi rõ hoạt động của bạn',
    cgu: 'Tôi xác nhận đã đọc Điều Khoản Sử Dụng và tôi chấp nhận. *',
    cguLink: 'Đọc Điều Khoản',
    submit: 'Gửi Đơn Đăng Ký',
    submitting: 'Đang gửi...',
    req: '* Trường bắt buộc',
    successTitle: '🎉 Đơn đăng ký đã nhận!',
    successMsg: 'Cảm ơn bạn! Chúng tôi sẽ xem xét đơn đăng ký và gửi mã truy cập trong vòng 48 giờ.',
    errorMsg: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    fullMsg: 'Chương trình beta đã đầy. Cảm ơn sự quan tâm của bạn.',
    alreadyMsg: 'Email này đã được đăng ký.',
    backHome: '← Về trang chủ',
    note: 'Ưu tiên sẽ được trao cho các ứng viên có nhiều bằng chứng hoạt động chuyên nghiệp nhất trong lĩnh vực bất động sản.',
  },
};

export default function BetaPage() {
  const [lang, setLang] = useState('en');
  const t = T[lang];

  const [form, setForm] = useState({
    first_name: '', last_name: '', age: '', city: '', email: '',
    sector: 'real_estate', agency_type: 'agency', experience: '',
    proof_website: false, proof_linkedin: false, proof_facebook: false,
    proof_instagram: false, proof_other: false,
    links: '', other_activity: '', cgu: false,
  });

  const [status, setStatus] = useState('idle');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.first_name || !form.age || !form.city) {
      alert(lang === 'fr' ? 'Veuillez remplir les champs obligatoires' : lang === 'vi' ? 'Vui lòng điền các trường bắt buộc' : 'Please fill required fields');
      return;
    }
    if (form.sector === 'real_estate' && !form.experience) {
      alert(lang === 'fr' ? 'Veuillez remplir les champs obligatoires' : lang === 'vi' ? 'Vui lòng điền các trường bắt buộc' : 'Please fill required fields');
      return;
    }
    if (!form.cgu) {
      alert(lang === 'fr' ? 'Vous devez accepter les CGU' : lang === 'vi' ? 'Bạn phải chấp nhận điều khoản' : 'You must accept the T&C');
      return;
    }
    setStatus('submitting');
    try {
      const res = await fetch('/api/beta-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          age: parseInt(form.age) || null,
          city: form.city,
          sector: form.sector,
          agency_type: form.sector === 'real_estate' ? form.agency_type : null,
          experience: form.sector === 'real_estate' ? parseInt(form.experience) || null : null,
          proof_website: form.proof_website,
          proof_linkedin: form.proof_linkedin,
          proof_facebook: form.proof_facebook,
          proof_instagram: form.proof_instagram,
          proof_other: form.proof_other,
          links: form.links,
          other_activity: form.sector === 'other' ? form.other_activity : null,
          cgu_accepted: form.cgu,
          lang: lang,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.message === 'already_registered' ? 'already' : 'success');
      } else if (data.error && data.error.toLowerCase().includes('full')) {
        setStatus('full');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inp = "w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white placeholder-[#4a5568] focus:outline-none focus:border-[#C9A84C] transition-colors text-sm";
  const lbl = "block text-[#8b949e] text-xs font-medium mb-1.5 uppercase tracking-wide";
  const sec = "text-[#C9A84C] font-bold text-sm uppercase tracking-widest mb-4 mt-8 flex items-center gap-2";

  return (
    <>
      <Head>
        <title>{t.pageTitle}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="min-h-screen bg-[#0d1117] text-white">
        {/* Navbar */}
        <div className="border-b border-[#21262d] bg-[#0d1117]/90 backdrop-blur sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-white text-xl tracking-tight">K Trix</span>
              <span className="text-xs border border-[#3fb950] text-[#3fb950] px-2 py-0.5 rounded">BETA</span>
            </Link>
            <div className="flex gap-1">
              {['en','fr','vi'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${lang===l ? 'bg-[#C9A84C] text-black' : 'text-[#8b949e] hover:text-white'}`}>
                  {l === 'vi' ? 'VN' : l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-full px-4 py-2 text-xs text-[#C9A84C] font-medium mb-6">
              <span className="w-2 h-2 bg-[#3fb950] rounded-full animate-pulse inline-block"></span>
              {t.badge}
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">{t.title}</h1>
            <p className="text-[#8b949e] text-sm leading-relaxed max-w-lg mx-auto">{t.subtitle}</p>
          </div>

          {/* Success / Full / Already states */}
          {['success','already','full'].includes(status) ? (
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-10 text-center">
              <div className="text-5xl mb-5">{status === 'full' ? '😔' : '✅'}</div>
              <h2 className="text-xl font-bold text-white mb-3">
                {status === 'success' ? t.successTitle : status === 'already' ? t.alreadyMsg : t.fullMsg}
              </h2>
              {status === 'success' && <p className="text-[#8b949e] text-sm leading-relaxed max-w-sm mx-auto">{t.successMsg}</p>}
              <Link href="/" className="inline-block mt-8 text-[#C9A84C] text-sm hover:underline">{t.backHome}</Link>
            </div>
          ) : (
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 md:p-8">

              {/* ── SECTION 1 ── */}
              <div className={sec}>
                <span className="w-6 h-6 bg-[#C9A84C] text-black rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
                {t.s1}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{t.firstName}</label>
                  <input className={inp} value={form.first_name} onChange={e => set('first_name', e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>{t.lastName}</label>
                  <input className={inp} value={form.last_name} onChange={e => set('last_name', e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>{t.age}</label>
                  <input type="number" className={inp} value={form.age} onChange={e => set('age', e.target.value)} min="18" max="99" />
                </div>
                <div>
                  <label className={lbl}>{t.city}</label>
                  <input className={inp} value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
              </div>
              <div className="mt-4">
                <label className={lbl}>{t.email}</label>
                <input type="email" className={inp} value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
              </div>

              {/* ── SECTION 2 ── */}
              <div className={sec}>
                <span className="w-6 h-6 bg-[#C9A84C] text-black rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
                {t.s2}
              </div>

              <div className="mb-4">
                <label className={lbl}>{t.sectorLabel}</label>
                <div className="flex gap-2">
                  {['real_estate','other'].map(s => (
                    <button key={s} onClick={() => set('sector', s)}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${form.sector===s ? 'bg-[#C9A84C] text-black border-[#C9A84C]' : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#C9A84C]'}`}>
                      {s === 'real_estate' ? t.re : t.other}
                    </button>
                  ))}
                </div>
              </div>

              {form.sector === 'real_estate' && (
                <>
                  <div className="mb-4">
                    <label className={lbl}>{t.typeLabel}</label>
                    <div className="flex gap-2">
                      {['agency','independent'].map(tp => (
                        <button key={tp} onClick={() => set('agency_type', tp)}
                          className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${form.agency_type===tp ? 'bg-[#21262d] text-white border-[#C9A84C]' : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#C9A84C]'}`}>
                          {tp === 'agency' ? t.agency : t.indep}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className={lbl}>{t.expLabel}</label>
                    <input type="number" className={inp} value={form.experience} onChange={e => set('experience', e.target.value)} min="0" max="50" placeholder="5" />
                  </div>
                  <div className="mb-4">
                    <label className={lbl}>{t.proofLabel}</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[['proof_website',t.w,'🌐'],['proof_linkedin',t.li,'💼'],['proof_facebook',t.fb,'📘'],['proof_instagram',t.ig,'📸'],['proof_other',t.op,'📎']].map(([k,label,icon]) => (
                        <button key={k} onClick={() => set(k, !form[k])}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors text-left ${form[k] ? 'bg-[#1a2332] border-[#C9A84C] text-white' : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#C9A84C]'}`}>
                          <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs flex-shrink-0 ${form[k] ? 'bg-[#C9A84C] border-[#C9A84C] text-black font-bold' : 'border-[#4a5568]'}`}>
                            {form[k] ? '✓' : ''}
                          </span>
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className={lbl}>{t.linksLabel}</label>
                    <textarea className={`${inp} resize-none`} rows={2} value={form.links} onChange={e => set('links', e.target.value)} placeholder={t.linksPlaceholder} />
                  </div>
                </>
              )}

              {form.sector === 'other' && (
                <div className="mb-4">
                  <label className={lbl}>{t.otherSpec}</label>
                  <input className={inp} value={form.other_activity} onChange={e => set('other_activity', e.target.value)} />
                </div>
              )}

              {/* Warning note */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 mt-4 mb-6 text-xs text-[#C9A84C] leading-relaxed">
                ⚠️ {t.note}
              </div>

              {/* CGU */}
              <button onClick={() => set('cgu', !form.cgu)}
                className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-colors mb-6 ${form.cgu ? 'bg-[#1a2332] border-[#C9A84C]' : 'bg-[#0d1117] border-[#30363d] hover:border-[#C9A84C]'}`}>
                <span className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center text-xs ${form.cgu ? 'bg-[#C9A84C] border-[#C9A84C] text-black font-bold' : 'border-[#4a5568]'}`}>
                  {form.cgu ? '✓' : ''}
                </span>
                <span className="text-sm text-[#8b949e]">
                  {t.cgu}{' '}
                  <Link href="/cgu" target="_blank" onClick={e => e.stopPropagation()} className="text-[#C9A84C] underline">{t.cguLink}</Link>
                </span>
              </button>

              <p className="text-[#4a5568] text-xs mb-5">{t.req}</p>

              {status === 'error' && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm mb-4">{t.errorMsg}</div>
              )}

              <button onClick={handleSubmit} disabled={status === 'submitting'}
                className="w-full py-4 bg-[#C9A84C] hover:bg-[#E8C96E] active:scale-[0.99] text-black font-bold rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {status === 'submitting' ? t.submitting : t.submit}
              </button>
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/" className="text-[#4a5568] text-xs hover:text-[#8b949e] transition-colors">{t.backHome}</Link>
          </div>
        </div>
      </div>
    </>
  );
}
