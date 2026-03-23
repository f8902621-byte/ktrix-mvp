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
      lastUpdated: 'Cập nhật lần cuối: 01/04/2026',
      sections: [
        {
          heading: '1. Giới thiệu',
          text: 'K Trix là ứng dụng phân tích bất động sản sử dụng trí tuệ nhân tạo, được phát triển bởi Frédéric Lefevre — người đã sinh sống tại Việt Nam 34 năm. K Trix hiện đang trong giai đoạn thử nghiệm (MVP) và được cung cấp hoàn toàn miễn phí cho một số lượng người dùng hạn chế.'
        },
        {
          heading: '2. Dữ liệu chúng tôi thu thập',
          text: 'Khi đăng ký, K Trix chỉ thu thập: họ và tên, địa chỉ email, lĩnh vực hoạt động (chuyên gia bất động sản, nhà đầu tư, cá nhân...), tiêu chí tìm kiếm và các tìm kiếm đã lưu trong ứng dụng. K Trix không thu thập bất kỳ dữ liệu tài chính, giấy tờ tùy thân hay số điện thoại nào.'
        },
        {
          heading: '3. Dữ liệu chúng tôi phân tích',
          text: 'K Trix phân tích các tin đăng bất động sản công khai từ các cổng thông tin trực tuyến (giá, diện tích, vị trí, loại bất động sản). Các dữ liệu này là công khai, được ẩn danh hóa và không chứa thông tin cá nhân có thể nhận dạng.'
        },
        {
          heading: '4. Mục đích sử dụng',
          text: 'Dữ liệu của bạn được sử dụng để: quản lý quyền truy cập ứng dụng (mã beta, xác thực), lưu các tìm kiếm và tùy chọn của bạn, cải thiện các tính năng của K Trix trong giai đoạn MVP, liên hệ với bạn khi cần thiết trong quá trình thử nghiệm. Dữ liệu của bạn không được bán hoặc chia sẻ với bên thứ ba.'
        },
        {
          heading: '5. Lưu trữ & Bảo mật',
          text: 'Dữ liệu được lưu trữ trên Supabase — nền tảng bảo mật tuân thủ các tiêu chuẩn bảo vệ dữ liệu quốc tế. Chúng tôi áp dụng các biện pháp kỹ thuật phù hợp để bảo vệ dữ liệu khỏi truy cập trái phép.'
        },
        {
          heading: '6. Thời gian lưu trữ',
          text: 'Dữ liệu của bạn được lưu giữ trong suốt giai đoạn thử nghiệm MVP. Sau giai đoạn này, bạn sẽ được thông báo về các điều kiện lưu giữ hoặc xóa dữ liệu.'
        },
        {
          heading: '7. Quyền của bạn',
          text: 'Bạn có quyền: truy cập dữ liệu cá nhân của bạn, chỉnh sửa dữ liệu không chính xác, xóa tài khoản và dữ liệu của bạn. Để thực hiện các quyền này, vui lòng liên hệ: admin@ktrix.ai'
        },
        {
          heading: '8. Cookie và theo dõi',
          text: 'K Trix chỉ sử dụng dữ liệu phiên cần thiết cho hoạt động của ứng dụng (xác thực). Không sử dụng cookie quảng cáo hay theo dõi bên thứ ba.'
        },
        {
          heading: '9. Tuân thủ pháp luật',
          text: 'K Trix tuân thủ Luật An ninh mạng Việt Nam (2018) và Nghị định về Bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP).'
        },
        {
          heading: '10. Thay đổi chính sách',
          text: 'Chính sách này có thể được cập nhật khi K Trix phát triển. Người dùng sẽ được thông báo về bất kỳ thay đổi quan trọng nào qua email hoặc trên nền tảng.'
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: April 1, 2026',
      sections: [
        {
          heading: '1. Introduction',
          text: 'K Trix is an AI-powered real estate analysis application, personally developed by Frédéric Lefevre, who has been living in Vietnam for 34 years. K Trix is currently in a testing phase (MVP) and offered free of charge to a limited number of users.'
        },
        {
          heading: '2. Data We Collect',
          text: 'Upon registration, K Trix collects only: first and last name, email address, field of activity (real estate professional, investor, private individual...), search criteria and saved searches within the application. K Trix does not collect any financial data, identity documents, or phone numbers.'
        },
        {
          heading: '3. Data We Analyze',
          text: 'K Trix analyzes publicly available real estate listings from online portals (price, surface area, location, property type). This data is public, anonymized, and contains no personally identifiable information.'
        },
        {
          heading: '4. Purpose of Use',
          text: 'Your data is used to: manage your access to the application (beta code, authentication), save your searches and preferences, improve K Trix features during the MVP phase, contact you if necessary during the testing period. Your data is never sold or shared with third parties.'
        },
        {
          heading: '5. Storage & Security',
          text: 'Data is stored on Supabase, a secure platform compliant with international data protection standards. We implement appropriate technical measures to protect data from unauthorized access.'
        },
        {
          heading: '6. Data Retention',
          text: 'Your data is retained for the duration of the MVP testing phase. At the end of this phase, you will be informed of the conditions for retaining or deleting your data.'
        },
        {
          heading: '7. Your Rights',
          text: 'You have the right to: access your personal data, correct inaccurate data, delete your account and data. To exercise these rights, please contact: admin@ktrix.ai'
        },
        {
          heading: '8. Cookies & Tracking',
          text: 'K Trix only uses session data necessary for the application to function (authentication). No advertising cookies or third-party tracking are used.'
        },
        {
          heading: '9. Legal Compliance',
          text: 'K Trix complies with the Vietnam Cybersecurity Law (2018) and the Personal Data Protection Decree (Decree 13/2023/NĐ-CP).'
        },
        {
          heading: '10. Policy Changes',
          text: 'This policy may be updated as K Trix evolves. Users will be informed of any significant changes via email or on the platform.'
        }
      ]
    },
    fr: {
      title: 'Politique de Confidentialité',
      lastUpdated: 'Dernière mise à jour : 1er avril 2026',
      sections: [
        {
          heading: '1. Introduction',
          text: 'K Trix est une application d\'analyse immobilière assistée par intelligence artificielle, développée à titre personnel par Frédéric Lefevre, installé au Vietnam depuis 34 ans. K Trix est actuellement en phase de test (MVP) et proposé gratuitement à un nombre limité d\'utilisateurs.'
        },
        {
          heading: '2. Données collectées',
          text: 'Lors de votre inscription, K Trix collecte uniquement : prénom et nom, adresse email, secteur d\'activité (professionnel de l\'immobilier, investisseur, particulier...), vos critères et recherches sauvegardées dans l\'application. K Trix ne collecte aucune donnée financière, aucun document d\'identité, aucun numéro de téléphone.'
        },
        {
          heading: '3. Données analysées',
          text: 'K Trix analyse des annonces immobilières publiques issues de portails en ligne (prix, superficie, localisation, type de bien). Ces données sont publiques, anonymisées et ne contiennent aucune information personnelle identifiable.'
        },
        {
          heading: '4. Finalité d\'utilisation',
          text: 'Vos données servent à : gérer votre accès à l\'application (code bêta, authentification), sauvegarder vos recherches et préférences, améliorer les fonctionnalités de K Trix pendant la phase MVP, vous contacter si nécessaire dans le cadre du test. Vos données ne sont ni vendues, ni partagées avec des tiers.'
        },
        {
          heading: '5. Stockage & Sécurité',
          text: 'Les données sont stockées sur Supabase, plateforme sécurisée conforme aux standards internationaux de protection des données. Nous appliquons des mesures techniques appropriées pour protéger les données contre tout accès non autorisé.'
        },
        {
          heading: '6. Durée de conservation',
          text: 'Vos données sont conservées pendant la durée de la phase de test MVP. À l\'issue de cette phase, vous serez informé des modalités de conservation ou de suppression de vos données.'
        },
        {
          heading: '7. Vos droits',
          text: 'Vous disposez des droits suivants : accès à vos données personnelles, correction de données inexactes, suppression de votre compte et de vos données. Pour exercer ces droits, contactez-nous : admin@ktrix.ai'
        },
        {
          heading: '8. Cookies et traceurs',
          text: 'K Trix utilise uniquement des données de session nécessaires au fonctionnement de l\'application (authentification). Aucun cookie publicitaire ou de tracking tiers n\'est utilisé.'
        },
        {
          heading: '9. Conformité légale',
          text: 'K Trix est conforme à la Loi sur la cybersécurité du Vietnam (2018) et au Décret sur la protection des données personnelles (Décret 13/2023/NĐ-CP).'
        },
        {
          heading: '10. Modifications',
          text: 'Cette politique peut être mise à jour au fur et à mesure de l\'évolution de K Trix. Les utilisateurs seront informés de tout changement significatif par email ou sur la plateforme.'
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
          <p>© 2026 K Trix — <a href="mailto:admin@ktrix.ai" className="text-blue-400 hover:underline">admin@ktrix.ai</a></p>
        </div>
      </main>
    </div>
  );
}
