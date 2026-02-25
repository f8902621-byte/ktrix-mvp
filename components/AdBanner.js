// ============================================
// KTRIX - AD BANNER COMPONENT
// Responsive: 320x100 mobile / 728x90 desktop
// Auto-rotation every 6 seconds
// MVP: K Trix self-promotion
// Future: Replace with paid advertiser content
// ============================================

import { useState, useEffect } from 'react';

// === BANNER DATA ===
// During MVP: K Trix self-promotion
// Future: Replace with advertiser data from API/database
const BANNERS = [
  {
    id: 1,
    gradient: 'linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #0d2137 100%)',
    icon: '🤖',
    titleVn: 'K Trix — Trí tuệ nhân tạo cho Bất động sản',
    titleEn: 'K Trix — AI-Powered Real Estate',
    titleFr: 'K Trix — L\'IA au service de l\'Immobilier',
    subtitleVn: 'Phân tích thông minh • Dữ liệu xác minh • Điểm đàm phán',
    subtitleEn: 'Smart Analysis • Verified Data • Negotiation Score',
    subtitleFr: 'Analyse intelligente • Données vérifiées • Score de négociation',
    accentColor: '#00d4ff',
  },
  {
    id: 2,
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)',
    icon: '📊',
    titleVn: '10.000+ tin đăng đã được phân tích bởi AI',
    titleEn: '10,000+ Listings Analyzed by AI',
    titleFr: '10 000+ annonces analysées par l\'IA',
    subtitleVn: 'Chotot • Alonhadat • Cập nhật hàng ngày',
    subtitleEn: 'Chotot • Alonhadat • Updated Daily',
    subtitleFr: 'Chotot • Alonhadat • Mise à jour quotidienne',
    accentColor: '#a855f7',
  },
  {
    id: 3,
    gradient: 'linear-gradient(135deg, #0a2818 0%, #1a4a2e 50%, #0a2818 100%)',
    icon: '🎯',
    titleVn: 'Tiết kiệm 70% thời gian tìm kiếm',
    titleEn: 'Save 70% of Your Search Time',
    titleFr: 'Économisez 70% de temps de recherche',
    subtitleVn: 'So sánh giá • Pháp lý rõ ràng • Cơ hội đầu tư',
    subtitleEn: 'Price Comparison • Legal Clarity • Investment Signals',
    subtitleFr: 'Comparaison prix • Clarté juridique • Signaux d\'investissement',
    accentColor: '#00ff88',
  },
  {
    id: 4,
    gradient: 'linear-gradient(135deg, #2a1a0a 0%, #4a2e1a 50%, #2a1a0a 100%)',
    icon: '🏆',
    titleVn: 'Nền tảng BĐS thông minh #1 Việt Nam',
    titleEn: '#1 Smart Real Estate Platform in Vietnam',
    titleFr: 'Plateforme immobilière intelligente #1 au Vietnam',
    subtitleVn: 'Công nghệ mới • Dữ liệu minh bạch • Quyết định thông minh',
    subtitleEn: 'New Technology • Transparent Data • Smart Decisions',
    subtitleFr: 'Nouvelle technologie • Données transparentes • Décisions intelligentes',
    accentColor: '#ff8c00',
  },
  {
    id: 5,
    gradient: 'linear-gradient(135deg, #1a0a0a 0%, #4a1a1a 50%, #2a0a0a 100%)',
    icon: '⚡',
    titleVn: 'Đàm phán thông minh hơn với K Trix',
    titleEn: 'Negotiate Smarter with K Trix',
    titleFr: 'Négociez plus intelligemment avec K Trix',
    subtitleVn: 'Điểm số AI • Phân tích giá • Tín hiệu thị trường',
    subtitleEn: 'AI Score • Price Analysis • Market Signals',
    subtitleFr: 'Score IA • Analyse des prix • Signaux du marché',
    accentColor: '#ff4444',
  },
];

const ROTATION_INTERVAL = 6000; // 6 seconds

export default function AdBanner({ language = 'en' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
        setIsTransitioning(false);
      }, 400); // fade out duration
    }, ROTATION_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[currentIndex];
  const title = language === 'vn' ? banner.titleVn : language === 'fr' ? banner.titleFr : banner.titleEn;
  const subtitle = language === 'vn' ? banner.subtitleVn : language === 'fr' ? banner.subtitleFr : banner.subtitleEn;

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '8px 16px 0',
    }}>
      <div
        style={{
          background: banner.gradient,
          borderRadius: 10,
          border: `1px solid ${banner.accentColor}33`,
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          width: '100%',
          maxWidth: 728,
          height: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.4s ease-in-out, background 0.4s ease-in-out',
          boxShadow: `0 0 20px ${banner.accentColor}15`,
        }}
      >
        {/* Accent line top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 2,
          background: `linear-gradient(90deg, transparent, ${banner.accentColor}, transparent)`,
        }} />

        {/* Content */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          width: '100%',
        }}>
          {/* Icon */}
          <span style={{ fontSize: 28, flexShrink: 0 }}>{banner.icon}</span>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {title}
            </p>
            <p style={{
              color: banner.accentColor,
              fontSize: 11,
              fontWeight: 500,
              margin: '4px 0 0',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              opacity: 0.9,
            }}>
              {subtitle}
            </p>
          </div>

          {/* K Trix badge */}
          <div style={{
            flexShrink: 0,
            padding: '4px 10px',
            background: `${banner.accentColor}20`,
            border: `1px solid ${banner.accentColor}40`,
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            color: banner.accentColor,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            K Trix
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 2,
          background: banner.accentColor,
          animation: `bannerProgress ${ROTATION_INTERVAL}ms linear infinite`,
          opacity: 0.6,
        }} />

        <style>{`
          @keyframes bannerProgress {
            from { width: 0%; }
            to { width: 100%; }
          }
          @media (max-width: 640px) {
            /* Mobile: 320x100 */
          }
        `}</style>
      </div>
    </div>
  );
}
