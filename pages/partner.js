import { useState } from 'react';
import { useRouter } from 'next/router';
import { Facebook, Globe, Users, TrendingUp, Languages, ArrowRight, CheckCircle, Star, ExternalLink } from 'lucide-react';

export default function PartnerPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('vn');
  const [step, setStep] = useState(1); // 1 = accueil, 2 = formulaire, 3 = confirmation
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const [fbData, setFbData] = useState({
    listingUrl: '',
    groupUrl: '',
    groupName: '',
    contactPhone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const t = {
    vn: {
      hero_badge: 'Chương trình Đối tác',
      hero_title: 'Mở rộng tầm với của nhóm bạn',
      hero_subtitle: 'K Trix giúp tin đăng của nhóm bạn tiếp cận hàng nghìn người mua trên toàn Việt Nam — và quốc tế.',
      benefit1_title: 'Khán giả rộng hơn',
      benefit1_desc: 'Tin đăng của bạn hiển thị cho người dùng K Trix ngoài nhóm Facebook của bạn.',
      benefit2_title: '3 ngôn ngữ (sắp có 5)',
      benefit2_desc: 'Tự động dịch sang Tiếng Việt, Tiếng Anh và Tiếng Pháp. Tiếng Trung và Tiếng Hàn sắp ra mắt.',
      benefit3_title: 'Giữ toàn quyền sở hữu',
      benefit3_desc: 'K Trix luôn chuyển hướng người dùng về nhóm Facebook của bạn. Thành viên và lưu lượng truy cập vẫn là của bạn.',
      benefit4_title: 'Miễn phí',
      benefit4_desc: 'Hoàn toàn miễn phí trong giai đoạn ra mắt. Không có chi phí ẩn.',
      cta: 'Bắt đầu ngay',
      step2_title: 'Nhập mã đối tác của bạn',
      step2_desc: 'Bạn đã nhận được mã đối tác riêng từ K Trix. Nhập mã đó ở đây.',
      code_placeholder: 'KTRIX-FB-XXXX',
      code_verify: 'Xác minh',
      code_verifying: 'Đang xác minh...',
      code_error: 'Mã không hợp lệ. Vui lòng kiểm tra lại.',
      code_success: 'Mã hợp lệ! Chào mừng bạn đến với K Trix.',
      form_title: 'Đăng tin đăng đầu tiên của bạn',
      form_desc: 'Chỉ cần dán link bài đăng Facebook — K Trix sẽ tự động xử lý.',
      listing_url: 'Link bài đăng Facebook *',
      listing_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      group_url: 'Link nhóm Facebook của bạn *',
      group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Nhóm của bạn sẽ được hiển thị trên K Trix — quảng bá miễn phí!',
      group_name: 'Tên nhóm (tùy chọn)',
      group_name_placeholder: 'Cộng đồng BĐS Hồ Chí Minh',
      contact: 'Số điện thoại / Zalo',
      contact_placeholder: '0901 234 567',
      submit: 'Đăng lên K Trix',
      submitting: 'Đang đăng...',
      success_title: '✅ Tin đăng đã được gửi!',
      success_desc: 'Tin đăng của bạn sẽ sớm xuất hiện trên K Trix với badge nhóm của bạn.',
      success_more: 'Đăng thêm tin',
      no_code: 'Bạn chưa có mã đối tác?',
      no_code_link: 'Liên hệ với chúng tôi',
      badge_preview: 'Nhóm của bạn sẽ xuất hiện như thế này:',
    },
    en: {
      hero_badge: 'Partner Program',
      hero_title: 'Expand your group\'s reach',
      hero_subtitle: 'K Trix helps your group\'s listings reach thousands of buyers across Vietnam — and internationally.',
      benefit1_title: 'Wider audience',
      benefit1_desc: 'Your listings appear to K Trix users beyond your Facebook group.',
      benefit2_title: '3 languages (5 coming soon)',
      benefit2_desc: 'Automatically translated into Vietnamese, English and French. Chinese and Korean coming soon.',
      benefit3_title: 'Keep full ownership',
      benefit3_desc: 'K Trix always redirects users back to your Facebook group. Your members and traffic stay yours.',
      benefit4_title: 'Free',
      benefit4_desc: 'Completely free during the launch period. No hidden fees.',
      cta: 'Get started',
      step2_title: 'Enter your partner code',
      step2_desc: 'You received a unique partner code from K Trix. Enter it here.',
      code_placeholder: 'KTRIX-FB-XXXX',
      code_verify: 'Verify',
      code_verifying: 'Verifying...',
      code_error: 'Invalid code. Please check and try again.',
      code_success: 'Valid code! Welcome to K Trix.',
      form_title: 'Post your first listing',
      form_desc: 'Just paste your Facebook post link — K Trix handles the rest.',
      listing_url: 'Facebook post URL *',
      listing_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      group_url: 'Your Facebook group URL *',
      group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Your group will be displayed on K Trix — free promotion!',
      group_name: 'Group name (optional)',
      group_name_placeholder: 'Ho Chi Minh Real Estate Community',
      contact: 'Phone / Zalo',
      contact_placeholder: '0901 234 567',
      submit: 'Post on K Trix',
      submitting: 'Posting...',
      success_title: '✅ Listing submitted!',
      success_desc: 'Your listing will appear on K Trix soon with your group badge.',
      success_more: 'Post another listing',
      no_code: 'Don\'t have a partner code yet?',
      no_code_link: 'Contact us',
      badge_preview: 'Your group will appear like this:',
    },
    fr: {
      hero_badge: 'Programme Partenaire',
      hero_title: 'Élargissez la portée de votre groupe',
      hero_subtitle: 'K Trix aide vos annonces à toucher des milliers d\'acheteurs à travers le Vietnam — et à l\'international.',
      benefit1_title: 'Audience élargie',
      benefit1_desc: 'Vos annonces sont visibles aux utilisateurs K Trix au-delà de votre groupe Facebook.',
      benefit2_title: '3 langues (5 bientôt)',
      benefit2_desc: 'Traduction automatique en vietnamien, anglais et français. Chinois et coréen bientôt disponibles.',
      benefit3_title: 'Paternité conservée',
      benefit3_desc: 'K Trix redirige toujours les utilisateurs vers votre groupe. Vos membres et votre trafic restent les vôtres.',
      benefit4_title: 'Gratuit',
      benefit4_desc: 'Entièrement gratuit pendant la période de lancement. Aucun frais caché.',
      cta: 'Commencer',
      step2_title: 'Entrez votre code partenaire',
      step2_desc: 'Vous avez reçu un code partenaire unique de K Trix. Entrez-le ici.',
      code_placeholder: 'KTRIX-FB-XXXX',
      code_verify: 'Vérifier',
      code_verifying: 'Vérification...',
      code_error: 'Code invalide. Veuillez vérifier et réessayer.',
      code_success: 'Code valide ! Bienvenue sur K Trix.',
      form_title: 'Publiez votre première annonce',
      form_desc: 'Collez simplement le lien de votre post Facebook — K Trix fait le reste.',
      listing_url: 'URL du post Facebook *',
      listing_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      group_url: 'URL de votre groupe Facebook *',
      group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Votre groupe sera affiché sur K Trix — promotion gratuite !',
      group_name: 'Nom du groupe (optionnel)',
      group_name_placeholder: 'Communauté Immobilière Ho Chi Minh',
      contact: 'Téléphone / Zalo',
      contact_placeholder: '0901 234 567',
      submit: 'Publier sur K Trix',
      submitting: 'Publication...',
      success_title: '✅ Annonce soumise !',
      success_desc: 'Votre annonce apparaîtra bientôt sur K Trix avec le badge de votre groupe.',
      success_more: 'Publier une autre annonce',
      no_code: 'Vous n\'avez pas encore de code partenaire ?',
      no_code_link: 'Contactez-nous',
      badge_preview: 'Votre groupe apparaîtra ainsi :',
    },
  }[language];

  const verifyCode = async () => {
    if (!code.trim()) return;
    setVerifying(true);
    setCodeError('');
    try {
      const res = await fetch('/api/verify-beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.valid && data.isPartner) {
        setCodeValid(true);
        setPartnerData(data.tester);
        if (data.tester?.partner_group_url) {
          setFbData(prev => ({
            ...prev,
            groupUrl: data.tester.partner_group_url,
            groupName: data.tester.partner_group_name || '',
          }));
        }
      } else {
        setCodeError(t.code_error);
      }
    } catch {
      setCodeError(t.code_error);
    }
    setVerifying(false);
  };

  const handleSubmit = async () => {
    if (!fbData.listingUrl || !fbData.groupUrl) return;
    setSubmitting(true);
    // Ici on pourrait appeler une API pour enregistrer le listing
    await new Promise(r => setTimeout(r, 1000)); // simulation
    setSubmitted(true);
    setSubmitting(false);
  };

  const FbBadge = ({ name, url }) => (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 bg-blue-700/80 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition">
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      {name || 'Facebook'}
    </a>
  );

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <header className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <img src="https://raw.githubusercontent.com/f8902621-byte/traxhome-mvp/main/Ktrixlogo.png" alt="K Trix" className="w-16 h-16 object-contain" />
            <div>
              <span className="text-white font-bold text-lg">K Trix</span>
              <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">Partner</span>
            </div>
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

      {/* ══ STEP 1 : Hero + Benefits ══ */}
      {step === 1 && (
        <>
          {/* Hero */}
          <section className="max-w-5xl mx-auto px-4 py-16 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium mb-6">
              <Facebook className="w-4 h-4" />
              {t.hero_badge}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t.hero_title}
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              {t.hero_subtitle}
            </p>
            <button onClick={() => setStep(2)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 transition">
              <Facebook className="w-5 h-5" />
              {t.cta}
              <ArrowRight className="w-5 h-5" />
            </button>
          </section>

          {/* Benefits */}
          <section className="max-w-5xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: <Users className="w-6 h-6 text-blue-400" />, title: t.benefit1_title, desc: t.benefit1_desc, color: 'blue' },
                { icon: <Languages className="w-6 h-6 text-emerald-400" />, title: t.benefit2_title, desc: t.benefit2_desc, color: 'emerald' },
                { icon: <TrendingUp className="w-6 h-6 text-orange-400" />, title: t.benefit3_title, desc: t.benefit3_desc, color: 'orange' },
                { icon: <Star className="w-6 h-6 text-yellow-400" />, title: t.benefit4_title, desc: t.benefit4_desc, color: 'yellow' },
              ].map((b, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${b.color}-500/10 flex items-center justify-center flex-shrink-0`}>
                      {b.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">{b.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Logos partenaires fictifs */}
            <div className="mt-12 text-center">
              <p className="text-gray-600 text-sm mb-6">
                {language === 'vn' ? 'Nguồn dữ liệu' : language === 'en' ? 'Data sources' : 'Sources de données'}
              </p>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <span className="text-gray-500 font-bold text-lg">Chotot.com</span>
                <span className="text-gray-700">•</span>
                <span className="text-gray-500 font-bold text-lg">Alonhadat.com.vn</span>
                <span className="text-gray-700">•</span>
                <span className="text-gray-500 font-bold text-lg">Facebook {language === 'vn' ? 'Groups' : 'Groups'}</span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ══ STEP 2 : Code + Formulaire ══ */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto px-4 py-12">

          {/* Vérification code */}
          {!codeValid && (
            <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">{t.step2_title}</h2>
              </div>
              <p className="text-gray-500 text-sm mb-6 ml-13">{t.step2_desc}</p>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError(''); }}
                  onKeyDown={e => e.key === 'Enter' && verifyCode()}
                  placeholder={t.code_placeholder}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-lg tracking-wider focus:border-blue-500 focus:outline-none transition placeholder-gray-600"
                />
                <button onClick={verifyCode} disabled={verifying || !code.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 transition">
                  {verifying ? t.code_verifying : t.code_verify}
                </button>
              </div>

              {codeError && (
                <p className="mt-3 text-red-400 text-sm flex items-center gap-2">
                  <span>⚠️</span> {codeError}
                </p>
              )}

              <p className="mt-6 text-center text-gray-600 text-sm">
                {t.no_code}{' '}
                <a href="mailto:admin@ktrix.ai" className="text-blue-400 hover:underline">{t.no_code_link}</a>
              </p>
            </div>
          )}

          {/* Code validé — formulaire */}
          {codeValid && !submitted && (
            <div className="space-y-5">
              {/* Message bienvenue */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-emerald-400 font-bold text-sm">{t.code_success}</p>
                  {partnerData?.partner_group_name && (
                    <p className="text-gray-400 text-xs mt-0.5">{partnerData.partner_group_name}</p>
                  )}
                </div>
              </div>

              {/* Formulaire */}
              <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{t.form_title}</h2>
                  <p className="text-gray-500 text-sm">{t.form_desc}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t.listing_url}</label>
                  <input type="url" value={fbData.listingUrl} onChange={e => setFbData({...fbData, listingUrl: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition"
                    placeholder={t.listing_placeholder} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t.group_url}</label>
                  <input type="url" value={fbData.groupUrl} onChange={e => setFbData({...fbData, groupUrl: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition"
                    placeholder={t.group_placeholder} />
                  <p className="text-emerald-400 text-xs mt-1.5 font-medium">{t.group_promo}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t.group_name}</label>
                  <input type="text" value={fbData.groupName} onChange={e => setFbData({...fbData, groupName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition"
                    placeholder={t.group_name_placeholder} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t.contact}</label>
                  <input type="text" value={fbData.contactPhone} onChange={e => setFbData({...fbData, contactPhone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition"
                    placeholder={t.contact_placeholder} />
                </div>

                {/* Preview badge */}
                {fbData.groupUrl && (
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <p className="text-xs text-gray-500 mb-3">{t.badge_preview}</p>
                    <FbBadge name={fbData.groupName || 'Votre groupe'} url={fbData.groupUrl} />
                  </div>
                )}

                <button onClick={handleSubmit}
                  disabled={submitting || !fbData.listingUrl || !fbData.groupUrl}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  <Facebook className="w-5 h-5" />
                  {submitting ? t.submitting : t.submit}
                  {!submitting && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {submitted && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{t.success_title}</h2>
              <p className="text-gray-400 mb-8">{t.success_desc}</p>
              <button onClick={() => { setSubmitted(false); setFbData({...fbData, listingUrl: ''}); }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition">
                {t.success_more}
              </button>
            </div>
          )}

          {/* Retour */}
          {!codeValid && (
            <button onClick={() => setStep(1)} className="mt-4 text-gray-600 hover:text-gray-400 text-sm transition flex items-center gap-1 mx-auto">
              ← {language === 'vn' ? 'Quay lại' : language === 'en' ? 'Back' : 'Retour'}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-8 text-center">
        <p className="text-gray-600 text-sm">© 2026 K Trix — <a href="/" className="hover:text-gray-400 transition">ktrix.ai</a></p>
      </footer>
    </div>
  );
}
