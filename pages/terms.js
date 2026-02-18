import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
      title: 'Điều khoản Sử dụng',
      lastUpdated: 'Cập nhật lần cuối: 18/02/2026',
      sections: [
        {
          heading: '1. Chấp nhận điều khoản',
          text: 'Bằng việc sử dụng K Trix, bạn đồng ý với các điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.'
        },
        {
          heading: '2. Mô tả dịch vụ',
          text: 'K Trix là nền tảng tổng hợp và phân tích dữ liệu bất động sản tại Việt Nam. Dịch vụ hiện đang trong giai đoạn Beta và có thể thay đổi, gián đoạn hoặc chứa lỗi. K Trix tổng hợp dữ liệu từ các nguồn công khai và không sở hữu các tin đăng bất động sản.'
        },
        {
          heading: '3. Tài khoản Beta',
          text: 'Tài khoản Beta được cấp theo lời mời, có thời hạn và có thể bị thu hồi. Bạn không được chia sẻ quyền truy cập Beta với người khác. Chúng tôi có quyền giới hạn hoặc chấm dứt quyền truy cập bất cứ lúc nào.'
        },
        {
          heading: '4. Sử dụng chấp nhận được',
          text: 'Bạn đồng ý sử dụng K Trix cho mục đích hợp pháp. Nghiêm cấm: thu thập dữ liệu hàng loạt (scraping), can thiệp vào hệ thống, sử dụng dữ liệu cho mục đích lừa đảo, hoặc vi phạm quyền sở hữu trí tuệ.'
        },
        {
          heading: '5. Dữ liệu & Độ chính xác',
          text: 'K Trix tổng hợp dữ liệu từ bên thứ ba. Chúng tôi nỗ lực đảm bảo độ chính xác nhưng không bảo đảm tuyệt đối. Phân tích AI mang tính tham khảo, không thay thế tư vấn chuyên nghiệp. Người dùng nên tự xác minh thông tin trước khi ra quyết định.'
        },
        {
          heading: '6. Sở hữu trí tuệ',
          text: 'Nền tảng K Trix, thuật toán AI, giao diện và thương hiệu thuộc sở hữu của K Trix. Dữ liệu bất động sản thuộc quyền sở hữu của các nguồn gốc tương ứng.'
        },
        {
          heading: '7. Giới hạn trách nhiệm',
          text: 'K Trix không chịu trách nhiệm cho: quyết định đầu tư dựa trên dữ liệu của nền tảng, thiệt hại do gián đoạn dịch vụ, sự không chính xác của dữ liệu từ nguồn bên thứ ba. Dịch vụ được cung cấp "nguyên trạng" trong giai đoạn Beta.'
        },
        {
          heading: '8. Phản hồi Beta',
          text: 'Bằng việc gửi phản hồi, báo cáo lỗi hoặc đề xuất, bạn cho phép K Trix sử dụng những thông tin đó để cải thiện dịch vụ mà không có nghĩa vụ bồi thường.'
        },
        {
          heading: '9. Luật áp dụng',
          text: 'Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp sẽ được giải quyết tại tòa án có thẩm quyền tại TP. Hồ Chí Minh.'
        },
        {
          heading: '10. Liên hệ',
          text: 'Mọi câu hỏi về điều khoản sử dụng, vui lòng liên hệ: contact@ktrix.ai'
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: February 18, 2026',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          text: 'By using K Trix, you agree to these terms. If you do not agree, please stop using the service.'
        },
        {
          heading: '2. Service Description',
          text: 'K Trix is a real estate data aggregation and analysis platform for Vietnam. The service is currently in Beta and may change, experience interruptions, or contain bugs. K Trix aggregates data from public sources and does not own the real estate listings.'
        },
        {
          heading: '3. Beta Account',
          text: 'Beta accounts are granted by invitation, are time-limited, and may be revoked. You may not share your Beta access with others. We reserve the right to limit or terminate access at any time.'
        },
        {
          heading: '4. Acceptable Use',
          text: 'You agree to use K Trix for lawful purposes only. Prohibited: mass data scraping, system interference, using data for fraudulent purposes, or violating intellectual property rights.'
        },
        {
          heading: '5. Data & Accuracy',
          text: 'K Trix aggregates data from third parties. We strive for accuracy but do not guarantee it absolutely. AI analysis is for reference only and does not replace professional advice. Users should independently verify information before making decisions.'
        },
        {
          heading: '6. Intellectual Property',
          text: 'The K Trix platform, AI algorithms, interface, and branding are the property of K Trix. Real estate data belongs to their respective original sources.'
        },
        {
          heading: '7. Limitation of Liability',
          text: 'K Trix is not liable for: investment decisions based on platform data, damages from service interruptions, inaccuracies in third-party data. The service is provided "as is" during the Beta phase.'
        },
        {
          heading: '8. Beta Feedback',
          text: 'By submitting feedback, bug reports, or suggestions, you grant K Trix permission to use this information to improve the service without obligation of compensation.'
        },
        {
          heading: '9. Governing Law',
          text: 'These terms are governed by Vietnamese law. Any disputes shall be resolved in the competent courts of Ho Chi Minh City.'
        },
        {
          heading: '10. Contact',
          text: 'For any questions about these terms, please contact: contact@ktrix.ai'
        }
      ]
    },
    fr: {
      title: 'Conditions d\'Utilisation',
      lastUpdated: 'Dernière mise à jour : 18 février 2026',
      sections: [
        {
          heading: '1. Acceptation des conditions',
          text: 'En utilisant K Trix, vous acceptez ces conditions. Si vous n\'êtes pas d\'accord, veuillez cesser d\'utiliser le service.'
        },
        {
          heading: '2. Description du service',
          text: 'K Trix est une plateforme d\'agrégation et d\'analyse de données immobilières au Vietnam. Le service est actuellement en phase Beta et peut évoluer, subir des interruptions ou contenir des bugs. K Trix agrège des données provenant de sources publiques et ne possède pas les annonces immobilières.'
        },
        {
          heading: '3. Compte Beta',
          text: 'Les comptes Beta sont accordés sur invitation, à durée limitée, et peuvent être révoqués. Vous ne pouvez pas partager votre accès Beta. Nous nous réservons le droit de limiter ou résilier l\'accès à tout moment.'
        },
        {
          heading: '4. Utilisation acceptable',
          text: 'Vous acceptez d\'utiliser K Trix à des fins légales uniquement. Interdits : extraction massive de données (scraping), interférence avec le système, utilisation des données à des fins frauduleuses, ou violation de la propriété intellectuelle.'
        },
        {
          heading: '5. Données & Précision',
          text: 'K Trix agrège des données de tiers. Nous nous efforçons d\'assurer leur exactitude mais ne la garantissons pas de manière absolue. L\'analyse IA est à titre indicatif et ne remplace pas un conseil professionnel. Les utilisateurs doivent vérifier les informations avant toute décision.'
        },
        {
          heading: '6. Propriété intellectuelle',
          text: 'La plateforme K Trix, ses algorithmes IA, son interface et sa marque sont la propriété de K Trix. Les données immobilières appartiennent à leurs sources respectives.'
        },
        {
          heading: '7. Limitation de responsabilité',
          text: 'K Trix n\'est pas responsable : des décisions d\'investissement basées sur les données de la plateforme, des dommages liés aux interruptions de service, des inexactitudes des données tierces. Le service est fourni "en l\'état" pendant la phase Beta.'
        },
        {
          heading: '8. Retours Beta',
          text: 'En soumettant des retours, rapports de bugs ou suggestions, vous autorisez K Trix à utiliser ces informations pour améliorer le service sans obligation de compensation.'
        },
        {
          heading: '9. Droit applicable',
          text: 'Ces conditions sont régies par le droit vietnamien. Tout litige sera résolu devant les tribunaux compétents de Hô-Chi-Minh-Ville.'
        },
        {
          heading: '10. Contact',
          text: 'Pour toute question sur ces conditions, veuillez contacter : contact@ktrix.ai'
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
              <FileText className="w-5 h-5 text-blue-400" />
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
          <p>© 2026 K Trix — <a href="mailto:contact@ktrix.ai" className="text-blue-400 hover:underline">contact@ktrix.ai</a></p>
        </div>
      </main>
    </div>
  );
}
