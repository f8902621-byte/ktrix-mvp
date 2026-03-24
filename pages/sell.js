import { useState, useEffect, useRef } from 'react';
import { Home, Copy, ExternalLink, Sparkles, Loader, CheckCircle, MapPin, Camera, X, Phone, Facebook } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SellPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('vn');
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // Localisation
    city: '',
    district: '',
    ward: '',
    street: '',

    // Type de bien
    propertyType: '',

    // Prix
    price: '',
    priceUnit: 'ty',
    priceNegotiable: false,

    // Caractéristiques de base
    landArea: '',
    livingArea: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',

    // Dimensions
    landLength: '',
    landWidth: '',
    houseLength: '',
    houseWidth: '',

    // Juridique & État
    legalStatus: '',
    propertyCondition: '',
    furniture: '',
    direction: '',

    // Points forts
    highlights: [],

    // Proximités
    nearbyEducation: [],
    nearbyHealth: [],
    nearbyAmenities: [],
    nearbyWork: [],

    // Conditions de vente
    saleConditions: [],

    // Description additionnelle
    additionalNotes: '',

    // ── NOUVEAUX CHAMPS ──
    // Photos
    photos: [],

    // Contact
    contactPhone: '',

    // Publication
    publishOnKtrix: true,
    publishOnFacebook: false,
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

  // Groupes FB partenaires (à alimenter dynamiquement plus tard)
  const facebookPartners = [
    { name: 'Cộng đồng BẤT ĐỘNG SẢN', url: 'https://www.facebook.com/groups/congdongbatdongsan', city: 'Hồ Chí Minh' },
    { name: 'Bất Động Sản Hà Nội', url: 'https://www.facebook.com/groups/batdongsanhanoi', city: 'Hà Nội' },
  ];

  const t = {
    vn: {
      title: 'Đăng tin bán',
      subtitle: 'Tạo tin đăng chuyên nghiệp với AI',
      location: 'Vị trí & Loại BDS',
      city: 'Thành phố',
      district: 'Quận/Huyện',
      ward: 'Phường/Xã',
      street: 'Đường/Số nhà',
      propertyType: 'Loại BDS',
      selectCity: 'Chọn thành phố',
      selectDistrict: 'Chọn quận/huyện',
      selectWard: 'Chọn phường/xã',
      priceSection: 'Giá & Thông tin cơ bản',
      price: 'Giá bán',
      priceNegotiable: 'Giá thương lượng',
      landArea: 'Diện tích đất (m²)',
      livingArea: 'Diện tích sử dụng (m²)',
      bedrooms: 'Phòng ngủ',
      bathrooms: 'Phòng tắm',
      floors: 'Số tầng',
      dimensions: 'Kích thước & Cấu trúc',
      landLength: 'Đất dài (m)',
      landWidth: 'Đất rộng (m)',
      houseLength: 'Nhà dài (m)',
      houseWidth: 'Nhà rộng (m)',
      legalStatus: 'Pháp lý',
      propertyCondition: 'Tình trạng',
      furniture: 'Nội thất',
      direction: 'Hướng',
      highlights: 'Điểm nổi bật',
      nearbyEducation: 'Gần trường học',
      nearbyHealth: 'Gần y tế',
      nearbyAmenities: 'Gần tiện ích',
      nearbyWork: 'Gần nơi làm việc',
      saleConditions: 'Điều kiện bán',
      additionalNotes: 'Ghi chú thêm',
      additionalNotesPlaceholder: 'Thông tin khác bạn muốn đề cập...',
      // Photos
      photosSection: 'Hình ảnh',
      photosDesc: 'Thêm ảnh bất động sản (tối đa 10 ảnh)',
      addPhotos: 'Thêm ảnh',
      photoCount: 'ảnh đã chọn',
      // Contact
      contactSection: 'Thông tin liên hệ',
      contactPhone: 'Số điện thoại / Zalo / WhatsApp',
      contactPhonePlaceholder: '0901 234 567',
      // Publication
      publishSection: 'Đăng tin lên',
      publishKtrix: 'Đăng trên K Trix',
      publishKtrixDesc: 'Hiển thị cho tất cả người dùng K Trix',
      publishFacebook: 'Đăng trên nhóm Facebook đối tác',
      publishFacebookDesc: 'Chia sẻ đến cộng đồng Facebook BĐS',
      selectFbGroup: 'Chọn nhóm Facebook đối tác',
      fbGroupUrl: 'Hoặc nhập URL nhóm Facebook',
      fbGroupUrlPlaceholder: 'https://www.facebook.com/groups/...',
      // Generate
      generate: 'Tạo tin đăng với AI',
      generating: 'Đang tạo...',
      generatedTitle: 'Tin đăng của bạn',
      copy: 'Sao chép',
      copied: 'Đã sao chép!',
      postOn: 'Đăng tin trên',
      required: 'Bắt buộc: Thành phố, Loại BDS, Giá, Diện tích',
      backToSearch: 'Quay lại tìm kiếm',
      publishBtn: 'Đăng tin ngay',
    },
    en: {
      title: 'List Property',
      subtitle: 'Create professional listings with AI',
      location: 'Location & Property Type',
      city: 'City',
      district: 'District',
      ward: 'Ward',
      street: 'Street/Address',
      propertyType: 'Property Type',
      selectCity: 'Select city',
      selectDistrict: 'Select district',
      selectWard: 'Select ward',
      priceSection: 'Price & Basic Info',
      price: 'Sale Price',
      priceNegotiable: 'Negotiable',
      landArea: 'Land Area (m²)',
      livingArea: 'Living Area (m²)',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      floors: 'Floors',
      dimensions: 'Dimensions & Structure',
      landLength: 'Land Length (m)',
      landWidth: 'Land Width (m)',
      houseLength: 'House Length (m)',
      houseWidth: 'House Width (m)',
      legalStatus: 'Legal Status',
      propertyCondition: 'Condition',
      furniture: 'Furniture',
      direction: 'Direction',
      highlights: 'Highlights',
      nearbyEducation: 'Near Schools',
      nearbyHealth: 'Near Healthcare',
      nearbyAmenities: 'Near Amenities',
      nearbyWork: 'Near Workplace',
      saleConditions: 'Sale Conditions',
      additionalNotes: 'Additional Notes',
      additionalNotesPlaceholder: 'Other info you want to mention...',
      photosSection: 'Photos',
      photosDesc: 'Add property photos (max 10)',
      addPhotos: 'Add Photos',
      photoCount: 'photos selected',
      contactSection: 'Contact Information',
      contactPhone: 'Phone / Zalo / WhatsApp',
      contactPhonePlaceholder: '0901 234 567',
      publishSection: 'Publish on',
      publishKtrix: 'Publish on K Trix',
      publishKtrixDesc: 'Visible to all K Trix users',
      publishFacebook: 'Publish on Facebook partner group',
      publishFacebookDesc: 'Share to Facebook real estate community',
      selectFbGroup: 'Select Facebook partner group',
      fbGroupUrl: 'Or enter Facebook group URL',
      fbGroupUrlPlaceholder: 'https://www.facebook.com/groups/...',
      generate: 'Generate with AI',
      generating: 'Generating...',
      generatedTitle: 'Your Listing',
      copy: 'Copy',
      copied: 'Copied!',
      postOn: 'Post on',
      required: 'Required: City, Property Type, Price, Area',
      backToSearch: 'Back to Search',
      publishBtn: 'Publish Now',
    },
    fr: {
      title: 'Publier une annonce',
      subtitle: "Créez une annonce professionnelle avec l'IA",
      location: 'Localisation & Type de bien',
      city: 'Ville',
      district: 'District / Ville',
      ward: 'Quartier',
      street: 'Rue/Adresse',
      propertyType: 'Type de bien',
      selectCity: 'Choisir ville',
      selectDistrict: 'Choisir district',
      selectWard: 'Choisir quartier',
      priceSection: 'Prix & Infos de base',
      price: 'Prix de vente',
      priceNegotiable: 'Négociable',
      landArea: 'Surface terrain (m²)',
      livingArea: 'Surface habitable (m²)',
      bedrooms: 'Chambres',
      bathrooms: 'Salle de bain',
      floors: 'Étages',
      dimensions: 'Dimensions & Structure',
      landLength: 'Longueur terrain (m)',
      landWidth: 'Largeur terrain (m)',
      houseLength: 'Longueur maison (m)',
      houseWidth: 'Largeur maison (m)',
      legalStatus: 'Statut légal',
      propertyCondition: 'État',
      furniture: 'Mobilier',
      direction: 'Orientation',
      highlights: 'Points forts',
      nearbyEducation: 'Écoles à proximité',
      nearbyHealth: 'Santé à proximité',
      nearbyAmenities: 'Commodités à proximité',
      nearbyWork: 'Travail à proximité',
      saleConditions: 'Conditions de vente',
      additionalNotes: 'Notes supplémentaires',
      additionalNotesPlaceholder: 'Autres infos à mentionner...',
      photosSection: 'Photos',
      photosDesc: 'Ajoutez des photos du bien (max 10)',
      addPhotos: 'Ajouter des photos',
      photoCount: 'photos sélectionnées',
      contactSection: 'Informations de contact',
      contactPhone: 'Téléphone / Zalo / WhatsApp',
      contactPhonePlaceholder: '0901 234 567',
      publishSection: 'Publier sur',
      publishKtrix: 'Publier sur K Trix',
      publishKtrixDesc: 'Visible par tous les utilisateurs K Trix',
      publishFacebook: 'Publier sur un groupe Facebook partenaire',
      publishFacebookDesc: 'Partager à la communauté immobilière Facebook',
      selectFbGroup: 'Choisir un groupe Facebook partenaire',
      fbGroupUrl: 'Ou entrer l\'URL du groupe Facebook',
      fbGroupUrlPlaceholder: 'https://www.facebook.com/groups/...',
      generate: "Générer avec l'IA",
      generating: 'Génération...',
      generatedTitle: 'Votre annonce',
      copy: 'Copier',
      copied: 'Copié !',
      postOn: 'Publier sur',
      required: 'Requis: Ville, Type, Prix, Surface',
      backToSearch: 'Retour à la recherche',
      publishBtn: 'Publier maintenant',
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
    { vn: 'Đông', en: 'East', fr: 'Est' },
    { vn: 'Tây', en: 'West', fr: 'Ouest' },
    { vn: 'Nam', en: 'South', fr: 'Sud' },
    { vn: 'Bắc', en: 'North', fr: 'Nord' },
    { vn: 'Đông Nam', en: 'Southeast', fr: 'Sud-Est' },
    { vn: 'Đông Bắc', en: 'Northeast', fr: 'Nord-Est' },
    { vn: 'Tây Nam', en: 'Southwest', fr: 'Sud-Ouest' },
    { vn: 'Tây Bắc', en: 'Northwest', fr: 'Nord-Ouest' },
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

  // ── Gestion des photos ──
  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 10 - formData.photos.length;
    const toAdd = files.slice(0, remaining);
    const previews = toAdd.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...previews] }));
  };

  const handlePhotoRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // ── Génération ──
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
      if (data.success) {
        setGeneratedText(data.listing);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setGeneratedText(generateFallbackListing());
    } finally {
      setGenerating(false);
    }
  };

  const generateFallbackListing = () => {
    const type = propertyTypes.find(p => p.vn === formData.propertyType)?.vn || formData.propertyType;
    const priceText = formData.priceUnit === 'ty' ? `${formData.price} Tỷ` : `${formData.price} Triệu`;
    let text = `🏠 BÁN ${type.toUpperCase()} - ${formData.city}\n\n`;
    text += `📍 Vị trí: ${formData.ward ? formData.ward + ', ' : ''}${formData.district ? formData.district + ', ' : ''}${formData.city}\n`;
    if (formData.street) text += `   Địa chỉ: ${formData.street}\n`;
    text += `\n💰 Giá: ${priceText}${formData.priceNegotiable ? ' (Thương lượng)' : ''}\n\n`;
    text += `📐 Thông tin:\n`;
    if (formData.landArea) text += `   • Diện tích đất: ${formData.landArea}m²\n`;
    if (formData.livingArea) text += `   • Diện tích sử dụng: ${formData.livingArea}m²\n`;
    if (formData.bedrooms) text += `   • Phòng ngủ: ${formData.bedrooms}\n`;
    if (formData.bathrooms) text += `   • Phòng tắm: ${formData.bathrooms}\n`;
    if (formData.floors) text += `   • Số tầng: ${formData.floors}\n`;
    if (formData.direction) text += `   • Hướng: ${formData.direction}\n`;
    if (formData.legalStatus) text += `   • Pháp lý: ${formData.legalStatus}\n`;
    if (formData.propertyCondition) text += `   • Tình trạng: ${formData.propertyCondition}\n`;
    if (formData.furniture) text += `   • Nội thất: ${formData.furniture}\n`;
    if (formData.highlights.length > 0) {
      text += `\n✨ Điểm nổi bật:\n`;
      formData.highlights.forEach(h => {
        const opt = highlightOptions.find(o => o.id === h);
        if (opt) text += `   • ${opt.vn}\n`;
      });
    }
    if (formData.saleConditions.length > 0) {
      text += `\n💼 Điều kiện:\n`;
      formData.saleConditions.forEach(c => {
        const opt = saleConditionOptions.find(o => o.id === c);
        if (opt) text += `   • ${opt.vn}\n`;
      });
    }
    if (formData.additionalNotes) text += `\n📝 Ghi chú: ${formData.additionalNotes}\n`;
    if (formData.contactPhone) text += `\n📞 Liên hệ: ${formData.contactPhone}`;
    if (formData.publishOnFacebook && (formData.facebookGroupUrl || formData.facebookGroupName)) {
      text += `\n🔗 Xem thêm trên: ${formData.facebookGroupName || formData.facebookGroupUrl}`;
    }
    text += `\n\n🤖 Đăng qua K Trix — ktrix.ai`;
    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CheckboxGroup = ({ label, options, field }) => (
    <div className="mb-3">
      <label className="block text-sm font-bold text-gray-400 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggleArrayItem(field, opt.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              formData[field].includes(opt.id)
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            {formData[field].includes(opt.id) && '✓ '}{opt[language]}
          </button>
        ))}
      </div>
    </div>
  );

  // Filtre les groupes FB selon la ville sélectionnée
  const filteredPartners = formData.city
    ? facebookPartners.filter(p => p.city === formData.city)
    : facebookPartners;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-800 rounded-lg text-blue-400">
              <Home className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="https://raw.githubusercontent.com/f8902621-byte/traxhome-mvp/main/Ktrixlogo.png" alt="K Trix" className="w-20 h-20 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-white">💰 {t.title}</h1>
                <p className="text-xs text-gray-500">{t.subtitle}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-300 text-sm">
              <option value="vn">🇻🇳 VN</option>
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            <button onClick={() => router.push('/search')} className="px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/20">
              🔍 {t.backToSearch}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">

          {/* Section: Localisation */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              {t.location}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.city} <span className="text-orange-400">*</span></label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value, district: '', ward: '' })}
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200"
                >
                  <option value="">{t.selectCity}</option>
                  {vietnamCities.map((c, i) => <option key={i} value={c.vn}>{c[language]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.district}</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value, ward: '' })}
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200"
                  disabled={!formData.city}
                >
                  <option value="">{t.selectDistrict}</option>
                  {(districtsByCity[formData.city] || []).map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.ward}</label>
                <input type="text" value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder={t.selectWard} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.street}</label>
                <input type="text" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="123 Nguyễn Văn A" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">{t.propertyType} <span className="text-orange-400">*</span></label>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((pt, i) => (
                  <button key={i} type="button" onClick={() => setFormData({ ...formData, propertyType: pt.vn })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${formData.propertyType === pt.vn ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}>
                    {pt[language]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Prix */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white mb-4">💰 {t.priceSection}</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.price} <span className="text-orange-400">*</span></label>
                <div className="flex gap-2">
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="flex-1 px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="5" />
                  <select value={formData.priceUnit} onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })} className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200">
                    <option value="ty">Tỷ</option>
                    <option value="trieu">Triệu</option>
                  </select>
                </div>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.priceNegotiable} onChange={(e) => setFormData({ ...formData, priceNegotiable: e.target.checked })} className="w-5 h-5 text-orange-500 rounded bg-gray-800 border-gray-600" />
                  <span className="text-sm font-medium text-gray-300">{t.priceNegotiable}</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.landArea} <span className="text-orange-400">*</span></label>
                <input type="number" value={formData.landArea} onChange={(e) => setFormData({ ...formData, landArea: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="100" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.livingArea}</label>
                <input type="number" value={formData.livingArea} onChange={(e) => setFormData({ ...formData, livingArea: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="80" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.bedrooms}</label>
                <input type="number" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="3" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.bathrooms}</label>
                <input type="number" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="2" />
              </div>
            </div>
          </div>

          {/* Section: Dimensions */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white mb-4">📐 {t.dimensions}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.floors}</label>
                <input type="number" value={formData.floors} onChange={(e) => setFormData({ ...formData, floors: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="2" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.landLength}</label>
                <input type="number" value={formData.landLength} onChange={(e) => setFormData({ ...formData, landLength: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="20" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.landWidth}</label>
                <input type="number" value={formData.landWidth} onChange={(e) => setFormData({ ...formData, landWidth: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200" placeholder="5" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.direction}</label>
                <select value={formData.direction} onChange={(e) => setFormData({ ...formData, direction: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200">
                  <option value="">--</option>
                  {directions.map((d, i) => <option key={i} value={d.vn}>{d[language]}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.legalStatus}</label>
                <select value={formData.legalStatus} onChange={(e) => setFormData({ ...formData, legalStatus: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200">
                  <option value="">--</option>
                  {legalStatuses.map((s, i) => <option key={i} value={s.vn}>{s[language]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.propertyCondition}</label>
                <select value={formData.propertyCondition} onChange={(e) => setFormData({ ...formData, propertyCondition: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200">
                  <option value="">--</option>
                  {propertyConditions.map((c, i) => <option key={i} value={c.vn}>{c[language]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">{t.furniture}</label>
                <select value={formData.furniture} onChange={(e) => setFormData({ ...formData, furniture: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200">
                  <option value="">--</option>
                  {furnitureOptions.map((f, i) => <option key={i} value={f.vn}>{f[language]}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Points forts + Proximités */}
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

          {/* Section: Photos ── NOUVEAU */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Camera className="w-5 h-5 text-orange-400" />
              {t.photosSection}
            </h2>
            <p className="text-sm text-gray-500 mb-4">{t.photosDesc}</p>

            {/* Grille de prévisualisations */}
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                {formData.photos.map((photo, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover rounded-lg border border-gray-700" />
                    <button
                      onClick={() => handlePhotoRemove(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded font-medium">
                        {language === 'vn' ? 'Chính' : language === 'en' ? 'Main' : 'Principale'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {formData.photos.length < 10 && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoAdd}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-orange-500 hover:text-orange-400 transition w-full justify-center"
                >
                  <Camera className="w-5 h-5" />
                  {t.addPhotos}
                  {formData.photos.length > 0 && (
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                      {formData.photos.length}/10 {t.photoCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Section: Contact ── NOUVEAU */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-orange-400" />
              {t.contactSection}
            </h2>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200"
              placeholder={t.contactPhonePlaceholder}
            />
          </div>

          {/* Section: Publication ── NOUVEAU */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-orange-400" />
              {t.publishSection}
            </h2>

            {/* K Trix */}
            <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-700 hover:border-blue-500/40 cursor-pointer transition mb-3 bg-gray-800/50">
              <input
                type="checkbox"
                checked={formData.publishOnKtrix}
                onChange={(e) => setFormData({ ...formData, publishOnKtrix: e.target.checked })}
                className="w-5 h-5 mt-0.5 text-blue-500 rounded bg-gray-700 border-gray-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <img src="https://raw.githubusercontent.com/f8902621-byte/traxhome-mvp/main/Ktrixlogo.png" alt="K Trix" className="w-8 h-8 object-contain" />
                  <span className="font-semibold text-white">{t.publishKtrix}</span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">Recommandé</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t.publishKtrixDesc}</p>
              </div>
            </label>

            {/* Facebook */}
            <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-700 hover:border-blue-500/40 cursor-pointer transition bg-gray-800/50">
              <input
                type="checkbox"
                checked={formData.publishOnFacebook}
                onChange={(e) => setFormData({ ...formData, publishOnFacebook: e.target.checked })}
                className="w-5 h-5 mt-0.5 text-blue-500 rounded bg-gray-700 border-gray-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-white">{t.publishFacebook}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t.publishFacebookDesc}</p>
              </div>
            </label>

            {/* Options Facebook (conditionnelles) */}
            {formData.publishOnFacebook && (
              <div className="mt-3 ml-8 space-y-3 p-4 bg-gray-800/50 rounded-xl border border-blue-500/20">
                {filteredPartners.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">{t.selectFbGroup}</label>
                    <div className="space-y-2">
                      {filteredPartners.map((partner, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, facebookGroupUrl: partner.url, facebookGroupName: partner.name })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                            formData.facebookGroupUrl === partner.url
                              ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                              : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          <Facebook className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1">{partner.name}</span>
                          {formData.facebookGroupUrl === partner.url && <CheckCircle className="w-4 h-4 text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">{t.fbGroupUrl}</label>
                  <input
                    type="url"
                    value={formData.facebookGroupUrl}
                    onChange={(e) => setFormData({ ...formData, facebookGroupUrl: e.target.value, facebookGroupName: '' })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 text-sm"
                    placeholder={t.fbGroupUrlPlaceholder}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes additionnelles */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-bold text-white mb-4">📝 {t.additionalNotes}</h2>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 h-24 resize-none"
              placeholder={t.additionalNotesPlaceholder}
            />
          </div>

        </div>

        {/* Résultat + Bouton générer */}
        <div className="space-y-4 mt-6">
          <button
            onClick={handleGenerate}
            disabled={generating || !formData.city || !formData.propertyType || !formData.price || !formData.landArea}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {generating ? (
              <><Loader className="w-6 h-6 animate-spin" />{t.generating}</>
            ) : (
              <><Sparkles className="w-6 h-6" />{t.generate}</>
            )}
          </button>

          <p className="text-sm text-center text-orange-400 font-medium">⚠️ {t.required}</p>

          {generatedText && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {t.generatedTitle}
                </h3>
                <button onClick={copyToClipboard} className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/30 transition">
                  <Copy className="w-4 h-4" />
                  {copied ? t.copied : t.copy}
                </button>
              </div>

              <div className="p-4">
                <textarea
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className="w-full h-96 p-4 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 resize-none"
                />
              </div>

              {/* Boutons de publication */}
              <div className="px-4 pb-4">
                <p className="text-sm font-bold text-gray-400 mb-2">{t.postOn}:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.publishOnKtrix && (
                    <button className="flex-1 min-w-[140px] py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:from-blue-500 hover:to-cyan-400 transition">
                      <CheckCircle className="w-4 h-4" />
                      K Trix
                    </button>
                  )}
                  {formData.publishOnFacebook && formData.facebookGroupUrl && (
                    <a
                      href={formData.facebookGroupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[140px] py-3 bg-blue-700 text-white rounded-lg font-medium text-center flex items-center justify-center gap-2 hover:bg-blue-600 transition"
                    >
                      <Facebook className="w-4 h-4" />
                      {formData.facebookGroupName || 'Facebook'}
                    </a>
                  )}
                  <a href="https://www.chotot.com/dang-tin" target="_blank" rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] py-3 bg-emerald-600 text-white rounded-lg font-medium text-center flex items-center justify-center gap-2 hover:bg-emerald-500 transition">
                    <ExternalLink className="w-4 h-4" />
                    Chotot.com
                  </a>
                  <a href="https://alonhadat.com.vn/dang-tin.html" target="_blank" rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] py-3 bg-purple-600 text-white rounded-lg font-medium text-center flex items-center justify-center gap-2 hover:bg-purple-500 transition">
                    <ExternalLink className="w-4 h-4" />
                    Alonhadat.com.vn
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
