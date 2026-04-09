import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Facebook, Users, TrendingUp, Languages, ArrowRight, CheckCircle, Star, Loader, MapPin, Plus, Trash2, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';

const EMPTY_LISTING = () => ({ postText: '', listingUrl: '', imageBase64: null, imagePreview: null, status: 'idle', result: null, error: null });

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
  const [deletingId, setDeletingId] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showExample, setShowExample] = useState(false);

  const t = {
    vn: {
      hero_badge: 'Chương trình Đối tác',
      hero_title: 'Đăng tin BĐS lên K Trix',
      hero_subtitle: 'Chỉ cần dán nội dung bài đăng Facebook — AI của K Trix sẽ tự động phân tích và hiển thị tin của bạn cho hàng nghìn người mua.',
      benefit1_title: 'Tiếp cận rộng hơn', benefit1_desc: 'Tin đăng hiển thị cho người dùng K Trix ngoài nhóm Facebook.',
      benefit2_title: '3 ngôn ngữ', benefit2_desc: 'Tự động dịch VN / EN / FR.',
      benefit3_title: 'Giữ toàn quyền sở hữu', benefit3_desc: 'K Trix luôn chuyển hướng người dùng về nhóm của bạn.',
      benefit4_title: 'Hoàn toàn miễn phí', benefit4_desc: 'Miễn phí trong giai đoạn ra mắt.',
      cta: 'Bắt đầu đăng tin',
      step2_title: 'Nhập mã đối tác',
      step2_desc: 'Bạn đã nhận được mã riêng từ K Trix qua email.',
      code_placeholder: 'KTRIX-FB-XXXX',
      code_verify: 'Xác minh',
      code_verifying: 'Đang xác minh...',
      code_error: 'Mã không hợp lệ. Vui lòng kiểm tra lại.',
      code_success: 'Xác minh thành công! Chào mừng bạn.',
      form_title: 'Đăng tin BĐS',
      form_desc: 'Mỗi tin đăng = 1 bài viết Facebook. Bạn có thể đăng nhiều tin cùng lúc.',
      group_url: 'Link nhóm Facebook của bạn *',
      group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Nhóm của bạn sẽ được hiển thị trên K Trix — quảng bá miễn phí!',
      group_name: 'Tên nhóm (tùy chọn)',
      group_name_placeholder: 'Ví dụ: Hội Mua Bán Nhà Đất TP.HCM',
      listing_label: 'Tin đăng',
      post_text: 'Nội dung bài đăng *',
      post_text_placeholder: 'Sao chép và dán toàn bộ nội dung bài đăng Facebook vào đây...\n\nVí dụ:\nCHÍNH CHỦ CẦN BÁN GẤP nhà 2 tầng, 4x15m, hẻm 5m, Quận Bình Thạnh\nGiá: 4,5 tỷ (thương lượng)\nLH: 0901...',
      listing_url: 'Link bài đăng Facebook *',
      listing_url_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      listing_url_hint: 'Cách lấy link: Nhấp vào ngày/giờ đăng bài → Sao chép URL trên thanh địa chỉ',
      photo: 'Ảnh bìa (tùy chọn)',
      photo_hint: 'JPG, PNG, WebP — tối đa 5MB',
      photo_upload: 'Chọn ảnh',
      photo_change: 'Đổi ảnh',
      add_listing: '+ Thêm tin đăng khác',
      submit_all: '✨ Phân tích & Đăng tất cả',
      submitting_label: 'Đang xử lý...',
      progress_label: 'Đang phân tích',
      no_code: 'Chưa có mã đối tác?',
      no_code_link: 'Liên hệ với chúng tôi',
      back: 'Quay lại',
      done_title: '✅ Đăng tin thành công!',
      done_desc: (ok, fail) => `${ok} tin đã được đăng${fail > 0 ? `, ${fail} thất bại` : ''}.`,
      publish_more: 'Đăng thêm tin',
      error_empty: 'Vui lòng điền nội dung và link bài đăng.',
      error_group: 'Vui lòng điền link nhóm Facebook.',
      expiry_note: '⏱ Tin đăng tự động hết hạn sau 30 ngày.',
      delete_listing: 'Ẩn tin này',
      delete_confirm: 'Ẩn tin này khỏi kết quả tìm kiếm?',
      deleted_label: 'Đã ẩn',
      tutorial_title: 'Hướng dẫn đăng tin (3 bước)',
      tutorial_hide: 'Ẩn hướng dẫn',
      tutorial_show: 'Xem hướng dẫn',
      tutorial_step1_title: 'Bước 1 — Sao chép nội dung bài đăng',
      tutorial_step1_desc: 'Mở bài đăng BĐS trên Facebook → Nhấn "Xem thêm" → Chọn tất cả văn bản → Sao chép (Ctrl+A, Ctrl+C)',
      tutorial_step2_title: 'Bước 2 — Lấy link bài đăng',
      tutorial_step2_desc: 'Nhấp vào ngày/giờ đăng bài (ví dụ: "2 giờ trước") → Thanh địa chỉ sẽ hiển thị link → Sao chép link đó',
      tutorial_step3_title: 'Bước 3 — Dán vào form và nhấn Đăng',
      tutorial_step3_desc: 'Dán nội dung vào ô "Nội dung bài đăng", dán link vào ô "Link bài đăng", thêm ảnh nếu có → Nhấn "Phân tích & Đăng"',
      example_show: 'Xem ví dụ mẫu',
      example_hide: 'Ẩn ví dụ',
      example_text: 'CHÍNH CHỦ CẦN BÁN GẤP\nNhà 2 tầng đúc, 4x15m, hẻm xe hơi 5m thông\nQuận Bình Thạnh, TP.HCM\nGiá: 4,5 tỷ (còn thương lượng)\nPháp lý: Sổ hồng riêng\nLiên hệ: 0901 234 567',
      welcome_msg: 'Chào mừng! Bạn đã sẵn sàng đăng tin.',
    },
    en: {
      hero_badge: 'Partner Program',
      hero_title: 'Post Real Estate Listings on K Trix',
      hero_subtitle: "Just paste your Facebook post content — K Trix's AI will automatically analyze and display your listings to thousands of buyers.",
      benefit1_title: 'Wider audience', benefit1_desc: 'Your listings appear to K Trix users beyond your Facebook group.',
      benefit2_title: '3 languages', benefit2_desc: 'Auto-translated VN / EN / FR.',
      benefit3_title: 'Keep full ownership', benefit3_desc: 'K Trix always redirects users back to your Facebook group.',
      benefit4_title: 'Completely free', benefit4_desc: 'Free during the launch period.',
      cta: 'Start posting',
      step2_title: 'Enter your partner code',
      step2_desc: 'You received a unique partner code from K Trix by email.',
      code_placeholder: 'KTRIX-FB-XXXX',
      code_verify: 'Verify',
      code_verifying: 'Verifying...',
      code_error: 'Invalid code. Please check again.',
      code_success: 'Verified! Welcome to K Trix.',
      form_title: 'Post Real Estate Listings',
      form_desc: 'Each listing = 1 Facebook post. You can post multiple listings at once.',
      group_url: 'Your Facebook group URL *',
      group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Your group will be displayed on K Trix — free promotion!',
      group_name: 'Group name (optional)',
      group_name_placeholder: 'E.g.: Ho Chi Minh Real Estate Community',
      listing_label: 'Listing',
      post_text: 'Post content *',
      post_text_placeholder: 'Copy and paste the full Facebook post content here...',
      listing_url: 'Facebook post URL *',
      listing_url_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      listing_url_hint: 'How to get the link: Click on the post date/time → Copy the URL from the address bar',
      photo: 'Cover photo (optional)',
      photo_hint: 'JPG, PNG, WebP — max 5MB',
      photo_upload: 'Choose photo',
      photo_change: 'Change photo',
      add_listing: '+ Add another listing',
      submit_all: '✨ Analyze & Publish all',
      submitting_label: 'Processing...',
      progress_label: 'Analyzing',
      no_code: "Don't have a partner code?",
      no_code_link: 'Contact us',
      back: 'Back',
      done_title: '✅ Published successfully!',
      done_desc: (ok, fail) => `${ok} listing${ok !== 1 ? 's' : ''} published${fail > 0 ? `, ${fail} failed` : ''}.`,
      publish_more: 'Post more listings',
      error_empty: 'Please fill in the post content and URL.',
      error_group: 'Please enter your Facebook group URL.',
      expiry_note: '⏱ Listings automatically expire after 30 days.',
      delete_listing: 'Hide this listing',
      delete_confirm: 'Hide this listing from search results?',
      deleted_label: 'Hidden',
      tutorial_title: 'How to post (3 steps)',
      tutorial_hide: 'Hide guide',
      tutorial_show: 'Show guide',
      tutorial_step1_title: 'Step 1 — Copy the post content',
      tutorial_step1_desc: 'Open the real estate post on Facebook → Click "See more" → Select all text → Copy (Ctrl+A, Ctrl+C)',
      tutorial_step2_title: 'Step 2 — Get the post link',
      tutorial_step2_desc: 'Click on the post date/time (e.g. "2 hours ago") → The address bar will show the link → Copy that link',
      tutorial_step3_title: 'Step 3 — Paste into the form and post',
      tutorial_step3_desc: 'Paste content into "Post content", paste link into "Post URL", add photo if available → Click "Analyze & Publish"',
      example_show: 'See example',
      example_hide: 'Hide example',
      example_text: 'URGENT SALE - Owner selling directly\n2-storey house, 4x15m, 5m car alley\nBinh Thanh District, Ho Chi Minh City\nPrice: 4.5 billion VND (negotiable)\nLegal: Separate pink book\nContact: 0901 234 567',
      welcome_msg: 'Welcome! You are ready to post.',
    },
    fr: {
      hero_badge: 'Programme Partenaire',
      hero_title: 'Publiez vos annonces sur K Trix',
      hero_subtitle: "Collez simplement votre post Facebook — l'IA de K Trix analysera et affichera vos annonces à des milliers d'acheteurs.",
      benefit1_title: 'Audience élargie', benefit1_desc: 'Vos annonces sont visibles aux utilisateurs K Trix au-delà de votre groupe.',
      benefit2_title: '3 langues', benefit2_desc: 'Traduction automatique VN / EN / FR.',
      benefit3_title: 'Paternité conservée', benefit3_desc: 'K Trix redirige toujours vers votre groupe.',
      benefit4_title: 'Entièrement gratuit', benefit4_desc: 'Gratuit pendant la période de lancement.',
      cta: 'Commencer à publier',
      step2_title: 'Entrez votre code partenaire',
      step2_desc: 'Vous avez reçu un code unique de K Trix par email.',
      code_placeholder: 'KTRIX-FB-XXXX',
      code_verify: 'Vérifier',
      code_verifying: 'Vérification...',
      code_error: 'Code invalide. Veuillez vérifier.',
      code_success: 'Vérifié ! Bienvenue sur K Trix.',
      form_title: 'Publier des annonces',
      form_desc: 'Chaque annonce = 1 post Facebook. Vous pouvez en publier plusieurs à la fois.',
      group_url: 'URL de votre groupe Facebook *',
      group_placeholder: 'https://www.facebook.com/groups/...',
      group_promo: '🎁 Votre groupe sera affiché sur K Trix — promotion gratuite !',
      group_name: 'Nom du groupe (optionnel)',
      group_name_placeholder: 'Ex : Communauté Immobilière Ho Chi Minh',
      listing_label: 'Annonce',
      post_text: 'Contenu du post *',
      post_text_placeholder: 'Copiez-collez ici le texte complet du post Facebook...',
      listing_url: 'URL du post Facebook *',
      listing_url_placeholder: 'https://www.facebook.com/groups/.../posts/...',
      listing_url_hint: "Comment obtenir le lien : Cliquez sur la date/heure du post → Copiez l'URL dans la barre d'adresse",
      photo: 'Photo de couverture (optionnel)',
      photo_hint: 'JPG, PNG, WebP — max 5MB',
      photo_upload: 'Choisir une photo',
      photo_change: 'Changer la photo',
      add_listing: '+ Ajouter une annonce',
      submit_all: '✨ Analyser & Publier tout',
      submitting_label: 'Traitement en cours...',
      progress_label: 'Analyse',
      no_code: "Pas de code partenaire ?",
      no_code_link: 'Contactez-nous',
      back: 'Retour',
      done_title: '✅ Publié avec succès !',
      done_desc: (ok, fail) => `${ok} annonce${ok !== 1 ? 's' : ''} publiée${ok !== 1 ? 's' : ''}${fail > 0 ? `, ${fail} échouée${fail !== 1 ? 's' : ''}` : ''}.`,
      publish_more: "Publier d'autres annonces",
      error_empty: "Veuillez remplir le contenu et l'URL du post.",
      error_group: "Veuillez entrer l'URL de votre groupe Facebook.",
      expiry_note: '⏱ Les annonces expirent automatiquement après 30 jours.',
      delete_listing: 'Masquer cette annonce',
      delete_confirm: 'Masquer cette annonce des résultats de recherche ?',
      deleted_label: 'Masquée',
      tutorial_title: 'Comment publier (3 étapes)',
      tutorial_hide: 'Masquer le guide',
      tutorial_show: 'Voir le guide',
      tutorial_step1_title: 'Étape 1 — Copiez le contenu du post',
      tutorial_step1_desc: "Ouvrez le post immobilier sur Facebook → Cliquez sur \"Voir plus\" → Sélectionnez tout le texte → Copiez (Ctrl+A, Ctrl+C)",
      tutorial_step2_title: "Étape 2 — Obtenez le lien du post",
      tutorial_step2_desc: "Cliquez sur la date/heure du post (ex : \"il y a 2 heures\") → La barre d'adresse affiche le lien → Copiez ce lien",
      tutorial_step3_title: 'Étape 3 — Collez dans le formulaire et publiez',
      tutorial_step3_desc: 'Collez le contenu dans "Contenu du post", le lien dans "URL du post", ajoutez une photo si disponible → Cliquez sur "Analyser & Publier"',
      example_show: 'Voir un exemple',
      example_hide: "Masquer l'exemple",
      example_text: 'VENTE URGENTE - Propriétaire direct\nMaison 2 étages, 4x15m, ruelle voiture 5m\nDistrict Binh Thanh, Ho Chi Minh Ville\nPrix : 4,5 milliards VND (négociable)\nStatut légal : Livre rose individuel\nContact : 0901 234 567',
      welcome_msg: 'Bienvenue ! Vous êtes prêt à publier.',
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

  const handleImageSelect = (index, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image too large (max 5MB)'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setListings(prev => prev.map((l, i) => i === index ? { ...l, imageBase64: base64, imagePreview: base64 } : l));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    setListings(prev => prev.map((l, i) => i === index ? { ...l, imageBase64: null, imagePreview: null } : l));
  };

  const addListing = () => setListings(prev => [...prev, EMPTY_LISTING()]);

  const removeListing = (index) => {
    if (listings.length === 1) return;
    setListings(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteListing = async (index) => {
    const listing = listings[index];
    if (!listing.result?.id) return;
    if (!confirm(t.delete_confirm)) return;
    setDeletingId(listing.result.id);
    try {
      const res = await fetch('/api/delete-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.result.id, beta_code: code }),
      });
      const data = await res.json();
      if (data.success) {
        setListings(prev => prev.map((l, i) => i === index ? { ...l, status: 'deleted' } : l));
      }
    } catch (err) { console.error('Delete error:', err); }
    setDeletingId(null);
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
            imageBase64: listings[i].imageBase64 || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setListings(prev => prev.map((l, idx) => idx === i ? { ...l, status: 'success', result: data.listing } : l));
        } else {
          const errMap = {
            not_a_listing: language === 'vn' ? 'Không phải tin BĐS' : language === 'fr' ? 'Pas une annonce immo' : 'Not a real estate listing',
            empty_content: language === 'vn' ? 'Nội dung quá ngắn' : language === 'fr' ? 'Contenu trop court' : 'Content too short',
            nlp_failed: 'AI error', db_failed: 'DB error',
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
      <header className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/Ktrixlogo.png" alt="K Trix" className="w-16 h-16 object-contain" />
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

          {/* Bénéfices */}
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
                <input type="text" value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError(''); }}
                  onKeyDown={e => e.key === 'Enter' && verifyCode()}
                  placeholder={t.code_placeholder}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-lg tracking-wider focus:border-blue-500 focus:outline-none transition placeholder-gray-600" />
                <button onClick={verifyCode} disabled={verifying || !code.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 transition">
                  {verifying ? <Loader className="w-4 h-4 animate-spin" /> : t.code_verify}
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
              {/* Welcome message */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-emerald-400 font-bold text-sm">{t.code_success}</p>
                  {partnerData?.partner_group_name && (
                    <p className="text-gray-400 text-xs mt-0.5">👥 {partnerData.partner_group_name}</p>
                  )}
                </div>
              </div>

              {/* Tutorial */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowTutorial(!showTutorial)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-blue-500/10 transition">
                  <span className="text-blue-400 font-bold text-sm flex items-center gap-2">
                    📖 {t.tutorial_title}
                  </span>
                  {showTutorial ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-blue-400" />}
                </button>
                {showTutorial && (
                  <div className="px-5 pb-5 space-y-4">
                    {[
                      { num: '1', title: t.tutorial_step1_title, desc: t.tutorial_step1_desc, color: 'bg-blue-500' },
                      { num: '2', title: t.tutorial_step2_title, desc: t.tutorial_step2_desc, color: 'bg-cyan-500' },
                      { num: '3', title: t.tutorial_step3_title, desc: t.tutorial_step3_desc, color: 'bg-emerald-500' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-7 h-7 ${step.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                          {step.num}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm mb-1">{step.title}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}

                    {/* Exemple */}
                    <div className="mt-2 pt-3 border-t border-blue-500/20">
                      <button
                        onClick={() => setShowExample(!showExample)}
                        className="text-blue-400 text-xs font-medium hover:text-blue-300 transition flex items-center gap-1">
                        {showExample ? <><ChevronUp className="w-3 h-3" />{t.example_hide}</> : <><ChevronDown className="w-3 h-3" />{t.example_show}</>}
                      </button>
                      {showExample && (
                        <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                          <p className="text-gray-500 text-xs mb-2 font-medium">
                            {language === 'vn' ? 'Ví dụ nội dung bài đăng tốt:' : language === 'fr' ? 'Exemple de bon contenu :' : 'Example of good post content:'}
                          </p>
                          <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">{t.example_text}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

              {/* Listings */}
              <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-1">{t.form_title}</h2>
                <p className="text-gray-500 text-sm mb-1">{t.form_desc}</p>
                <p className="text-amber-500/80 text-xs mb-6">{t.expiry_note}</p>

                <div className="space-y-5">
                  {listings.map((listing, index) => (
                    <div key={index} className={`border rounded-xl p-5 transition-all duration-300 ${
                      listing.status === 'success' ? 'border-emerald-500/40 bg-emerald-500/5' :
                      listing.status === 'deleted' ? 'border-gray-700/40 bg-gray-800/20 opacity-50' :
                      listing.status === 'error' ? 'border-red-500/40 bg-red-500/5' :
                      listing.status === 'processing' ? 'border-blue-400/50 bg-blue-500/5' :
                      'border-gray-700 bg-gray-800/40'
                    }`}>
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
                          {listing.status === 'deleted' && (
                            <span className="text-gray-500 text-xs font-bold">🚫 {t.deleted_label}</span>
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

                      {listing.status === 'success' && listing.result && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mb-3">
                          {listing.result.thumbnail && (
                            <img src={listing.result.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{listing.result.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              {listing.result.price && <span className="text-emerald-400 font-bold">{formatPrice(listing.result.price)}</span>}
                              {listing.result.area && <span>📐 {listing.result.area}m²</span>}
                              {listing.result.district && <span><MapPin className="w-3 h-3 inline mr-0.5" />{listing.result.district}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a href={listing.listingUrl} target="_blank" rel="noopener noreferrer"
                              className="text-blue-400 text-xs hover:underline font-medium">FB →</a>
                            <button onClick={() => handleDeleteListing(index)}
                              disabled={deletingId === listing.result?.id}
                              title={t.delete_listing}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50">
                              {deletingId === listing.result?.id ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {listing.status !== 'success' && listing.status !== 'deleted' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">{t.post_text}</label>
                            <textarea
                              value={listing.postText}
                              onChange={e => updateListing(index, 'postText', e.target.value)}
                              placeholder={t.post_text_placeholder}
                              rows={5}
                              disabled={submitting}
                              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none transition resize-y placeholder-gray-600 text-sm leading-relaxed disabled:opacity-60"
                            />
                            {listing.postText.length > 0 && (
                              <p className="text-gray-600 text-xs mt-1 text-right">{listing.postText.length} ký tự</p>
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
                            <p className="text-blue-400/70 text-xs mt-1">💡 {t.listing_url_hint}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">📷 {t.photo}</label>
                            {listing.imagePreview ? (
                              <div className="relative inline-block w-full">
                                <img src={listing.imagePreview} alt="preview"
                                  className="w-full h-40 object-cover rounded-lg border border-gray-700" />
                                <button onClick={() => removeImage(index)} disabled={submitting}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-50">
                                  <X className="w-3 h-3" />
                                </button>
                                <label className="absolute bottom-2 right-2 px-2 py-1 bg-gray-900/80 text-gray-300 text-xs rounded cursor-pointer hover:bg-gray-800 transition">
                                  {t.photo_change}
                                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                    onChange={e => handleImageSelect(index, e.target.files[0])} disabled={submitting} />
                                </label>
                              </div>
                            ) : (
                              <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Upload className="w-6 h-6 text-gray-600 mb-2" />
                                <span className="text-gray-500 text-sm font-medium">{t.photo_upload}</span>
                                <span className="text-gray-600 text-xs mt-0.5">{t.photo_hint}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                  onChange={e => handleImageSelect(index, e.target.files[0])} disabled={submitting} />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!submitting && !done && (
                  <button onClick={addListing}
                    className="mt-4 w-full py-3 border-2 border-dashed border-gray-700 text-gray-500 rounded-xl hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition text-sm font-medium flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> {t.add_listing}
                  </button>
                )}

                {submitting && (
                  <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span className="font-medium text-blue-400">{t.submitting_label}</span>
                      <span>{totalProcessed} / {listings.length}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                      <div className="h-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${listings.length > 0 ? (totalProcessed / listings.length) * 100 : 0}%` }} />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs">
                      {successCount > 0 && <span className="text-emerald-400 font-medium">✅ {successCount} ok</span>}
                      {failCount > 0 && <span className="text-red-400 font-medium">❌ {failCount} failed</span>}
                    </div>
                  </div>
                )}

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

                {!done && (
                  <button onClick={handleSubmitAll} disabled={submitting}
                    className="mt-5 w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    {submitting ? <><Loader className="w-5 h-5 animate-spin" />{t.submitting_label}</> : t.submit_all}
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
