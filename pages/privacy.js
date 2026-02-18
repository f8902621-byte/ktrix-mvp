import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (router.query.lang && ['vn', 'en', 'fr'].includes(router.query.lang)) {
      setLanguage(router.query.lang);
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ktrix_language');
      if (saved && ['vn', 'en', 'fr'].includes(saved)) setLanguage(saved);
    }
  }, [router.query.lang]);

  const content = {
    vn: {
      title: 'Chính sách Bảo mật',
      lastUpdated: 'Cập nhật lần cuối: 18/02/2026',
      sections: [
        {
          heading: '1. Giới thiệu',
          text: 'K Trix ("chúng tôi") cam kết bảo vệ quyền riêng tư của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn khi sử dụng nền tảng K Trix.'
        },
        {
          heading: '2. Dữ liệu chúng tôi thu thập',
          text: 'Chúng tôi thu thập: địa chỉ email (khi đăng ký Beta), thông số tìm kiếm bất động sản (thành phố, loại BĐS, ngân sách...), dữ liệu sử dụng ẩn danh (để cải thiện dịch vụ). Chúng tôi không thu thập thông tin tài chính, số CMND/CCCD, hoặc dữ liệu nhạy cảm khác.'
        },
        {
          heading: '3. Mục đích sử dụng',
          text: 'Dữ liệu của bạn được sử dụng để: cung cấp kết quả tìm kiếm BĐS phù hợp, cải thiện thuật toán AI và trải nghiệm người dùng, liên hệ với bạn về chương trình Beta, và phân tích xu hướng thị trường (dữ liệu tổng hợp, ẩn danh).'
        },
        {
          heading: '4. Lưu trữ & Bảo mật',
          text: 'Dữ liệu được lưu trữ trên Supabase với mã hóa tiêu chuẩn ngành. Chúng tôi áp dụng các biện pháp kỹ thuật phù hợp để bảo vệ dữ liệu khỏi truy cập trái phép. Dữ liệu được lưu trữ trong thời gian bạn sử dụng dịch vụ.'
        },
        {
          heading: '5. Chia sẻ dữ liệu',
          text: 'Chúng tôi không bán, cho thuê hoặc chia sẻ dữ liệu cá nhân của bạn với bên thứ ba vì mục đích thương mại. Dữ liệu chỉ được chia sẻ khi: pháp luật yêu cầu, hoặc với sự đồng ý rõ ràng của bạn.'
        },
        {
          heading: '6. Quyền của bạn',
          text: 'Bạn có quyền: yêu cầu xem dữ liệu cá nhân của mình, yêu cầu xóa tài khoản và dữ liệu, rút lại sự đồng ý bất cứ lúc nào. Liên hệ: privacy@ktrix.ai'
        },
        {
          heading: '7. Tuân thủ pháp luật',
          text: 'K Trix tuân thủ Luật An ninh mạng Việt Nam (2018) và Nghị định về Bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP).'
        },
        {
          heading: '8. Thay đổi chính sách',
          text: 'Chúng tôi có thể cập nhật chính sách này. Mọi thay đổi sẽ được thông báo qua email hoặc trên nền tảng.'
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: February 18, 2026',
      sections: [
        {
          heading: '1. Introduction',
          text: 'K Trix ("we") is committed to protecting your privacy. This policy describes how we collect, use, and protect your personal data when using the K Trix platform.'
        },
        {
          heading: '2. Data We Collect',
          text: 'We collect: email addresses (when registering for Beta), real estate search parameters (city, property type, budget...), anonymous usage data (to improve our service). We do not collect financial information, ID numbers, or other sensitive data.'
        },
        {
          heading: '3. Purpose of Use',
          text: 'Your data is used to: provide relevant real estate search results, improve our AI algorithms and user experience, contact you about the Beta program, and analyze market trends (aggregated, anonymous data only).'
        },
        {
          heading: '4. Storage & Security',
          text: 'Data is stored on Supabase with industry-standard encryption. We implement appropriate technical measures to protect data from unauthorized access. Data is retained for the duration of your use of the service.'
        },
        {
          heading: '5. Data Sharing',
          text: 'We do not sell, rent, or share your personal data with third parties for commercial purposes. Data is only shared when: required by law, or with your explicit consent.'
        },
        {
          heading: '6. Your Rights',
          text: 'You have the right to: request access to your personal data, request deletion of your account and data, withdraw consent at any time. Contact: privacy@ktrix.ai'
        },
        {
          heading: '7. Legal Compliance',
          text: 'K Trix complies with the Vietnam Cybersecurity Law (2018) and the Personal Data Protection Decree (Decree 13/2023/NĐ-CP).'
        },
        {
          heading: '8. Policy Changes',
          text: 'We may update this policy. Any changes will be communicated via email or on the platform.'
        }
      ]
    },
    fr: {
      title: 'Politique de Confidentialité',
      lastUpdated: 'Dernière mise à jour : 18 février 2026',
      sections: [
        {
          heading: '1. Introduction',
          text: 'K Trix ("nous") s\'engage à protéger votre vie privée. Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles lors de l\'utilisation de la plateforme K Trix.'
        },
        {
          heading: '2. Données collectées',
          text: 'Nous collectons : adresses email (lors de l\'inscription Beta), paramètres de recherche immobilière (ville, type de bien, budget...), données d\'utilisation anonymes (pour améliorer le service). Nous ne collectons pas d\'informations financières, numéros d\'identité ou autres données sensibles.'
        },
        {
          heading: '3. Finalité d\'utilisation',
          text: 'Vos données servent à : fournir des résultats de recherche immobilière pertinents, améliorer nos algorithmes IA et l\'expérience utilisateur, vous contacter concernant le programme Beta, et analyser les tendances du marché (données agrégées et anonymes uniquement).'
        },
        {
          heading: '4. Stockage & Sécurité',
          text: 'Les données sont stockées sur Supabase avec chiffrement aux standards de l\'industrie. Nous appliquons des mesures techniques appropriées pour protéger les données contre tout accès non autorisé. Les données sont conservées pendant la durée de votre utilisation du service.'
        },
        {
          heading: '5. Partage des données',
          text: 'Nous ne vendons, louons ni partageons vos données personnelles avec des tiers à des fins commerciales. Les données ne sont partagées que : sur obligation légale, ou avec votre consentement explicite.'
        },
        {
          heading: '6. Vos droits',
          text: 'Vous avez le droit de : demander l\'accès à vos données personnelles, demander la suppression de votre compte et données, retirer votre consentement à tout moment. Contact : privacy@ktrix.ai'
        },
        {
          heading: '7. Conformité légale',
          text: 'K Trix est conforme à la Loi sur la cybersécurité du Vietnam (2018) et au Décret sur la protection des données personnelles (Décret 13/2023/NĐ-CP).'
        },
        {
          heading: '8. Modifications',
          text: 'Nous pouvons mettre à jour cette politique. Tout changement sera communiqué par email ou sur la plateforme.'
        }
      ]
    }
  }[language];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h1 className="text-lg font-bold text-white">{content.title}</h1>
            </div>
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-300 text-sm">
            <option value="vn">🇻🇳 VN</option>
            <option value="en">🇬🇧 EN</option>
            <option value="fr">🇫🇷 FR</option>
          </select>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-500 text-sm mb-8">{content.lastUpdated}</p>

        <div className="space-y-8">
          {content.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold text-white mb-2">{section.heading}</h2>
              <p className="text-gray-400 leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-600">
          <p>© 2026 K Trix — <a href="mailto:privacy@ktrix.ai" className="text-blue-400 hover:underline">privacy@ktrix.ai</a></p>
        </div>
      </main>
    </div>
  );
}
