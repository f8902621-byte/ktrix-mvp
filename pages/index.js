import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Search, TrendingUp, Clock, Shield, ChevronRight, Globe, CheckCircle, Zap, Users, BarChart3, LogIn, AlertTriangle, Lightbulb, Trophy, Mail, ChevronDown } from 'lucide-react';

function RevealOnScroll({ children, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
}

export default function Landing() {
  const [language, setLanguage] = useState('vn');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const router = useRouter();
const [stats, setStats] = useState(null);

useEffect(() => {
  fetch('/.netlify/functions/monitoring')
    .then(res => res.json())
    .then(data => setStats(data.stats))
    .catch(() => {});
}, []);
  const t = {
    vn: {
      tagline: 'Nền tảng Tìm kiếm BĐS Thông minh',
      login: 'Đăng nhập',
      heroTitle: 'Tìm kiếm BĐS trên',
      heroHighlight: '65% thị trường',
      heroSubtitle: 'Việt Nam',
      heroDesc: 'K Trix tổng hợp dữ liệu từ nhiều nguồn uy tín, giúp môi giới tiết kiệm thời gian và không bỏ lỡ cơ hội.',
      tryBeta: 'Dùng thử miễn phí',
      learnMore: 'Tìm hiểu thêm',
      statSources: 'Nguồn dữ liệu',
     statListings: 'Tin đăng trong cơ sở dữ liệu',
      statCoverage: 'Độ phủ thị trường',
      statCities: 'Tỉnh thành',
      sourcesTitle: 'Dữ liệu từ các nguồn hàng đầu',
      sourcesDesc: 'Tự động tổng hợp và cập nhật liên tục',
      sourceActive: 'Đang hoạt động',
      sourceComingSoon: 'Sắp ra mắt',
      benefitsTitle: 'Tại sao Môi giới chọn K Trix?',
      benefitsDesc: 'Công cụ được thiết kế dành riêng cho chuyên gia BĐS',
      benefit1Title: 'Tiết kiệm 80% thời gian',
      benefit1Desc: 'Không cần mở từng trang web. Tất cả tin đăng ở một nơi, lọc theo tiêu chí của bạn.',
      benefit2Title: 'Phát hiện cơ hội',
      benefit2Desc: 'AI phát hiện từ khóa "bán gấp", "kẹt tiền" - những cơ hội đàm phán tốt nhất.',
      benefit3Title: 'Dữ liệu tin cậy',
      benefit3Desc: 'Tự động loại bỏ tin trùng, xác minh thông tin, hiển thị trạng thái pháp lý.',
      benefit4Title: 'Cập nhật realtime',
      benefit4Desc: 'Nhận thông báo khi có tin mới phù hợp. Luôn đi trước đối thủ.',
      howTitle: 'Cách hoạt động',
      howDesc: 'Đơn giản như 1-2-3',
      step1Title: 'Chọn tiêu chí',
      step1Desc: 'Thành phố, loại BĐS, ngân sách, diện tích...',
      step2Title: 'K Trix tìm kiếm',
      step2Desc: 'Quét tất cả nguồn dữ liệu trong vài giây',
      step3Title: 'Xem kết quả',
      step3Desc: 'Danh sách được sắp xếp, lọc sẵn, sẵn sàng liên hệ',
      ctaTitle: 'Sẵn sàng thử nghiệm?',
      ctaDesc: 'Tham gia chương trình Beta miễn phí cho Môi giới BĐS',
      ctaPlaceholder: 'Email của bạn',
      ctaButton: 'Đăng ký Beta',
      ctaSuccess: 'Cảm ơn! Chúng tôi sẽ liên hệ sớm.',
      ctaDirect: 'Hoặc dùng thử ngay',
      footerDesc: 'Nền tảng tìm kiếm BĐS thông minh cho thị trường Việt Nam',
      footerContact: 'Liên hệ',
      footerPrivacy: 'Bảo mật',
      footerTerms: 'Điều khoản',
      copyright: '© 2026 K Trix. Đang phát triển.',
      // Beta welcome
      welcomeTitle: 'Chào mừng đến với K Trix!',
      welcomeBravo: 'Xin chúc mừng bạn đã được chọn và cảm ơn bạn là một trong những người tiên phong.',
      welcomeDesc: 'Bạn đang sử dụng phiên bản đầu tiên của AI chuyên về bất động sản tại Việt Nam.',
      mvpTitle: 'Đang phát triển (và đổi mới)',
      mvpDesc: 'Ứng dụng này là MVP (Minimum Viable Product). Hãy coi nó như một viên kim cương thô. Nó có khả năng phân tích mạnh mẽ, nhưng chưa hoàn hảo. Bạn có thể gặp lỗi hoặc phân tích chưa chính xác. Đó là bình thường — và đó là lúc bạn tham gia.',
      roleTitle: 'Vai trò của bạn rất quan trọng',
      roleDesc: 'Chúng tôi không muốn đoán bạn cần gì — chúng tôi muốn bạn cho chúng tôi biết.',
      reportTitle: 'Báo cáo',
      reportDesc: 'Phân tích có vẻ không chính xác? Kết quả bất ngờ? Hãy cho chúng tôi biết để cải thiện AI.',
      suggestTitle: 'Đề xuất',
      suggestDesc: 'Thiếu tính năng cho quyết định của bạn? Cảnh báo? Xuất dữ liệu? Chia sẻ ý tưởng.',
      trainAI: 'Khi sử dụng phiên bản này, bạn không chỉ tìm kiếm hay bán BĐS — bạn đang đào tạo AI sẽ trở thành tiêu chuẩn thị trường.',
      rewardTitle: 'Phần thưởng Beta Tester',
      rewardDesc: 'Những beta tester tích cực nhất sẽ nhận quyền truy cập đặc biệt khi ra mắt chính thức.',
      rewardBadge: '🎁 6 tháng Premium miễn phí',
      feedbackTitle: 'Gửi nhận xét của bạn',
      feedbackDesc: 'Ảnh chụp màn hình, ý tưởng tính năng, lỗi phát hiện — mọi thứ đều quan trọng!',
      qualityTitle: 'Ít tin hơn, chính xác hơn',
      qualityDesc: 'K Trix không chỉ tổng hợp. AI lọc, loại trùng và xác minh từng kết quả.',
      dedup: 'Loại trùng lặp',
      dedupDesc: 'Tin trùng giữa các nguồn được tự động phát hiện và gộp.',
      activeListings: 'Tin còn hiệu lực',
      activeDesc: 'Khác các trang web khác, chúng tôi chỉ giữ tin còn hoạt động.',
      nlpTitle: 'Phân tích NLP',
      nlpDesc: 'AI trích xuất diện tích, tầng, bề rộng đường ngay cả khi không có dữ liệu cấu trúc.',
      explore: 'Khám phá ngay! 🎉',
      betaLimited: 'Beta Riêng — Giới hạn 20 người dùng',
    },
    en: {
      tagline: 'Smart Real Estate Search Platform',
      login: 'Login',
      heroTitle: 'Search properties across',
      heroHighlight: '65% of the market',
      heroSubtitle: 'in Vietnam',
      heroDesc: 'K Trix aggregates data from multiple trusted sources, helping agents save time and never miss an opportunity.',
      tryBeta: 'Try for free',
      learnMore: 'Learn more',
      statSources: 'Data sources',
      statListings: 'Listings in database',
      statCoverage: 'Market coverage',
      statCities: 'Provinces',
      sourcesTitle: 'Data from leading sources',
      sourcesDesc: 'Automatically aggregated and continuously updated',
      sourceActive: 'Active',
      sourceComingSoon: 'Coming soon',
      benefitsTitle: 'Why Agents choose K Trix?',
      benefitsDesc: 'Tools designed specifically for real estate professionals',
      benefit1Title: 'Save 80% of your time',
      benefit1Desc: 'No need to browse multiple websites. All listings in one place, filtered by your criteria.',
      benefit2Title: 'Spot opportunities',
      benefit2Desc: 'AI detects "urgent sale", "need cash" keywords - the best negotiation opportunities.',
      benefit3Title: 'Reliable data',
      benefit3Desc: 'Automatic duplicate removal, verified information, legal status displayed.',
      benefit4Title: 'Real-time updates',
      benefit4Desc: 'Get notified when new matching listings appear. Always stay ahead.',
      howTitle: 'How it works',
      howDesc: 'Simple as 1-2-3',
      step1Title: 'Set criteria',
      step1Desc: 'City, property type, budget, area...',
      step2Title: 'K Trix searches',
      step2Desc: 'Scans all data sources in seconds',
      step3Title: 'View results',
      step3Desc: 'Sorted, filtered list ready to contact',
      ctaTitle: 'Ready to try?',
      ctaDesc: 'Join the free Beta program for Real Estate Agents',
      ctaPlaceholder: 'Your email',
      ctaButton: 'Join Beta',
      ctaSuccess: 'Thank you! We\'ll contact you soon.',
      ctaDirect: 'Or try it now',
      footerDesc: 'Smart real estate search platform for the Vietnam market',
      footerContact: 'Contact',
      footerPrivacy: 'Privacy',
      footerTerms: 'Terms',
      copyright: '© 2026 K Trix. In development.',
      welcomeTitle: 'Welcome to the K Trix adventure!',
      welcomeBravo: 'Congratulations on being selected and thank you for being among our pioneers.',
      welcomeDesc: 'You have in your hands the very first version of our AI dedicated to real estate in Vietnam.',
      mvpTitle: 'Under construction (and innovation)',
      mvpDesc: 'This application is an MVP (Minimum Viable Product). Think of it as a rough diamond. It is capable of analytical prowess, but it is not yet perfect. You may encounter bugs or improvable analyses. This is normal — and this is where you come in.',
      roleTitle: 'Your role is crucial',
      roleDesc: 'We don\'t want to guess what you need — we want you to tell us.',
      reportTitle: 'Report',
      reportDesc: 'An analysis seems incoherent? A surprising result? Let us know to improve AI accuracy.',
      suggestTitle: 'Suggest',
      suggestDesc: 'A feature is missing for your decision-making? Alerts? Exports? Share your ideas.',
      trainAI: 'By using this version, you\'re not just searching or selling a property — you\'re training the AI that will become the market reference.',
      rewardTitle: 'Beta Tester Reward',
      rewardDesc: 'The most active beta testers will receive privileged access at official launch.',
      rewardBadge: '🎁 6 months of Premium subscription free',
      feedbackTitle: 'Send us your feedback',
      feedbackDesc: 'Screenshots, feature ideas, bugs encountered — everything matters!',
      qualityTitle: 'Fewer listings, more relevance',
      qualityDesc: 'K Trix doesn\'t just aggregate. Our AI filters, deduplicates and verifies each result.',
      dedup: 'Deduplication',
      dedupDesc: 'Duplicate listings across sources are automatically detected and merged.',
      activeListings: 'Active listings',
      activeDesc: 'Unlike sites that inflate their numbers, we only keep listings still online.',
      nlpTitle: 'NLP Analysis',
      nlpDesc: 'Our AI extracts key info (area, floors, street width) even when unstructured.',
      explore: 'Happy exploring! 🎉',
      betaLimited: 'Private Beta — Limited to 20 users',
    },
    fr: {
      tagline: 'Plateforme de Recherche Immobilière Intelligente',
      login: 'Connexion',
      heroTitle: 'Recherchez sur',
      heroHighlight: '65% du marché',
      heroSubtitle: 'immobilier au Vietnam',
      heroDesc: 'K Trix agrège les données de multiples sources fiables, aidant les agents à gagner du temps et ne jamais manquer une opportunité.',
      tryBeta: 'Essai gratuit',
      learnMore: 'En savoir plus',
      statSources: 'Sources de données',
      statListings: 'Annonces en base',
      statCoverage: 'Couverture marché',
      statCities: 'Provinces',
      sourcesTitle: 'Données des sources leaders',
      sourcesDesc: 'Agrégation automatique et mise à jour continue',
      sourceActive: 'Actif',
      sourceComingSoon: 'Bientôt',
      benefitsTitle: 'Pourquoi les Agents choisissent K Trix?',
      benefitsDesc: 'Outils conçus spécifiquement pour les professionnels immobiliers',
      benefit1Title: 'Économisez 80% de temps',
      benefit1Desc: 'Plus besoin de parcourir plusieurs sites. Toutes les annonces au même endroit, filtrées selon vos critères.',
      benefit2Title: 'Détectez les opportunités',
      benefit2Desc: 'L\'IA détecte "vente urgente", "besoin d\'argent" - les meilleures opportunités de négociation.',
      benefit3Title: 'Données fiables',
      benefit3Desc: 'Suppression automatique des doublons, infos vérifiées, statut légal affiché.',
      benefit4Title: 'Mises à jour temps réel',
      benefit4Desc: 'Soyez notifié des nouvelles annonces correspondantes. Gardez l\'avance.',
      howTitle: 'Comment ça marche',
      howDesc: 'Simple comme 1-2-3',
      step1Title: 'Définir les critères',
      step1Desc: 'Ville, type de bien, budget, surface...',
      step2Title: 'K Trix recherche',
      step2Desc: 'Analyse toutes les sources en quelques secondes',
      step3Title: 'Voir les résultats',
      step3Desc: 'Liste triée, filtrée, prête à contacter',
      ctaTitle: 'Prêt à essayer?',
      ctaDesc: 'Rejoignez le programme Beta gratuit pour Agents Immobiliers',
      ctaPlaceholder: 'Votre email',
      ctaButton: 'Rejoindre Beta',
      ctaSuccess: 'Merci! Nous vous contacterons bientôt.',
      ctaDirect: 'Ou essayez maintenant',
      footerDesc: 'Plateforme de recherche immobilière intelligente pour le marché vietnamien',
      footerContact: 'Contact',
      footerPrivacy: 'Confidentialité',
      footerTerms: 'Conditions',
      copyright: '© 2026 K Trix. En développement.',
      welcomeTitle: 'Bienvenue dans l\'aventure K Trix !',
      welcomeBravo: 'Bravo d\'avoir été sélectionné et merci d\'être parmi nos pionniers.',
      welcomeDesc: 'Vous avez entre les mains la toute première version de notre intelligence artificielle dédiée à l\'immobilier au Vietnam.',
      mvpTitle: 'Zone de travaux (et d\'innovation)',
      mvpDesc: 'Cette application est un MVP (Minimum Viable Product). Considérez-la comme un diamant brut. Elle est capable de prouesses analytiques, mais elle n\'est pas encore parfaite. Vous rencontrerez peut-être des bugs ou des analyses perfectibles. C\'est normal — et c\'est là que vous intervenez.',
      roleTitle: 'Votre rôle est capital',
      roleDesc: 'Nous ne voulons pas deviner ce dont vous avez besoin — nous voulons que vous nous le disiez.',
      reportTitle: 'Signalez',
      reportDesc: 'Une analyse vous semble incohérente ? Un résultat surprenant ? Dites-le-nous pour améliorer la précision de l\'IA.',
      suggestTitle: 'Proposez',
      suggestDesc: 'Une fonctionnalité manque pour votre prise de décision ? Alertes ? Exports ? Partagez vos idées.',
      trainAI: 'En utilisant cette version, vous ne faites pas que chercher ou vendre un bien — vous entraînez l\'IA qui deviendra demain la référence du marché.',
      rewardTitle: 'Récompense Beta Testeurs',
      rewardDesc: 'Les bêta-testeurs les plus actifs recevront un accès privilégié lors du lancement officiel.',
      rewardBadge: '🎁 6 mois d\'abonnement Premium offerts',
      feedbackTitle: 'Envoyez-nous vos observations',
      feedbackDesc: 'Captures d\'écran, idées de fonctionnalités, bugs rencontrés — tout nous intéresse !',
      qualityTitle: 'Moins d\'annonces, plus de pertinence',
      qualityDesc: 'K Trix ne se contente pas d\'agréger. Notre IA filtre, déduplique et vérifie chaque résultat.',
      dedup: 'Déduplication',
      dedupDesc: 'Les annonces en double entre les différentes sources sont automatiquement détectées et fusionnées.',
      activeListings: 'Annonces actives',
      activeDesc: 'Contrairement aux sites qui gonflent leurs chiffres, nous ne gardons que les annonces encore en ligne.',
      nlpTitle: 'Analyse NLP',
      nlpDesc: 'Notre IA extrait les informations clés (surface, étages, largeur de rue) même quand elles ne sont pas structurées.',
      explore: 'Bonne exploration ! 🎉',
      betaLimited: 'Beta Privée — Limitée à 20 testeurs',
    }
  }[language];

  const handleBetaSignup = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch('/.netlify/functions/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language, source: 'landing' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error');
      setSubmitted(true);
      setEmail('');
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sources = [
    { name: 'Chotot.com', logo: '🛒', active: true },
    { name: 'Alonhadat.com.vn', logo: '📍', active: true },
    { name: 'Batdongsan.com.vn', logo: '🏠', active: false, status: 'maintenance' },
    { name: 'Nhadat247.com.vn', logo: '🏘️', active: false },
    { name: 'Homedy.com', logo: '🏡', active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://raw.githubusercontent.com/f8902621-byte/traxhome-mvp/main/Ktrixlogo.png" alt="K Trix" className="w-12 h-12 object-contain" />
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30">BETA</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 sm:px-3 py-2 text-sm border border-gray-700 rounded-lg bg-gray-900 text-gray-300 hover:border-gray-600 transition cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value="vn">🇻🇳 VN</option>
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
<button onClick={() => router.push(`/search?lang=${language}`)} className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition">
  <LogIn className="w-4 h-4" />
  {t.login}
</button>
            <button
              onClick={() => router.push(`/search?lang=${language}`)}
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-500 hover:to-cyan-400 transition shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tryBeta}</span>
              <span className="sm:hidden">Go</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl"></div>
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gray-800/80 border border-gray-700/50 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-medium mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                {t.betaLimited}
              </div>
              <p className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t.tagline}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                {t.heroTitle}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {t.heroHighlight}
                </span>{' '}
                {t.heroSubtitle}
              </h1>
              <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed">{t.heroDesc}</p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={() => router.push(`/search?lang=${language}`)}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-400 transition shadow-xl shadow-blue-500/25 flex items-center gap-2 text-base sm:text-lg"
                >
                  {t.tryBeta}
                  <ChevronRight className="w-5 h-5" />
                </button>
                <a href="#welcome" className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition border border-gray-700 flex items-center gap-2">
                  {t.learnMore}
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { icon: <BarChart3 className="w-6 h-6 text-cyan-400" />, value: '2', label: t.statSources, bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                { icon: <TrendingUp className="w-6 h-6 text-orange-400" />, value: stats?.total_listings ? stats.total_listings.toLocaleString() : '8,000+', label: t.statListings, bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                { icon: <Shield className="w-6 h-6 text-blue-400" />, value: '65%', label: t.statCoverage, bg: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: true },
                { icon: <Globe className="w-6 h-6 text-emerald-400" />, value: '12+', label: t.statCities, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gray-900/80 rounded-2xl p-5 sm:p-6 border ${stat.border} backdrop-blur-sm hover:bg-gray-800/80 transition`}>
                  <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                    {stat.icon}
                  </div>
                  <p className={`text-2xl sm:text-3xl font-bold ${stat.gradient ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400' : 'text-white'}`}>{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Welcome / Beta Message */}
      <section id="welcome" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
              {/* Top gradient bar */}
              <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"></div>
              <div className="p-6 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t.welcomeTitle}</h2>
                <p className="text-emerald-400 font-medium text-lg mb-4">{t.welcomeBravo}</p>
                <p className="text-gray-400 text-base sm:text-lg mb-8">{t.welcomeDesc}</p>

                {/* MVP Block */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 sm:p-6 mb-4 hover:border-amber-500/20 transition">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-3">
                    <span className="text-2xl">🚧</span> {t.mvpTitle}
                  </h3>
                  <p className="text-gray-400">{t.mvpDesc}</p>
                </div>

                {/* Role Block */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 sm:p-6 mb-6 hover:border-blue-500/20 transition">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-3">
                    <span className="text-2xl">🚀</span> {t.roleTitle}
                  </h3>
                  <p className="text-gray-400">{t.roleDesc}</p>
                </div>

                {/* Role Cards */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-red-500/30 transition">
                    <span className="absolute top-2 right-4 text-5xl font-bold text-gray-700/30 select-none">01</span>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" /> {t.reportTitle}
                    </h4>
                    <p className="text-gray-400 text-sm">{t.reportDesc}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-400 opacity-0 group-hover:opacity-100 transition"></div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-blue-500/30 transition">
                    <span className="absolute top-2 right-4 text-5xl font-bold text-gray-700/30 select-none">02</span>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-blue-400" /> {t.suggestTitle}
                    </h4>
                    <p className="text-gray-400 text-sm">{t.suggestDesc}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition"></div>
                  </div>
                </div>

                <p className="text-gray-300 text-base sm:text-lg text-center italic mb-8">{t.trainAI}</p>

                {/* Reward Box */}
                <div className="bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl p-6 sm:p-8 text-center">
                  <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-amber-400 mb-3">{t.rewardTitle}</h3>
                  <p className="text-gray-400 mb-4 max-w-lg mx-auto">{t.rewardDesc}</p>
                  <span className="inline-block bg-amber-500/15 text-amber-400 px-5 py-2 rounded-full font-semibold text-sm border border-amber-500/20">{t.rewardBadge}</span>
                </div>

                <p className="text-center text-xl font-semibold text-white mt-8">{t.explore}</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Data Quality */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <div className="w-6 h-0.5 bg-blue-400"></div>
              {language === 'vn' ? 'Chất lượng dữ liệu' : language === 'fr' ? 'Qualité des données' : 'Data Quality'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.qualityTitle}</h2>
            <p className="text-gray-400 text-base sm:text-lg mb-8">{t.qualityDesc}</p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: '🔄', title: t.dedup, desc: t.dedupDesc },
                { icon: '✅', title: t.activeListings, desc: t.activeDesc },
                { icon: '🧠', title: t.nlpTitle, desc: t.nlpDesc },
              ].map((item, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center hover:border-gray-700 transition">
                  <span className="text-3xl mb-3 block">{item.icon}</span>
                  <h4 className="font-semibold text-white mb-2 text-sm">{item.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Sources */}
            <div className="flex flex-wrap justify-center gap-3">
              {sources.filter(s => s.active).map((source, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/30"></span>
                  <div>
                    <p className="font-semibold text-white text-sm">{source.name}</p>
                    <p className="text-emerald-400 text-xs">{t.sourceActive}</p>
                  </div>
                </div>
              ))}
              {sources.filter(s => !s.active).map((source, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-900/50 border border-gray-800/50 rounded-xl px-5 py-3 opacity-50">
                  <span className="w-2.5 h-2.5 bg-gray-600 rounded-full"></span>
                  <div>
                    <p className="font-medium text-gray-400 text-sm">{source.name}</p>
                    <p className="text-gray-600 text-xs">{t.sourceComingSoon}</p>
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.benefitsTitle}</h2>
              <p className="text-gray-400 text-base sm:text-lg">{t.benefitsDesc}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: <Clock className="w-7 h-7 text-cyan-400" />, bg: 'bg-cyan-500/10', border: 'hover:border-cyan-500/30', title: t.benefit1Title, desc: t.benefit1Desc },
                { icon: <Zap className="w-7 h-7 text-orange-400" />, bg: 'bg-orange-500/10', border: 'hover:border-orange-500/30', title: t.benefit2Title, desc: t.benefit2Desc },
                { icon: <Shield className="w-7 h-7 text-emerald-400" />, bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/30', title: t.benefit3Title, desc: t.benefit3Desc },
                { icon: <TrendingUp className="w-7 h-7 text-blue-400" />, bg: 'bg-blue-500/10', border: 'hover:border-blue-500/30', title: t.benefit4Title, desc: t.benefit4Desc },
              ].map((benefit, i) => (
                <div key={i} className={`bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-800 ${benefit.border} transition`}>
                  <div className={`w-14 h-14 ${benefit.bg} rounded-2xl flex items-center justify-center mb-5`}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.howTitle}</h2>
              <p className="text-gray-400 text-base sm:text-lg">{t.howDesc}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((num) => (
                <div key={num} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-xl shadow-blue-500/25">
                    {num}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{t[`step${num}Title`]}</h3>
                  <p className="text-gray-500">{t[`step${num}Desc`]}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <RevealOnScroll>
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                  <Users className="w-4 h-4" />
                  Beta Program
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t.ctaTitle}</h2>
                <p className="text-blue-100 text-base sm:text-lg mb-8">{t.ctaDesc}</p>
                {submitted ? (
                  <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                    <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                    <p className="text-white font-medium">{t.ctaSuccess}</p>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleBetaSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.ctaPlaceholder}
                        className="flex-1 px-5 py-4 rounded-xl border-0 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white/50"
                        required
                        disabled={isSubmitting}
                      />
                      <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg disabled:opacity-50">
                        {isSubmitting ? '...' : t.ctaButton}
                      </button>
                    </form>
                    {submitError && <p className="text-red-200 text-sm mb-4">{submitError}</p>}
                  </>
                )}
                <div className="flex items-center justify-center gap-2 text-blue-100">
                  <span>{t.ctaDirect}</span>
                  <button onClick={() => router.push(`/search?lang=${language}`)} className="text-white font-semibold underline hover:no-underline">
                    {t.tryBeta} →
                  </button>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Feedback CTA */}
      <section className="pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <RevealOnScroll>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 text-center">
              <Mail className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{t.feedbackTitle}</h3>
              <p className="text-gray-400 mb-5 max-w-md mx-auto">{t.feedbackDesc}</p>
              <a href="mailto:feedback@ktrix.ai" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-400 transition shadow-lg shadow-blue-500/20">
                ✉️ feedback@ktrix.ai
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="https://raw.githubusercontent.com/f8902621-byte/traxhome-mvp/main/Ktrixlogo.png" alt="K Trix" className="w-12 h-12 object-contain" />
              <p className="text-sm text-gray-500">{t.footerDesc}</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="mailto:contact@ktrix.ai" className="text-gray-500 hover:text-white transition">{t.footerContact}</a>
<a href="/privacy" className="text-gray-500 hover:text-white transition">{t.footerPrivacy}</a>
<a href="/terms" className="text-gray-500 hover:text-white transition">{t.footerTerms}</a>
              <a href="/monitoring" className="text-gray-500 hover:text-white transition">Status</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-600">
            {t.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
