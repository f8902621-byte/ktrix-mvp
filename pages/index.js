import { useState, useEffect, useRef } from 'react';
import SeoHead from '../components/SeoHead';
import { useRouter } from 'next/router';
import { Search, TrendingUp, Clock, Shield, ChevronRight, Globe, Zap, Users, BarChart3, LogIn, AlertTriangle, Lightbulb, Trophy, Mail, ChevronDown, Plus, Minus } from 'lucide-react';
import AdBanner from '../components/AdBanner';

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

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-800/40 transition">
        <span className="text-white font-medium text-sm sm:text-base pr-4">{question}</span>
        {open ? <Minus className="w-4 h-4 text-blue-400 flex-shrink-0" /> : <Plus className="w-4 h-4 text-gray-500 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-800/60">
          <p className="pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  const [language, setLanguage] = useState('vn');
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    const target = stats?.total_listings || 21147;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      setAnimatedCount(current);
    }, 16);
    return () => clearInterval(timer);
  }, [stats]);
const [zoomOpen, setZoomOpen] = useState(false);
  useEffect(() => {
    fetch('/api/monitoring').then(r => r.json()).then(d => setStats(d.stats)).catch(() => {});
  }, []);

  const T = {
    vn: {
      tagline: 'Nền tảng Tìm kiếm BĐS Thông minh', login: 'Đăng nhập',
      heroTitle: 'Tìm kiếm BĐS trên', heroHighlight: '65% thị trường', heroSubtitle: 'Việt Nam',
      heroDesc: 'K Trix tổng hợp dữ liệu từ nhiều nguồn uy tín, giúp môi giới tiết kiệm thời gian và không bỏ lỡ cơ hội.',
      tryBeta: 'Dùng thử miễn phí', learnMore: 'Tìm hiểu thêm',
      statSources: 'Nguồn dữ liệu', statListings: 'Tin đăng trong cơ sở dữ liệu', statCoverage: 'Độ phủ thị trường', statCities: 'Tỉnh thành',
      sourceActive: 'Đang hoạt động', sourceComingSoon: 'Sắp ra mắt',
      benefitsTitle: 'Tại sao Môi giới chọn K Trix?', benefitsDesc: 'Công cụ được thiết kế dành riêng cho chuyên gia BĐS',
      benefit1Title: 'Tiết kiệm 80% thời gian', benefit1Desc: 'Không cần mở từng trang web. Tất cả tin đăng ở một nơi, lọc theo tiêu chí của bạn.',
      benefit2Title: 'Phát hiện cơ hội', benefit2Desc: 'AI phát hiện từ khóa "bán gấp", "kẹt tiền" - những cơ hội đàm phán tốt nhất.',
      benefit3Title: 'Dữ liệu tin cậy', benefit3Desc: 'Tự động loại bỏ tin trùng, xác minh thông tin, hiển thị trạng thái pháp lý.',
      benefit4Title: 'Cập nhật realtime', benefit4Desc: 'Nhận thông báo khi có tin mới phù hợp. Luôn đi trước đối thủ.',
      howTitle: 'Cách hoạt động', howDesc: 'Đơn giản như 1-2-3',
      step1Title: 'Chọn tiêu chí', step1Desc: 'Thành phố, loại BĐS, ngân sách, diện tích...',
      step2Title: 'K Trix tìm kiếm', step2Desc: 'Quét tất cả nguồn dữ liệu trong vài giây',
      step3Title: 'Xem kết quả', step3Desc: 'Danh sách được sắp xếp, lọc sẵn, sẵn sàng liên hệ',
      aiReportTitle: 'Báo cáo AI — Phân tích chuyên sâu từng bất động sản',
      aiReportDesc: 'Mỗi bất động sản đều được AI phân tích toàn diện: điểm đàm phán, so sánh giá thị trường, tín hiệu bán gấp và hồ sơ pháp lý.',
      aiScoreTitle: 'Điểm đàm phán', aiScoreDesc: 'Điểm từ 0–100% cho biết tiềm năng thương lượng giá. Điểm càng cao, cơ hội đàm phán càng lớn.', aiScoreBadge: '65% = Tốt',
      aiPriceTitle: 'So sánh giá thị trường', aiPriceDesc: 'Giá bất động sản so với giá trung bình cùng quận. +19% nghĩa là giá cao hơn thị trường 19%.', aiPriceBadge: '+19% vs thị trường',
      aiSignalsTitle: 'Tín hiệu đàm phán', aiSignalsDesc: 'AI phát hiện từ khóa "bán gấp", "kẹt tiền", giá chẵn, pháp lý — các yếu tố ảnh hưởng đến điểm số.', aiSignalsBadge: 'Bán gấp · Kẹt tiền · Giá tốt',
      ctaTitle: 'Sẵn sàng thử nghiệm?', ctaDesc: 'Tham gia chương trình Beta miễn phí cho Môi giới BĐS',
      ctaButton: 'Đăng ký Beta', ctaDirect: 'Hoặc dùng thử ngay',
      footerDesc: 'Nền tảng tìm kiếm BĐS thông minh cho thị trường Việt Nam',
      footerContact: 'Liên hệ', footerPrivacy: 'Bảo mật', footerTerms: 'Điều khoản',
      copyright: '© 2026 K Trix. Đang phát triển.',
      welcomeTitle: 'Chào mừng đến với K Trix!',
      welcomeBravo: 'Xin chúc mừng bạn đã được chọn và cảm ơn bạn là một trong những người tiên phong.',
      welcomeDesc: 'Bạn đang sử dụng phiên bản đầu tiên của AI chuyên về bất động sản tại Việt Nam.',
      mvpTitle: 'Đang phát triển (và đổi mới)',
      mvpDesc: 'Ứng dụng này là MVP (Minimum Viable Product). Hãy coi nó như một viên kim cương thô. Nó có khả năng phân tích mạnh mẽ, nhưng chưa hoàn hảo. Bạn có thể gặp lỗi hoặc phân tích chưa chính xác. Đó là bình thường — và đó là lúc bạn tham gia.',
      roleTitle: 'Vai trò của bạn rất quan trọng', roleDesc: 'Chúng tôi không muốn đoán bạn cần gì — chúng tôi muốn bạn cho chúng tôi biết.',
      reportTitle: 'Báo cáo', reportDesc: 'Phân tích có vẻ không chính xác? Kết quả bất ngờ? Hãy cho chúng tôi biết để cải thiện AI.',
      suggestTitle: 'Đề xuất', suggestDesc: 'Thiếu tính năng cho quyết định của bạn? Cảnh báo? Xuất dữ liệu? Chia sẻ ý tưởng.',
      trainAI: 'Khi sử dụng phiên bản này, bạn không chỉ tìm kiếm hay bán BĐS — bạn đang đào tạo AI sẽ trở thành tiêu chuẩn thị trường.',
      rewardTitle: 'Phần thưởng Beta Tester', rewardDesc: 'Những beta tester tích cực nhất sẽ nhận quyền truy cập đặc biệt khi ra mắt chính thức.',
      rewardBadge: '🎁 6 tháng Premium miễn phí',
      feedbackTitle: 'Gửi nhận xét của bạn', feedbackDesc: 'Ảnh chụp màn hình, ý tưởng tính năng, lỗi phát hiện — mọi thứ đều quan trọng!',
      qualityTitle: 'Ít tin hơn, chính xác hơn', qualityDesc: 'K Trix không chỉ tổng hợp. AI lọc, loại trùng và xác minh từng kết quả.',
      dedup: 'Loại trùng lặp', dedupDesc: 'Tin trùng giữa các nguồn được tự động phát hiện và gộp.',
      activeListings: 'Tin còn hiệu lực', activeDesc: 'Khác các trang web khác, chúng tôi chỉ giữ tin còn hoạt động.',
      nlpTitle: 'Phân tích NLP', nlpDesc: 'AI trích xuất diện tích, tầng, bề rộng đường ngay cả khi không có dữ liệu cấu trúc.',
      explore: 'Khám phá ngay! 🎉', betaLimited: 'Beta Riêng — Giới hạn 20 người dùng',
      roadmapTitle: 'Sắp ra mắt', roadmapDesc: 'K Trix không ngừng phát triển',
      roadmapFacebook: 'Tích hợp nhóm Facebook BĐS', roadmapFacebookDesc: 'Hàng triệu tin đăng trực tiếp từ chủ nhà',
      roadmapAlerts: 'Tìm kiếm tự động & Cảnh báo', roadmapAlertsDesc: 'Nhận thông báo ngay khi có tin mới phù hợp',
      roadmapChinese: 'Phiên bản tiếng Trung', roadmapChineseDesc: 'Dành cho nhà đầu tư Trung Quốc & Đài Loan',
      roadmapKorean: 'Phiên bản tiếng Hàn', roadmapKoreanDesc: 'Cộng đồng Hàn Quốc tại Việt Nam',
      roadmapHistory: 'Lịch sử giá', roadmapHistoryDesc: 'Theo dõi xu hướng giá theo thời gian',
      roadmapMore: 'Và nhiều hơn nữa...',
      whatTitle: 'K Trix là gì?',
      whatDesc: 'K Trix (ktrix.ai) là nền tảng tìm kiếm bất động sản đầu tiên tại Việt Nam được hỗ trợ bởi trí tuệ nhân tạo. Thay vì phải mở nhiều tab trên các trang như Chotot, Batdongsan hay các nhóm Facebook, K Trix tự động tổng hợp và phân tích toàn bộ dữ liệu từ nhiều nguồn trong vài giây. AI của K Trix hiểu ngôn ngữ tự nhiên, trích xuất thông tin quan trọng (giá, diện tích, vị trí, pháp lý) và phát hiện các cơ hội đàm phán như tin "bán gấp" hay "kẹt tiền". Nền tảng phục vụ môi giới BĐS, nhà đầu tư và người mua nhà tại Việt Nam, với giao diện hỗ trợ tiếng Việt, tiếng Anh và tiếng Pháp.',
      faqTitle: 'Câu hỏi thường gặp',
      faqs: [
        { q: 'K Trix hoạt động như thế nào?', a: 'K Trix sử dụng AI để tự động thu thập và phân tích tin đăng từ nhiều nguồn BĐS lớn tại Việt Nam. Hệ thống loại bỏ tin trùng, trích xuất thông tin quan trọng và hiển thị kết quả đã được lọc và sắp xếp theo tiêu chí của bạn.' },
        { q: 'K Trix phủ được bao nhiêu % thị trường BĐS Việt Nam?', a: 'Hiện tại K Trix đang trong giai đoạn beta và phủ khoảng 65% thị trường với hơn 21.000 tin đăng từ 2 nguồn chính. Chúng tôi đang tích hợp thêm các nguồn mới bao gồm các nhóm Facebook BĐS lớn.' },
        { q: 'K Trix dành cho ai?', a: 'K Trix được thiết kế chủ yếu cho môi giới BĐS chuyên nghiệp, nhà đầu tư và người mua nhà tại Việt Nam. Giao diện đa ngôn ngữ (VN/EN/FR) cũng phục vụ người nước ngoài đang tìm kiếm bất động sản tại Việt Nam.' },
        { q: 'K Trix có miễn phí không?', a: 'Hoàn toàn miễn phí trong giai đoạn Beta. Các tính năng nâng cao sẽ được ra mắt theo gói Premium sau khi ra mắt chính thức. Những beta tester tích cực sẽ nhận 6 tháng Premium miễn phí.' },
        { q: '"Bán gấp" và "kẹt tiền" được phát hiện như thế nào?', a: 'AI của K Trix phân tích nội dung văn bản của từng tin đăng bằng xử lý ngôn ngữ tự nhiên (NLP). Hệ thống nhận diện các từ khóa và ngữ cảnh cho thấy người bán đang trong tình trạng cần thanh lý nhanh, tạo cơ hội đàm phán tốt hơn cho người mua.' },
        { q: 'Điểm đàm phán được tính như thế nào?', a: 'Điểm đàm phán tổng hợp 4 yếu tố: (1) từ khóa khẩn cấp trong tin đăng như "bán gấp", "kẹt tiền", (2) độ lệch giá so với trung bình cùng quận, (3) thời gian đăng tin, (4) pháp lý của bất động sản. Điểm 65–100% = cơ hội tốt, 40–64% = trung bình, dưới 40% = hạn chế.' },
      ],
    },
    en: {
      tagline: 'Smart Real Estate Search Platform', login: 'Login',
      heroTitle: 'Search properties across', heroHighlight: '65% of the market', heroSubtitle: 'in Vietnam',
      heroDesc: 'K Trix aggregates data from multiple trusted sources, helping agents save time and never miss an opportunity.',
      tryBeta: 'Try for free', learnMore: 'Learn more',
      statSources: 'Data sources', statListings: 'Listings in database', statCoverage: 'Market coverage', statCities: 'Provinces',
      sourceActive: 'Active', sourceComingSoon: 'Coming soon',
      benefitsTitle: 'Why Agents choose K Trix?', benefitsDesc: 'Tools designed specifically for real estate professionals',
      benefit1Title: 'Save 80% of your time', benefit1Desc: 'No need to browse multiple websites. All listings in one place, filtered by your criteria.',
      benefit2Title: 'Spot opportunities', benefit2Desc: 'AI detects "urgent sale", "need cash" keywords - the best negotiation opportunities.',
      benefit3Title: 'Reliable data', benefit3Desc: 'Automatic duplicate removal, verified information, legal status displayed.',
      benefit4Title: 'Real-time updates', benefit4Desc: 'Get notified when new matching listings appear. Always stay ahead.',
      howTitle: 'How it works', howDesc: 'Simple as 1-2-3',
      step1Title: 'Set criteria', step1Desc: 'City, property type, budget, area...',
      step2Title: 'K Trix searches', step2Desc: 'Scans all data sources in seconds',
      step3Title: 'View results', step3Desc: 'Sorted, filtered list ready to contact',
      aiReportTitle: 'AI Report — In-depth analysis for every property',
      aiReportDesc: 'Every property gets a full AI analysis: negotiation score, market price comparison, urgent sale signals and legal profile.',
      aiScoreTitle: 'Negotiation Score', aiScoreDesc: 'A 0–100% score indicating negotiation potential. The higher the score, the greater the opportunity to negotiate the price down.', aiScoreBadge: '65% = Good opportunity',
      aiPriceTitle: 'Price vs Market', aiPriceDesc: 'Property price compared to the district median. +19% means the listing is 19% above market — useful context for your offer.', aiPriceBadge: '+19% vs market',
      aiSignalsTitle: 'Negotiation Signals', aiSignalsDesc: 'AI detects "urgent sale", "need cash", round prices, legal status — all factors that affect the final score.', aiSignalsBadge: 'Urgent sale · Need cash · Good price',
      ctaTitle: 'Ready to try?', ctaDesc: 'Join the free Beta program for Real Estate Agents',
      ctaButton: 'Join Beta', ctaDirect: 'Or try it now',
      footerDesc: 'Smart real estate search platform for the Vietnam market',
      footerContact: 'Contact', footerPrivacy: 'Privacy', footerTerms: 'Terms',
      copyright: '© 2026 K Trix. In development.',
      welcomeTitle: 'Welcome to the K Trix adventure!',
      welcomeBravo: 'Congratulations on being selected and thank you for being among our pioneers.',
      welcomeDesc: 'You have in your hands the very first version of our AI dedicated to real estate in Vietnam.',
      mvpTitle: 'Under construction (and innovation)',
      mvpDesc: 'This application is an MVP (Minimum Viable Product). Think of it as a rough diamond. It is capable of analytical prowess, but it is not yet perfect. You may encounter bugs or improvable analyses. This is normal — and this is where you come in.',
      roleTitle: 'Your role is crucial', roleDesc: "We don't want to guess what you need — we want you to tell us.",
      reportTitle: 'Report', reportDesc: 'An analysis seems incoherent? A surprising result? Let us know to improve AI accuracy.',
      suggestTitle: 'Suggest', suggestDesc: 'A feature is missing for your decision-making? Alerts? Exports? Share your ideas.',
      trainAI: "By using this version, you're not just searching or selling a property — you're training the AI that will become the market reference.",
      rewardTitle: 'Beta Tester Reward', rewardDesc: 'The most active beta testers will receive privileged access at official launch.',
      rewardBadge: '🎁 6 months of Premium subscription free',
      feedbackTitle: 'Send us your feedback', feedbackDesc: 'Screenshots, feature ideas, bugs encountered — everything matters!',
      qualityTitle: 'Fewer listings, more relevance', qualityDesc: "K Trix doesn't just aggregate. Our AI filters, deduplicates and verifies each result.",
      dedup: 'Deduplication', dedupDesc: 'Duplicate listings across sources are automatically detected and merged.',
      activeListings: 'Active listings', activeDesc: 'Unlike sites that inflate their numbers, we only keep listings still online.',
      nlpTitle: 'NLP Analysis', nlpDesc: 'Our AI extracts key info (area, floors, street width) even when unstructured.',
      explore: 'Happy exploring! 🎉', betaLimited: 'Private Beta — Limited to 20 users',
      roadmapTitle: 'Coming soon', roadmapDesc: 'K Trix is constantly evolving',
      roadmapFacebook: 'Facebook Real Estate Groups', roadmapFacebookDesc: 'Millions of direct listings from property owners',
      roadmapAlerts: 'Automatic search & Alerts', roadmapAlertsDesc: 'Get notified instantly when new matching listings appear',
      roadmapChinese: 'Chinese version', roadmapChineseDesc: 'For Chinese & Taiwanese investors',
      roadmapKorean: 'Korean version', roadmapKoreanDesc: 'Korean community in Vietnam',
      roadmapHistory: 'Price history', roadmapHistoryDesc: 'Track price trends over time',
      roadmapMore: 'And much more...',
      whatTitle: 'What is K Trix?',
      whatDesc: "K Trix (ktrix.ai) is Vietnam's first AI-powered real estate search platform. Instead of opening multiple tabs across Chotot, Batdongsan, or Facebook groups, K Trix automatically aggregates and analyzes data from multiple sources in seconds. K Trix's AI understands natural language, extracts key information (price, area, location, legal status) and detects negotiation opportunities such as \"urgent sale\" or \"need cash\" listings. The platform serves real estate agents, investors and homebuyers in Vietnam, with a multilingual interface supporting Vietnamese, English and French.",
      faqTitle: 'Frequently asked questions',
      faqs: [
        { q: 'How does K Trix work?', a: 'K Trix uses AI to automatically collect and analyze listings from major Vietnamese real estate sources. The system removes duplicates, extracts key information and displays filtered, ranked results based on your criteria.' },
        { q: 'How much of the Vietnamese real estate market does K Trix cover?', a: 'K Trix is currently in beta and covers approximately 65% of the market with over 21,000 listings from 2 main sources. We are integrating additional sources including major Facebook real estate groups.' },
        { q: 'Who is K Trix for?', a: 'K Trix is designed primarily for professional real estate agents, investors and homebuyers in Vietnam. The multilingual interface (VN/EN/FR) also serves foreigners searching for real estate in Vietnam.' },
        { q: 'Is K Trix free?', a: 'Completely free during the Beta period. Premium features will be launched after the official release. Active beta testers will receive 6 months of Premium for free.' },
        { q: 'How are "urgent sale" opportunities detected?', a: "K Trix's AI analyzes the text content of each listing using natural language processing (NLP). The system identifies keywords and context indicating the seller needs to sell quickly, creating better negotiation opportunities for buyers." },
        { q: 'How is the Negotiation Score calculated?', a: 'The Negotiation Score combines 4 factors: (1) urgent keywords such as "urgent sale" or "need cash", (2) price deviation from the district median, (3) listing age, (4) legal status. Score 65–100% = good opportunity, 40–64% = moderate, below 40% = limited.' },
      ],
    },
    fr: {
      tagline: 'Plateforme de Recherche Immobilière Intelligente', login: 'Connexion',
      heroTitle: 'Recherchez sur', heroHighlight: '65% du marché', heroSubtitle: 'immobilier au Vietnam',
      heroDesc: "K Trix agrège les données de multiples sources fiables, aidant les agents à gagner du temps et ne jamais manquer une opportunité.",
      tryBeta: 'Essai gratuit', learnMore: 'En savoir plus',
      statSources: 'Sources de données', statListings: 'Annonces en base', statCoverage: 'Couverture marché', statCities: 'Provinces',
      sourceActive: 'Actif', sourceComingSoon: 'Bientôt',
      benefitsTitle: 'Pourquoi les Agents choisissent K Trix?', benefitsDesc: 'Outils conçus spécifiquement pour les professionnels immobiliers',
      benefit1Title: 'Économisez 80% de temps', benefit1Desc: "Plus besoin de parcourir plusieurs sites. Toutes les annonces au même endroit, filtrées selon vos critères.",
      benefit2Title: 'Détectez les opportunités', benefit2Desc: "L'IA détecte \"vente urgente\", \"besoin d'argent\" - les meilleures opportunités de négociation.",
      benefit3Title: 'Données fiables', benefit3Desc: 'Suppression automatique des doublons, infos vérifiées, statut légal affiché.',
      benefit4Title: 'Mises à jour temps réel', benefit4Desc: "Soyez notifié des nouvelles annonces correspondantes. Gardez l'avance.",
      howTitle: 'Comment ça marche', howDesc: 'Simple comme 1-2-3',
      step1Title: 'Définir les critères', step1Desc: 'Ville, type de bien, budget, surface...',
      step2Title: 'K Trix recherche', step2Desc: 'Analyse toutes les sources en quelques secondes',
      step3Title: 'Voir les résultats', step3Desc: 'Liste triée, filtrée, prête à contacter',
      aiReportTitle: "Rapport IA — Analyse approfondie de chaque bien",
      aiReportDesc: "Chaque bien immobilier bénéficie d'une analyse IA complète : score de négociation, comparaison prix marché, signaux de vente urgente et profil juridique.",
      aiScoreTitle: 'Score de négociation', aiScoreDesc: 'Un score de 0 à 100% indiquant le potentiel de négociation. Plus le score est élevé, plus la marge de négociation est importante.', aiScoreBadge: '65% = Bonne opportunité',
      aiPriceTitle: 'Prix vs Marché', aiPriceDesc: "Le prix du bien comparé à la médiane du quartier. +19% signifie que le bien est 19% au-dessus du marché.", aiPriceBadge: '+19% vs marché',
      aiSignalsTitle: 'Signaux de négociation', aiSignalsDesc: "L'IA détecte les mots-clés d'urgence, les prix ronds, le statut légal — tous les facteurs qui influencent le score final.", aiSignalsBadge: 'Vente urgente · Prix rond · Statut légal',
      ctaTitle: 'Prêt à essayer?', ctaDesc: 'Rejoignez le programme Beta gratuit pour Agents Immobiliers',
      ctaButton: 'Rejoindre Beta', ctaDirect: 'Ou essayez maintenant',
      footerDesc: 'Plateforme de recherche immobilière intelligente pour le marché vietnamien',
      footerContact: 'Contact', footerPrivacy: 'Confidentialité', footerTerms: 'Conditions',
      copyright: '© 2026 K Trix. En développement.',
      welcomeTitle: "Bienvenue dans l'aventure K Trix !",
      welcomeBravo: "Bravo d'avoir été sélectionné et merci d'être parmi nos pionniers.",
      welcomeDesc: "Vous avez entre les mains la toute première version de notre intelligence artificielle dédiée à l'immobilier au Vietnam.",
      mvpTitle: "Zone de travaux (et d'innovation)",
      mvpDesc: "Cette application est un MVP (Minimum Viable Product). Considérez-la comme un diamant brut. Elle est capable de prouesses analytiques, mais elle n'est pas encore parfaite. Vous rencontrerez peut-être des bugs ou des analyses perfectibles. C'est normal — et c'est là que vous intervenez.",
      roleTitle: 'Votre rôle est capital', roleDesc: "Nous ne voulons pas deviner ce dont vous avez besoin — nous voulons que vous nous le disiez.",
      reportTitle: 'Signalez', reportDesc: "Une analyse vous semble incohérente ? Un résultat surprenant ? Dites-le-nous pour améliorer la précision de l'IA.",
      suggestTitle: 'Proposez', suggestDesc: "Une fonctionnalité manque pour votre prise de décision ? Alertes ? Exports ? Partagez vos idées.",
      trainAI: "En utilisant cette version, vous ne faites pas que chercher ou vendre un bien — vous entraînez l'IA qui deviendra demain la référence du marché.",
      rewardTitle: 'Récompense Beta Testeurs', rewardDesc: 'Les bêta-testeurs les plus actifs recevront un accès privilégié lors du lancement officiel.',
      rewardBadge: "🎁 6 mois d'abonnement Premium offerts",
      feedbackTitle: 'Envoyez-nous vos observations', feedbackDesc: "Captures d'écran, idées de fonctionnalités, bugs rencontrés — tout nous intéresse !",
      qualityTitle: "Moins d'annonces, plus de pertinence", qualityDesc: "K Trix ne se contente pas d'agréger. Notre IA filtre, déduplique et vérifie chaque résultat.",
      dedup: 'Déduplication', dedupDesc: 'Les annonces en double entre les différentes sources sont automatiquement détectées et fusionnées.',
      activeListings: 'Annonces actives', activeDesc: "Contrairement aux sites qui gonflent leurs chiffres, nous ne gardons que les annonces encore en ligne.",
      nlpTitle: 'Analyse NLP', nlpDesc: "Notre IA extrait les informations clés (surface, étages, largeur de rue) même quand elles ne sont pas structurées.",
      explore: 'Bonne exploration ! 🎉', betaLimited: 'Beta Privée — Limitée à 20 testeurs',
      roadmapTitle: 'Bientôt disponible', roadmapDesc: 'K Trix évolue en permanence',
      roadmapFacebook: 'Groupes Facebook Immobilier', roadmapFacebookDesc: "Des millions d'annonces directes de propriétaires",
      roadmapAlerts: 'Recherche automatique & Alertes', roadmapAlertsDesc: 'Soyez notifié instantanément des nouvelles annonces',
      roadmapChinese: 'Version chinoise', roadmapChineseDesc: 'Pour les investisseurs chinois & taïwanais',
      roadmapKorean: 'Version coréenne', roadmapKoreanDesc: 'Communauté coréenne au Vietnam',
      roadmapHistory: 'Historique des prix', roadmapHistoryDesc: "Suivez l'évolution des prix dans le temps",
      roadmapMore: 'Et bien plus encore...',
      whatTitle: "Qu'est-ce que K Trix ?",
      whatDesc: "K Trix (ktrix.ai) est la première plateforme de recherche immobilière au Vietnam propulsée par l'intelligence artificielle. Au lieu d'ouvrir de multiples onglets sur Chotot, Batdongsan ou des groupes Facebook, K Trix agrège et analyse automatiquement les données de multiples sources en quelques secondes. L'IA de K Trix comprend le langage naturel, extrait les informations clés (prix, surface, localisation, statut légal) et détecte les opportunités de négociation comme les annonces \"vente urgente\" ou \"besoin d'argent\". La plateforme s'adresse aux agents immobiliers, investisseurs et acheteurs au Vietnam, avec une interface multilingue en vietnamien, anglais et français.",
      faqTitle: 'Questions fréquentes',
      faqs: [
        { q: 'Comment fonctionne K Trix ?', a: "K Trix utilise l'IA pour collecter et analyser automatiquement les annonces des principales sources immobilières vietnamiennes. Le système supprime les doublons, extrait les informations clés et affiche des résultats filtrés et classés selon vos critères." },
        { q: 'Quelle part du marché immobilier vietnamien K Trix couvre-t-il ?', a: "K Trix est actuellement en bêta et couvre environ 65% du marché avec plus de 21 000 annonces issues de 2 sources principales. Nous intégrons de nouvelles sources dont les grands groupes Facebook immobiliers." },
        { q: "À qui s'adresse K Trix ?", a: "K Trix est conçu principalement pour les agents immobiliers professionnels, les investisseurs et les acheteurs au Vietnam. L'interface multilingue (VN/EN/FR) s'adresse également aux étrangers cherchant un bien immobilier au Vietnam." },
        { q: 'K Trix est-il gratuit ?', a: "Complètement gratuit pendant la période Bêta. Des fonctionnalités Premium seront lancées après la sortie officielle. Les bêta-testeurs actifs recevront 6 mois de Premium offerts." },
        { q: 'Comment les opportunités "vente urgente" sont-elles détectées ?', a: "L'IA de K Trix analyse le contenu textuel de chaque annonce par traitement du langage naturel (NLP). Le système identifie les mots-clés et le contexte indiquant que le vendeur doit vendre rapidement, créant de meilleures opportunités de négociation." },
        { q: 'Comment est calculé le Score de négociation ?', a: "Le Score de négociation combine 4 facteurs : (1) les mots-clés d'urgence dans l'annonce, (2) l'écart de prix par rapport à la médiane du quartier, (3) l'ancienneté de l'annonce, (4) le statut juridique du bien. Score 65–100% = bonne opportunité, 40–64% = moyen, en dessous de 40% = limité." },
      ],
    },
  };

  const t = T[language];

  const sources = [
    { name: 'Chotot.com', active: true },
    { name: 'Alonhadat.com.vn', active: true },
    { name: 'Facebook Groups', active: false, highlight: true },
    { name: 'Batdongsan.com.vn', active: false },
    { name: 'Nhadat247.com.vn', active: false },
    { name: 'Homedy.com', active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <SeoHead path="/" />

      <header className="fixed top-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Ktrixlogo.png" alt="K Trix" className="w-20 h-20 object-contain" />
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30">BETA</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="px-2 sm:px-3 py-2 text-sm border border-gray-700 rounded-lg bg-gray-900 text-gray-300 hover:border-gray-600 transition cursor-pointer focus:outline-none focus:border-blue-500">
              <option value="vn">🇻🇳 VN</option>
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            <button onClick={() => router.push(`/login?lang=${language}`)} className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition">
              <LogIn className="w-4 h-4" />{t.login}
            </button>
            <button onClick={() => router.push(`/beta?lang=${language}`)}
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-500 hover:to-cyan-400 transition shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tryBeta}</span>
              <span className="sm:hidden">Go</span>
            </button>
          </div>
        </div>
      </header>

      <div style={{paddingTop: 70}}><AdBanner language={language} /></div>

      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl"></div>
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gray-800/80 border border-gray-700/50 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-medium mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>{t.betaLimited}
              </div>
              <p className="text-blue-400 font-semibold mb-4 flex items-center gap-2"><Globe className="w-4 h-4" />{t.tagline}</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                {t.heroTitle}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{t.heroHighlight}</span>{' '}
                {t.heroSubtitle}
              </h1>
              <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed">{t.heroDesc}</p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button onClick={() => router.push(`/beta?lang=${language}`)}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-400 transition shadow-xl shadow-blue-500/25 flex items-center gap-2 text-base sm:text-lg">
                  {t.tryBeta}<ChevronRight className="w-5 h-5" />
                </button>
                <a href="#what-is-ktrix" className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition border border-gray-700 flex items-center gap-2">
                  {t.learnMore}<ChevronDown className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { icon: <BarChart3 className="w-6 h-6 text-cyan-400" />, value: '2', label: t.statSources, bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                { icon: <TrendingUp className="w-6 h-6 text-orange-400" />, value: animatedCount > 0 ? animatedCount.toLocaleString('fr-FR') : '21,000+', label: t.statListings, bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                { icon: <Shield className="w-6 h-6 text-blue-400" />, value: '65%', label: t.statCoverage, bg: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: true },
                { icon: <Globe className="w-6 h-6 text-emerald-400" />, value: '12+', label: t.statCities, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gray-900/80 rounded-2xl p-5 sm:p-6 border ${stat.border} backdrop-blur-sm hover:bg-gray-800/80 transition`}>
                  <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>{stat.icon}</div>
                  <p className={`text-2xl sm:text-3xl font-bold ${stat.gradient ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400' : 'text-white'}`}>{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What is K Trix */}
      <section id="what-is-ktrix" className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <div className="w-6 h-0.5 bg-blue-400"></div>K Trix
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t.whatTitle}</h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">{t.whatDesc}</p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Welcome */}
      <section id="welcome" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll>
            <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"></div>
              <div className="p-6 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t.welcomeTitle}</h2>
                <p className="text-emerald-400 font-medium text-lg mb-4">{t.welcomeBravo}</p>
                <p className="text-gray-400 text-base sm:text-lg mb-8">{t.welcomeDesc}</p>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 sm:p-6 mb-4 hover:border-amber-500/20 transition">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-3"><span className="text-2xl">🚧</span>{t.mvpTitle}</h3>
                  <p className="text-gray-400">{t.mvpDesc}</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 sm:p-6 mb-6 hover:border-blue-500/20 transition">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-3"><span className="text-2xl">🚀</span>{t.roleTitle}</h3>
                  <p className="text-gray-400">{t.roleDesc}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-red-500/30 transition">
                    <span className="absolute top-2 right-4 text-5xl font-bold text-gray-700/30 select-none">01</span>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 text-red-400" />{t.reportTitle}</h4>
                    <p className="text-gray-400 text-sm">{t.reportDesc}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-400 opacity-0 group-hover:opacity-100 transition"></div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-blue-500/30 transition">
                    <span className="absolute top-2 right-4 text-5xl font-bold text-gray-700/30 select-none">02</span>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 mb-2"><Lightbulb className="w-5 h-5 text-blue-400" />{t.suggestTitle}</h4>
                    <p className="text-gray-400 text-sm">{t.suggestDesc}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition"></div>
                  </div>
                </div>
                <p className="text-gray-300 text-base sm:text-lg text-center italic mb-8">{t.trainAI}</p>
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
            <div className="flex flex-wrap justify-center gap-3">
              {sources.filter(s => s.active).map((source, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/30"></span>
                  <div><p className="font-semibold text-white text-sm">{source.name}</p><p className="text-emerald-400 text-xs">{t.sourceActive}</p></div>
                </div>
              ))}
              {sources.filter(s => !s.active).map((source, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl px-5 py-3 border transition ${source.highlight ? 'bg-blue-500/10 border-blue-500/30 opacity-90' : 'bg-gray-900/50 border-gray-800/50 opacity-50'}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${source.highlight ? 'bg-blue-400' : 'bg-gray-600'}`}></span>
                  <div>
                    <p className={`font-medium text-sm ${source.highlight ? 'text-blue-300' : 'text-gray-400'}`}>{source.name}</p>
                    <p className={`text-xs ${source.highlight ? 'text-blue-400 font-semibold' : 'text-gray-600'}`}>{source.highlight ? '🔜 ' : ''}{t.sourceComingSoon}</p>
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Benefits */}
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
                  <div className={`w-14 h-14 ${benefit.bg} rounded-2xl flex items-center justify-center mb-5`}>{benefit.icon}</div>
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
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-xl shadow-blue-500/25">{num}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{t[`step${num}Title`]}</h3>
                  <p className="text-gray-500">{t[`step${num}Desc`]}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── AI REPORT ── */}
      <section id="ai-report" className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <div className="w-6 h-0.5 bg-cyan-400"></div>AI Report
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.aiReportTitle}</h2>
            <p className="text-gray-400 text-base sm:text-lg mb-10">{t.aiReportDesc}</p>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Screenshot */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-2xl blur-sm"></div>
                <div className="relative cursor-zoom-in" onClick={() => setZoomOpen(true)}>
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                    </div>
                    <span className="text-gray-500 text-xs ml-2">K Trix — AI Report</span><span className="ml-auto text-gray-600 text-xs">🔍 Click to zoom</span>
                  </div>
                  <img src="/ai-report-preview.png" alt="K Trix AI Report — Negotiation Score, Price vs Market, Property Analysis"
                    className="w-full object-contain" style={{ maxHeight: 580 }} />
                </div>
              </div>
              {/* Explications */}
              <div className="space-y-5">
                {[
                  { icon: '🎯', color: 'border-cyan-500/30 bg-cyan-500/5', iconBg: 'bg-cyan-500/10', title: t.aiScoreTitle, desc: t.aiScoreDesc, badge: t.aiScoreBadge, badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
                  { icon: '📊', color: 'border-orange-500/30 bg-orange-500/5', iconBg: 'bg-orange-500/10', title: t.aiPriceTitle, desc: t.aiPriceDesc, badge: t.aiPriceBadge, badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
                  { icon: '⚡', color: 'border-blue-500/30 bg-blue-500/5', iconBg: 'bg-blue-500/10', title: t.aiSignalsTitle, desc: t.aiSignalsDesc, badge: t.aiSignalsBadge, badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
                ].map((item, i) => (
                  <div key={i} className={`rounded-2xl border p-5 sm:p-6 ${item.color} transition`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 text-xl`}>{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-3">{item.desc}</p>
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${item.badgeColor}`}>{item.badge}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => router.push(`/beta?lang=${language}`)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:from-blue-500 hover:to-cyan-400 transition shadow-lg shadow-blue-500/20">
                  {t.tryBeta} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
{zoomOpen && (
  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
    onClick={() => setZoomOpen(false)}>
    <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
      <button onClick={() => setZoomOpen(false)}
        className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm">
        ✕ Close
      </button>
      <img src="/ai-report-preview.png" alt="K Trix AI Report"
        className="w-full rounded-2xl shadow-2xl border border-gray-700" />
    </div>
  </div>
)}
          </RevealOnScroll>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                🚀 {t.roadmapTitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.roadmapDesc}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '📱', title: t.roadmapFacebook, desc: t.roadmapFacebookDesc },
                { icon: '🔔', title: t.roadmapAlerts, desc: t.roadmapAlertsDesc },
                { icon: '🇨🇳', title: t.roadmapChinese, desc: t.roadmapChineseDesc },
                { icon: '🇰🇷', title: t.roadmapKorean, desc: t.roadmapKoreanDesc },
                { icon: '📈', title: t.roadmapHistory, desc: t.roadmapHistoryDesc },
                { icon: '✨', title: t.roadmapMore, desc: '' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 hover:border-gray-700 transition relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/2 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                  <span className="text-3xl mb-3 block">{item.icon}</span>
                  <h4 className="font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  <span className="inline-block mt-3 text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded-full border border-gray-700">{t.sourceComingSoon}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <RevealOnScroll>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <div className="w-6 h-0.5 bg-blue-400"></div>FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">{t.faqTitle}</h2>
            <div className="space-y-3">
              {t.faqs.map((item, i) => (<FaqItem key={i} question={item.q} answer={item.a} />))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-900/50">
        <div className="max-w-2xl mx-auto">
          <RevealOnScroll>
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                  <Users className="w-4 h-4" />Beta Program
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t.ctaTitle}</h2>
                <p className="text-blue-100 text-base sm:text-lg mb-8">{t.ctaDesc}</p>
                <button onClick={() => router.push(`/beta?lang=${language}`)}
                  className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg text-lg mb-6">
                  {t.ctaButton} →
                </button>
                <div className="flex items-center justify-center gap-2 text-blue-100">
                  <span>{t.ctaDirect}</span>
                  <button onClick={() => router.push(`/beta?lang=${language}`)} className="text-white font-semibold underline hover:no-underline">{t.tryBeta} →</button>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Feedback */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
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
              <img src="/Ktrixlogo.png" alt="K Trix" className="w-20 h-20 object-contain" />
              <div>
                <p className="text-sm text-gray-500">{t.footerDesc}</p>
                <p className="text-xs text-gray-600 mt-1">Ho Chi Minh City, Vietnam — <a href="mailto:contact@ktrix.ai" className="hover:text-gray-400 transition">contact@ktrix.ai</a></p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="mailto:contact@ktrix.ai" className="text-gray-500 hover:text-white transition">{t.footerContact}</a>
              <a href="/privacy" className="text-gray-500 hover:text-white transition">{t.footerPrivacy}</a>
              <a href="/terms" className="text-gray-500 hover:text-white transition">{t.footerTerms}</a>
              <a href="#faq" className="text-gray-500 hover:text-white transition">FAQ</a>
              <a href="/monitoring" className="text-gray-500 hover:text-white transition">Status</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-600">{t.copyright}</div>
        </div>
      </footer>
    </div>
  );
}
