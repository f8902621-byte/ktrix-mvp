import { useState } from 'react';
import { useRouter } from 'next/router';
import { Facebook, Users, TrendingUp, Languages, ArrowRight, CheckCircle, Star, Loader, MapPin, Plus, Trash2 } from 'lucide-react';

const EMPTY_LISTING = () => ({ postText: '', listingUrl: '', status: 'idle', result: null, error: null });

export default function PartnerPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('vn');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const [groupUrl, setGroupUrl] = useState('');
  const [groupName, setGroupName] = useState('');
  const [listings, setListings] = useState([EMPTY_LISTING()]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const t = {
    vn: {
      hero_badge: 'Chương trình Đối tác', hero_title: 'Mở rộng tầm với của nhóm bạn',
      hero_subtitle: 'K Trix giúp tin đăng của nhóm bạn tiếp cận hàng nghìn người mua — và quốc tế.',
      benefit1_title: 'Khán giả rộng hơn', benefit1_desc: 'Tin đăng hiển thị cho người dùng K Trix ngoài nhóm Facebook.',
      benefit2_title: '3 ngôn ngữ (sắp có 5)', benefit2_desc: 'Tự động dịch VN / EN / FR. Tiếng Trung và Hàn sắp ra mắt.',
      benefit3_title: 'Giữ toàn quyền sở hữu', benefit3_desc: 'K Trix luôn chuyển hướng người dùng về nhóm của bạn.',
      benefit4_title: 'Miễn phí', benefit4_desc: 'Hoàn toàn miễn phí trong giai đoạn ra mắt.',
      cta: 'Bắt đầu ngay',
      step2_title: 'Nhập mã đối tác', step2_desc: 'Bạn đã nhận được mã riêng từ K Trix.',
      code_placeholder: 'KTRIX-FB-XXXX', code_verify: 'Xác minh', code_verifying: 'Đang xác minh...',
      code_error: 'Mã không hợp lệ. Vui lòng kiểm tra lại.',
      code_success: 'Mã hợp lệ! Chào mừng bạn đến với K Trix.',
      form_title: 'Đăng nhiều tin cùng lúc',
      form_desc: 'Dán nội dung và URL từng bài đăng Facebook. Thêm bao nhiêu tin cũng được.',
      group_url: 'Link nhóm Facebook *', group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Nhóm của bạn sẽ được hiển thị trên K Trix — quảng bá miễn phí!',
      group_name: 'Tên nhóm (tùy chọn)', group_name_placeholder: 'Cộng đồng BĐS Hồ Chí Minh',
      listing_label: 'Tin đăng',
      post_text: 'Nội dung bài đăng *',
      post_text_placeholder: 'Dán toàn bộ nội dung bài đăng Facebook vào đây...',
      listing_url: 'URL bài đăng *',
      listing_url_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      listing_url_hint: 'Clik chuột phải vào thời gian đăng → "Sao chép địa chỉ liên kết"',
      add_listing: '+ Thêm tin đăng',
      submit_all: '✨ Phân tích & Đăng tất cả',
      submitting_label: 'Đang xử lý...',
      progress_label: 'Đang phân tích',
      no_code: 'Chưa có mã đối tác?', no_code_link: 'Liên hệ với chúng tôi',
      back: 'Quay lại',
      done_title: '✅ Hoàn tất!',
      done_desc: (ok, fail) => `${ok} tin đã đăng thành công${fail > 0 ? `, ${fail} tin thất bại` : ''}.`,
      publish_more: 'Đăng thêm tin',
      remove: 'Xóa',
      error_empty: 'Vui lòng điền nội dung và URL bài đăng.',
      error_group: 'Vui lòng điền link nhóm Facebook.',
    },
    en: {
      hero_badge: 'Partner Program', hero_title: "Expand your group's reach",
      hero_subtitle: 'K Trix helps your listings reach thousands of buyers across Vietnam — and internationally.',
      benefit1_title: 'Wider audience', benefit1_desc: 'Your listings appear to K Trix users beyond your Facebook group.',
      benefit2_title: '3 languages (5 coming)', benefit2_desc: 'Auto-translated VN / EN / FR. Chinese & Korean coming soon.',
      benefit3_title: 'Keep full ownership', benefit3_desc: 'K Trix always redirects users back to your Facebook group.',
      benefit4_title: 'Free', benefit4_desc: 'Completely free during the launch period.',
      cta: 'Get started',
      step2_title: 'Enter your partner code', step2_desc: 'You received a unique partner code from K Trix.',
      code_placeholder: 'KTRIX-FB-XXXX', code_verify: 'Verify', code_verifying: 'Verifying...',
      code_error: 'Invalid code. Please check and try again.',
      code_success: 'Valid code! Welcome to K Trix.',
      form_title: 'Bulk listing import',
      form_desc: 'Paste the content and URL of each Facebook post. Add as many as you want.',
      group_url: 'Your Facebook group URL *', group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Your group will be displayed on K Trix — free promotion!',
      group_name: 'Group name (optional)', group_name_placeholder: 'Ho Chi Minh Real Estate Community',
      listing_label: 'Listing',
      post_text: 'Post content *',
      post_text_placeholder: 'Paste the full Facebook post text here...',
      listing_url: 'Post URL *',
      listing_url_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      listing_url_hint: 'Right-click the post timestamp → "Copy link address"',
      add_listing: '+ Add another listing',
      submit_all: '✨ Analyze & Publish all',
      submitting_label: 'Processing...',
      progress_label: 'Analyzing',
      no_code: "Don't have a partner code?", no_code_link: 'Contact us',
      back: 'Back',
      done_title: '✅ All done!',
      done_desc: (ok, fail) => `${ok} listing${ok !== 1 ? 's' : ''} published${fail > 0 ? `, ${fail} failed` : ''}.`,
      publish_more: 'Import more listings',
      remove: 'Remove',
      error_empty: 'Please fill in the post content and URL.',
      error_group: 'Please enter your Facebook group URL.',
    },
    fr: {
      hero_badge: 'Programme Partenaire', hero_title: 'Élargissez la portée de votre groupe',
      hero_subtitle: "K Trix aide vos annonces à toucher des milliers d'acheteurs à travers le Vietnam.",
      benefit1_title: 'Audience élargie', benefit1_desc: 'Vos annonces sont visibles aux utilisateurs K Trix au-delà de votre groupe.',
      benefit2_title: '3 langues (5 bientôt)', benefit2_desc: 'Traduction automatique VN / EN / FR. Chinois et coréen bientôt.',
      benefit3_title: 'Paternité conservée', benefit3_desc: 'K Trix redirige toujours les utilisateurs vers votre groupe.',
      benefit4_title: 'Gratuit', benefit4_desc: 'Entièrement gratuit pendant la période de lancement.',
      cta: 'Commencer',
      step2_title: 'Entrez votre code partenaire', step2_desc: 'Vous avez reçu un code unique de K Trix.',
      code_placeholder: 'KTRIX-FB-XXXX', code_verify: 'Vérifier', code_verifying: 'Vérification...',
      code_error: 'Code invalide. Veuillez vérifier et réessayer.',
      code_success: 'Code valide ! Bienvenue sur K Trix.',
      form_title: "Import groupé d'annonces",
      form_desc: "Collez le contenu et l'URL de chaque post Facebook. Ajoutez autant d'annonces que vous voulez.",
      group_url: 'URL de votre groupe *', group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Votre groupe sera affiché sur K Trix — promotion gratuite !',
      group_name: 'Nom du groupe (optionnel)', group_name_placeholder: 'Communauté Immobilière Ho Chi Minh',
      listing_label: 'Annonce',
      post_text: 'Contenu du post *',
      post_text_placeholder: 'Collez ici le texte complet du post Facebook...',
      listing_url: 'URL du post *',
      listing_url_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      listing_url_hint: "Clic droit sur l'horodatage → \"Copier l'adresse du lien\"",
      add_listing: '+ Ajouter une annonce',
      submit_all: '✨ Analyser & Publier tout',
      submitting_label: 'Traitement en cours...',
      progress_label: 'Analyse',
      no_code: "Pas de code partenaire ?", no_code_link: 'Contactez-nous',
      back: 'Retour',
      done_title: '✅ Terminé !',
      done_desc: (ok, fail) => `${ok} annonce${ok !== 1 ? 's' : ''} publiée${ok !== 1 ? 's' : ''}${fail > 0 ? `, ${fail} échouée${fail !== 1 ? 's' : ''}` : ''}.`,
      publish_more: "Importer d'autres annonces",
      remove: 'Supprimer',
      error_empty: "Veuillez remplir le contenu et l'URL du post.",
      error_group: 'Veuillez entrer l\'URL de votre groupe Facebook.',
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
          setGroupUrl(data.tester.partner_group_url);
          setGroupName(data.tester.partner_group_name || '');
        }
      } else {
        setCodeError(t.code_error);
      }
    } catch { setCodeError(t.code_error); }
    setVerifying(false);
  };

  const updateListing = (index, field, value) => {
    setListings(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  const addListing = () => setListings(prev => [...prev, EMPTY_LISTING()]);

  const removeListing = (index) => {
    if (listings.length === 1) return;
    setListings(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async () => {
    if (!groupUrl.trim()) { alert(t.error_group); return; }
    for (let i = 0; i < listings.length; i++) {
      if (!listings[i].postText.trim() || !listings[i].listingUrl.trim()) {
        alert(`${t.listing_label} ${i + 1}: ${t.error_empty}`);
        return;
      }
    }

    setSubmitting(true);
    setDone(false);
    setListings(prev => prev.map(l => ({ ...l, status: 'pending', result: null, error: null })));

    for (let i = 0; i < listings.length; i++) {
      setListings(prev => prev.map((l, idx) => idx === i ? { ...l, status: 'processing' } : l));

      try {
        const res = await fetch('/api/import-fb-listing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postText: listings[i].postText.trim(),
            listingUrl: listings[i].listingUrl.trim(),
            groupUrl: groupUrl.trim(),
            groupName: groupName.trim() || undefined,
            betaCode: code,
          }),
        });
        const data = await res.json();

        if (data.success) {
          setListings(prev => prev.map((l, idx) => idx === i ? { ...l, status: 'success', result: data.listing } : l));
        } else {
          const errMap = {
            not_a_listing: language === 'vn' ? 'Không phải tin BĐS' : language === 'fr' ? 'Pas une annonce immo' : 'Not a real estate listing',
            empty_content: language === 'vn' ? 'Nội dung quá ngắn' : language === 'fr' ? 'Contenu trop court' : 'Content too short',
            nlp_failed: language === 'vn' ? 'Lỗi AI' : language === 'fr' ? 'Erreur IA' : 'AI error',
          };
          setListings(prev => prev.map((l, idx) => idx === i ? { ...l, status: 'error', error: errMap[data.error] || data.message || 'Error' } : l));
        }
      } catch {
        setListings(prev => prev.map((l, idx) => idx === i ? { ...l, status: 'error', error: 'Network error' } : l));
      }

      if (i < listings.length - 1) await new Promise(r => setTimeout(r, 600));
    }

    setSubmitting(false);
    setDone(true);
  };

  const resetForm = () => { setListings([EMPTY_LISTING()]); setDone(false); };

  const successCount = listings.filter(l => l.status === 'success').length;
  const failCount = listings.filter(l => l.status === 'error').length;
  const totalProcessed = successCount + failCount;

  const formatPrice = (price) => {
    if (!price) return null;
    if (price >= 1000) return `${(price / 1000).toFixed(1)} Tỷ`;
    return `${price} Tr`;
  };

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

      {/* Step 1 — Landing */}
      {step === 1 && (
        <>
          <section className="max-w-5xl mx-auto px-4 py-16 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium mb-6">
              <Facebook className="w-4 h-4" />{t.hero_badge}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{t.hero_title}</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">{t.hero_subtitle}</p>
            <button onClick={() => setStep(2)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 transition">
              <Facebook className="w-5 h-5" />{t.cta}<ArrowRight className="w-5 h-5" />
            </button>
          </section>
          <section className="max-w-5xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: <Users className="w-6 h-6 text-blue-400" />, title: t.benefit1_title, desc: t.benefit1_desc },
                { icon: <Languages className="w-6 h-6 text-emerald-400" />, title: t.benefit2_title, desc: t.benefit2_desc },
                { icon: <TrendingUp className="w-6 h-6 text-orange-400" />, title: t.benefit3_title, desc: t.benefit3_desc },
                { icon: <Star className="w-6 h-6 text-yellow-400" />, title: t.benefit4_title, desc: t.benefit4_desc },
              ].map((b, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">{b.icon}</div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">{b.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Step 2 — Form */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-5">

          {/* Code verification */}
          {!codeValid && (
            <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">{t.step2_title}</h2>
              </div>
              <p className="text-gray-500 text-sm mb-6">{t.step2_desc}</p>
              <div className="flex gap-3">
                <input type="text" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError(''); }}
                  onKeyDown={e => e.key === 'Enter' && verifyCode()} placeholder={t.code_placeholder}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-lg tracking-wider focus:border-blue-500 focus:outline-none transition placeholder-gray-600" />
                <button onClick={verifyCode} disabled={verifying || !code.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 transition">
                  {verifying ? t.code_verifying : t.code_verify}
                </button>
              </div>
              {codeError && <p className="mt-3 text-red-400 text-sm">⚠️ {codeError}</p>}
              <p className="mt-6 text-center text-gray-600 text-sm">
                {t.no_code}{' '}<a href="mailto:admin@ktrix.ai" className="text-blue-400 hover:underline">{t.no_code_link}</a>
              </p>
            </div>
          )}

          {codeValid && (
            <>
              {/* Code badge */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-emerald-400 font-bold text-sm">{t.code_success}</p>
                  {partnerData?.partner_group_name && <p className="text-gray-400 text-xs mt-0.5">{partnerData.partner_group_name}</p>}
                </div>
              </div>

              {/* Group info */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t.group_url}</label>
                  <input type="url" value={groupUrl} onChange={e => setGroupUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition disabled:opacity-60"
                    placeholder={t.group_placeholder} disabled={submitting} />
                  <p className="text-emerald-400 text-xs mt-1.5 font-medium">{t.group_promo}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{t.group_name}</label>
                  <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition disabled:opacity-60"
                    placeholder={t.group_name_placeholder} disabled={submitting} />
                </div>
              </div>

              {/* Bulk listings form */}
              <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-1">{t.form_title}</h2>
                <p className="text-gray-500 text-sm mb-6">{t.form_desc}</p>

                <div className="space-y-5">
                  {listings.map((listing, index) => (
                    <div key={index} className={`border rounded-xl p-5 transition-all duration-300 ${
                      listing.status === 'success' ? 'border-emerald-500/40 bg-emerald-500/5' :
                      listing.status === 'error' ? 'border-red-500/40 bg-red-500/5' :
                      listing.status === 'processing' ? 'border-blue-400/50 bg-blue-500/5' :
                      'border-gray-700 bg-gray-800/40'
                    }`}>
                      {/* Block header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-300">{t.listing_label} {index + 1}</span>
                          {listing.status === 'processing' && (
                            <span className="flex items-center gap-1 text-blue-400 text-xs">
                              <Loader className="w-3 h-3 animate-spin" /> {t.progress_label}...
                            </span>
                          )}
                          {listing.status === 'success' && (
                            <span className="text-emerald-400 text-xs font-bold truncate max-w-xs">
                              ✅ {listing.result?.title?.slice(0, 35)}{listing.result?.title?.length > 35 ? '...' : ''}
                            </span>
                          )}
                          {listing.status === 'error' && (
                            <span className="text-red-400 text-xs font-bold">❌ {listing.error}</span>
                          )}
                        </div>
                        {listings.length > 1 && !submitting && listing.status === 'idle' && (
                          <button onClick={() => removeListing(index)}
                            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Success mini-card */}
                      {listing.status === 'success' && listing.result && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{listing.result.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              {listing.result.price && <span className="text-emerald-400 font-bold">{formatPrice(listing.result.price)}</span>}
                              {listing.result.area && <span>📐 {listing.result.area}m²</span>}
                              {listing.result.district && <span><MapPin className="w-3 h-3 inline mr-0.5" />{listing.result.district}</span>}
                            </div>
                          </div>
                          <a href={listing.listingUrl} target="_blank" rel="noopener noreferrer"
                            className="text-blue-400 text-xs hover:underline flex-shrink-0 font-medium">
                            FB →
                          </a>
                        </div>
                      )}

                      {/* Input fields */}
                      {listing.status !== 'success' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">{t.post_text}</label>
                            <textarea
                              value={listing.postText}
                              onChange={e => updateListing(index, 'postText', e.target.value)}
                              placeholder={t.post_text_placeholder}
                              rows={4}
                              disabled={submitting}
                              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition resize-y placeholder-gray-600 text-sm leading-relaxed disabled:opacity-60"
                            />
                            {listing.postText.length > 0 && (
                              <p className="text-gray-600 text-xs mt-1 text-right">{listing.postText.length} chars</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">{t.listing_url}</label>
                            <input
                              type="url"
                              value={listing.listingUrl}
                              onChange={e => updateListing(index, 'listingUrl', e.target.value)}
                              placeholder={t.listing_url_placeholder}
                              disabled={submitting}
                              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition placeholder-gray-600 text-sm disabled:opacity-60"
                            />
                            <p className="text-gray-600 text-xs mt-1">💡 {t.listing_url_hint}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add listing button */}
                {!submitting && !done && (
                  <button onClick={addListing}
                    className="mt-4 w-full py-3 border-2 border-dashed border-gray-700 text-gray-500 rounded-xl hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition text-sm font-medium flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> {t.add_listing}
                  </button>
                )}

                {/* Progress bar */}
                {submitting && (
                  <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span className="font-medium text-blue-400">{t.submitting_label}</span>
                      <span>{totalProcessed} / {listings.length}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${listings.length > 0 ? (totalProcessed / listings.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs">
                      {successCount > 0 && <span className="text-emerald-400 font-medium">✅ {successCount} ok</span>}
                      {failCount > 0 && <span className="text-red-400 font-medium">❌ {failCount} failed</span>}
                    </div>
                  </div>
                )}

                {/* Done state */}
                {done && (
                  <div className="mt-6 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                    <p className="text-3xl mb-3">🎉</p>
                    <p className="text-emerald-400 font-bold text-xl mb-2">{t.done_title}</p>
                    <p className="text-gray-400 text-sm mb-5">{t.done_desc(successCount, failCount)}</p>
                    <button onClick={resetForm}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition">
                      {t.publish_more}
                    </button>
                  </div>
                )}

                {/* Submit button */}
                {!done && (
                  <button
                    onClick={handleSubmitAll}
                    disabled={submitting}
                    className="mt-5 w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    {submitting
                      ? <><Loader className="w-5 h-5 animate-spin" />{t.submitting_label}</>
                      : t.submit_all
                    }
                  </button>
                )}
              </div>
            </>
          )}

          {!codeValid && (
            <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-400 text-sm transition flex items-center gap-1 mx-auto">
              ← {t.back}
            </button>
          )}
        </div>
      )}

      <footer className="border-t border-gray-800 mt-12 py-8 text-center">
        <p className="text-gray-600 text-sm">© 2026 K Trix — <a href="/" className="hover:text-gray-400 transition">ktrix.ai</a></p>
      </footer>
    </div>
  );
}
