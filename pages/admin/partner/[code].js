import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Shield, ArrowLeft, ExternalLink, ToggleLeft, ToggleRight, Clock, Trash2, CheckCircle, AlertTriangle, Facebook, Image, RefreshCw, Plus, Minus } from 'lucide-react';

export default function PartnerDetail() {
  const router = useRouter();
  const { code } = router.query;
  const [partner, setPartner] = useState(null);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fbPosts, setFbPosts] = useState(0);
  const [notes, setNotes] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [pwdInput, setPwdInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedPwd = localStorage.getItem('ktrix_admin_pwd');
    if (savedPwd) { setPassword(savedPwd); setAuthenticated(true); }
  }, []);

  useEffect(() => {
    if (authenticated && code) fetchData();
  }, [authenticated, code]);

  const fetchData = async () => {
    setLoading(true);
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    try {
      // Fetch partner info
      const res = await fetch('/api/admin-data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, action: 'list_partners' }),
      });
      const data = await res.json();
      const found = (data.partners || []).find(p => p.code === code);
      if (found) {
        setPartner(found);
        setFbPosts(found.fb_posts_count || 0);
        setNotes(found.notes || '');
      }
      // Fetch banner
      const resB = await fetch('/api/admin-data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, action: 'get_partner_banner', code }),
      });
      const dataB = await resB.json();
      if (dataB.banner) setBanner(dataB.banner);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleLogin = () => {
    if (!pwdInput) return;
    localStorage.setItem('ktrix_admin_pwd', pwdInput);
    setPassword(pwdInput);
    setAuthenticated(true);
  };

  const handleToggle = async () => {
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    await fetch('/api/admin-data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'toggle', code }),
    });
    fetchData();
  };

  const handleExtend = async (months) => {
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    await fetch('/api/admin-data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'extend', code, data: { days: months * 30 } }),
    });
    fetchData();
  };

  const handleConvertPermanent = async () => {
    if (!confirm('Convertir ce partenaire en accès PERMANENT ?\n\nCela supprimera la date d\'expiration.')) return;
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    await fetch('/api/admin-data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'convert_permanent', code }),
    });
    fetchData();
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    await fetch('/api/admin-data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'note', code, data: { note: notes } }),
    });
    setSaving(false);
    fetchData();
  };

  const handleUpdateFbPosts = async (newCount) => {
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    setFbPosts(newCount);
    await fetch('/api/admin-data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'update_fb_posts', code, data: { fb_posts_count: newCount } }),
    });
    fetchData();
  };

  const handleDeleteBanner = async () => {
    if (!confirm('Supprimer la bannière de ce partenaire ?')) return;
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    await fetch('/api/admin-data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'delete_banner', code }),
    });
    setBanner(null);
    fetchData();
  };

  const handleDeletePartner = async () => {
    if (!confirm(`🗑️ Supprimer DÉFINITIVEMENT le partenaire ${code} ?\n\nCela supprimera aussi ses bannières.\nCette action est irréversible.`)) return;
    if (!confirm('DERNIÈRE CONFIRMATION — Supprimer ce partenaire ?')) return;
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    await fetch('/api/admin-data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'delete_partner', code }),
    });
    router.push('/admin');
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const isExpired = (d) => d && new Date(d) < new Date();
  const getDaysLeft = (d) => d ? Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const TARGET_POSTS = 26; // 6 mois × ~4 semaines
  const postsProgress = Math.min((fbPosts / TARGET_POSTS) * 100, 100);
  const daysLeft = partner ? getDaysLeft(partner.expires_at) : null;
  const startDate = partner?.registered_at ? new Date(partner.registered_at) : null;
  const totalDays = startDate && partner?.expires_at ? Math.ceil((new Date(partner.expires_at) - startDate) / (1000 * 60 * 60 * 24)) : 180;
  const daysElapsed = startDate ? Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24)) : 0;
  const timeProgress = Math.min((daysElapsed / totalDays) * 100, 100);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h1 className="text-white font-bold text-xl mb-4 text-center">Admin K Trix</h1>
          <input type="password" value={pwdInput} onChange={e => setPwdInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Mot de passe admin"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-red-500 transition mb-4" autoFocus />
          <button onClick={handleLogin} className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition">
            Accéder
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 flex items-center gap-3"><RefreshCw className="w-5 h-5 animate-spin" />Chargement...</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Partenaire introuvable : {code}</p>
          <button onClick={() => router.push('/admin')} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
            ← Retour Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />Admin
            </button>
            <span className="text-gray-600">/</span>
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-white font-bold">{partner.partner_group_name}</span>
            <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{code}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ${partner.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}>
              {partner.is_active ? <><ToggleRight className="w-4 h-4" />Actif</> : <><ToggleLeft className="w-4 h-4" />Inactif</>}
            </button>
            <button onClick={handleDeletePartner} className="flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-400 rounded-lg text-sm font-medium hover:bg-red-900 transition border border-red-700">
              <Trash2 className="w-4 h-4" />Supprimer
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Infos principales */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-400" />Informations</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-xs mb-1">Groupe</p>
                <p className="text-white font-semibold">{partner.partner_group_name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">URL</p>
                <a href={partner.partner_group_url} target="_blank" rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm flex items-center gap-1">
                  {partner.partner_group_url?.replace('https://www.facebook.com/groups/', 'fb.com/groups/')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Ville</p>
                  <p className="text-gray-300">{partner.city || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Membres</p>
                  <p className="text-gray-300">{partner.notes?.replace('Membres: ', '') || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Début partenariat</p>
                  <p className="text-gray-300 text-sm">{formatDate(partner.registered_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Expiration</p>
                  <p className={`text-sm font-medium ${isExpired(partner.expires_at) ? 'text-red-400' : partner.expires_at ? 'text-gray-300' : 'text-emerald-400'}`}>
                    {partner.expires_at ? formatDate(partner.expires_at) : '∞ Permanent'}
                    {daysLeft !== null && daysLeft > 0 && <span className="text-gray-500 text-xs ml-1">({daysLeft}j)</span>}
                    {isExpired(partner.expires_at) && <span className="text-red-400"> ⚠️</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statut contrat */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-white font-bold mb-4">Statut du contrat</h2>

            {/* Progression temporelle */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Durée écoulée</span>
                <span>{Math.min(daysElapsed, totalDays)} / {totalDays} jours</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${timeProgress}%` }}></div>
              </div>
            </div>

            {/* Posts FB */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Posts Facebook réalisés</span>
                <span className={fbPosts >= TARGET_POSTS ? 'text-emerald-400 font-bold' : 'text-gray-400'}>{fbPosts} / {TARGET_POSTS}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full transition-all ${postsProgress >= 100 ? 'bg-emerald-500' : postsProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${postsProgress}%` }}></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleUpdateFbPosts(Math.max(0, fbPosts - 1))}
                  className="p-1.5 bg-gray-800 rounded hover:bg-gray-700 transition border border-gray-700">
                  <Minus className="w-3 h-3 text-gray-400" />
                </button>
                <span className="text-white font-bold text-lg w-8 text-center">{fbPosts}</span>
                <button onClick={() => handleUpdateFbPosts(fbPosts + 1)}
                  className="p-1.5 bg-gray-800 rounded hover:bg-gray-700 transition border border-gray-700">
                  <Plus className="w-3 h-3 text-gray-400" />
                </button>
                <span className="text-gray-500 text-xs ml-1">posts publiés</span>
              </div>
            </div>

            {/* Score conformité */}
            <div className={`rounded-lg p-3 border ${fbPosts >= TARGET_POSTS && !isExpired(partner.expires_at) ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
              {fbPosts >= TARGET_POSTS && !isExpired(partner.expires_at) ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Contrat respecté — Éligible accès permanent</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">En cours — {TARGET_POSTS - fbPosts} posts restants</span>
                </div>
              )}
            </div>

            {/* Actions expiration */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => handleExtend(6)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition border border-blue-500/20">
                <Clock className="w-3 h-3" />+6 mois
              </button>
              <button onClick={() => handleExtend(12)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition border border-blue-500/20">
                <Clock className="w-3 h-3" />+12 mois
              </button>
              {!partner.expires_at && (
                <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/20">
                  ∞ Accès permanent
                </span>
              )}
              {partner.expires_at && fbPosts >= TARGET_POSTS && (
                <button onClick={handleConvertPermanent}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" />Convertir permanent
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bannière */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Image className="w-4 h-4 text-cyan-400" />Bannière publicitaire</h2>
          {banner ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs mb-2">Desktop (728×90)</p>
                  <img src={banner.image_url_desktop} alt="Desktop banner"
                    className="w-full rounded-lg border border-gray-700 object-contain bg-gray-800" style={{ maxHeight: 100 }} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-2">Mobile (320×100)</p>
                  <img src={banner.image_url_mobile} alt="Mobile banner"
                    className="w-full rounded-lg border border-gray-700 object-contain bg-gray-800" style={{ maxHeight: 100 }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Uploadée le {formatDate(banner.created_at)}</span>
                  <span>Expire le {formatDate(banner.expires_at)}</span>
                  <span className={`font-medium ${banner.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                    {banner.is_active ? '● Active' : '● Inactive'}
                  </span>
                </div>
                <button onClick={handleDeleteBanner}
                  className="flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-400 rounded-lg text-sm hover:bg-red-900 transition border border-red-700">
                  <Trash2 className="w-4 h-4" />Supprimer bannière
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Image className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucune bannière uploadée</p>
              <a href={`/banner-upload`} target="_blank" className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition">
  Uploader une bannière →
</a>
            </div>
          )}
        </div>

        {/* Notes admin */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-bold mb-4">Notes admin</h2>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Notes internes sur ce partenaire..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition resize-none"
            rows={3} />
          <div className="flex justify-end mt-3">
            <button onClick={handleSaveNotes} disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>

        {/* Zone danger */}
        <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-400 font-bold mb-2">Zone dangereuse</h2>
          <p className="text-gray-500 text-sm mb-4">La suppression du partenaire est irréversible et supprime aussi ses bannières.</p>
          <button onClick={handleDeletePartner}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-900/50 text-red-400 rounded-lg font-medium hover:bg-red-900 transition border border-red-700">
            <Trash2 className="w-4 h-4" />Supprimer ce partenaire
          </button>
        </div>

      </main>
    </div>
  );
}
