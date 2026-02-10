import { useState, useEffect } from 'react';
import { Search, Menu, Download, MapPin, AlertCircle, Loader, Home, Info, TrendingUp, TrendingDown, Minus, Database } from 'lucide-react';
import { useRouter } from 'next/router';
import { wardsByDistrict, premiumWards } from '../lib/wards-data';

export default function SearchPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('vn');
  const [currency, setCurrency] = useState('VND');
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
  
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  
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
// Relancer la recherche quand le tri change

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
progressTime: 'Khoảng 60 giây',
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
progressTime: 'About 60 seconds',
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
progressTime: 'Environ 60 secondes',
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
    console.log('DEBUG searchParams avant fetch:', JSON.stringify(searchParams));
try {
  console.log('[DEBUG FRONTEND] searchParams.maxResults =', searchParams.maxResults);
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
          ...searchParams,
          keywords: searchParams.keywords || [],
          keywordsOnly: searchParams.keywordsOnly || false,
          sortBy: sortBy === 'priceAsc' ? 'price_asc' : sortBy === 'priceDesc' ? 'price_desc' : 'score_desc'
        })
  });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search error');
      console.log('API Response - first result:', data.results?.[0]);
      setResults(data.results || []);
      setStats(data.stats);
      
      if (data.marketStats && data.marketStats.length > 0) {
        setMarketStats(data.marketStats);
      }
      
      if (data.results && data.results.length > 0) {
        const statsBySource = {};
        data.results.forEach(result => {
          const source = result.source || 'unknown';
          if (!statsBySource[source]) {
            statsBySource[source] = 0;
          }
          statsBySource[source]++;
        });
        setSourceStats(statsBySource);
      }
      
      if (data.bdsTaskId) {
        console.log('BDS: Démarrage polling pour', data.bdsTaskId);
        setBdsTaskId(data.bdsTaskId);
        setBdsStatus('polling');
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
    if (currency === 'VND') {
      return `${(price / 1000000000).toFixed(1).replace('.', ',')} Tỷ`;
    }
    return `$${(price / 25000).toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')}`;
  };

  const formatPricePerM2 = (price) => {
    if (!price) return '-';
    return `${Math.round(price / 1000000)} tr/m²`;
  };

const toggleKeyword = (keyword) => {
  const kwVn = keyword.vn; // Toujours utiliser la version vietnamienne
  const kwDisplay = keyword[language]; // Pour l'affichage
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
  if (sortBy === 'priceAsc') {
    return sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (sortBy === 'priceDesc') {
    return sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  }
  return sorted.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
};

  const getPropertyTypesByCategory = () => {
    const categories = {
      all: propertyTypes.filter(pt => pt.category === 'all'),
      apartment: propertyTypes.filter(pt => pt.category === 'apartment'),
      house: propertyTypes.filter(pt => pt.category === 'house'),
      commercial: propertyTypes.filter(pt => pt.category === 'commercial'),
      land: propertyTypes.filter(pt => pt.category === 'land'),
      other: propertyTypes.filter(pt => pt.category === 'other'),
    };
    return categories;
  };

const getSearchCriteriaSummary = () => {
    const criteria = [];
    if (searchParams.city) criteria.push(`${t.city}: ${searchParams.city}`);
    if (searchParams.district) criteria.push(`${t.district}: ${searchParams.district}`);
    if (searchParams.propertyType) criteria.push(`${t.propertyType}: ${searchParams.propertyType}`);
    if (searchParams.priceMin || searchParams.priceMax) {
      const priceRange = `${searchParams.priceMin || '0'} - ${searchParams.priceMax || '∞'} Tỷ`;
      criteria.push(`${t.price}: ${priceRange}`);
    }
    if (searchParams.bedrooms) criteria.push(`${t.bedrooms}: ${searchParams.bedrooms}`);
    if (searchParams.keywords.length > 0) criteria.push(`${t.keywordsLabel}: ${searchParams.keywords.slice(0, 3).join(', ')}${searchParams.keywords.length > 3 ? '...' : ''}`);
    if (searchParams.sources.length < 3) criteria.push(`${t.sourcesLabel}: ${searchParams.sources.join(', ')}`);
    return criteria;
  };

  // ============================================
  // COMPOSANT MARKET STATS AVEC ARCHIVE ET TRENDS
  // ============================================
  const MarketStatsTable = ({ data }) => {
    if (!data || data.length === 0) return null;
    
    const getTrendIcon = (trend, trendPercent) => {
      if (!trend) return <span className="text-gray-400">—</span>;
      
      if (trend === 'up') {
        return (
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <TrendingUp className="w-4 h-4" />
            +{trendPercent}%
          </span>
        );
      } else if (trend === 'down') {
        return (
          <span className="flex items-center gap-1 text-red-500 font-semibold">
            <TrendingDown className="w-4 h-4" />
            {trendPercent}%
          </span>
        );
      } else {
        return (
          <span className="flex items-center gap-1 text-gray-500">
            <Minus className="w-4 h-4" />
            0%
          </span>
        );
      }
    };
    
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowMarketStats(!showMarketStats)}
        >
          <h3 className="text-white font-bold flex items-center gap-2">
            📊 {t.marketStats}
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{data.length} districts</span>
          </h3>
          <button className="text-white/80 hover:text-white">
            {showMarketStats ? '▼' : '▶'}
          </button>
        </div>
        
        {showMarketStats && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">{t.district}</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">#</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">{t.avgPrice}</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Min</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Max</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">
                    <span className="flex items-center justify-center gap-1">
                      <Database className="w-4 h-4" />
                      {t.archive}
                    </span>
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">{t.trend}</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((district, index) => (
                  <tr 
                    key={district.district} 
                    className={`border-b hover:bg-slate-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">{district.district}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-indigo-600">{district.count}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-emerald-600">
                        {formatPricePerM2(district.avgPricePerM2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-500">
                      {formatPricePerM2(district.minPricePerM2)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-500">
                      {formatPricePerM2(district.maxPricePerM2)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {district.archiveCount > 0 ? (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          {district.archiveCount}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getTrendIcon(district.trend, district.trendPercent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 10 && (
              <div className="px-6 py-3 bg-slate-50 text-center text-sm text-gray-500">
                +{data.length - 10} autres districts
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
<header className="bg-white shadow-sm border-b sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-sky-50 rounded-lg text-sky-600">
              <Home className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="https://raw.githubusercontent.com/f8902621-byte/traxhome-mvp/main/Ktrixlogo.png" alt="K Trix" className="w-14 h-14 object-contain" />
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">MVP</span>
            </div>
            <button onClick={() => router.push('/monitoring')} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200" title="Monitoring">
              🔍
            </button>
<button onClick={() => setShowSearch(!showSearch)} className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-lg font-medium flex items-center gap-2 shadow-md">
  <Search className="w-4 h-4" />
  <span className="hidden md:inline">{t.searchParams}</span>
</button>
<button onClick={() => setShowSavedSearches(!showSavedSearches)} className="px-3 md:px-4 py-2 bg-orange-100 text-orange-600 rounded-lg font-medium">
  ⭐ <span className="hidden md:inline">{t.savedSearches}</span> ({savedSearches.length})
</button>
          </div>
<div className="hidden md:flex items-center gap-4">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
              <option value="vn">🇻🇳 VN</option>
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </header>

      {/* Saved Searches */}
      {showSavedSearches && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">⭐ {t.savedSearches}</h2>
            {savedSearches.length === 0 ? (
              <p className="text-gray-500">{t.noSavedSearches}</p>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">{search.name}</p>
                      <p className="text-sm text-gray-500">{search.date}</p>
                    </div>
                    <button onClick={() => { setSearchParams(search.params); setShowSavedSearches(false); }} className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg">
                      {t.loadSearch}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Form */}
      {showSearch && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🌐 {t.sources}</label>
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
                      !source.active ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : searchParams.sources.includes(source.id) ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-100 text-gray-700 hover:bg-slate-200 border-2 border-slate-200'
                    }`}
                  >
                    {searchParams.sources.includes(source.id) && <span>✓</span>}
                    {source.name} {!source.active && `(${t.comingSoon})`}
                  </button>
                ))}
              </div>
            </div>
{/* Max Results per Source */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">📊 {t.maxResults}</label>
  <div className="flex gap-2">
    {[50, 100, 200, 300].map((num) => (
      <button
        key={num}
        type="button"
        onClick={() => setSearchParams({ ...searchParams, maxResults: num })}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          searchParams.maxResults === num
            ? 'bg-sky-500 text-white shadow-md'
            : 'bg-slate-100 text-gray-700 hover:bg-slate-200 border border-slate-200'
        }`}
      >
        {num}
      </button>
    ))}
  </div>
</div>
            {/* Buy/Sell */}
            <div className="flex gap-4">
              <button onClick={() => setMode('buy')} className={`px-6 py-3 rounded-lg font-medium ${mode === 'buy' ? 'bg-sky-500 text-white' : 'bg-slate-100'}`}>
                🏠 {t.buy}
              </button>
<button onClick={() => router.push('/sell')} className="px-6 py-3 rounded-lg font-medium bg-slate-100 hover:bg-orange-400 hover:text-white transition">
  💰 {t.sell}
</button>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.city} <span className="text-orange-500">*</span></label>
                <select value={searchParams.city} onChange={(e) => setSearchParams({...searchParams, city: e.target.value, district: ''})} className="w-full px-4 py-2.5 border rounded-lg">
                  <option value="">{t.selectCity}</option>
                  {vietnamCities.map((c, i) => <option key={i} value={c.vn}>{c[language]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.district}</label>
                <select value={searchParams.district} onChange={(e) => setSearchParams({...searchParams, district: e.target.value, ward: ''})} className="w-full px-4 py-2.5 border rounded-lg" disabled={!searchParams.city}>
                  <option value="">{t.allDistricts}</option>
                  {currentDistricts.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>
              </div>
                                        <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">🏘️ Phường/Xã</label>
              <select value={searchParams.ward} onChange={(e) => setSearchParams({...searchParams, ward: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" disabled={!searchParams.district}>
                <option value="">Tất cả phường/xã</option>
                {currentWards.map((w, i) => <option key={i} value={w}>{premiumWards[w] ? `⭐ ${w}` : w}</option>)}
              </select>
            </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.propertyType} <span className="text-orange-500">*</span></label>
                <select value={searchParams.propertyType} onChange={(e) => setSearchParams({...searchParams, propertyType: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg">
                  <option value="">{t.selectType}</option>
                  {getPropertyTypesByCategory().all.map((pt, i) => (
                    <option key={`all-${i}`} value={pt.vn}>📋 {pt[language]}</option>
                  ))}
                  <optgroup label="🏢 Apartments">
                    {getPropertyTypesByCategory().apartment.map((pt, i) => (
                      <option key={`apt-${i}`} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🏠 Houses">
                    {getPropertyTypesByCategory().house.map((pt, i) => (
                      <option key={`house-${i}`} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🏪 Commercial">
                    {getPropertyTypesByCategory().commercial.map((pt, i) => (
                      <option key={`comm-${i}`} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🌳 Land">
                    {getPropertyTypesByCategory().land.map((pt, i) => (
                      <option key={`land-${i}`} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </optgroup>
                  <optgroup label="📦 Other">
                    {getPropertyTypesByCategory().other.map((pt, i) => (
                      <option key={`other-${i}`} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.priceMin}</label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.1" min="0" max="500" value={searchParams.priceMin} onChange={(e) => setSearchParams({...searchParams, priceMin: e.target.value})} className="w-24 px-3 py-2.5 border rounded-lg text-right" placeholder="0" />
                  <span className="text-gray-500 font-medium">Tỷ</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.priceMax} <span className="text-orange-500">*</span></label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.1" min="0" max="500" value={searchParams.priceMax} onChange={(e) => setSearchParams({...searchParams, priceMax: e.target.value})} className="w-24 px-3 py-2.5 border rounded-lg text-right" placeholder="10" />
                  <span className="text-gray-500 font-medium">Tỷ</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.livingArea}</label>
                <div className="flex gap-2">
                  <input type="number" value={searchParams.livingAreaMin} onChange={(e) => setSearchParams({...searchParams, livingAreaMin: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg" placeholder={t.min} />
                  <input type="number" value={searchParams.livingAreaMax} onChange={(e) => setSearchParams({...searchParams, livingAreaMax: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg" placeholder={t.max} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.bedrooms}</label>
                <input type="number" value={searchParams.bedrooms} onChange={(e) => setSearchParams({...searchParams, bedrooms: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" placeholder="2" />
              </div>
            </div>

            {/* Extra filters */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🚿 {t.bathrooms}</label>
                <input type="number" value={searchParams.bathrooms} onChange={(e) => setSearchParams({...searchParams, bathrooms: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" placeholder="1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.daysListed}</label>
                <input type="number" value={searchParams.daysListed} onChange={(e) => setSearchParams({...searchParams, daysListed: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" placeholder="30" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.legalStatus}</label>
                <select value={searchParams.legalStatus} onChange={(e) => setSearchParams({...searchParams, legalStatus: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg">
                  <option value="">{t.legalAll}</option>
                  <option value="sohong">{t.legalSoHong}</option>
                  <option value="hopdong">{t.legalHopdong}</option>
                  <option value="dangcho">{t.legalDangcho}</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input type="checkbox" checked={searchParams.hasParking} onChange={(e) => setSearchParams({...searchParams, hasParking: e.target.checked})} className="w-5 h-5 text-sky-500 rounded" />
                  <span className="text-sm font-medium">🚗 {t.hasParking}</span>
                </label>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input type="checkbox" checked={searchParams.hasPool} onChange={(e) => setSearchParams({...searchParams, hasPool: e.target.checked})} className="w-5 h-5 text-sky-500 rounded" />
                  <span className="text-sm font-medium">🏊 {t.hasPool}</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🛣️ {t.streetWidth}</label>
                <input type="number" value={searchParams.streetWidthMin} onChange={(e) => setSearchParams({...searchParams, streetWidthMin: e.target.value})} placeholder="4" className="w-full px-3 py-2.5 border rounded-lg" />
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-bold text-orange-600 mb-1">🔥 {t.keywords}</label>
              <p className="text-xs text-gray-500 mb-3">{t.keywordsDesc}</p>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-orange-200">
                  <button
                    type="button"
onClick={() => {
  const allKeywordsVn = urgentKeywords.map(kw => kw.vn); // Toujours vietnamien
  const allSelected = allKeywordsVn.every(kw => searchParams.keywords.includes(kw));
  setSearchParams({
    ...searchParams,
    keywords: allSelected ? [] : allKeywordsVn
  });
}}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold text-sm shadow"
                  >
                    {urgentKeywords.map(kw => kw.vn).every(kw => searchParams.keywords.includes(kw))
                      ? (language === 'vn' ? '❌ Bỏ chọn tất cả' : language === 'fr' ? '❌ Tout désélectionner' : '❌ Deselect All')
                      : (language === 'vn' ? '✅ Chọn tất cả' : language === 'fr' ? '✅ Tout sélectionner' : '✅ Select All')}
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-orange-300">
                    <input 
                      type="checkbox" 
                      checked={searchParams.keywordsOnly || false} 
                      onChange={(e) => setSearchParams({...searchParams, keywordsOnly: e.target.checked})} 
                      className="w-4 h-4 text-orange-500 rounded" 
                    />
                    <span className="text-sm font-medium text-orange-700">
                      {language === 'vn' ? '🎯 Chỉ kết quả có từ khóa' : language === 'fr' ? '🎯 Uniquement avec mots-clés' : '🎯 Only with keywords'}
                    </span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
{urgentKeywords.map((kw, i) => (
  <button key={i} onClick={() => toggleKeyword(kw)} className={`... ${searchParams.keywords.includes(kw.vn) ? 'bg-orange-500 text-white' : '...'}`}>
    {kw[language]}
  </button>
))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-2 text-orange-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t bg-sky-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
              <div>
                <p className="text-sm font-semibold text-sky-700">⚠️ {t.required}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={saveCurrentSearch} disabled={!searchParams.city || !searchParams.propertyType || !searchParams.priceMax} className="px-4 py-3 bg-slate-200 text-gray-700 rounded-lg font-medium disabled:opacity-50">
                  ⭐ {t.saveSearch}
                </button>
                <button onClick={handleSearch} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg disabled:opacity-50">
                  {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                  {loading ? t.loading : t.search}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {!showSearch && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search Criteria Banner */}
          {results.length > 0 && (
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-sky-800 mb-2">📊 {t.searchCriteria}</p>
                  <div className="flex flex-wrap gap-2">
                    {getSearchCriteriaSummary().map((criterion, i) => (
                      <span key={i} className="px-3 py-1 bg-white text-sky-700 rounded-full text-xs font-medium border border-sky-200">
                        {criterion}
                      </span>
                    ))}
                    <span className="px-3 py-1 bg-sky-500 text-white rounded-full text-xs font-bold">
                      {results.length} {t.results}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats par source */}
          {Object.keys(sourceStats).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
              <p className="text-sm font-bold text-gray-700 mb-3">🌐 {t.sourceResults}</p>
              <div className="grid grid-cols-3 gap-3">
{Object.entries(sourceStats).map(([source, count]) => (
  <button
    key={source}
    onClick={() => setFilterSource(filterSource === source ? null : source)}
    className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
      filterSource === source ? 'ring-2 ring-offset-2 ring-sky-500 scale-105' : 'hover:scale-105'
    } ${
      source === 'chotot.com' ? 'bg-green-50 border border-green-200' :
      source === 'batdongsan.com.vn' ? 'bg-blue-50 border border-blue-200' :
      source === 'alonhadat.com.vn' ? 'bg-purple-50 border border-purple-200' :
      'bg-slate-50 border border-slate-200'
    }`}
  >
    <p className={`text-2xl font-bold ${
      source === 'chotot.com' ? 'text-green-600' :
      source === 'batdongsan.com.vn' ? 'text-blue-600' :
      source === 'alonhadat.com.vn' ? 'text-purple-600' :
      'text-slate-600'
    }`}>{count}</p>
    <p className="text-xs text-gray-600">{source}</p>
    {filterSource === source && (
      <p className="text-xs text-sky-600 mt-1 font-medium">✓ Filtré</p>
    )}
  </button>
))}
{filterSource && (
  <button 
    onClick={() => setFilterSource(null)}
    className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 py-2 bg-slate-100 rounded-lg"
  >
    ✕ Afficher toutes les sources
  </button>
)}
              </div>
            </div>
          )}

          {/* 📊 MARKET STATS TABLE WITH ARCHIVE AND TRENDS */}
          <MarketStatsTable data={marketStats} />

          {/* BDS Loading Banner */}
          {bdsStatus === 'polling' && (
            <div className="mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">🔄 Recherche Batdongsan en cours... {bdsProgress}%</span>
                {bdsCount > 0 && <span className="bg-white/20 px-2 py-1 rounded-full text-sm">{bdsCount} trouvées</span>}
              </div>
            </div>
          )}

          {/* BDS Completed Banner */}
          {bdsStatus === 'completed' && bdsCount > 0 && (
            <div className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg">
              <span>✅</span>
              <span className="font-medium">{bdsCount} annonces Batdongsan ajoutées !</span>
            </div>
          )}

{loading ? (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-80 mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-sky-700">
{searchProgress < 30 ? t.progressConnecting :
    searchProgress < 60 ? t.progressFetching :
    searchProgress < 85 ? t.progressScoring :
    searchProgress < 100 ? t.progressFinalizing : t.progressDone}
        </span>
        <span className="text-sm font-bold text-sky-700">{Math.round(searchProgress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-sky-400 to-sky-600 h-3 rounded-full transition-all duration-500"
          style={{width: `${searchProgress}%`}}
        ></div>
      </div>
    </div>
    <p className="text-gray-500 text-sm">{t.progressTime}</p>
</div>
  ) : results.length > 0 ? (
            <>
              {stats && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold">{results.length} {t.results}</h2>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
                        <option value="score">{t.sortScore}</option>
                        <option value="priceAsc">{t.sortPriceAsc}</option>
                        <option value="priceDesc">{t.sortPriceDesc}</option>
                      </select>
                    </div>
                    <button onClick={exportToExcel} className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      {t.export}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-sky-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">{t.lowestPrice}</p>
                      <p className="text-2xl font-bold text-sky-600">{formatPrice(stats.lowestPrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t.highestPrice}</p>
                      <p className="text-2xl font-bold text-sky-600">{formatPrice(stats.highestPrice)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortResults(results).filter(r => !filterSource || r.source === filterSource).map((prop, i) => (
                  <div key={`${prop.id}-${prop.source}-${i}`} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                    <div className="relative h-48 bg-slate-200">
                      <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
                      {prop.isNew && <div className="absolute top-2 left-2 bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">{t.newListing}</div>}
                      {prop.urgentKeywords && prop.urgentKeywords.length > 0 && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          🔥 {prop.urgentKeywords[0]}
                        </div>
                      )}
                      {prop.legalStatus && <div className="absolute bottom-2 left-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">📋 {prop.legalStatus}</div>}
                      <div className="absolute bottom-2 right-2 bg-sky-500 text-white px-2 py-1 rounded text-xs font-bold shadow">
                        {prop.source}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{prop.title}</h3>
                        {/* Badges mots-clés détectés */}
{prop.matchedKeywords && prop.matchedKeywords.length > 0 && (
  <div className="flex flex-wrap gap-1 mb-2">
    {prop.matchedKeywords.slice(0, 3).map((kw, idx) => (
      <span
        key={idx}
        className="px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-600 rounded-full border border-orange-200"
      >
        🔥 {kw}
      </span>
    ))}
  </div>
)}
                      <div className="flex items-baseline gap-2 mb-2">
                        <p className="text-2xl font-bold text-sky-600">{formatPrice(prop.price)}</p>
                        {prop.pricePerSqm && prop.pricePerSqm > 0 && (
                          <p className="text-sm text-gray-500">{Math.round(prop.pricePerSqm / 1000000)} tr/m²</p>
                        )}
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-600">{t.score}</span>
                          <span className="text-sm font-bold">{prop.score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" style={{ width: `${prop.score}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div>📐 {prop.area || prop.floorArea || '?'}m²</div>
                        <div>🛏️ {prop.bedrooms || '?'} ch.</div>
                      </div>
                      <div 
                        className="flex items-start gap-2 text-sm text-gray-700 mb-3 cursor-pointer hover:text-sky-600 bg-slate-50 p-2 rounded-lg" 
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.address || prop.district + ' ' + prop.city)}`, '_blank')}
                      >
                        <MapPin className="w-4 h-4 mt-0.5 text-sky-500 flex-shrink-0" />
                        <span className="line-clamp-2">{prop.address || `${prop.district}${prop.district ? ', ' : ''}${prop.city}`}</span>
                      </div>
                      {prop.postedOn && (
                        <div className="text-xs text-gray-500 mb-2">📅 {prop.postedOn}</div>
                      )}
                      <a 
                        href={prop.url} 
                        onClick={(e) => { e.preventDefault(); setSelectedProperty(prop); }}
                        onAuxClick={(e) => { if (e.button === 1) window.open(prop.url, '_blank'); }}
                        className="block w-full px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 font-medium text-center cursor-pointer"
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
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">{t.noResults}</p>
            </div>
          )}
        </div>
      )}

{/* ============================================
   K TRIX — AI REPORT MODAL
   Remplace le bloc {selectedProperty && (...)} 
   dans pages/search.js
   ============================================ */}

{selectedProperty && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProperty(null)}>
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
      
      {/* Header sticky */}
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b p-4 flex justify-between items-center z-10 rounded-t-2xl">
        <h2 className="text-lg font-bold flex items-center gap-2">
          🤖 {language === 'vn' ? 'Báo cáo AI' : language === 'fr' ? 'Rapport IA' : 'AI Report'}
          {selectedProperty.negotiationLevel && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              selectedProperty.negotiationLevel === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
              selectedProperty.negotiationLevel === 'good' ? 'bg-sky-100 text-sky-700' :
              selectedProperty.negotiationLevel === 'moderate' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {selectedProperty.negotiationLevel === 'excellent' ? '🔥 ' : 
               selectedProperty.negotiationLevel === 'good' ? '👍 ' : 
               selectedProperty.negotiationLevel === 'moderate' ? '➡️ ' : '⬇️ '}
              {language === 'vn' 
                ? (selectedProperty.negotiationLevel === 'excellent' ? 'Cơ hội tốt' : selectedProperty.negotiationLevel === 'good' ? 'Khá tốt' : selectedProperty.negotiationLevel === 'moderate' ? 'Trung bình' : 'Thấp')
                : language === 'fr'
                ? (selectedProperty.negotiationLevel === 'excellent' ? 'Excellente opportunité' : selectedProperty.negotiationLevel === 'good' ? 'Bonne opportunité' : selectedProperty.negotiationLevel === 'moderate' ? 'Opportunité moyenne' : 'Faible')
                : (selectedProperty.negotiationLevel === 'excellent' ? 'Excellent opportunity' : selectedProperty.negotiationLevel === 'good' ? 'Good opportunity' : selectedProperty.negotiationLevel === 'moderate' ? 'Average' : 'Low')}
            </span>
          )}
        </h2>
        <button onClick={() => setSelectedProperty(null)} className="p-2 hover:bg-slate-100 rounded-full text-xl">✕</button>
      </div>

      <div className="p-6 space-y-6">

        {/* === IMAGE + INFOS DE BASE === */}
        {selectedProperty.imageUrl && (
          <div className="rounded-xl overflow-hidden">
            <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-56 object-cover" />
          </div>
        )}
        
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedProperty.title}</h3>
          {selectedProperty.matchedKeywords && selectedProperty.matchedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedProperty.matchedKeywords.map((kw, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-600 rounded-full border border-orange-200">
                  🔥 {kw}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-sky-600">{formatPrice(selectedProperty.price)}</span>
            {selectedProperty.area > 0 && (
              <span className="text-base text-gray-500">({Math.round(selectedProperty.price / selectedProperty.area / 1000000)} tr/m²)</span>
            )}
          </div>
        </div>

        {/* === SCORE GLOBAL === */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-sky-50 border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-gray-700">
              {language === 'vn' ? 'Điểm đàm phán' : language === 'fr' ? 'Score de négociation' : 'Negotiation Score'}
            </span>
            <span className={`text-3xl font-black ${
              selectedProperty.score >= 70 ? 'text-emerald-600' :
              selectedProperty.score >= 50 ? 'text-sky-600' :
              selectedProperty.score >= 30 ? 'text-amber-600' :
              'text-slate-500'
            }`}>{selectedProperty.score}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${
              selectedProperty.score >= 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
              selectedProperty.score >= 50 ? 'bg-gradient-to-r from-sky-400 to-blue-500' :
              selectedProperty.score >= 30 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
              'bg-gradient-to-r from-slate-300 to-slate-400'
            }`} style={{ width: `${selectedProperty.score}%` }} />
          </div>
        </div>

        {/* === SECTION 1: ANALYSE PRIX VS MARCHÉ === */}
        {selectedProperty.pricePosition && (
          <div className="rounded-xl border border-indigo-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3">
              <h4 className="text-white font-bold flex items-center gap-2">
                📊 {language === 'vn' ? 'Phân tích giá' : language === 'fr' ? 'Analyse Prix vs Marché' : 'Price vs Market Analysis'}
              </h4>
            </div>
            <div className="p-5 bg-white space-y-4">
              {/* Verdict principal */}
              <div className={`p-4 rounded-lg text-center ${
                selectedProperty.pricePosition.position === 'below' ? 'bg-emerald-50 border border-emerald-200' :
                selectedProperty.pricePosition.position === 'above' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-2xl font-black ${
                  selectedProperty.pricePosition.position === 'below' ? 'text-emerald-600' :
                  selectedProperty.pricePosition.position === 'above' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {selectedProperty.pricePosition.percentFromMedian > 0 ? '+' : ''}{selectedProperty.pricePosition.percentFromMedian}%
                  {selectedProperty.pricePosition.position === 'below' ? ' ↓' : selectedProperty.pricePosition.position === 'above' ? ' ↑' : ' ≈'}
                </p>
<p className="text-sm text-gray-600 mt-1">
                  {language === 'vn' 
                    ? `${selectedProperty.pricePosition.position === 'below' ? 'Dưới giá thị trường' : selectedProperty.pricePosition.position === 'above' ? 'Trên giá thị trường' : 'Giá hợp lý'} (${selectedProperty.pricePosition.districtCount} ${t.listingsInDistrict})`
                    : language === 'fr'
                    ? `${selectedProperty.pricePosition.position === 'below' ? 'En dessous du marché' : selectedProperty.pricePosition.position === 'above' ? 'Au dessus du marché' : 'Prix dans la moyenne'} (${selectedProperty.pricePosition.districtCount} ${t.listingsInDistrict})`
                    : `${selectedProperty.pricePosition.position === 'below' ? 'Below market' : selectedProperty.pricePosition.position === 'above' ? 'Above market' : 'Fair price'} (${selectedProperty.pricePosition.districtCount} ${t.listingsInDistrict})`}
                </p>
              </div>

              {/* Barre visuelle position prix */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Min: {Math.round(selectedProperty.pricePosition.districtMin / 1000000)} tr/m²</span>
                  <span>{language === 'vn' ? 'Trung bình' : language === 'fr' ? 'Médiane' : 'Median'}: {Math.round(selectedProperty.pricePosition.districtMedian / 1000000)} tr/m²</span>
                  <span>Max: {Math.round(selectedProperty.pricePosition.districtMax / 1000000)} tr/m²</span>
                </div>
                <div className="relative w-full h-6 bg-gradient-to-r from-emerald-200 via-sky-200 to-red-200 rounded-full overflow-visible">
                  {/* Zone normale (Q25-Q75) */}
                  <div className="absolute h-full bg-sky-300/50 rounded"
                    style={{
                      left: `${Math.max(0, Math.min(100, ((selectedProperty.pricePosition.districtLowRange - selectedProperty.pricePosition.districtMin) / (selectedProperty.pricePosition.districtMax - selectedProperty.pricePosition.districtMin)) * 100))}%`,
                      width: `${Math.max(5, ((selectedProperty.pricePosition.districtHighRange - selectedProperty.pricePosition.districtLowRange) / (selectedProperty.pricePosition.districtMax - selectedProperty.pricePosition.districtMin)) * 100)}%`
                    }}
                  />
                  {/* Marqueur de cette annonce */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-3 border-indigo-600 rounded-full shadow-lg z-10"
                    style={{
                      left: `${Math.max(2, Math.min(96, ((selectedProperty.pricePosition.itemPricePerM2 - selectedProperty.pricePosition.districtMin) / (selectedProperty.pricePosition.districtMax - selectedProperty.pricePosition.districtMin)) * 100))}%`,
                      transform: 'translate(-50%, -50%)',
                      borderWidth: '3px'
                    }}
                  />
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm font-semibold text-indigo-700">
                    {language === 'vn' ? 'Giá này' : language === 'fr' ? 'Ce bien' : 'This property'}: {Math.round(selectedProperty.pricePosition.itemPricePerM2 / 1000000)} tr/m²
                  </span>
                </div>
              </div>

              {/* Grille de comparaison */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-xs text-gray-500">{language === 'vn' ? 'Giá này' : language === 'fr' ? 'Ce bien' : 'This'}</p>
                  <p className="font-bold text-indigo-600">{Math.round(selectedProperty.pricePosition.itemPricePerM2 / 1000000)} tr</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-xs text-gray-500">{language === 'vn' ? 'TB quận' : language === 'fr' ? 'Moy. district' : 'Avg district'}</p>
                  <p className="font-bold text-gray-700">{Math.round(selectedProperty.pricePosition.districtAvg / 1000000)} tr</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-xs text-gray-500">{language === 'vn' ? 'Trung vị' : language === 'fr' ? 'Médiane' : 'Median'}</p>
                  <p className="font-bold text-gray-700">{Math.round(selectedProperty.pricePosition.districtMedian / 1000000)} tr</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === SECTION 2: SIGNAUX DE NÉGOCIATION === */}
        {selectedProperty.scoreDetails && (
          <div className="rounded-xl border border-amber-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
              <h4 className="text-white font-bold flex items-center gap-2">
                🎯 {language === 'vn' ? 'Tín hiệu đàm phán' : language === 'fr' ? 'Signaux de Négociation' : 'Negotiation Signals'}
              </h4>
            </div>
            <div className="p-5 bg-white space-y-3">
              
              {/* Mots-clés urgents */}
              {selectedProperty.scoreDetails.urgentKeywords && selectedProperty.scoreDetails.urgentKeywords.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-xl">🔥</span>
                  <div>
                    <p className="font-semibold text-orange-800 text-sm">
                      {language === 'vn' ? 'Từ khóa gấp' : language === 'fr' ? 'Mots-clés urgents détectés' : 'Urgent keywords detected'}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProperty.scoreDetails.urgentKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded text-xs font-bold">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Analyse prix */}
              {selectedProperty.scoreDetails.priceAnalysis && (
                <div className="flex items-start gap-3 p-3 bg-sky-50 rounded-lg">
                  <span className="text-xl">💰</span>
                  <div>
                    <p className="font-semibold text-sky-800 text-sm">
                      {language === 'vn' ? 'Phân tích giá' : language === 'fr' ? 'Position prix' : 'Price analysis'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedProperty.scoreDetails.priceAnalysis.verdict === 'excellent' 
                        ? (language === 'fr' ? `Prix excellent : ${selectedProperty.scoreDetails.priceAnalysis.diffPercent}% en dessous de la moyenne` : `${selectedProperty.scoreDetails.priceAnalysis.diffPercent}% below average`)
                        : selectedProperty.scoreDetails.priceAnalysis.verdict === 'good'
                        ? (language === 'fr' ? `Bon prix : ${selectedProperty.scoreDetails.priceAnalysis.diffPercent}% en dessous` : `${selectedProperty.scoreDetails.priceAnalysis.diffPercent}% below average`)
                        : selectedProperty.scoreDetails.priceAnalysis.verdict === 'fair'
                        ? (language === 'fr' ? `Prix correct : ${selectedProperty.scoreDetails.priceAnalysis.diffPercent}% en dessous` : `${selectedProperty.scoreDetails.priceAnalysis.diffPercent}% below average`)
                        : selectedProperty.scoreDetails.priceAnalysis.verdict === 'average'
                        ? (language === 'fr' ? 'Prix dans la moyenne du quartier' : 'Average price for this area')
                        : (language === 'fr' ? `Au dessus de la moyenne : +${Math.abs(selectedProperty.scoreDetails.priceAnalysis.diffPercent)}%` : `${Math.abs(selectedProperty.scoreDetails.priceAnalysis.diffPercent)}% above average`)}
                    </p>
                  </div>
                </div>
              )}

              {/* Âge de l'annonce */}
              {selectedProperty.scoreDetails.listingAge && selectedProperty.scoreDetails.listingAge.days > 0 && (
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="font-semibold text-purple-800 text-sm">
                      {language === 'vn' ? 'Tuổi tin đăng' : language === 'fr' ? 'Ancienneté de l\'annonce' : 'Listing age'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedProperty.scoreDetails.listingAge.days} {language === 'vn' ? 'ngày' : language === 'fr' ? 'jours' : 'days'}
                      {selectedProperty.scoreDetails.listingAge.verdict === 'very_old' 
                        ? (language === 'fr' ? ' — Très ancienne → vendeur potentiellement flexible' : ' — Very old → seller may be flexible')
                        : selectedProperty.scoreDetails.listingAge.verdict === 'old'
                        ? (language === 'fr' ? ' — Ancienne → possibilité de négocier' : ' — Old → room to negotiate')
                        : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Type de prix */}
              {selectedProperty.scoreDetails.priceType === 'round' && (
                <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                  <span className="text-xl">🎲</span>
                  <div>
                    <p className="font-semibold text-teal-800 text-sm">
                      {language === 'vn' ? 'Giá tròn' : language === 'fr' ? 'Prix rond' : 'Round price'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Prix arrondi → le vendeur n\'a probablement pas fait d\'estimation précise, marge de négociation possible' 
                        : 'Round price → seller may not have precise valuation, negotiation margin possible'}
                    </p>
                  </div>
                </div>
              )}

              {/* Statut légal */}
              {selectedProperty.scoreDetails.legalStatus && selectedProperty.scoreDetails.legalStatus.status && (
                <div className={`flex items-start gap-3 p-3 rounded-lg ${
                  selectedProperty.scoreDetails.legalStatus.verdict === 'excellent' ? 'bg-emerald-50' :
                  selectedProperty.scoreDetails.legalStatus.verdict === 'good' ? 'bg-blue-50' :
                  'bg-amber-50'
                }`}>
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {language === 'vn' ? 'Pháp lý' : language === 'fr' ? 'Statut légal' : 'Legal status'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedProperty.scoreDetails.legalStatus.status}
                      {selectedProperty.scoreDetails.legalStatus.verdict === 'excellent' 
                        ? (language === 'fr' ? ' ✓ Sécurisé' : ' ✓ Secure') 
                        : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === SECTION 3: ALERTES RISQUES / OPPORTUNITÉS === */}
        {selectedProperty.scoreDetails && selectedProperty.scoreDetails.nlpFactors && selectedProperty.scoreDetails.nlpFactors.length > 0 && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-5 py-3">
              <h4 className="text-white font-bold flex items-center gap-2">
                ⚡ {language === 'vn' ? 'Cảnh báo & Cơ hội' : language === 'fr' ? 'Alertes & Opportunités' : 'Alerts & Opportunities'}
              </h4>
            </div>
            <div className="p-5 bg-white space-y-2">
              {selectedProperty.scoreDetails.nlpFactors.map((factor, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                  factor.type === 'bonus' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <span className="font-medium text-sm">{factor.label}</span>
                  <span className={`font-bold text-sm ${factor.type === 'bonus' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {factor.points > 0 ? '+' : ''}{factor.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === SECTION 4: VERDICT IA === */}
        <div className="rounded-xl border-2 border-indigo-300 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3">
            <h4 className="text-white font-bold flex items-center gap-2">
              🤖 {language === 'vn' ? 'Nhận xét AI' : language === 'fr' ? 'Verdict IA' : 'AI Verdict'}
            </h4>
          </div>
          <div className="p-5 bg-gradient-to-br from-indigo-50 to-violet-50">
            <p className="text-gray-800 leading-relaxed">
              {(() => {
                const p = selectedProperty;
                const sd = p.scoreDetails || {};
                const pp = p.pricePosition;
                const parts = [];

                // Ligne 1: Évaluation générale
                if (p.score >= 70) {
                  parts.push(language === 'fr' ? '🔥 Opportunité très intéressante.' : language === 'vn' ? '🔥 Cơ hội rất tốt.' : '🔥 Very interesting opportunity.');
                } else if (p.score >= 50) {
                  parts.push(language === 'fr' ? '👍 Annonce intéressante à considérer.' : language === 'vn' ? '👍 Tin đáng chú ý.' : '👍 Interesting listing to consider.');
                } else if (p.score >= 30) {
                  parts.push(language === 'fr' ? '➡️ Annonce dans la moyenne.' : language === 'vn' ? '➡️ Tin trung bình.' : '➡️ Average listing.');
                } else {
                  parts.push(language === 'fr' ? '⬇️ Peu de signaux de négociation.' : language === 'vn' ? '⬇️ Ít tín hiệu đàm phán.' : '⬇️ Few negotiation signals.');
                }

                // Ligne 2: Prix
                if (pp && pp.position === 'below') {
                  parts.push(language === 'fr' ? `Prix ${Math.abs(pp.percentFromMedian)}% en dessous de la médiane du quartier.` : language === 'vn' ? `Giá thấp hơn ${Math.abs(pp.percentFromMedian)}% so với trung vị quận.` : `Price ${Math.abs(pp.percentFromMedian)}% below district median.`);
                } else if (pp && pp.position === 'above') {
                  parts.push(language === 'fr' ? `Attention : prix ${Math.abs(pp.percentFromMedian)}% au dessus de la médiane.` : language === 'vn' ? `Chú ý: giá cao hơn ${Math.abs(pp.percentFromMedian)}% so với trung vị.` : `Note: price ${Math.abs(pp.percentFromMedian)}% above median.`);
                }

                // Ligne 3: Mots-clés urgents
                if (sd.urgentKeywords && sd.urgentKeywords.length > 0) {
                  parts.push(language === 'fr' ? `Signaux d'urgence détectés (${sd.urgentKeywords.join(', ')}) → marge de négociation probable.` : language === 'vn' ? `Phát hiện từ khóa gấp (${sd.urgentKeywords.join(', ')}) → có thể đàm phán.` : `Urgent signals detected (${sd.urgentKeywords.join(', ')}) → likely negotiation margin.`);
                }

                // Ligne 4: Alerte légale
                if (sd.nlpFactors && sd.nlpFactors.some(f => f.type === 'malus')) {
                  const risks = sd.nlpFactors.filter(f => f.type === 'malus').map(f => f.label).join(', ');
                  parts.push(language === 'fr' ? `⚠️ Risque(s) détecté(s) : ${risks}.` : language === 'vn' ? `⚠️ Rủi ro: ${risks}.` : `⚠️ Risk(s) detected: ${risks}.`);
                }

                // Ligne 5: Estimation négociation
                if (p.score >= 60 && pp && pp.position !== 'above') {
                  const estimMin = pp.position === 'below' ? 5 : 10;
                  const estimMax = pp.position === 'below' ? 15 : 20;
                  parts.push(language === 'fr' ? `💡 Potentiel de négociation estimé : ${estimMin}-${estimMax}%.` : language === 'vn' ? `💡 Tiềm năng đàm phán: ${estimMin}-${estimMax}%.` : `💡 Estimated negotiation potential: ${estimMin}-${estimMax}%.`);
                }

                // Ligne 6: Statut légal manquant
                if (!p.legalStatus) {
                  parts.push(language === 'fr' ? '📋 Statut légal non confirmé — à vérifier avant visite.' : language === 'vn' ? '📋 Chưa xác nhận pháp lý — cần kiểm tra.' : '📋 Legal status unconfirmed — verify before visiting.');
                }

                return parts.join(' ');
              })()}
            </p>
          </div>
        </div>

        {/* === DÉTAILS DU BIEN === */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
<div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-gray-500">📐 {language === 'vn' ? 'Diện tích' : language === 'fr' ? 'Surface' : 'Area'}</p>
            <p className="text-lg font-semibold">{selectedProperty.area || '?'} m²</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-gray-500">🛏️ {t.rooms}</p>
            <p className="text-lg font-semibold">{selectedProperty.bedrooms || '?'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-gray-500">🚿 {t.bathrooms}</p>
            <p className="text-lg font-semibold">{selectedProperty.bathrooms || '?'}</p>
          </div>
{selectedProperty.floors && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-gray-500">🏢 {language === 'vn' ? 'Số tầng' : language === 'fr' ? 'Étages' : 'Floors'}</p>
              <p className="text-lg font-semibold">{selectedProperty.floors}</p>
            </div>
          )}
{selectedProperty.direction && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-gray-500">🧭 {language === 'vn' ? 'Hướng' : language === 'fr' ? 'Orientation' : 'Direction'}</p>
              <p className="text-lg font-semibold">{selectedProperty.direction}</p>
            </div>
          )}
          {selectedProperty.facadeWidth && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-gray-500">📏 {language === 'fr' ? 'Façade' : 'Facade'}</p>
              <p className="text-lg font-semibold">{selectedProperty.streetWidth}m</p>
            </div>
          )}
          {selectedProperty.facadeWidth && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-gray-500">📏 {language === 'fr' ? 'Façade' : 'Facade'}</p>
              <p className="text-lg font-semibold">{selectedProperty.facadeWidth}m</p>
            </div>
          )}
          {selectedProperty.legalStatus && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-gray-500">📋 {language === 'vn' ? 'Pháp lý' : language === 'fr' ? 'Statut légal' : 'Legal'}</p>
              <p className="text-lg font-semibold">{selectedProperty.legalStatus}</p>
            </div>
          )}
        </div>

        {/* Adresse */}
        <div className="p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition"
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProperty.address || selectedProperty.district + ' ' + selectedProperty.city)}`, '_blank')}
        >
          <p className="text-xs text-gray-500 mb-1">📍 {language === 'fr' ? 'Adresse (cliquer pour Google Maps)' : 'Address (click for Google Maps)'}</p>
          <p className="font-medium">{selectedProperty.address || `${selectedProperty.district || ''}, ${selectedProperty.ward || ''}, ${selectedProperty.city || ''}`}</p>
        </div>

        {/* Source et Date */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>🌐 {selectedProperty.source}</span>
          {selectedProperty.postedOn && <span>📅 {selectedProperty.postedOn}</span>}
        </div>

              {/* Disclaimer Transparence */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">⚖️</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 mb-1">
                      {language === 'vn'
                        ? 'Minh bạch dữ liệu'
                        : language === 'fr'
                        ? 'Transparence des données'
                        : 'Data Transparency'}
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {language === 'vn'
                        ? 'Phân tích giá dựa trên các tin đăng trực tuyến trong cùng quận/huyện tại thời điểm tìm kiếm. Điểm đàm phán được tính từ thuật toán K Trix (giá, từ khóa, pháp lý, thời gian đăng). Dữ liệu này không thay thế thẩm định chuyên nghiệp.'
                        : language === 'fr'
                        ? 'L\'analyse des prix est basée sur les annonces en ligne du même district au moment de la recherche. Le score de négociation est calculé par l\'algorithme K Trix (prix, mots-clés, statut légal, ancienneté). Ces données ne remplacent pas une évaluation immobilière professionnelle.'
                        : 'Price analysis is based on online listings in the same district at the time of search. The negotiation score is calculated by the K Trix algorithm (price, keywords, legal status, listing age). This data does not replace a professional property valuation.'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-amber-200">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-amber-700">
                          {language === 'vn' ? 'Dữ liệu thực' : language === 'fr' ? 'Données réelles' : 'Real data'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                        <span className="text-xs text-amber-700">
                          {language === 'vn' ? 'Thuật toán K Trix' : language === 'fr' ? 'Algorithme K Trix' : 'K Trix algorithm'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-amber-700">
                          {language === 'vn' ? 'Tham khảo' : language === 'fr' ? 'Indicatif' : 'Indicative'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


        {/* Boutons */}
        <div className="flex gap-3 pt-2">
          <a 
            href={selectedProperty.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-xl font-medium text-center hover:from-blue-600 hover:to-sky-500 transition shadow-lg"
          >
            🔗 {t.viewOriginal}
          </a>
          <button 
            onClick={() => setSelectedProperty(null)} 
            className="px-6 py-3 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition"
          >
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
