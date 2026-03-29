import { useState } from 'react';
import { useRouter } from 'next/router';
import { Facebook, Users, TrendingUp, Languages, ArrowRight, CheckCircle, Star, Loader, MapPin, Home } from 'lucide-react';

export default function PartnerPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('vn');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const [fbData, setFbData] = useState({ listingUrl: '', groupUrl: '', groupName: '' });
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [preview, setPreview] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

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
      form_title: 'Đăng tin đăng của bạn',
      form_desc: 'Dán link bài đăng Facebook — K Trix tự động đọc và tạo thẻ kết quả.',
      listing_url: 'Link bài đăng Facebook *', listing_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      group_url: 'Link nhóm Facebook *', group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Nhóm của bạn sẽ được hiển thị trên K Trix — quảng bá miễn phí!',
      group_name: 'Tên nhóm (tùy chọn)', group_name_placeholder: 'Cộng đồng BĐS Hồ Chí Minh',
      import_btn: '✨ Đọc và phân tích bài đăng', importing: 'AI đang phân tích...',
      import_error_fetch: 'Không thể đọc bài đăng này. Bài đăng có thể ở chế độ riêng tư.',
      import_error_not_listing: 'Link này không chứa tin đăng bất động sản.',
      import_error_generic: 'Có lỗi xảy ra. Vui lòng thử lại.',
      preview_title: 'Xem trước thẻ K Trix',
      preview_desc: 'Đây là cách tin đăng của bạn sẽ hiển thị trong kết quả tìm kiếm:',
      publish_btn: 'Đăng lên K Trix ✓', publishing: 'Đang đăng...',
      modify_btn: 'Sửa link',
      published_title: '✅ Đã đăng thành công!',
      published_desc: 'Tin đăng của bạn sẽ xuất hiện trong kết quả tìm kiếm K Trix.',
      publish_more: 'Đăng thêm tin',
      no_code: 'Chưa có mã đối tác?', no_code_link: 'Liên hệ với chúng tôi',
      back: 'Quay lại', price_unit: 'Tỷ', area_unit: 'm²', bedrooms_label: 'PN', bathrooms_label: 'WC',
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
      form_title: 'Post your listing',
      form_desc: 'Paste your Facebook post link — K Trix reads it automatically with AI.',
      listing_url: 'Facebook post URL *', listing_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      group_url: 'Your Facebook group URL *', group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Your group will be displayed on K Trix — free promotion!',
      group_name: 'Group name (optional)', group_name_placeholder: 'Ho Chi Minh Real Estate Community',
      import_btn: '✨ Read & analyze listing', importing: 'AI is analyzing...',
      import_error_fetch: 'Could not read this post. It may be private.',
      import_error_not_listing: 'This link does not contain a real estate listing.',
      import_error_generic: 'An error occurred. Please try again.',
      preview_title: 'K Trix card preview',
      preview_desc: 'This is how your listing will appear in search results:',
      publish_btn: 'Publish on K Trix ✓', publishing: 'Publishing...',
      modify_btn: 'Change link',
      published_title: '✅ Successfully published!',
      published_desc: 'Your listing will appear in K Trix search results.',
      publish_more: 'Post another listing',
      no_code: "Don't have a partner code?", no_code_link: 'Contact us',
      back: 'Back', price_unit: 'Tỷ', area_unit: 'm²', bedrooms_label: 'BR', bathrooms_label: 'BA',
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
      form_title: 'Publiez votre annonce',
      form_desc: "Collez le lien de votre post Facebook — K Trix le lit automatiquement avec l'IA.",
      listing_url: 'URL du post Facebook *', listing_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      group_url: 'URL de votre groupe *', group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Votre groupe sera affiché sur K Trix — promotion gratuite !',
      group_name: 'Nom du groupe (optionnel)', group_name_placeholder: 'Communauté Immobilière Ho Chi Minh',
      import_btn: "✨ Lire et analyser l'annonce", importing: "L'IA analyse...",
      import_error_fetch: 'Impossible de lire ce post. Il est peut-être privé.',
      import_error_not_listing: "Ce lien ne contient pas d'annonce immobilière.",
      import_error_generic: 'Une erreur est survenue. Veuillez réessayer.',
      preview_title: 'Aperçu carte K Trix',
      preview_desc: 'Voici comment votre annonce apparaîtra dans les résultats :',
      publish_btn: 'Publier sur K Trix ✓', publishing: 'Publication...',
      modify_btn: 'Changer le lien',
      published_title: '✅ Publié avec succès !',
      published_desc: 'Votre annonce apparaîtra dans les résultats de recherche K Trix.',
      publish_more: 'Publier une autre annonce',
      no_code: "Pas de code partenaire ?", no_code_link: 'Contactez-nous',
      back: 'Retour', price_unit: 'Tỷ', area_unit: 'm²', bedrooms_label: 'ch.', bathrooms_label: 'SDB',
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
          setFbData(prev => ({ ...prev, groupUrl: data.tester.partner_group_url, groupName: data.tester.partner_group_name || '' }));
        }
      } else {
        setCodeError(t.code_error);
      }
    } catch { setCodeError(t.code_error); }
    setVerifying(false);
  };

  const handleImport = async () => {
    if (!fbData.listingUrl || !fbData.groupUrl) return;
    setImporting(true);
    setImportError('');
    setPreview(null);
    try {
      const res = await fetch('/api/import-fb-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingUrl: fbData.listingUrl, groupUrl: fbData.groupUrl, groupName: fbData.groupName, betaCode: code }),
      });
      const data = await res.json();
      if (data.success) {
        setPreview(data.listing);
      } else {
        if (data.error === 'fetch_failed') setImportError(t.import_error_fetch);
        else if (data.error === 'not_a_listing') setImportError(t.import_error_not_listing);
        else setImportError(t.import_error_generic);
      }
    } catch { setImportError(t.import_error_generic); }
    setImporting(false);
  };

  const formatPrice = (price) => {
    if (!price) return '—';
    if (price >= 1000) return `${(price / 1000).toFixed(1)} ${t.price_unit}`;
    return `${price} Triệu`;
  };

  const FbBadge = ({ name, url }) => (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 bg-blue-700/80 text-white px-2 py-1 rounded text-xs font-bold hover:bg-blue-600 transition">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      {name || 'Facebook'}
    </a>
  );

  const ListingCard = ({ listing }) => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden max-w-sm">
      <div className="h-36 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative">
        <Home className="w-10 h-10 text-gray-600" />
        <div className="absolute top-2 left-2">
          {listing.legal_status && <span className="text-xs bg-blue-900/80 text-blue-300 px-2 py-0.5 rounded font-medium border border-blue-700/50">{listing.legal_status}</span>}
        </div>
        <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-900/80 px-2 py-0.5 rounded">facebook</div>
      </div>
      <div className="p-4">
        <p className="text-white font-medium text-sm mb-2 line-clamp-2">{listing.title}</p>
        {listing.facebook_group_name && <div className="mb-2"><FbBadge name={listing.facebook_group_name} url={listing.facebook_group_url} /></div>}
        <p className="text-orange-400 font-bold text-lg mb-1">{formatPrice(listing.price)}</p>
        <div className="flex items-center gap-3 text-gray-400 text-xs mb-2">
          {listing.area && <span>📐 {listing.area} {t.area_unit}</span>}
          {listing.bedrooms && <span>🛏 {listing.bedrooms} {t.bedrooms_label}</span>}
          {listing.bathrooms && <span>🚿 {listing.bathrooms} {t.bathrooms_label}</span>}
        </div>
        {(listing.district || listing.city) && (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <MapPin className="w-3 h-3" />
            <span>{[listing.district, listing.city].filter(Boolean).join(', ')}</span>
          </div>
        )}
        {listing.negotiation_score && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">Score</span>
            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-1.5 rounded-full" style={{ width: `${listing.negotiation_score}%` }}></div>
            </div>
            <span className="text-xs text-gray-400">{listing.negotiation_score}%</span>
          </div>
        )}
        <a href={listing.url} target="_blank" rel="noopener noreferrer"
          className="mt-3 w-full py-2 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-blue-600/30 transition border border-blue-600/20">
          {language === 'vn' ? 'Xem bài gốc →' : language === 'fr' ? 'Voir l\'annonce originale →' : 'View original post →'}
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
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

      {step === 2 && (
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-5">
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
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-emerald-400 font-bold text-sm">{t.code_success}</p>
                  {partnerData?.partner_group_name && <p className="text-gray-400 text-xs mt-0.5">{partnerData.partner_group_name}</p>}
                </div>
              </div>

              {!published ? (
                <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6 space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{t.form_title}</h2>
                    <p className="text-gray-500 text-sm">{t.form_desc}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{t.listing_url}</label>
                    <input type="url" value={fbData.listingUrl} onChange={e => setFbData({...fbData, listingUrl: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition"
                      placeholder={t.listing_placeholder} disabled={!!preview} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{t.group_url}</label>
                    <input type="url" value={fbData.groupUrl} onChange={e => setFbData({...fbData, groupUrl: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition"
                      placeholder={t.group_placeholder} disabled={!!preview} />
                    <p className="text-emerald-400 text-xs mt-1.5 font-medium">{t.group_promo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{t.group_name}</label>
                    <input type="text" value={fbData.groupName} onChange={e => setFbData({...fbData, groupName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition"
                      placeholder={t.group_name_placeholder} disabled={!!preview} />
                  </div>

                  {importError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">⚠️ {importError}</p>
                    </div>
                  )}

                  {preview && (
                    <div>
                      <p className="text-sm font-bold text-gray-300 mb-1">{t.preview_title}</p>
                      <p className="text-xs text-gray-500 mb-4">{t.preview_desc}</p>
                      <ListingCard listing={preview} />
                    </div>
                  )}

                  {!preview ? (
                    <button onClick={handleImport} disabled={importing || !fbData.listingUrl || !fbData.groupUrl}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition">
                      {importing ? <><Loader className="w-5 h-5 animate-spin" />{t.importing}</> : t.import_btn}
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => { setPreview(null); setImportError(''); }}
                        className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl font-bold border border-gray-700 hover:bg-gray-700 transition">
                        {t.modify_btn}
                      </button>
                      <button onClick={() => setPublished(true)} disabled={publishing}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 transition">
                        {publishing ? t.publishing : t.publish_btn}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900 rounded-xl border border-emerald-500/20">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">{t.published_title}</h2>
                  <p className="text-gray-400 mb-8">{t.published_desc}</p>
                  <button onClick={() => { setPublished(false); setPreview(null); setFbData({...fbData, listingUrl: ''}); }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition">
                    {t.publish_more}
                  </button>
                </div>
              )}
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
