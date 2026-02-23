import { useState, useEffect } from 'react';
import { Search, Menu, Download, MapPin, AlertCircle, Loader, Home, Info, TrendingUp, TrendingDown, Minus, Database } from 'lucide-react';
import { useRouter } from 'next/router';
import { wardsByDistrict, premiumWards } from '../lib/wards-data';
import { NeedleGauge, PriceDistribution, ScoreBars, AlertBadge, SignalItem, NEON_CSS, NEON } from '../components/HolographicCharts';
export default function SearchPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('vn');
  //const [currency, setCurrency] = useState('VND');
  const [mode, setMode] = useState('buy');
  const [showSearch, setShowSearch] = useState(true);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [marketStats, setMarketStats] = useState([]);
  const [showMarketStats, setShowMarketStats] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const [sourceStats, setSourceStats] = useState({});
  const [filterSource, setFilterSource] = useState(null);
  const [bdsTaskId, setBdsTaskId] = useState(null);
  const [bdsStatus, setBdsStatus] = useState('idle');
  const [bdsProgress, setBdsProgress] = useState(0);
  const [bdsCount, setBdsCount] = useState(0);
  const [alonhadatLoading, setAlonhadatLoading] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  useEffect(() => {
  if (typeof window !== 'undefined') {
    const betaCode = localStorage.getItem('ktrix_beta_code');
    if (!betaCode) {
      router.push('/beta');
    }
  }
}, []);
  const [searchParams, setSearchParams] = useState({
    city: '',
    district: '',
    ward: '',
    propertyType: '',
    priceMin: '',
    priceMax: '',
    livingAreaMin: '',
    livingAreaMax: '',
    bedrooms: '',
    bathrooms: '',
    hasParking: false,
    hasPool: false,
    streetWidthMin: '',
    daysListed: '',
    legalStatus: '',
    customKeyword: '',
    sources: ['chotot', 'alonhadat'],
    keywords: [],
    keywordsOnly: false,
    maxResults: 200
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ktrix_searches');
      if (saved) setSavedSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (router.query.lang && ['vn', 'en', 'fr'].includes(router.query.lang)) {
      setLanguage(router.query.lang);
    }
  }, [router.query.lang]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedProperty(null);
        setExpandedPhoto(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (!bdsTaskId || bdsStatus !== 'polling') return;
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/bds-status?taskId=${bdsTaskId}`);
        const data = await response.json();
        
        if (data.success) {
          setBdsProgress(data.progress || 0);
          setBdsCount(data.listingsCount || 0);
          
          if (data.listings && data.listings.length > 0) {
            setResults(prev => {
              const existingIds = new Set(prev.map(r => r.id));
              const newBds = data.listings.filter(l => !existingIds.has(l.id));
              if (newBds.length > 0) {
                console.log(`BDS: +${newBds.length} nouvelles annonces`);
                return [...prev, ...newBds];
              }
              return prev;
            });
          }
          
          if (data.status === 'completed' || data.status === 'error') {
            setBdsStatus(data.status);
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error('BDS polling error:', err);
      }
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, [bdsTaskId, bdsStatus]);

  const t = {
    vn: {
      menu: 'Menu', searchParams: 'Tham số Tìm kiếm', backToHome: 'Trang chủ',
      city: 'Thành phố', district: 'Quận/Huyện', propertyType: 'Loại BDS',
      priceMin: 'Giá tối thiểu', priceMax: 'Giá tối đa', livingArea: 'Diện tích (m²)',
      bedrooms: 'Phòng ngủ', daysListed: 'Đăng trong (ngày)', legalStatus: 'Pháp lý',
      legalAll: 'Tất cả', legalSoHong: 'Sổ đỏ/Sổ hồng', legalHopdong: 'Hợp đồng mua bán', legalDangcho: 'Đang chờ sổ',
      customKeyword: 'Thêm từ khóa', customKeywordPlaceholder: 'Nhập từ khóa khác...',
      sources: 'Nguồn dữ liệu', keywords: 'Từ khóa Khẩn cấp (QUAN TRỌNG)',
      keywordsDesc: 'Những từ này cho thấy người bán gấp = cơ hội đàm phán tốt nhất!',
      search: 'Tìm kiếm', results: 'Kết quả', score: 'Điểm phù hợp',
      newListing: 'MỚI', urgentSale: 'GẤP', viewDetails: 'Xem chi tiết',
      export: 'Xuất Excel', lowestPrice: 'Giá thấp nhất', highestPrice: 'Giá cao nhất',
      loading: 'Đang tìm kiếm...', min: 'Tối thiểu', max: 'Tối đa',
      required: 'Trường bắt buộc: Thành phố - Loại BDS - Giá tối đa',
      selectCity: 'Chọn thành phố', selectDistrict: 'Chọn quận/huyện',
      selectType: 'Chọn loại BDS', allDistricts: 'Tất cả quận/huyện',
      buy: 'Mua', sell: 'Bán', sortScore: 'Điểm phù hợp',
      sortPriceAsc: 'Giá tăng dần', sortPriceDesc: 'Giá giảm dần', sortDateDesc: 'Mới nhất',
      close: 'Đóng', propertyDetails: 'Chi tiết BDS', postedOn: 'Ngày đăng',
      rooms: 'Phòng ngủ', bathrooms: 'Phòng tắm', viewOriginal: 'Xem bài gốc',
      saveSearch: 'Lưu tìm kiếm', savedSearches: 'Tìm kiếm đã lưu',
      noSavedSearches: 'Chưa có tìm kiếm nào được lưu',
      loadSearch: 'Tải', deleteSearch: 'Xóa', searchSaved: 'Đã lưu tìm kiếm!',
      hasParking: 'Parking', hasPool: 'Hồ bơi', streetWidth: 'Đường rộng (m)',
      noResults: 'Không tìm thấy kết quả',
      comingSoon: 'Sắp ra mắt',
      searchCriteria: 'Tiêu chí tìm kiếm',
      sourceResults: 'Kết quả theo nguồn',
      marketStats: 'Thống kê thị trường',
      avgPrice: 'Giá TB/m²',
      listings: 'Tin đăng',
      archive: 'Lưu trữ',
      trend: 'Xu hướng',
      maxResults: 'Kết quả tối đa/nguồn',
      price: 'Giá',
      keywordsLabel: 'Từ khóa',
      sourcesLabel: 'Nguồn',
      listingsInDistrict: 'tin trong quận này',
      progressConnecting: 'Đang kết nối nguồn...',
      progressFetching: 'Đang lấy tin đăng...',
      progressScoring: 'Đang phân tích và chấm điểm...',
      progressFinalizing: 'Đang hoàn tất...',
      progressDone: 'Hoàn tất!',
      progressTime: 'Đang tìm kiếm...',
      ward: 'Phường/Xã',
      wardAll: 'Tất cả phường/xã',
    },
    en: {
      menu: 'Menu', searchParams: 'Search Parameters', backToHome: 'Home',
      city: 'City', district: 'District', propertyType: 'Property Type',
      priceMin: 'Min Price', priceMax: 'Max Price', livingArea: 'Living Area (m²)',
      bedrooms: 'Bedrooms', daysListed: 'Listed within (days)', legalStatus: 'Legal Status',
      legalAll: 'All', legalSoHong: 'Red/Pink Book', legalHopdong: 'Sales Contract', legalDangcho: 'Pending',
      customKeyword: 'Add keyword', customKeywordPlaceholder: 'Enter custom keyword...',
      sources: 'Data Sources', keywords: 'Urgent Keywords (IMPORTANT)',
      keywordsDesc: 'These words indicate desperate sellers = best negotiation opportunity!',
      search: 'Search', results: 'Results', score: 'Match Score',
      newListing: 'NEW', urgentSale: 'URGENT', viewDetails: 'View Details',
      export: 'Export Excel', lowestPrice: 'Lowest Price', highestPrice: 'Highest Price',
      loading: 'Searching...', min: 'Min', max: 'Max',
      required: 'Required: City - Property Type - Max Price',
      selectCity: 'Select city', selectDistrict: 'Select district',
      selectType: 'Select type', allDistricts: 'All districts',
      buy: 'Buy', sell: 'Sell', sortScore: 'Match Score',
      sortPriceAsc: 'Price: Low to High', sortPriceDesc: 'Price: High to Low', sortDateDesc: 'Newest First',
      close: 'Close', propertyDetails: 'Property Details', postedOn: 'Posted on',
      rooms: 'Bedrooms', bathrooms: 'Bathrooms', viewOriginal: 'View Original',
      saveSearch: 'Save Search', savedSearches: 'Saved Searches',
      noSavedSearches: 'No saved searches yet',
      loadSearch: 'Load', deleteSearch: 'Delete', searchSaved: 'Search saved!',
      hasParking: 'Parking', hasPool: 'Pool', streetWidth: 'Street min (m)',
      noResults: 'No results found',
      comingSoon: 'Coming soon',
      searchCriteria: 'Search criteria',
      sourceResults: 'Results by source',
      marketStats: 'Market Statistics',
      avgPrice: 'Avg price/m²',
      listings: 'Listings',
      archive: 'Archive',
      trend: 'Trend',
      maxResults: 'Max results/source',
      price: 'Price',
      keywordsLabel: 'Keywords',
      sourcesLabel: 'Sources',
      listingsInDistrict: 'listings in this district',
      progressConnecting: 'Connecting to sources...',
      progressFetching: 'Fetching listings...',
      progressScoring: 'Analyzing and scoring...',
      progressFinalizing: 'Finalizing...',
      progressDone: 'Done!',
      progressTime: 'Searching sources...',
      ward: 'Ward',
      wardAll: 'All wards',
    },
    fr: {
      menu: 'Menu', searchParams: 'Paramètres', backToHome: 'Accueil',
      city: 'Ville', district: 'District', propertyType: 'Type de Bien',
      priceMin: 'Prix Min', priceMax: 'Prix Max', livingArea: 'Surface (m²)',
      bedrooms: 'Chambres', daysListed: 'Publié depuis (jours)', legalStatus: 'Statut légal',
      legalAll: 'Tous', legalSoHong: 'Sổ đỏ/Sổ hồng', legalHopdong: 'Contrat de vente', legalDangcho: 'En attente',
      customKeyword: 'Ajouter mot-clé', customKeywordPlaceholder: 'Entrer un mot-clé...',
      sources: 'Sources de données', keywords: 'Mots-clés Urgents (IMPORTANT)',
      keywordsDesc: 'Ces mots indiquent un vendeur pressé = meilleure opportunité de négociation!',
      search: 'Rechercher', results: 'Résultats', score: 'Score',
      newListing: 'NOUVEAU', urgentSale: 'URGENT', viewDetails: 'Détails',
      export: 'Exporter', lowestPrice: 'Prix Min', highestPrice: 'Prix Max',
      loading: 'Recherche...', min: 'Min', max: 'Max',
      required: 'Requis: Ville - Type - Prix Max',
      selectCity: 'Choisir ville', selectDistrict: 'Choisir district',
      selectType: 'Choisir type', allDistricts: 'Tous les districts',
      buy: 'Achat', sell: 'Vente', sortScore: 'Score',
      sortPriceAsc: 'Prix croissant', sortPriceDesc: 'Prix décroissant', sortDateDesc: 'Plus récent',
      close: 'Fermer', propertyDetails: 'Détails du bien', postedOn: 'Publié le',
      rooms: 'Chambres', bathrooms: 'Salle de bain', viewOriginal: 'Voir annonce originale',
      saveSearch: 'Sauvegarder', savedSearches: 'Recherches sauvegardées',
      noSavedSearches: 'Aucune recherche sauvegardée',
      loadSearch: 'Charger', deleteSearch: 'Supprimer', searchSaved: 'Recherche sauvegardée!',
      hasParking: 'Parking', hasPool: 'Piscine', streetWidth: 'Rue min (m)',
      noResults: 'Aucun résultat trouvé',
      comingSoon: 'Bientôt',
      searchCriteria: 'Critères de recherche',
      sourceResults: 'Résultats par source',
      marketStats: 'Statistiques du marché',
      avgPrice: 'Prix moy/m²',
      listings: 'Annonces',
      archive: 'Archive',
      trend: 'Tendance',
      maxResults: 'Résultats max/source',
      price: 'Prix',
      keywordsLabel: 'Mots-clés',
      sourcesLabel: 'Sources',
      listingsInDistrict: 'annonces dans ce district',
      progressConnecting: 'Connexion aux sources...',
      progressFetching: 'Récupération des annonces...',
      progressScoring: 'Analyse et scoring...',
      progressFinalizing: 'Finalisation...',
      progressDone: 'Terminé !',
      progressTime: 'Recherche en cours...',
      ward: 'Quartier',
      wardAll: 'Tous les quartiers',
    }
  }[language];

  const urgentKeywords = [
    { vn: 'Bán gấp', en: 'Urgent Sale', fr: 'Vente Urgente' },
    { vn: 'Bán nhanh', en: 'Quick Sale', fr: 'Vente Express' },
    { vn: 'Cần bán nhanh', en: 'Need Quick Sale', fr: 'Doit Vendre Vite' },
    { vn: 'Kẹt tiền', en: 'Need Money', fr: 'Besoin Argent' },
    { vn: 'Cần tiền', en: 'Need Cash', fr: 'Besoin Cash' },
    { vn: 'Giá rẻ', en: 'Cheap Price', fr: 'Prix Bas' },
    { vn: 'Ngộp bank', en: 'Bank Pressure', fr: 'Pression Banque' },
    { vn: 'Chính chủ', en: 'Direct Owner', fr: 'Propriétaire Direct' },
    { vn: 'Miễn trung gian', en: 'No Agent', fr: 'Sans Intermédiaire' },
    { vn: 'Giá thương lượng', en: 'Negotiable Price', fr: 'Prix Négociable' },
    { vn: 'Bán lỗ', en: 'Selling at Loss', fr: 'Vente à Perte' }
  ];

  const propertyTypes = [
    { vn: 'Tất cả nhà đất', en: 'All Properties', fr: 'Tous Biens', category: 'all' },
    { vn: 'Căn hộ chung cư', en: 'Apartment', fr: 'Appartement', category: 'apartment' },
    { vn: 'Căn hộ nghỉ dưỡng', en: 'Resort Condo', fr: 'Appart. Vacances', category: 'apartment' },
    { vn: 'Studio', en: 'Studio', fr: 'Studio', category: 'apartment' },
    { vn: 'Nhà ở', en: 'House', fr: 'Maison', category: 'house' },
    { vn: 'Nhà biệt thự', en: 'Villa', fr: 'Villa', category: 'house' },
    { vn: 'Nhà nghỉ dưỡng', en: 'Resort House', fr: 'Maison Vacances', category: 'house' },
    { vn: 'Shophouse', en: 'Shophouse', fr: 'Shophouse', category: 'commercial' },
    { vn: 'Văn phòng', en: 'Office', fr: 'Bureau', category: 'commercial' },
    { vn: 'Cửa hàng', en: 'Shop', fr: 'Boutique', category: 'commercial' },
    { vn: 'Mặt bằng', en: 'Premises', fr: 'Local commercial', category: 'commercial' },
    { vn: 'Kho, nhà xưởng', en: 'Warehouse', fr: 'Entrepôt', category: 'commercial' },
    { vn: 'Đất', en: 'Land', fr: 'Terrain', category: 'land' },
    { vn: 'Đất nghỉ dưỡng', en: 'Resort Land', fr: 'Terrain Vacances', category: 'land' },
    { vn: 'Bất động sản khác', en: 'Other Property', fr: 'Autre Bien', category: 'other' },
  ];

  const availableSources = [
    { id: 'chotot', name: 'Chotot.com', active: true },
    { id: 'alonhadat', name: 'Alonhadat.com.vn', active: true },
  ];

  const vietnamCities = [
    { vn: 'Hồ Chí Minh', en: 'Ho Chi Minh City', fr: 'Hô-Chi-Minh-Ville' },
    { vn: 'Hà Nội', en: 'Hanoi', fr: 'Hanoï' },
    { vn: 'Đà Nẵng', en: 'Da Nang', fr: 'Da Nang' },
    { vn: 'Bình Dương', en: 'Binh Duong', fr: 'Binh Duong' },
    { vn: 'Khánh Hòa', en: 'Khanh Hoa (Nha Trang)', fr: 'Khanh Hoa (Nha Trang)' },
    { vn: 'Cần Thơ', en: 'Can Tho', fr: 'Can Tho' },
    { vn: 'Hải Phòng', en: 'Hai Phong', fr: 'Hai Phong' },
    { vn: 'Bà Rịa - Vũng Tàu', en: 'Ba Ria - Vung Tau', fr: 'Ba Ria - Vung Tau' },
    { vn: 'Bình Định', en: 'Binh Dinh (Quy Nhon)', fr: 'Binh Dinh (Quy Nhon)' },
    { vn: 'Lâm Đồng', en: 'Lam Dong (Da Lat)', fr: 'Lam Dong (Da Lat)' },
  ];

  const districtsByCity = {
    'Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Thủ Đức'],
    'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Tây Hồ', 'Cầu Giấy'],
    'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu'],
    'Bình Dương': ['Thủ Dầu Một', 'Dĩ An', 'Thuận An'],
    'Khánh Hòa': ['Nha Trang', 'Cam Ranh', 'Diên Khánh'],
    'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng'],
    'Hải Phòng': ['Hồng Bàng', 'Lê Chân', 'Ngô Quyền', 'Đồ Sơn'],
    'Bà Rịa - Vũng Tàu': ['Vũng Tàu', 'Bà Rịa', 'Long Điền', 'Phú Mỹ'],
    'Bình Định': ['Quy Nhơn', 'An Nhơn', 'Hoài Nhơn', 'Tuy Phước', 'Phù Cát'],
    'Lâm Đồng': ['Đà Lạt', 'Bảo Lộc', 'Đức Trọng', 'Lâm Hà', 'Đơn Dương', 'Di Linh', 'Bảo Lâm', 'Đạ Huoai', 'Đạ Tẻh', 'Cát Tiên', 'Lạc Dương'],
  };

  const currentDistricts = districtsByCity[searchParams.city] || [];
  const currentWards = wardsByDistrict[searchParams.district] || [];

  const handleSearch = async () => {
    if (
      !searchParams.city ||
      !searchParams.propertyType ||
      searchParams.priceMax === null ||
      searchParams.priceMax === undefined ||
      searchParams.priceMax === '' ||
      Number(searchParams.priceMax) <= 0
    ) {
      setError(t.required);
      return;
    }
    // Track search for beta tester
    const betaCode = typeof window !== 'undefined' ? localStorage.getItem('ktrix_beta_code') : null;
    if (betaCode) fetch('/api/track-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: betaCode }) });
    setLoading(true);
    setSearchProgress(0);
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev < 30) return prev + 3;
        if (prev < 60) return prev + 2;
        if (prev < 85) return prev + 1;
        if (prev < 95) return prev + 0.3;
        return prev;
      });
    }, 1000);
    setError(null);
    setShowSearch(false);
    setBdsTaskId(null);
    setBdsStatus('idle');
    setBdsProgress(0);
    setBdsCount(0);
    setSourceStats({});
    setMarketStats([]);
try {
        // Séparer sources rapides et lentes
        const allSources = searchParams.sources || ['chotot', 'alonhadat'];
        const fastSources = allSources.filter(s => s !== 'alonhadat');
        const slowSources = allSources.filter(s => s === 'alonhadat');
        
        const searchBody = {
          ...searchParams,
          keywords: searchParams.keywords || [],
          keywordsOnly: searchParams.keywordsOnly || false,
          sortBy: sortBy === 'priceAsc' ? 'price_asc' : sortBy === 'priceDesc' ? 'price_desc' : 'score_desc'
        };

        // Phase 1 : Sources rapides (Chotot) → affichage immédiat
        if (fastSources.length > 0) {
          const fastResponse = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...searchBody, sources: fastSources })
          });
          const fastData = await fastResponse.json();
          if (!fastResponse.ok) throw new Error(fastData.error || 'Search error');
          
          setResults(fastData.results || []);
          setStats(fastData.stats);
          if (fastData.marketStats && fastData.marketStats.length > 0) setMarketStats(fastData.marketStats);
          if (fastData.results && fastData.results.length > 0) {
            const statsBySource = {};
            fastData.results.forEach(result => {
              const source = result.source || 'unknown';
              if (!statsBySource[source]) statsBySource[source] = 0;
              statsBySource[source]++;
            });
            setSourceStats(statsBySource);
          }
        }
setAlonhadatLoading(true);
        // Phase 2 : Sources lentes (Alonhadat) → ajout en arrière-plan
        if (slowSources.length > 0 && fastSources.length > 0) {
          fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...searchBody, sources: slowSources })
          }).then(res => res.json()).then(slowData => {
            if (slowData.results && slowData.results.length > 0) {
              setResults(prev => {
                const merged = [...prev, ...slowData.results];
                if (sortBy === 'priceAsc') merged.sort((a, b) => (a.price || 0) - (b.price || 0));
                else if (sortBy === 'priceDesc') merged.sort((a, b) => (b.price || 0) - (a.price || 0));
                else merged.sort((a, b) => (b.score || 0) - (a.score || 0));
                return merged;
              });
              setSourceStats(prev => {
                const updated = { ...prev };
                slowData.results.forEach(result => {
                  const source = result.source || 'unknown';
                  if (!updated[source]) updated[source] = 0;
                  updated[source]++;
                });
                return updated;
              });
              if (slowData.marketStats && slowData.marketStats.length > 0) {
                setMarketStats(prev => {
                  if (!prev || prev.length === 0) return slowData.marketStats;
                  const merged = [...prev];
                  slowData.marketStats.forEach(newStat => {
                    const existing = merged.find(m => m.district === newStat.district);
                    if (existing) {
                      existing.count = (existing.count || 0) + (newStat.count || 0);
                    } else {
                      merged.push(newStat);
                    }
                  });
                  return merged;
                });
              }
            }
             setAlonhadatLoading(false);
         }).catch(err => { console.error('Alonhadat background error:', err); setAlonhadatLoading(false); });
        }

        // Cas : seulement Alonhadat sélectionné (pas de source rapide)
        if (fastSources.length === 0 && slowSources.length > 0) {
          const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...searchBody, sources: slowSources })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Search error');
          setResults(data.results || []);
          setStats(data.stats);
          if (data.marketStats && data.marketStats.length > 0) setMarketStats(data.marketStats);
          if (data.results && data.results.length > 0) {
            const statsBySource = {};
            data.results.forEach(result => {
              const source = result.source || 'unknown';
              if (!statsBySource[source]) statsBySource[source] = 0;
              statsBySource[source]++;
            });
            setSourceStats(statsBySource);
          }
        }
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(progressInterval);
      setSearchProgress(100);
      setLoading(false);
    }
  };

const formatPrice = (price) => {
  if (!price) return '-';
  return `${(price / 1000000000).toFixed(1).replace('.', ',')} Tỷ`;
};

  const formatPricePerM2 = (price) => {
    if (!price) return '-';
    return `${Math.round(price / 1000000)} tr/m²`;
  };

  const toggleKeyword = (keyword) => {
    const kwVn = keyword.vn;
    setSearchParams(prev => ({
      ...prev,
      keywords: prev.keywords.includes(kwVn) ? prev.keywords.filter(k => k !== kwVn) : [...prev.keywords, kwVn]
    }));
  };

  const exportToExcel = () => {
    const headers = ['Titre', 'Prix', 'Ville', 'Surface', 'Chambres', 'Score', 'Source'];
    const rows = results.map(r => [r.title, r.price, r.city, r.floorArea, r.bedrooms, r.score, r.source]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ktrix_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const saveCurrentSearch = () => {
    const searchName = `${searchParams.city} - ${searchParams.propertyType}`;
    const newSearch = { id: Date.now(), name: searchName, params: { ...searchParams }, date: new Date().toLocaleDateString() };
    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    if (typeof window !== 'undefined') localStorage.setItem('ktrix_searches', JSON.stringify(updated));
    alert(t.searchSaved);
  };

  const sortResults = (res) => {
    if (!res || res.length === 0) return [];
    const sorted = [...res];
    if (sortBy === 'priceAsc') return sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    if (sortBy === 'priceDesc') return sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    return sorted.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
  };

  const getPropertyTypesByCategory = () => ({
    all: propertyTypes.filter(pt => pt.category === 'all'),
    apartment: propertyTypes.filter(pt => pt.category === 'apartment'),
    house: propertyTypes.filter(pt => pt.category === 'house'),
    commercial: propertyTypes.filter(pt => pt.category === 'commercial'),
    land: propertyTypes.filter(pt => pt.category === 'land'),
    other: propertyTypes.filter(pt => pt.category === 'other'),
  });

  const getSearchCriteriaSummary = () => {
    const criteria = [];
    if (searchParams.city) criteria.push(`${t.city}: ${searchParams.city}`);
    if (searchParams.district) criteria.push(`${t.district}: ${searchParams.district}`);
    if (searchParams.propertyType) criteria.push(`${t.propertyType}: ${searchParams.propertyType}`);
    if (searchParams.priceMin || searchParams.priceMax) {
      criteria.push(`${t.price}: ${searchParams.priceMin || '0'} - ${searchParams.priceMax || '∞'} Tỷ`);
    }
    if (searchParams.bedrooms) criteria.push(`${t.bedrooms}: ${searchParams.bedrooms}`);
    if (searchParams.keywords.length > 0) criteria.push(`${t.keywordsLabel}: ${searchParams.keywords.slice(0, 3).join(', ')}${searchParams.keywords.length > 3 ? '...' : ''}`);
    if (searchParams.sources.length < 3) criteria.push(`${t.sourcesLabel}: ${searchParams.sources.join(', ')}`);
    return criteria;
  };

  // ============================================
  // MARKET STATS TABLE - DARK MODE
  // ============================================
  const MarketStatsTable = ({ data }) => {
    if (!data || data.length === 0) return null;
    
    const getTrendIcon = (trend, trendPercent) => {
      if (!trend) return <span className="text-gray-500">—</span>;
      if (trend === 'up') return <span className="flex items-center gap-1 text-emerald-400 font-semibold"><TrendingUp className="w-4 h-4" />+{trendPercent}%</span>;
      if (trend === 'down') return <span className="flex items-center gap-1 text-red-400 font-semibold"><TrendingDown className="w-4 h-4" />{trendPercent}%</span>;
      return <span className="flex items-center gap-1 text-gray-500"><Minus className="w-4 h-4" />0%</span>;
    };
    
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-6">
        <div 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowMarketStats(!showMarketStats)}
        >
          <h3 className="text-white font-bold flex items-center gap-2">
            📊 {t.marketStats}
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{data.length} districts</span>
          </h3>
          <button className="text-white/80 hover:text-white">{showMarketStats ? '▼' : '▶'}</button>
        </div>
        
        {showMarketStats && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">{t.district}</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-300">#</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-300">{t.avgPrice}</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-300">Min</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-300">Max</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-300">
                    <span className="flex items-center justify-center gap-1"><Database className="w-4 h-4" />{t.archive}</span>
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-300">{t.trend}</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((district, index) => (
                  <tr key={district.district} className={`border-b border-gray-800 hover:bg-gray-800/50 transition ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'}`}>
                    <td className="px-6 py-4"><span className="font-medium text-gray-200">{district.district}</span></td>
                    <td className="px-4 py-4 text-center"><span className="font-bold text-indigo-400">{district.count}</span></td>
                    <td className="px-4 py-4 text-center"><span className="font-semibold text-emerald-400">{formatPricePerM2(district.avgPricePerM2)}</span></td>
                    <td className="px-4 py-4 text-center text-sm text-gray-500">{formatPricePerM2(district.minPricePerM2)}</td>
                    <td className="px-4 py-4 text-center text-sm text-gray-500">{formatPricePerM2(district.maxPricePerM2)}</td>
                    <td className="px-4 py-4 text-center">
                      {district.archiveCount > 0 ? (
                        <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">{district.archiveCount}</span>
                      ) : <span className="text-gray-600 text-sm">—</span>}
                    </td>
                    <td className="px-4 py-4 text-center">{getTrendIcon(district.trend, district.trendPercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 10 && (
              <div className="px-6 py-3 bg-gray-800 text-center text-sm text-gray-500">+{data.length - 10} autres districts</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header - Dark */}
      <header className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-800 rounded-lg text-blue-400">
              <Home className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="https://raw.githubusercontent.com/f8902621-byte/traxhome-mvp/main/Ktrixlogo.png" alt="K Trix" className="w-14 h-14 object-contain" />
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-medium border border-emerald-500/30">MVP</span>
            </div>
            <button onClick={() => router.push('/monitoring')} className="px-3 py-1 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 border border-gray-700" title="Monitoring">🔍</button>
            <button onClick={() => setShowSearch(!showSearch)} className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20">
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">{t.searchParams}</span>
            </button>
            <button onClick={() => setShowSavedSearches(!showSavedSearches)} className="px-3 md:px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg font-medium border border-amber-500/20">
              ⭐ <span className="hidden md:inline">{t.savedSearches}</span> ({savedSearches.length})
            </button>
          </div>
<div className="flex items-center gap-4">
  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-300">
    <option value="vn">🇻🇳 VN</option>
    <option value="en">🇬🇧 EN</option>
    <option value="fr">🇫🇷 FR</option>
  </select>
</div>
        </div>
      </header>

      {/* Saved Searches - Dark */}
      {showSavedSearches && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">⭐ {t.savedSearches}</h2>
            {savedSearches.length === 0 ? (
              <p className="text-gray-500">{t.noSavedSearches}</p>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div>
                      <p className="font-medium text-white">{search.name}</p>
                      <p className="text-sm text-gray-500">{search.date}</p>
                    </div>
                    <button onClick={() => { setSearchParams(search.params); setShowSavedSearches(false); }} className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                      {t.loadSearch}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Form - Dark */}
      {showSearch && (
        <div className="max-w-6xl mx-auto px-4 py-6">
         <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6" onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleSearch(); }}>
            {/* Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">🌐 {t.sources}</label>
              <div className="flex flex-wrap gap-2">
                {availableSources.map((source) => (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => {
                      if (!source.active) return;
                      const newSources = searchParams.sources.includes(source.id)
                        ? searchParams.sources.filter(s => s !== source.id)
                        : [...searchParams.sources, source.id];
                      setSearchParams({ ...searchParams, sources: newSources });
                    }}
                    disabled={!source.active}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                      !source.active ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : searchParams.sources.includes(source.id) ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    {searchParams.sources.includes(source.id) && <span>✓</span>}
                    {source.name} {!source.active && `(${t.comingSoon})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Results */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">📊 {t.maxResults}</label>
              <div className="flex gap-2">
                {[50, 100, 200, 300].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSearchParams({ ...searchParams, maxResults: num })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      searchParams.maxResults === num
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Buy/Sell */}
            <div className="flex gap-4">
              <button onClick={() => setMode('buy')} className={`px-6 py-3 rounded-lg font-medium transition ${mode === 'buy' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}>
                🏠 {t.buy}
              </button>
              <button onClick={() => router.push('/sell')} className="px-6 py-3 rounded-lg font-medium bg-gray-800 text-gray-300 border border-gray-700 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/30 transition">
                💰 {t.sell}
              </button>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">{t.city} <span className="text-orange-400">*</span></label>
                <select value={searchParams.city} onChange={(e) => setSearchParams({...searchParams, city: e.target.value, district: ''})} className="w-full px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200">
                  <option value="">{t.selectCity}</option>
                  {vietnamCities.map((c, i) => <option key={i} value={c.vn}>{c[language]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">{t.district}</label>
                <select value={searchParams.district} onChange={(e) => setSearchParams({...searchParams, district: e.target.value, ward: ''})} className="w-full px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" disabled={!searchParams.city}>
                  <option value="">{t.allDistricts}</option>
                  {currentDistricts.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
               <label className="block text-sm font-bold text-gray-300 mb-2"> {t.ward}</label>
                <select value={searchParams.ward} onChange={(e) => setSearchParams({...searchParams, ward: e.target.value})} className="w-full px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" disabled={!searchParams.district}>
                  <option value="">{t.wardAll || 'All'}</option>
                  {currentWards.map((w, i) => <option key={i} value={w}>{premiumWards[w] ? `⭐ ${w}` : w}</option>)}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-300 mb-2">{t.propertyType} <span className="text-orange-400">*</span></label>
                <select value={searchParams.propertyType} onChange={(e) => setSearchParams({...searchParams, propertyType: e.target.value})} className="w-full px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200">
                  <option value="">{t.selectType}</option>
                  {getPropertyTypesByCategory().all.map((pt, i) => <option key={`all-${i}`} value={pt.vn}>📋 {pt[language]}</option>)}
                  <optgroup label="🏢 Apartments">{getPropertyTypesByCategory().apartment.map((pt, i) => <option key={`apt-${i}`} value={pt.vn}>{pt[language]}</option>)}</optgroup>
                  <optgroup label="🏠 Houses">{getPropertyTypesByCategory().house.map((pt, i) => <option key={`house-${i}`} value={pt.vn}>{pt[language]}</option>)}</optgroup>
                  <optgroup label="🏪 Commercial">{getPropertyTypesByCategory().commercial.map((pt, i) => <option key={`comm-${i}`} value={pt.vn}>{pt[language]}</option>)}</optgroup>
                  <optgroup label="🌳 Land">{getPropertyTypesByCategory().land.map((pt, i) => <option key={`land-${i}`} value={pt.vn}>{pt[language]}</option>)}</optgroup>
                  <optgroup label="📦 Other">{getPropertyTypesByCategory().other.map((pt, i) => <option key={`other-${i}`} value={pt.vn}>{pt[language]}</option>)}</optgroup>
                </select>
              </div>
            </div>

            {/* Price & Area */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">{t.priceMin}</label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.1" min="0" max="500" value={searchParams.priceMin} onChange={(e) => setSearchParams({...searchParams, priceMin: e.target.value})} className="w-24 px-3 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-right text-gray-200" placeholder="0" />
                  <span className="text-gray-500 font-medium">Tỷ</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">{t.priceMax} <span className="text-orange-400">*</span></label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.1" min="0" max="500" value={searchParams.priceMax} onChange={(e) => setSearchParams({...searchParams, priceMax: e.target.value})} className="w-24 px-3 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-right text-gray-200" placeholder="10" />
                  <span className="text-gray-500 font-medium">Tỷ</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">{t.livingArea}</label>
                <div className="flex gap-2">
                  <input type="number" value={searchParams.livingAreaMin} onChange={(e) => setSearchParams({...searchParams, livingAreaMin: e.target.value})} className="w-full px-3 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder={t.min} />
                  <input type="number" value={searchParams.livingAreaMax} onChange={(e) => setSearchParams({...searchParams, livingAreaMax: e.target.value})} className="w-full px-3 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder={t.max} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">{t.bedrooms}</label>
                <input type="number" value={searchParams.bedrooms} onChange={(e) => setSearchParams({...searchParams, bedrooms: e.target.value})} className="w-full px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="2" />
              </div>
            </div>

            {/* Extra filters */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">🚿 {t.bathrooms}</label>
                <input type="number" value={searchParams.bathrooms} onChange={(e) => setSearchParams({...searchParams, bathrooms: e.target.value})} className="w-full px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">{t.daysListed}</label>
                <input type="number" value={searchParams.daysListed} onChange={(e) => setSearchParams({...searchParams, daysListed: e.target.value})} className="w-full px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="30" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">{t.legalStatus}</label>
                <select value={searchParams.legalStatus} onChange={(e) => setSearchParams({...searchParams, legalStatus: e.target.value})} className="w-full px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200">
                  <option value="">{t.legalAll}</option>
                  <option value="sohong">{t.legalSoHong}</option>
                  <option value="hopdong">{t.legalHopdong}</option>
                  <option value="dangcho">{t.legalDangcho}</option>
                </select>
              </div>
              <div className="flex items-end mt-4">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input type="checkbox" checked={searchParams.hasParking} onChange={(e) => setSearchParams({...searchParams, hasParking: e.target.checked})} className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-blue-500" />
                  <span className="text-sm font-medium text-gray-300">🚗 {t.hasParking}</span>
                </label>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input type="checkbox" checked={searchParams.hasPool} onChange={(e) => setSearchParams({...searchParams, hasPool: e.target.checked})} className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-blue-500" />
                  <span className="text-sm font-medium text-gray-300">🏊 {t.hasPool}</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">🛣️ {t.streetWidth}</label>
                <input type="number" value={searchParams.streetWidthMin} onChange={(e) => setSearchParams({...searchParams, streetWidthMin: e.target.value})} placeholder="4" className="w-full px-3 py-2.5 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" />
              </div>
            </div>

            {/* Keywords - Dark */}
            <div>
              <label className="block text-sm font-bold text-orange-400 mb-1">🔥 {t.keywords}</label>
              <p className="text-xs text-gray-500 mb-3">{t.keywordsDesc}</p>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-orange-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      const allKeywordsVn = urgentKeywords.map(kw => kw.vn);
                      const allSelected = allKeywordsVn.every(kw => searchParams.keywords.includes(kw));
                      setSearchParams({ ...searchParams, keywords: allSelected ? [] : allKeywordsVn });
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold text-sm shadow"
                  >
                    {urgentKeywords.map(kw => kw.vn).every(kw => searchParams.keywords.includes(kw))
                      ? (language === 'vn' ? '❌ Bỏ chọn tất cả' : language === 'fr' ? '❌ Tout désélectionner' : '❌ Deselect All')
                      : (language === 'vn' ? '✅ Chọn tất cả' : language === 'fr' ? '✅ Tout sélectionner' : '✅ Select All')}
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-800 px-3 py-2 rounded-lg border border-orange-500/20">
                    <input type="checkbox" checked={searchParams.keywordsOnly || false} onChange={(e) => setSearchParams({...searchParams, keywordsOnly: e.target.checked})} className="w-4 h-4 text-orange-500 rounded bg-gray-700 border-gray-600" />
                    <span className="text-sm font-medium text-orange-400">
                      {language === 'vn' ? '🎯 Chỉ kết quả có từ khóa' : language === 'fr' ? '🎯 Uniquement avec mots-clés' : '🎯 Only with keywords'}
                    </span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {urgentKeywords.map((kw, i) => (
                    <button key={i} onClick={() => toggleKeyword(kw)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${searchParams.keywords.includes(kw.vn) ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-orange-500/30'}`}>
                      {kw[language]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Actions - Dark */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-800 bg-gray-800/50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
              <div>
                <p className="text-sm font-semibold text-amber-400">⚠️ {t.required}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={saveCurrentSearch} disabled={!searchParams.city || !searchParams.propertyType || !searchParams.priceMax} className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium disabled:opacity-50 border border-gray-600">
                  ⭐ {t.saveSearch}
                </button>
                <button onClick={handleSearch} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                  {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                  {loading ? t.loading : t.search}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results - Dark */}
      {!showSearch && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search Criteria Banner */}
          {results.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-300 mb-2">📊 {t.searchCriteria}</p>
                  <div className="flex flex-wrap gap-2">
                    {getSearchCriteriaSummary().map((criterion, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-800 text-blue-300 rounded-full text-xs font-medium border border-blue-500/20">{criterion}</span>
                    ))}
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">{results.length} {t.results}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Source Stats */}
{alonhadatLoading && (
              <div style={{padding: '12px 20px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 12, margin: '8px 0', textAlign: 'center'}}>
                <span style={{color: '#00d4ff', fontSize: 14}}>
                  ⏳ {language === 'vn' ? 'Đang tìm thêm kết quả từ Alonhadat...' : language === 'fr' ? 'Recherche Alonhadat en cours...' : 'Searching Alonhadat...'}
                </span>
              </div>
            )}
          {Object.keys(sourceStats).length > 0 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-4">
              <p className="text-sm font-bold text-gray-300 mb-3">🌐 {t.sourceResults}</p>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(sourceStats).map(([source, count]) => (
                  <button
                    key={source}
                    onClick={() => setFilterSource(filterSource === source ? null : source)}
                    className={`p-3 rounded-lg text-center cursor-pointer transition-all border ${
                      filterSource === source ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-500 scale-105' : 'hover:scale-105'
                    } ${
                      source === 'chotot.com' ? 'bg-emerald-500/10 border-emerald-500/20' :
                      source === 'alonhadat.com.vn' ? 'bg-purple-500/10 border-purple-500/20' :
                      'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <p className={`text-2xl font-bold ${
                      source === 'chotot.com' ? 'text-emerald-400' :
                      source === 'alonhadat.com.vn' ? 'text-purple-400' :
                      'text-gray-300'
                    }`}>{count}</p>
                    <p className="text-xs text-gray-500">{source}</p>
                    {filterSource === source && <p className="text-xs text-blue-400 mt-1 font-medium">✓ Filtré</p>}
                  </button>
                ))}
                {filterSource && (
                  <button onClick={() => setFilterSource(null)} className="mt-3 w-full text-sm text-gray-500 hover:text-gray-300 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    ✕ Afficher toutes les sources
                  </button>
                )}
              </div>
            </div>
          )}

          <MarketStatsTable data={marketStats} />

          {/* BDS Loading */}
          {bdsStatus === 'polling' && (
            <div className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">🔄 Recherche Batdongsan en cours... {bdsProgress}%</span>
                {bdsCount > 0 && <span className="bg-white/20 px-2 py-1 rounded-full text-sm">{bdsCount} trouvées</span>}
              </div>
            </div>
          )}
          {bdsStatus === 'completed' && bdsCount > 0 && (
            <div className="mb-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg">
              <span>✅</span><span className="font-medium">{bdsCount} annonces Batdongsan ajoutées !</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-80 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-blue-400">
                    {searchProgress < 30 ? t.progressConnecting : searchProgress < 60 ? t.progressFetching : searchProgress < 85 ? t.progressScoring : searchProgress < 100 ? t.progressFinalizing : t.progressDone}
                  </span>
                  <span className="text-sm font-bold text-blue-400">{Math.round(searchProgress)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-500" style={{width: `${searchProgress}%`}}></div>
                </div>
              </div>
              <p className="text-gray-500 text-sm">{t.progressTime}</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {stats && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold text-white">{results.length} {t.results}</h2>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-300">
                        <option value="score">{t.sortScore}</option>
                        <option value="priceAsc">{t.sortPriceAsc}</option>
                        <option value="priceDesc">{t.sortPriceDesc}</option>
                      </select>
                    </div>
                    <button onClick={exportToExcel} className="px-4 py-2 bg-teal-500/10 text-teal-400 rounded-lg flex items-center gap-2 border border-teal-500/20">
                      <Download className="w-4 h-4" />{t.export}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-400">{t.lowestPrice}</p>
                      <p className="text-2xl font-bold text-blue-400">{formatPrice(stats.lowestPrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{t.highestPrice}</p>
                      <p className="text-2xl font-bold text-blue-400">{formatPrice(stats.highestPrice)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Property Cards - Dark */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortResults(results).filter(r => !filterSource || r.source === filterSource).map((prop, i) => (
                  <div key={`${prop.id}-${prop.source}-${i}`} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition">
                    <div className="relative h-48 bg-gray-800">
                      <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
                      {prop.isNew && <div className="absolute top-2 left-2 bg-cyan-500/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">{t.newListing}</div>}
                      {prop.urgentKeywords && prop.urgentKeywords.length > 0 && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">🔥 {prop.urgentKeywords[0]}</div>
                      )}
                      {prop.legalStatus && <div className="absolute bottom-2 left-2 bg-blue-500/80 text-white px-2 py-1 rounded text-xs font-bold">📋 {prop.legalStatus}</div>}
                      <div className="absolute bottom-2 right-2 bg-gray-900/80 text-gray-300 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">{prop.source}</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 text-white">{prop.title}</h3>
                      {prop.matchedKeywords && prop.matchedKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {prop.matchedKeywords.slice(0, 3).map((kw, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs font-bold bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">🔥 {kw}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-baseline gap-2 mb-2">
                        <p className="text-2xl font-bold text-blue-400">{formatPrice(prop.price)}</p>
                        {prop.pricePerSqm && prop.pricePerSqm > 0 && (
                          <p className="text-sm text-gray-500">{Math.round(prop.pricePerSqm / 1000000)} tr/m²</p>
                        )}
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">{t.score}</span>
                          <span className="text-sm font-bold text-gray-300">{prop.score}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${prop.score}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-3">
<div>📐 {(() => {
                  if (prop.area || prop.floorArea) return `${Math.round((prop.area || prop.floorArea) * 10) / 10}m²`;
                  if (prop.nlpAnalysis && prop.nlpAnalysis.extractedArea) return `${prop.nlpAnalysis.extractedArea}m²`;
                  return '?m²';
                })()}</div>
                <div>🛏️ {(() => {
                  if (prop.bedrooms) return `${prop.bedrooms} ch.`;
                  if (prop.nlpAnalysis && prop.nlpAnalysis.extractedBedrooms) return `${prop.nlpAnalysis.extractedBedrooms} ch.`;
                  return '? ch.';
                                   </div>
                      <div 
                        className="flex items-start gap-2 text-sm text-gray-400 mb-3 cursor-pointer hover:text-blue-400 bg-gray-800 p-2 rounded-lg border border-gray-700" 
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.address || prop.district + ' ' + prop.city)}`, '_blank')}
                      >
                        <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                        <span className="line-clamp-2">{prop.address || `${prop.district}${prop.district ? ', ' : ''}${prop.city}`}</span>
                      </div>
                      {prop.postedOn && <div className="text-xs text-gray-600 mb-2">📅 {prop.postedOn}</div>}
                      <a 
                        href={prop.url} 
                        onClick={(e) => { e.preventDefault(); setSelectedProperty(prop); }}
                        onAuxClick={(e) => { if (e.button === 1) window.open(prop.url, '_blank'); }}
                        className="block w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-500 hover:to-cyan-400 font-medium text-center cursor-pointer shadow-lg shadow-blue-500/20"
                      >
                        {t.viewDetails}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-xl text-gray-500">{t.noResults}</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================
         PROPERTY DETAIL MODAL - DARK MODE
         ============================================ */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProperty(null)}>
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-gray-800" onClick={(e) => e.stopPropagation()}>
            
            {/* Header sticky */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-4 flex justify-between items-center z-10 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                🤖 {language === 'vn' ? 'Báo cáo AI' : language === 'fr' ? 'Rapport IA' : 'AI Report'}
                {selectedProperty.negotiationLevel && (
                  <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold ${
                    selectedProperty.negotiationLevel === 'excellent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    selectedProperty.negotiationLevel === 'good' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    selectedProperty.negotiationLevel === 'moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {selectedProperty.negotiationLevel === 'excellent' ? '🔥 ' : selectedProperty.negotiationLevel === 'good' ? '👍 ' : selectedProperty.negotiationLevel === 'moderate' ? '➡️ ' : '⬇️ '}
                    {language === 'vn' 
                      ? (selectedProperty.negotiationLevel === 'excellent' ? 'Cơ hội tốt' : selectedProperty.negotiationLevel === 'good' ? 'Khá tốt' : selectedProperty.negotiationLevel === 'moderate' ? 'Trung bình' : 'Thấp')
                      : language === 'fr'
                      ? (selectedProperty.negotiationLevel === 'excellent' ? 'Excellente opportunité' : selectedProperty.negotiationLevel === 'good' ? 'Bonne opportunité' : selectedProperty.negotiationLevel === 'moderate' ? 'Opportunité moyenne' : 'Faible')
                      : (selectedProperty.negotiationLevel === 'excellent' ? 'Excellent opportunity' : selectedProperty.negotiationLevel === 'good' ? 'Good opportunity' : selectedProperty.negotiationLevel === 'moderate' ? 'Average' : 'Low')}
                  </span>
                )}
              </h2>
              <button onClick={() => setSelectedProperty(null)} className="p-2 hover:bg-gray-800 rounded-full text-xl text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image */}
              {selectedProperty.imageUrl && (
                <div className="rounded-xl overflow-hidden">
                  <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-56 object-cover" />
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedProperty.title}</h3>
                {selectedProperty.matchedKeywords && selectedProperty.matchedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedProperty.matchedKeywords.map((kw, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-xs font-bold bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">🔥 {kw}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-blue-400">{formatPrice(selectedProperty.price)}</span>
                  {selectedProperty.area > 0 && (
                    <span className="text-base text-gray-500">({Math.round(selectedProperty.price / selectedProperty.area / 1000000)} tr/m²)</span>
                  )}
                </div>
              </div>

          {/* === HOLOGRAPHIC AI REPORT === */}
          <style dangerouslySetInnerHTML={{__html: NEON_CSS}} />

          {/* Negotiation Score Gauge */}
          <div style={{margin: '12px 0'}}>
            <NeedleGauge
              score={selectedProperty.score || 0}
              label={language === 'vn' ? '🎯 Điểm đàm phán' : language === 'fr' ? '🎯 Score de négociation' : '🎯 Negotiation Score'}
            />
          </div>

          {/* Price vs Market */}
          {selectedProperty.pricePosition && (
            <div style={{margin: '12px 0'}}>
              <PriceDistribution
                propertyPrice={Math.round(selectedProperty.pricePosition.itemPricePerM2 / 1000000)}
                min={Math.round(selectedProperty.pricePosition.districtMin / 1000000)}
                median={Math.round(selectedProperty.pricePosition.districtMedian / 1000000)}
                max={Math.round(selectedProperty.pricePosition.districtMax / 1000000)}
                count={selectedProperty.pricePosition.districtCount}
title={language === 'vn' ? '📊 Phân tích giá' : language === 'fr' ? '📊 Analyse Prix vs Marché' : '📊 Price vs Market'}
              />
            </div>
          )}
{!selectedProperty.pricePosition && (() => {
          let area = selectedProperty.area;
          if (!area) {
            const text = (selectedProperty.title || '') + ' ' + (selectedProperty.description || '');
            const dimMatch = text.match(/(\d+[.,]?\d*)\s*x\s*(\d+[.,]?\d*)/i);
            if (dimMatch) area = parseFloat(dimMatch[1].replace(',', '.')) * parseFloat(dimMatch[2].replace(',', '.'));
            const areaMatch = text.match(/(\d+[.,]?\d*)\s*m2/i);
            if (!area && areaMatch) area = parseFloat(areaMatch[1].replace(',', '.'));
          }
          return area && selectedProperty.price ? (
            <div style={{background: `linear-gradient(135deg, ${NEON.card} 0%, rgba(0,212,255,0.03) 100%)`, border: `1px solid rgba(0,212,255,0.15)`, borderRadius: 16, padding: 16, margin: '12px 0', textAlign: 'center'}}>
              <p style={{color: '#f0f8ff', fontSize: 14, fontWeight: 700, margin: '0 0 8px', letterSpacing: 1, textTransform: 'uppercase', textShadow: `0 0 10px rgba(0,212,255,0.4)`}}>📊 Price vs Market</p>
              <p style={{color: NEON.cyan, fontSize: 20, fontWeight: 800, margin: '8px 0', fontFamily: 'Orbitron, monospace'}}>
                {Math.round(selectedProperty.price / 1000000 / area)} tr/m²
              </p>
              <p style={{color: 'rgba(240,248,255,0.5)', fontSize: 13, margin: 0}}>
                {language === 'vn' ? 'Giá tính từ diện tích đất' : language === 'fr' ? 'Prix calculé depuis la surface' : 'Price calculated from land area'}
              </p>
            </div>
          ) : (
            <div style={{background: `linear-gradient(135deg, ${NEON.card} 0%, rgba(0,212,255,0.03) 100%)`, border: `1px solid rgba(0,212,255,0.15)`, borderRadius: 16, padding: 16, margin: '12px 0', textAlign: 'center'}}>
              <p style={{color: '#f0f8ff', fontSize: 14, fontWeight: 700, margin: '0 0 8px', letterSpacing: 1, textTransform: 'uppercase', textShadow: `0 0 10px rgba(0,212,255,0.4)`}}>📊 Price vs Market</p>
              <p style={{color: 'rgba(240,248,255,0.5)', fontSize: 13, margin: 0}}>
                {language === 'vn' ? '⚠️ Diện tích không có – không thể phân tích giá/m²' : language === 'fr' ? '⚠️ Surface non renseignée – analyse prix/m² indisponible' : '⚠️ Area not provided — price/m² analysis unavailable'}
              </p>
            </div>
          );
        })()}
{/* Score Bars */}
          <div style={{margin: '12px 0'}}>
<div style={{background: `linear-gradient(135deg, ${NEON.card} 0%, rgba(0,212,255,0.03) 100%)`, border: `1px solid ${NEON.border}`, borderRadius: 16, padding: 16, margin: '12px 0', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`, backgroundSize: '20px 20px', pointerEvents: 'none'}} />
          <p style={{color: NEON.white, fontSize: 14, fontWeight: 700, textAlign: 'center', margin: '0 0 14px', letterSpacing: 1, textTransform: 'uppercase', textShadow: `0 0 10px ${NEON.blueGlow}`}}>
            📋 {language === 'vn' ? 'Hồ sơ bất động sản' : language === 'fr' ? 'Profil du bien' : 'Property Profile'}
          </p>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
            {/* Street Access */}
            <div style={{background: 'rgba(0,212,255,0.06)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(0,212,255,0.1)'}}>
              <span style={{color: '#888', fontSize: 11}}>🛣️ {language === 'vn' ? 'Mặt bằng' : language === 'fr' ? 'Accès rue' : 'Street Access'}</span>
              <p style={{color: NEON.white, fontSize: 14, fontWeight: 600, margin: '4px 0 0'}}>
{(() => {
                  const nlp = selectedProperty.nlpAnalysis || {};
                  const accessMap = {
                    'goc_mt': 'Góc MT', 'nhieu_mt': '2+ MT', 'mat_tien': 'Mặt tiền',
                    'goc': 'Góc', 'hxh': 'Hẻm xe hơi', 'hem': 'Hẻm',
                    'kiet': 'Kiệt', 'ngo': 'Ngõ'
                  };
                  const parts = [];
                  if (nlp.extractedStreetAccess) parts.push(accessMap[nlp.extractedStreetAccess] || nlp.extractedStreetAccess);
                  if (nlp.extractedStreetWidth || selectedProperty.streetWidth) parts.push(`Đường ${nlp.extractedStreetWidth || selectedProperty.streetWidth}m`);
                  if (nlp.extractedFacade || selectedProperty.facadeWidth) parts.push(`Ngang ${nlp.extractedFacade || selectedProperty.facadeWidth}m`);
                  return parts.length > 0 ? parts.join(' • ') : '—';
                })()}
              </p>
            </div>
            {/* Dimensions */}
            <div style={{background: 'rgba(0,212,255,0.06)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(0,212,255,0.1)'}}>
              <span style={{color: '#888', fontSize: 11}}>📐 {language === 'vn' ? 'Kích thước' : language === 'fr' ? 'Dimensions' : 'Dimensions'}</span>
              <p style={{color: NEON.white, fontSize: 14, fontWeight: 600, margin: '4px 0 0'}}>
{(() => {
                  const nlp = selectedProperty.nlpAnalysis || {};
                  if (nlp.extractedWidth && nlp.extractedDepth) {
                    return `${nlp.extractedWidth}×${nlp.extractedDepth}m (${nlp.extractedArea}m²)`;
                  }
                  if (nlp.extractedArea) return `${nlp.extractedArea} m²`;
                  if (selectedProperty.area) return `${Math.round(selectedProperty.area * 10) / 10} m²`;
                  return '—';
                })()}
              </p>
            </div>
            {/* Legal Status */}
            <div style={{background: 'rgba(0,212,255,0.06)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(0,212,255,0.1)'}}>
              <span style={{color: '#888', fontSize: 11}}>📜 {language === 'vn' ? 'Pháp lý' : language === 'fr' ? 'Statut légal' : 'Legal Status'}</span>
              <p style={{color: (() => {
                const legalText = (selectedProperty.legalStatus || '').toLowerCase();
                const allText = legalText + ' ' + ((selectedProperty.title || '') + ' ' + (selectedProperty.description || '') + ' ' + JSON.stringify(selectedProperty.nlpAnalysis || {})).toLowerCase();
const nlp = selectedProperty.nlpAnalysis || {};
                  const colorMap = { 'so_hong_rieng': NEON.green, 'so_hong': NEON.green, 'hop_dong': NEON.orange, 'gpxd': NEON.orange, 'giay_tay': NEON.red, 'cho_so': NEON.orange, 'vi_bang': NEON.red };
                  if (nlp.extractedLegalStatus && colorMap[nlp.extractedLegalStatus]) return colorMap[nlp.extractedLegalStatus];
                  return '#888';
                 const nlp = selectedProperty.nlpAnalysis || {};
                  const legalMap = {
                    'so_hong_rieng': '✅ Sổ hồng riêng', 'so_hong': '✅ Sổ hồng / Sổ đỏ',
                    'hop_dong': '📄 Hợp đồng mua bán', 'gpxd': '📄 Giấy phép XD',
                    'giay_tay': '⚠️ Giấy tay', 'cho_so': '⏳ Đang chờ sổ', 'vi_bang': '⚠️ Vi bằng',
                  };
                  if (nlp.extractedLegalStatus && legalMap[nlp.extractedLegalStatus]) return legalMap[nlp.extractedLegalStatus];
                  if (selectedProperty.legalStatus) return selectedProperty.legalStatus;
                  return '—';
                })()}
              </p>
            </div>
            {/* Structure */}
            <div style={{background: 'rgba(0,212,255,0.06)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(0,212,255,0.1)'}}>
              <span style={{color: '#888', fontSize: 11}}>🏢 {language === 'vn' ? 'Kết cấu' : language === 'fr' ? 'Structure' : 'Structure'}</span>
              <p style={{color: NEON.white, fontSize: 14, fontWeight: 600, margin: '4px 0 0'}}>
                {(() => {
                  const parts = [];
                  const text = (selectedProperty.title || '') + ' ' + (selectedProperty.description || '');
{(() => {
                  const nlp = selectedProperty.nlpAnalysis || {};
                  const parts = [];
                  const floors = selectedProperty.floors || nlp.extractedFloors;
                  if (floors && floors > 0) parts.push(`${floors} tầng`);
                  const beds = selectedProperty.bedrooms || nlp.extractedBedrooms;
                  if (beds && beds > 0) parts.push(`${beds} PN`);
                  const facade = selectedProperty.facadeWidth || nlp.extractedFacade;
                  if (facade && facade > 0) parts.push(`Ngang ${facade}m`);
                  return parts.length > 0 ? parts.join(' • ') : '—';
                })()}
        </div>
                  </div>
          {/* Negotiation Signals */}
          {selectedProperty.scoreDetails && (
            <div style={{background: 'linear-gradient(135deg, #0d1225 0%, rgba(0,212,255,0.03) 100%)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 16, padding: 16, margin: '12px 0', position: 'relative', overflow: 'hidden'}}>
              <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none'}} />
              <p style={{color: '#f0f8ff', fontSize: 14, fontWeight: 700, margin: '0 0 12px', letterSpacing: 1, textTransform: 'uppercase', textShadow: '0 0 10px rgba(0,212,255,0.4)'}}>
                ⚡ {language === 'vn' ? 'Tín hiệu đàm phán' : language === 'fr' ? 'Signaux de Négociation' : 'Negotiation Signals'}
              </p>

              {selectedProperty.scoreDetails.urgentKeywords && selectedProperty.scoreDetails.urgentKeywords.length > 0 && (
                <SignalItem icon="🔥" label={language === 'vn' ? 'Từ khóa gấp' : language === 'fr' ? 'Mots-clés urgents' : 'Urgent keywords'} value={selectedProperty.scoreDetails.urgentKeywords.join(', ')} isPositive={true} />
              )}

              {selectedProperty.scoreDetails.listingAge && selectedProperty.scoreDetails.listingAge.days > 0 && (
                <SignalItem icon="📅" label={language === 'vn' ? 'Tuổi tin đăng' : language === 'fr' ? 'Ancienneté' : 'Listing age'} value={`${selectedProperty.scoreDetails.listingAge.days} ${language === 'vn' ? 'ngày' : language === 'fr' ? 'jours' : 'days'}`} isPositive={selectedProperty.scoreDetails.listingAge.verdict === 'old' || selectedProperty.scoreDetails.listingAge.verdict === 'very_old'} />
              )}

              {selectedProperty.scoreDetails.priceAnalysis && (
                <SignalItem icon="💰" label={language === 'vn' ? 'Phân tích giá' : language === 'fr' ? 'Position prix' : 'Price analysis'} value={`${selectedProperty.scoreDetails.priceAnalysis.diffPercent}%`} isPositive={selectedProperty.scoreDetails.priceAnalysis.verdict === 'excellent' || selectedProperty.scoreDetails.priceAnalysis.verdict === 'good'} />
              )}

              {selectedProperty.scoreDetails.priceType === 'round' && (
                <SignalItem icon="🎯" label={language === 'vn' ? 'Giá tròn' : language === 'fr' ? 'Prix rond' : 'Round price'} value={language === 'vn' ? 'Có' : language === 'fr' ? 'Oui' : 'Yes'} isPositive={true} />
              )}

              {selectedProperty.scoreDetails.legalStatus && selectedProperty.scoreDetails.legalStatus.status && (
                <SignalItem icon="📜" label={language === 'vn' ? 'Pháp lý' : language === 'fr' ? 'Statut légal' : 'Legal status'} value={selectedProperty.scoreDetails.legalStatus.status} isPositive={selectedProperty.scoreDetails.legalStatus.verdict === 'excellent' || selectedProperty.scoreDetails.legalStatus.verdict === 'good'} />
              )}
            </div>
          )}

          {/* NLP Alerts & Opportunities */}
          {selectedProperty.scoreDetails && selectedProperty.scoreDetails.nlpFactors && selectedProperty.scoreDetails.nlpFactors.length > 0 && (
            <div style={{background: 'linear-gradient(135deg, #0d1225 0%, rgba(255,140,0,0.03) 100%)', border: '1px solid rgba(255,140,0,0.15)', borderRadius: 16, padding: 16, margin: '12px 0', position: 'relative', overflow: 'hidden'}}>
              <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none'}} />
              <p style={{color: '#f0f8ff', fontSize: 14, fontWeight: 700, margin: '0 0 12px', letterSpacing: 1, textTransform: 'uppercase', textShadow: '0 0 10px rgba(255,140,0,0.5)'}}>
                🚨 {language === 'vn' ? 'Cảnh báo & Cơ hội' : language === 'fr' ? 'Alertes & Opportunités' : 'Alerts & Opportunities'}
              </p>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                {selectedProperty.scoreDetails.nlpFactors.map((factor, i) => (
                  <AlertBadge key={i} text={factor.label || factor.text || factor} type={factor.type === 'positive' || factor.type === 'opportunity' ? 'good' : factor.type === 'risk' || factor.type === 'warning' ? 'risk' : 'alert'} />
                ))}
              </div>
            </div>
          )}

          {/* AI Verdict */}
          <div style={{background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,255,136,0.05) 100%)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 16, padding: 16, margin: '12px 0', boxShadow: '0 0 20px rgba(0,212,255,0.15), inset 0 0 30px rgba(0,212,255,0.03)', position: 'relative', overflow: 'hidden'}}>
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none'}} />
            <p style={{color: '#00d4ff', fontSize: 14, fontWeight: 700, margin: '0 0 10px', letterSpacing: 1, textTransform: 'uppercase', textShadow: '0 0 10px rgba(0,212,255,0.4)'}}>
              🤖 {language === 'vn' ? 'Nhận xét AI' : language === 'fr' ? 'Verdict IA' : 'AI Verdict'}
            </p>
            <p style={{color: '#f0f8ff', fontSize: 14, lineHeight: 1.7, margin: 0, opacity: 0.9}}>
              {(() => {
                const p = selectedProperty;
                const sd = p.scoreDetails || {};
                const pp = p.pricePosition;
                const parts = [];
                if (p.score >= 70) parts.push(language === 'fr' ? '🔥 Opportunité très intéressante.' : language === 'vn' ? '🔥 Cơ hội rất tốt.' : '🔥 Very interesting opportunity.');
                else if (p.score >= 50) parts.push(language === 'fr' ? '👍 Annonce intéressante à considérer.' : language === 'vn' ? '👍 Tin đáng chú ý.' : '👍 Interesting listing to consider.');
                else if (p.score >= 30) parts.push(language === 'fr' ? '📊 Annonce dans la moyenne.' : language === 'vn' ? '📊 Tin trung bình.' : '📊 Average listing.');
                else parts.push(language === 'fr' ? '📉 Peu de signaux de négociation.' : language === 'vn' ? '📉 Ít tín hiệu đàm phán.' : '📉 Few negotiation signals.');
                if (pp && pp.position === 'below') parts.push(language === 'fr' ? `Prix ${Math.abs(pp.percentFromMedian)}% en dessous de la médiane du quartier.` : language === 'vn' ? `Giá thấp hơn ${Math.abs(pp.percentFromMedian)}% so với trung vị quận.` : `Price ${Math.abs(pp.percentFromMedian)}% below district median.`);
                else if (pp && pp.position === 'above') parts.push(language === 'fr' ? `Attention : prix ${Math.abs(pp.percentFromMedian)}% au dessus de la médiane.` : language === 'vn' ? `Chú ý: giá cao hơn ${Math.abs(pp.percentFromMedian)}% so với trung vị.` : `Note: price ${Math.abs(pp.percentFromMedian)}% above median.`);
                if (sd.urgentKeywords && sd.urgentKeywords.length > 0) parts.push(language === 'fr' ? `Signaux d'urgence détectés (${sd.urgentKeywords.join(', ')}) → marge de négociation probable.` : language === 'vn' ? `Phát hiện từ khóa gấp (${sd.urgentKeywords.join(', ')}) → có thể đàm phán.` : `Urgent signals detected (${sd.urgentKeywords.join(', ')}) → likely negotiation margin.`);
                if (sd.nlpFactors) {
                  const risks = sd.nlpFactors.filter(f => f.type === 'risk' || f.type === 'warning');
                  if (risks.length > 0) parts.push(language === 'fr' ? `⚠️ Risque(s) détecté(s): ${risks.map(r => r.label || r.text || r).join(', ')}.` : language === 'vn' ? `⚠️ Rủi ro: ${risks.map(r => r.label || r.text || r).join(', ')}.` : `⚠️ Risk(s) detected: ${risks.map(r => r.label || r.text || r).join(', ')}.`);
                }
                if (p.score >= 50 && pp && pp.position !== 'above') {
                  const estimMin = pp.position === 'below' ? 5 : 10;
                  const estimMax = pp.position === 'below' ? 15 : 20;
                  parts.push(language === 'fr' ? `💡 Potentiel de négociation estimé : ${estimMin}-${estimMax}%.` : language === 'vn' ? `💡 Tiềm năng đàm phán: ${estimMin}-${estimMax}%.` : `💡 Estimated negotiation potential: ${estimMin}-${estimMax}%.`);
                }
                if (!p.legalStatus) parts.push(language === 'fr' ? '📋 Statut légal non confirmé — à vérifier avant visite.' : language === 'vn' ? '📋 Chưa xác nhận pháp lý — cần kiểm tra.' : '📋 Legal status unconfirmed — verify before visiting.');
                return parts.join(' ');
              })()}
            </p>
          </div>


<div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-500">📐 {language === 'vn' ? 'Diện tích' : language === 'fr' ? 'Surface' : 'Area'}</p>
              <p className="text-lg font-semibold text-white">{(() => {
                if (selectedProperty.area) return `${Math.round(selectedProperty.area * 10) / 10} m²`;
                const nlp = selectedProperty.nlpAnalysis || {};
                if (nlp.extractedArea) return `${nlp.extractedArea} m²`;
                return '?';
              })()}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-500">🛏️ {t.rooms}</p>
              <p className="text-lg font-semibold text-white">{(() => {
                if (selectedProperty.bedrooms) return selectedProperty.bedrooms;
                const nlp = selectedProperty.nlpAnalysis || {};
                if (nlp.extractedBedrooms) return nlp.extractedBedrooms;
                return '?';
              })()}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-500">🚿 {t.bathrooms}</p>
              <p className="text-lg font-semibold text-white">{(() => {
                if (selectedProperty.bathrooms) return selectedProperty.bathrooms;
                const nlp = selectedProperty.nlpAnalysis || {};
                if (nlp.extractedBathrooms) return nlp.extractedBathrooms;
                return '?';
              })()}</p>
            </div>
            {(() => {
              let floors = selectedProperty.floors;
              if (!floors || floors <= 0) {
                const nlp = selectedProperty.nlpAnalysis || {};
                if (nlp.extractedFloors) floors = nlp.extractedFloors;
              }
              return floors && floors > 0 ? (
                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-500">🏢 {language === 'vn' ? 'Số tầng' : language === 'fr' ? 'Étages' : 'Floors'}</p>
                  <p className="text-lg font-semibold text-white">{floors}</p>
                </div>
              ) : null;
            })()}
            {selectedProperty.legalStatus && (
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-500">📜 {language === 'vn' ? 'Pháp lý' : language === 'fr' ? 'Statut légal' : 'Legal'}</p>
                <p className="text-lg font-semibold text-white">{selectedProperty.legalStatus}</p>
              </div>
            )}
              </div>

              {/* Address */}
              <div className="p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition border border-gray-700"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProperty.address || selectedProperty.district + ' ' + selectedProperty.city)}`, '_blank')}
              >
                <p className="text-xs text-gray-500 mb-1">📍 {language === 'fr' ? 'Adresse (cliquer pour Google Maps)' : 'Address (click for Google Maps)'}</p>
                <p className="font-medium text-gray-200">{selectedProperty.address || `${selectedProperty.district || ''}, ${selectedProperty.ward || ''}, ${selectedProperty.city || ''}`}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>🌐 {selectedProperty.source}</span>
                {selectedProperty.postedOn && <span>📅 {selectedProperty.postedOn}</span>}
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">⚖️</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-400 mb-1">
                      {language === 'vn' ? 'Minh bạch dữ liệu' : language === 'fr' ? 'Transparence des données' : 'Data Transparency'}
                    </p>
                    <p className="text-xs text-amber-400/70 leading-relaxed">
                      {language === 'vn'
                        ? 'Phân tích giá dựa trên các tin đăng trực tuyến trong cùng quận/huyện tại thời điểm tìm kiếm. Điểm đàm phán được tính từ thuật toán K Trix (giá, từ khóa, pháp lý, thời gian đăng). Dữ liệu này không thay thế thẩm định chuyên nghiệp.'
                        : language === 'fr'
                        ? 'L\'analyse des prix est basée sur les annonces en ligne du même district au moment de la recherche. Le score de négociation est calculé par l\'algorithme K Trix (prix, mots-clés, statut légal, ancienneté). Ces données ne remplacent pas une évaluation immobilière professionnelle.'
                        : 'Price analysis is based on online listings in the same district at the time of search. The negotiation score is calculated by the K Trix algorithm (price, keywords, legal status, listing age). This data does not replace a professional property valuation.'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-amber-500/20">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-amber-400/70">{language === 'vn' ? 'Dữ liệu thực' : language === 'fr' ? 'Données réelles' : 'Real data'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-amber-400/70">{language === 'vn' ? 'Thuật toán K Trix' : language === 'fr' ? 'Algorithme K Trix' : 'K Trix algorithm'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-amber-400/70">{language === 'vn' ? 'Tham khảo' : language === 'fr' ? 'Indicatif' : 'Indicative'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <a href={selectedProperty.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium text-center hover:from-blue-500 hover:to-cyan-400 transition shadow-lg shadow-blue-500/20">
                  🔗 {t.viewOriginal}
                </a>
                <button onClick={() => setSelectedProperty(null)} className="px-6 py-3 border border-gray-700 rounded-xl font-medium hover:bg-gray-800 transition text-gray-300">
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
