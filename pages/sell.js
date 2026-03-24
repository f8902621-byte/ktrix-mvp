import { useState, useEffect, useRef } from 'react';
import { Home, Copy, ExternalLink, Sparkles, Loader, CheckCircle, MapPin, Camera, X, Phone, Facebook, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SellPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('vn');
  const [mode, setMode] = useState('facebook'); // 'facebook' | 'manual'
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // ── Mode Facebook ──
  const [fbData, setFbData] = useState({
    listingUrl: '',
    groupUrl: '',
    groupName: '',
    contactPhone: '',
  });

  // ── Mode Manuel ──
  const [formData, setFormData] = useState({
    city: '', district: '', ward: '', street: '',
    propertyType: '',
    price: '', priceUnit: 'ty', priceNegotiable: false,
    landArea: '', livingArea: '', bedrooms: '', bathrooms: '', floors: '',
    landLength: '', landWidth: '',
    legalStatus: '', propertyCondition: '', furniture: '', direction: '',
    highlights: [], nearbyEducation: [], nearbyHealth: [], nearbyAmenities: [], nearbyWork: [],
    saleConditions: [],
    additionalNotes: '',
    photos: [],
    contactPhone: '',
    facebookGroupUrl: '',
    facebookGroupName: '',
  });

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
    'Lâm Đồng': ['Đà Lạt', 'Bảo Lộc', 'Đức Trọng', 'Lâm Hà'],
  };

  const t = {
    vn: {
      title: 'Đăng tin bán', subtitle: 'Tạo tin đăng chuyên nghiệp với AI',
      modeFacebook: 'Import từ Facebook', modeManual: 'Nhập thủ công',
      modeFacebookDesc: 'Dán link bài đăng Facebook — K Trix tự động nhập thông tin',
      modeManualDesc: 'Điền thông tin thủ công và tạo tin đăng với AI',
      fbListingUrl: 'Link bài đăng Facebook *',
      fbListingUrlPlaceholder: 'https://www.facebook.com/groups/.../posts/...',
      fbGroupUrl: 'Link nhóm Facebook của bạn *',
      fbGroupUrlPlaceholder: 'https://www.facebook.com/groups/...',
      fbGroupUrlDesc: 'Nhóm của bạn sẽ được hiển thị trên K Trix — quảng bá miễn phí!',
      fbGroupName: 'Tên nhóm (tùy chọn)',
      fbGroupNamePlaceholder: 'Cộng đồng BĐS Hồ Chí Minh',
      fbContact: 'Số điện thoại / Zalo',
      fbContactPlaceholder: '0901 234 567',
      fbSubmit: 'Đăng lên K Trix',
      fbBadge: 'Nhóm của bạn sẽ xuất hiện như này trên kết quả tìm kiếm:',
      location: 'Vị trí & Loại BDS', city: 'Thành phố', district: 'Quận/Huyện',
      ward: 'Phường/Xã', street: 'Đường/Số nhà', propertyType: 'Loại BDS',
      selectCity: 'Chọn thành phố', selectDistrict: 'Chọn quận/huyện', selectWard: 'Chọn phường/xã',
      priceSection: 'Giá & Thông tin cơ bản', price: 'Giá bán', priceNegotiable: 'Giá thương lượng',
      landArea: 'Diện tích đất (m²)', livingArea: 'Diện tích sử dụng (m²)',
      bedrooms: 'Phòng ngủ', bathrooms: 'Phòng tắm', floors: 'Số tầng',
      dimensions: 'Kích thước & Cấu trúc', landLength: 'Đất dài (m)', landWidth: 'Đất rộng (m)',
      legalStatus: 'Pháp lý', propertyCondition: 'Tình trạng', furniture: 'Nội thất', direction: 'Hướng',
      highlights: 'Điểm nổi bật', nearbyEducation: 'Gần trường học', nearbyHealth: 'Gần y tế',
      nearbyAmenities: 'Gần tiện ích', nearbyWork: 'Gần nơi làm việc', saleConditions: 'Điều kiện bán',
      additionalNotes: 'Ghi chú thêm', additionalNotesPlaceholder: 'Thông tin khác...',
      photosSection: 'Hình ảnh', photosDesc: 'Thêm ảnh bất động sản (tối đa 10 ảnh)',
      addPhotos: 'Thêm ảnh', photoCount: 'ảnh đã chọn',
      contactSection: 'Thông tin liên hệ', contactPhone: 'Số điện thoại / Zalo / WhatsApp',
      contactPhonePlaceholder: '0901 234 567',
      fbGroupSection: 'Nhóm Facebook nguồn (tùy chọn)',
      fbGroupSectionDesc: 'Nếu tin này đến từ nhóm FB, nhóm của bạn sẽ được hiển thị trên K Trix',
      generate: 'Tạo tin đăng với AI', generating: 'Đang tạo...',
      generatedTitle: 'Tin đăng của bạn', copy: 'Sao chép', copied: 'Đã sao chép!',
      postOn: 'Đăng tin trên', required: 'Bắt buộc: Thành phố, Loại BDS, Giá, Diện tích',
      backToSearch: 'Quay lại tìm kiếm',
    },
    en: {
      title: 'List Property', subtitle: 'Create professional listings with AI',
      modeFacebook: 'Import from Facebook', modeManual: 'Manual entry',
      modeFacebookDesc: 'Paste your Facebook post link — K Trix imports automatically',
      modeManualDesc: 'Fill in details manually and generate listing with AI',
      fbListingUrl: 'Facebook post URL *',
      fbListingUrlPlaceholder: 'https://www.facebook.com/groups/.../posts/...',
      fbGroupUrl: 'Your Facebook group URL *',
      fbGroupUrlPlaceholder: 'https://www.facebook.com/groups/...',
      fbGroupUrlDesc: 'Your group will be displayed on K Trix — free promotion!',
      fbGroupName: 'Group name (optional)',
      fbGroupNamePlaceholder: 'Ho Chi Minh Real Estate Community',
      fbContact: 'Phone / Zalo',
      fbContactPlaceholder: '0901 234 567',
      fbSubmit: 'Post on K Trix',
      fbBadge: 'Your group will appear like this on search results:',
      location: 'Location & Property Type', city: 'City', district: 'District',
      ward: 'Ward', street: 'Street/Address', propertyType: 'Property Type',
      selectCity: 'Select city', selectDistrict: 'Select district', selectWard: 'Select ward',
      priceSection: 'Price & Basic Info', price: 'Sale Price', priceNegotiable: 'Negotiable',
      landArea: 'Land Area (m²)', livingArea: 'Living Area (m²)',
      bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', floors: 'Floors',
      dimensions: 'Dimensions & Structure', landLength: 'Land Length (m)', landWidth: 'Land Width (m)',
      legalStatus: 'Legal Status', propertyCondition: 'Condition', furniture: 'Furniture', direction: 'Direction',
      highlights: 'Highlights', nearbyEducation: 'Near Schools', nearbyHealth: 'Near Healthcare',
      nearbyAmenities: 'Near Amenities', nearbyWork: 'Near Workplace', saleConditions: 'Sale Conditions',
      additionalNotes: 'Additional Notes', additionalNotesPlaceholder: 'Other info...',
      photosSection: 'Photos', photosDesc: 'Add property photos (max 10)',
      addPhotos: 'Add Photos', photoCount: 'photos selected',
      contactSection: 'Contact Information', contactPhone: 'Phone / Zalo / WhatsApp',
      contactPhonePlaceholder: '0901 234 567',
      fbGroupSection: 'Facebook source group (optional)',
      fbGroupSectionDesc: 'If this listing comes from an FB group, your group will be shown on K Trix',
      generate: 'Generate with AI', generating: 'Generating...',
      generatedTitle: 'Your Listing', copy: 'Copy', copied: 'Copied!',
      postOn: 'Post on', required: 'Required: City, Property Type, Price, Area',
      backToSearch: 'Back to Search',
    },
    fr: {
      title: 'Publier une annonce', subtitle: "Créez une annonce professionnelle avec l'IA",
      modeFacebook: 'Import depuis Facebook', modeManual: 'Saisie manuelle',
      modeFacebookDesc: 'Collez le lien de votre post Facebook — K Trix importe automatiquement',
      modeManualDesc: "Remplissez les informations manuellement et générez avec l'IA",
      fbListingUrl: 'URL du post Facebook *',
      fbListingUrlPlaceholder: 'https://www.facebook.com/groups/.../posts/...',
      fbGroupUrl: 'URL de votre groupe Facebook *',
      fbGroupUrlPlaceholder: 'https://www.facebook.com/groups/...',
      fbGroupUrlDesc: 'Votre groupe sera affiché sur K Trix — promotion gratuite !',
      fbGroupName: 'Nom du groupe (optionnel)',
      fbGroupNamePlaceholder: 'Communauté Immobilière Ho Chi Minh',
      fbContact: 'Téléphone / Zalo',
      fbContactPlaceholder: '0901 234 567',
      fbSubmit: 'Publier sur K Trix',
      fbBadge: 'Votre groupe apparaîtra ainsi dans les résultats de recherche :',
      location: 'Localisation & Type de bien', city: 'Ville', district: 'District / Ville',
      ward: 'Quartier', street: 'Rue/Adresse', propertyType: 'Type de bien',
      selectCity: 'Choisir ville', selectDistrict: 'Choisir district', selectWard: 'Choisir quartier',
      priceSection: 'Prix & Infos de base', price: 'Prix de vente', priceNegotiable: 'Négociable',
      landArea: 'Surface terrain (m²)', livingArea: 'Surface habitable (m²)',
      bedrooms: 'Chambres', bathrooms: 'Salle de bain', floors: 'Étages',
      dimensions: 'Dimensions & Structure', landLength: 'Longueur terrain (m)', landWidth: 'Largeur terrain (m)',
      legalStatus: 'Statut légal', propertyCondition: 'État', furniture: 'Mobilier', direction: 'Orientation',
      highlights: 'Points forts', nearbyEducation: 'Écoles à proximité', nearbyHealth: 'Santé à proximité',
      nearbyAmenities: 'Commodités à proximité', nearbyWork: 'Travail à proximité', saleConditions: 'Conditions de vente',
      additionalNotes: 'Notes supplémentaires', additionalNotesPlaceholder: 'Autres infos...',
      photosSection: 'Photos', photosDesc: 'Ajoutez des photos du bien (max 10)',
      addPhotos: 'Ajouter des photos', photoCount: 'photos sélectionnées',
      contactSection: 'Informations de contact', contactPhone: 'Téléphone / Zalo / WhatsApp',
      contactPhonePlaceholder: '0901 234 567',
      fbGroupSection: 'Groupe Facebook source (optionnel)',
      fbGroupSectionDesc: "Si cette annonce provient d'un groupe FB, votre groupe sera affiché sur K Trix",
      generate: "Générer avec l'IA", generating: 'Génération...',
      generatedTitle: 'Votre annonce', copy: 'Copier', copied: 'Copié !',
      postOn: 'Publier sur', required: 'Requis: Ville, Type, Prix, Surface',
      backToSearch: 'Retour à la recherche',
    }
  }[language];

  const propertyTypes = [
    { vn: 'Căn hộ chung cư', en: 'Apartment', fr: 'Appartement' },
    { vn: 'Nhà ở', en: 'House', fr: 'Maison' },
    { vn: 'Nhà biệt thự', en: 'Villa', fr: 'Villa' },
    { vn: 'Shophouse', en: 'Shophouse', fr: 'Shophouse' },
    { vn: 'Đất', en: 'Land', fr: 'Terrain' },
    { vn: 'Văn phòng', en: 'Office', fr: 'Bureau' },
    { vn: 'Mặt bằng', en: 'Premises', fr: 'Local commercial' },
  ];

  const legalStatuses = [
    { vn: 'Sổ đỏ/Sổ hồng', en: 'Red/Pink Book', fr: 'Sổ đỏ/Sổ hồng' },
    { vn: 'Hợp đồng mua bán', en: 'Sales Contract', fr: 'Contrat de vente' },
    { vn: 'Đang chờ sổ', en: 'Pending', fr: 'En attente' },
  ];

  const propertyConditions = [
    { vn: 'Mới xây', en: 'Newly Built', fr: 'Neuf' },
    { vn: 'Mới sửa', en: 'Recently Renovated', fr: 'Rénové récemment' },
    { vn: 'Vào ở ngay', en: 'Ready to Move In', fr: 'Prêt à habiter' },
    { vn: 'Cần sửa chữa', en: 'Needs Renovation', fr: 'À rénover' },
  ];

  const furnitureOptions = [
    { vn: 'Nội thất đầy đủ', en: 'Fully Furnished', fr: 'Meublé complet' },
    { vn: 'Nội thất cơ bản', en: 'Basic Furniture', fr: 'Meublé basique' },
    { vn: 'Nhà trống', en: 'Unfurnished', fr: 'Non meublé' },
  ];

  const directions = [
    { vn: 'Đông', en: 'East', fr: 'Est' }, { vn: 'Tây', en: 'West', fr: 'Ouest' },
    { vn: 'Nam', en: 'South', fr: 'Sud' }, { vn: 'Bắc', en: 'North', fr: 'Nord' },
    { vn: 'Đông Nam', en: 'Southeast', fr: 'Sud-Est' }, { vn: 'Đông Bắc', en: 'Northeast', fr: 'Nord-Est' },
    { vn: 'Tây Nam', en: 'Southwest', fr: 'Sud-Ouest' }, { vn: 'Tây Bắc', en: 'Northwest', fr: 'Nord-Ouest' },
  ];

  const highlightOptions = [
    { id: 'bright', vn: 'Nhiều ánh sáng', en: 'Bright', fr: 'Lumineux' },
    { id: 'quiet', vn: 'Yên tĩnh', en: 'Quiet', fr: 'Calme' },
    { id: 'view', vn: 'View thoáng', en: 'Open View', fr: 'Vue dégagée' },
    { id: 'river_view', vn: 'View sông', en: 'River View', fr: 'Vue rivière' },
    { id: 'garden', vn: 'Sân vườn', en: 'Garden', fr: 'Jardin' },
    { id: 'terrace', vn: 'Sân thượng', en: 'Terrace', fr: 'Terrasse' },
    { id: 'kitchen', vn: 'Bếp đầy đủ', en: 'Equipped Kitchen', fr: 'Cuisine équipée' },
    { id: 'parking', vn: 'Chỗ đậu xe', en: 'Parking', fr: 'Parking' },
    { id: 'pool', vn: 'Hồ bơi', en: 'Pool', fr: 'Piscine' },
    { id: 'security', vn: 'An ninh 24/7', en: '24/7 Security', fr: 'Sécurité 24/7' },
  ];

  const nearbyEducationOptions = [
    { id: 'kindergarten', vn: 'Trường mầm non', en: 'Kindergarten', fr: 'École maternelle' },
    { id: 'primary', vn: 'Trường tiểu học', en: 'Primary School', fr: 'École primaire' },
    { id: 'secondary', vn: 'Trường THCS', en: 'Secondary School', fr: 'Collège' },
    { id: 'highschool', vn: 'Trường THPT', en: 'High School', fr: 'Lycée' },
    { id: 'international', vn: 'Trường quốc tế', en: 'International School', fr: 'École internationale' },
    { id: 'university', vn: 'Đại học', en: 'University', fr: 'Université' },
  ];

  const nearbyHealthOptions = [
    { id: 'clinic', vn: 'Phòng khám', en: 'Clinic', fr: 'Clinique' },
    { id: 'hospital_public', vn: 'Bệnh viện công', en: 'Public Hospital', fr: 'Hôpital public' },
    { id: 'hospital_intl', vn: 'Bệnh viện quốc tế', en: 'International Hospital', fr: 'Hôpital international' },
    { id: 'pharmacy', vn: 'Nhà thuốc', en: 'Pharmacy', fr: 'Pharmacie' },
  ];

  const nearbyAmenitiesOptions = [
    { id: 'mall', vn: 'Trung tâm thương mại', en: 'Shopping Mall', fr: 'Centre commercial' },
    { id: 'supermarket', vn: 'Siêu thị', en: 'Supermarket', fr: 'Supermarché' },
    { id: 'market', vn: 'Chợ', en: 'Local Market', fr: 'Marché' },
    { id: 'metro', vn: 'Ga metro', en: 'Metro Station', fr: 'Station métro' },
    { id: 'bus', vn: 'Trạm xe buýt', en: 'Bus Stop', fr: 'Arrêt de bus' },
    { id: 'park', vn: 'Công viên', en: 'Park', fr: 'Parc' },
    { id: 'gym', vn: 'Phòng gym', en: 'Gym', fr: 'Salle de sport' },
    { id: 'restaurant', vn: 'Nhà hàng', en: 'Restaurants', fr: 'Restaurants' },
    { id: 'cafe', vn: 'Quán cà phê', en: 'Cafes', fr: 'Cafés' },
  ];

  const nearbyWorkOptions = [
    { id: 'industrial', vn: 'Khu công nghiệp', en: 'Industrial Zone', fr: 'Zone industrielle' },
    { id: 'business', vn: 'Trung tâm kinh doanh', en: 'Business Center', fr: "Centre d'affaires" },
    { id: 'coworking', vn: 'Không gian làm việc chung', en: 'Coworking Space', fr: 'Coworking' },
    { id: 'cbd', vn: 'Trung tâm thành phố', en: 'CBD', fr: 'Centre-ville' },
  ];

  const saleConditionOptions = [
    { id: 'negotiable', vn: 'Giá thương lượng', en: 'Price Negotiable', fr: 'Prix négociable' },
    { id: 'immediate', vn: 'Bàn giao ngay', en: 'Immediate Handover', fr: 'Disponible immédiatement' },
    { id: 'urgent', vn: 'Bán gấp', en: 'Urgent Sale', fr: 'Vente urgente' },
    { id: 'installment', vn: 'Hỗ trợ trả góp', en: 'Installment Support', fr: 'Paiement échelonné' },
    { id: 'bank_loan', vn: 'Hỗ trợ vay ngân hàng', en: 'Bank Loan Support', fr: 'Aide prêt bancaire' },
  ];

  const toggleArrayItem = (field, itemId) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(itemId)
        ? prev[field].filter(id => id !== itemId)
        : [...prev[field], itemId]
    }));
  };

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 10 - formData.photos.length;
    const toAdd = files.slice(0, remaining);
    const previews = toAdd.map(file => ({ file, url: URL.createObjectURL(file), name: file.name }));
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...previews] }));
  };

  const handlePhotoRemove = (index) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleFbSubmit = () => {
    if (!fbData.listingUrl || !fbData.groupUrl) return;
    alert(
      language === 'fr'
        ? '✅ Annonce soumise ! Elle apparaîtra dans les résultats avec le badge de votre groupe.'
        : language === 'vn'
        ? '✅ Tin đã được gửi! Tin sẽ xuất hiện trong kết quả với badge nhóm của bạn.'
        : '✅ Listing submitted! It will appear in results with your group badge.'
    );
  };

  const handleGenerate = async () => {
    if (!formData.city || !formData.propertyType || !formData.price || !formData.landArea) {
      alert(t.required);
      return;
    }
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) { setGeneratedText(data.listing); }
      else { throw new Error(data.error); }
    } catch (err) {
      const type = propertyTypes.find(p => p.vn === formData.propertyType)?.vn || formData.propertyType;
      const priceText = formData.priceUnit === 'ty' ? `${formData.price} Tỷ` : `${formData.price} Triệu`;
      let text = `🏠 BÁN ${type.toUpperCase()} - ${formData.city}\n\n`;
      text += `📍 ${formData.ward ? formData.ward + ', ' : ''}${formData.district ? formData.district + ', ' : ''}${formData.city}\n`;
      if (formData.street) text += `   ${formData.street}\n`;
      text += `\n💰 ${priceText}${formData.priceNegotiable ? ' (Thương lượng)' : ''}\n`;
      if (formData.landArea) text += `📐 ${formData.landArea}m²`;
      if (formData.bedrooms) text += ` • ${formData.bedrooms} PN`;
      if (formData.bathrooms) text += ` • ${formData.bathrooms} WC`;
      text += '\n';
      if (formData.legalStatus) text += `📜 ${formData.legalStatus}\n`;
      if (formData.additionalNotes) text += `\n📝 ${formData.additionalNotes}\n`;
      if (formData.contactPhone) text += `\n📞 ${formData.contactPhone}`;
      if (formData.facebookGroupUrl) text += `\n🔗 ${formData.facebookGroupName || formData.facebookGroupUrl}`;
      text += `\n\n🤖 K Trix — ktrix.ai`;
      setGeneratedText(text);
    } finally { setGenerating(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const FbBadge = ({ name, url }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-blue-700/80 text-white px-2 py-1 rounded text-xs font-bold hover:bg-blue-600 transition">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      {name || 'Facebook'}
    </a>
  );

  const CheckboxGroup = ({ label, options, field }) => (
    <div className="mb-3">
      <label className="block text-sm font-bold text-gray-400 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt.id} type="button" onClick={() => toggleArrayItem(field, opt.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${formData[field].includes(opt.id) ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}>
            {formData[field].includes(opt.id) && '✓ '}{opt[language]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-800 rounded-lg text-blue-400"><Home className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              <img src="https://raw.githubusercontent.com/f8902621-byte/traxhome-mvp/main/Ktrixlogo.png" alt="K Trix" className="w-20 h-20 object-contain" />
              <div><h1 className="text-lg font-bold text-white">💰 {t.title}</h1><p className="text-xs text-gray-500">{t.subtitle}</p></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-300 text-sm">
              <option value="vn">🇻🇳 VN</option><option value="en">🇬🇧 EN</option><option value="fr">🇫🇷 FR</option>
            </select>
            <button onClick={() => router.push('/search')} className="px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/20">🔍 {t.backToSearch}</button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Toggle Mode */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setMode('facebook')} className={`p-4 rounded-xl border-2 text-left transition ${mode === 'facebook' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Facebook className={`w-5 h-5 ${mode === 'facebook' ? 'text-blue-400' : 'text-gray-500'}`} />
              <span className={`font-bold text-sm ${mode === 'facebook' ? 'text-blue-300' : 'text-gray-400'}`}>{t.modeFacebook}</span>
              {mode === 'facebook' && <span className="ml-auto text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">⚡ Rapide</span>}
            </div>
            <p className="text-xs text-gray-500">{t.modeFacebookDesc}</p>
          </button>
          <button onClick={() => setMode('manual')} className={`p-4 rounded-xl border-2 text-left transition ${mode === 'manual' ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className={`w-5 h-5 ${mode === 'manual' ? 'text-orange-400' : 'text-gray-500'}`} />
              <span className={`font-bold text-sm ${mode === 'manual' ? 'text-orange-300' : 'text-gray-400'}`}>{t.modeManual}</span>
            </div>
            <p className="text-xs text-gray-500">{t.modeManualDesc}</p>
          </button>
        </div>

        {/* ══ MODE FACEBOOK ══ */}
        {mode === 'facebook' && (
          <div className="bg-gray-900 rounded-xl border border-blue-500/30 p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Facebook className="w-6 h-6 text-blue-400" />
              <h2 className="text-lg font-bold text-white">{t.modeFacebook}</h2>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">{t.fbListingUrl}</label>
              <input type="url" value={fbData.listingUrl} onChange={(e) => setFbData({ ...fbData, listingUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:border-blue-500 focus:outline-none transition"
                placeholder={t.fbListingUrlPlaceholder} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">{t.fbGroupUrl}</label>
              <input type="url" value={fbData.groupUrl} onChange={(e) => setFbData({ ...fbData, groupUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:border-blue-500 focus:outline-none transition"
                placeholder={t.fbGroupUrlPlaceholder} />
              <p className="text-xs text-emerald-400 mt-1.5 font-medium">🎁 {t.fbGroupUrlDesc}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">{t.fbGroupName}</label>
              <input type="text" value={fbData.groupName} onChange={(e) => setFbData({ ...fbData, groupName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:border-blue-500 focus:outline-none transition"
                placeholder={t.fbGroupNamePlaceholder} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">{t.fbContact}</label>
              <input type="text" value={fbData.contactPhone} onChange={(e) => setFbData({ ...fbData, contactPhone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:border-blue-500 focus:outline-none transition"
                placeholder={t.fbContactPlaceholder} />
            </div>

            {/* Préview badge */}
            {fbData.groupUrl && (
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-xs text-gray-500 mb-3">{t.fbBadge}</p>
                <FbBadge name={fbData.groupName || 'Votre groupe Facebook'} url={fbData.groupUrl} />
              </div>
            )}

            <button onClick={handleFbSubmit} disabled={!fbData.listingUrl || !fbData.groupUrl}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition">
              <Facebook className="w-6 h-6" />{t.fbSubmit}<ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ══ MODE MANUEL ══ */}
        {mode === 'manual' && (
          <div className="space-y-6">

            {/* Localisation */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-400" />{t.location}</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">{t.city} <span className="text-orange-400">*</span></label>
                  <select value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value, district: '', ward: '' })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200">
                    <option value="">{t.selectCity}</option>
                    {vietnamCities.map((c, i) => <option key={i} value={c.vn}>{c[language]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">{t.district}</label>
                  <select value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value, ward: '' })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" disabled={!formData.city}>
                    <option value="">{t.selectDistrict}</option>
                    {(districtsByCity[formData.city] || []).map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.ward}</label><input type="text" value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder={t.selectWard} /></div>
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.street}</label><input type="text" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="123 Nguyễn Văn A" /></div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">{t.propertyType} <span className="text-orange-400">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((pt, i) => (<button key={i} type="button" onClick={() => setFormData({ ...formData, propertyType: pt.vn })} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${formData.propertyType === pt.vn ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}>{pt[language]}</button>))}
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">💰 {t.priceSection}</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-300 mb-1">{t.price} <span className="text-orange-400">*</span></label>
                  <div className="flex gap-2">
                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="flex-1 px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="5" />
                    <select value={formData.priceUnit} onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })} className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200"><option value="ty">Tỷ</option><option value="trieu">Triệu</option></select>
                  </div>
                </div>
                <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.priceNegotiable} onChange={(e) => setFormData({ ...formData, priceNegotiable: e.target.checked })} className="w-5 h-5 text-orange-500 rounded bg-gray-800 border-gray-600" /><span className="text-sm font-medium text-gray-300">{t.priceNegotiable}</span></label></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.landArea} <span className="text-orange-400">*</span></label><input type="number" value={formData.landArea} onChange={(e) => setFormData({ ...formData, landArea: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="100" /></div>
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.livingArea}</label><input type="number" value={formData.livingArea} onChange={(e) => setFormData({ ...formData, livingArea: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="80" /></div>
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.bedrooms}</label><input type="number" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="3" /></div>
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.bathrooms}</label><input type="number" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="2" /></div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">📐 {t.dimensions}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.floors}</label><input type="number" value={formData.floors} onChange={(e) => setFormData({ ...formData, floors: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="2" /></div>
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.landLength}</label><input type="number" value={formData.landLength} onChange={(e) => setFormData({ ...formData, landLength: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="20" /></div>
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.landWidth}</label><input type="number" value={formData.landWidth} onChange={(e) => setFormData({ ...formData, landWidth: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="5" /></div>
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.direction}</label><select value={formData.direction} onChange={(e) => setFormData({ ...formData, direction: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200"><option value="">--</option>{directions.map((d, i) => <option key={i} value={d.vn}>{d[language]}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.legalStatus}</label><select value={formData.legalStatus} onChange={(e) => setFormData({ ...formData, legalStatus: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200"><option value="">--</option>{legalStatuses.map((s, i) => <option key={i} value={s.vn}>{s[language]}</option>)}</select></div>
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.propertyCondition}</label><select value={formData.propertyCondition} onChange={(e) => setFormData({ ...formData, propertyCondition: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200"><option value="">--</option>{propertyConditions.map((c, i) => <option key={i} value={c.vn}>{c[language]}</option>)}</select></div>
                <div><label className="block text-sm font-bold text-gray-300 mb-1">{t.furniture}</label><select value={formData.furniture} onChange={(e) => setFormData({ ...formData, furniture: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200"><option value="">--</option>{furnitureOptions.map((f, i) => <option key={i} value={f.vn}>{f[language]}</option>)}</select></div>
              </div>
            </div>

            {/* Points forts + Proximités */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h2 className="text-lg font-bold text-white mb-3">✨ {t.highlights}</h2>
                <CheckboxGroup label="" options={highlightOptions} field="highlights" />
                <h2 className="text-lg font-bold text-white mb-3 mt-4">💼 {t.saleConditions}</h2>
                <CheckboxGroup label="" options={saleConditionOptions} field="saleConditions" />
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h2 className="text-lg font-bold text-white mb-3">📍 {language === 'vn' ? 'Tiện ích lân cận' : language === 'en' ? 'Nearby' : 'Proximités'}</h2>
                <CheckboxGroup label={`🎓 ${t.nearbyEducation}`} options={nearbyEducationOptions} field="nearbyEducation" />
                <CheckboxGroup label={`🏥 ${t.nearbyHealth}`} options={nearbyHealthOptions} field="nearbyHealth" />
                <CheckboxGroup label={`🛒 ${t.nearbyAmenities}`} options={nearbyAmenitiesOptions} field="nearbyAmenities" />
                <CheckboxGroup label={`💼 ${t.nearbyWork}`} options={nearbyWorkOptions} field="nearbyWork" />
              </div>
            </div>

            {/* Photos */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Camera className="w-5 h-5 text-orange-400" />{t.photosSection}</h2>
              <p className="text-sm text-gray-500 mb-4">{t.photosDesc}</p>
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                  {formData.photos.map((photo, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={photo.url} alt={photo.name} className="w-full h-full object-cover rounded-lg border border-gray-700" />
                      <button onClick={() => handlePhotoRemove(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3 text-white" /></button>
                      {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded font-medium">{language === 'vn' ? 'Chính' : language === 'en' ? 'Main' : 'Principale'}</span>}
                    </div>
                  ))}
                </div>
              )}
              {formData.photos.length < 10 && (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoAdd} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-orange-500 hover:text-orange-400 transition w-full justify-center">
                    <Camera className="w-5 h-5" />{t.addPhotos}
                    {formData.photos.length > 0 && <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{formData.photos.length}/10 {t.photoCount}</span>}
                  </button>
                </>
              )}
            </div>

            {/* Contact */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Phone className="w-5 h-5 text-orange-400" />{t.contactSection}</h2>
              <input type="text" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder={t.contactPhonePlaceholder} />
            </div>

            {/* Groupe FB source */}
            <div className="bg-gray-900 rounded-xl border border-blue-500/20 p-6">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Facebook className="w-5 h-5 text-blue-400" />{t.fbGroupSection}</h2>
              <p className="text-sm text-emerald-400 mb-4">🎁 {t.fbGroupSectionDesc}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">URL {language === 'fr' ? 'du groupe' : language === 'en' ? 'of group' : 'nhóm'}</label>
                  <input type="url" value={formData.facebookGroupUrl} onChange={(e) => setFormData({ ...formData, facebookGroupUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 text-sm" placeholder="https://www.facebook.com/groups/..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">{language === 'fr' ? 'Nom du groupe' : language === 'en' ? 'Group name' : 'Tên nhóm'}</label>
                  <input type="text" value={formData.facebookGroupName} onChange={(e) => setFormData({ ...formData, facebookGroupName: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 text-sm" placeholder="Cộng đồng BĐS..." />
                </div>
              </div>
              {formData.facebookGroupUrl && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Badge K Trix :</span>
                  <FbBadge name={formData.facebookGroupName || 'Votre groupe'} url={formData.facebookGroupUrl} />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">📝 {t.additionalNotes}</h2>
              <textarea value={formData.additionalNotes} onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })} className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 h-24 resize-none" placeholder={t.additionalNotesPlaceholder} />
            </div>

            {/* Bouton + résultat */}
            <div className="space-y-4">
              <button onClick={handleGenerate} disabled={generating || !formData.city || !formData.propertyType || !formData.price || !formData.landArea}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
                {generating ? <><Loader className="w-6 h-6 animate-spin" />{t.generating}</> : <><Sparkles className="w-6 h-6" />{t.generate}</>}
              </button>
              <p className="text-sm text-center text-orange-400 font-medium">⚠️ {t.required}</p>
              {generatedText && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 flex items-center justify-between">
                    <h3 className="text-white font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5" />{t.generatedTitle}</h3>
                    <button onClick={copyToClipboard} className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/30 transition"><Copy className="w-4 h-4" />{copied ? t.copied : t.copy}</button>
                  </div>
                  <div className="p-4"><textarea value={generatedText} onChange={(e) => setGeneratedText(e.target.value)} className="w-full h-96 p-4 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 resize-none" /></div>
                  <div className="px-4 pb-4">
                    <p className="text-sm font-bold text-gray-400 mb-2">{t.postOn}:</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="flex-1 min-w-[140px] py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:from-blue-500 hover:to-cyan-400 transition"><CheckCircle className="w-4 h-4" />K Trix</button>
                      <a href="https://www.chotot.com/dang-tin" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px] py-3 bg-emerald-600 text-white rounded-lg font-medium text-center flex items-center justify-center gap-2 hover:bg-emerald-500 transition"><ExternalLink className="w-4 h-4" />Chotot.com</a>
                      <a href="https://alonhadat.com.vn/dang-tin.html" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px] py-3 bg-purple-600 text-white rounded-lg font-medium text-center flex items-center justify-center gap-2 hover:bg-purple-500 transition"><ExternalLink className="w-4 h-4" />Alonhadat.com.vn</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
