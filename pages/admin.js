import * as XLSX from 'xlsx';
import { useState, useEffect } from 'react';
import { Lock, RefreshCw, ToggleLeft, ToggleRight, Clock, MessageSquare, Shield, AlertCircle, Check, X } from 'lucide-react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [testers, setTesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noteEdit, setNoteEdit] = useState({ code: null, text: '' });
  const [savedSearches, setSavedSearches] = useState([]);
  const [loadingSearches, setLoadingSearches] = useState(false);
  const [feedbackView, setFeedbackView] = useState({ code: null, text: '' });
  // ✅ NOUVEAU: state pour la table feedbacks dédiée
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    const savedPwd = localStorage.getItem('ktrix_admin_pwd');
    if (savedPwd) {
      setPassword(savedPwd);
      fetchTesters(savedPwd);
      fetchSavedSearches(savedPwd);
      fetchFeedbacks(savedPwd); // ✅ Charger feedbacks au démarrage
    }
  }, []);

  const fetchSavedSearches = async (pwd) => {
    setLoadingSearches(true);
    try {
      const res = await fetch('/api/saved-searches?all=true', {
        headers: { 'x-admin-pwd': pwd || password }
      });
      const data = await res.json();
      if (Array.isArray(data)) setSavedSearches(data);
    } catch (err) {
      console.error('Error fetching saved searches:', err);
    }
    setLoadingSearches(false);
  };

  // ✅ NOUVEAU: charger feedbacks depuis Supabase via API
  const fetchFeedbacks = async (pwd) => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd || password, action: 'list_feedbacks' }),
      });
      const data = await res.json();
      if (Array.isArray(data.feedbacks)) setFeedbacks(data.feedbacks);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    }
    setLoadingFeedbacks(false);
  };

  const fetchTesters = async (pwd) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd || password, action: 'list' }),
      });
      const data = await res.json();
      if (data.error === 'Unauthorized') {
        setError('Wrong password');
        setAuthenticated(false);
      } else if (data.testers) {
        setTesters(data.testers);
        setAuthenticated(true);
        fetchSavedSearches(pwd);
        fetchFeedbacks(pwd); // ✅ Recharger feedbacks aussi
      }
    } catch (err) {
      setError('Connection error');
    }
    setLoading(false);
  };

  const handleLogin = () => {
    if (!password) return;
    localStorage.setItem('ktrix_admin_pwd', password);
    fetchTesters(password);
  };

  const handleToggle = async (code) => {
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    await fetch('/api/admin-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'toggle', code }),
    });
    fetchTesters(pwd);
  };

  const handleReset = async (code) => {
    if (!confirm(`⚠️ RESET COMPLET de ${code}\n\nCeci va effacer :\n- Nom et email\n- Dates d'inscription et d'expiration\n- Compteur de recherches\n\nLe code sera remis à disposition.\n\nConfirmer ?`)) return;
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    await fetch('/api/admin-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'reset_full', code }),
    });
    fetchTesters(pwd);
  };

  const handleExtend = async (code, days) => {
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    await fetch('/api/admin-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'extend', code, data: { days } }),
    });
    fetchTesters(pwd);
  };

  const handleNote = async (code) => {
    const pwd = password || localStorage.getItem('ktrix_admin_pwd');
    await fetch('/api/admin-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'note', code, data: { note: noteEdit.text } }),
    });
    setNoteEdit({ code: null, text: '' });
    fetchTesters(pwd);
  };

  // ✅ MODIFIÉ: Feedback maintenant en position D (juste après Email)
  // + largeur de colonne augmentée pour le feedback
  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    testers.filter(t => t.email).forEach(tester => {
      // Récupérer les feedbacks de ce testeur depuis la table feedbacks dédiée
      const testerFeedbacks = feedbacks.filter(f => f.beta_code === tester.code);
      const feedbackText = testerFeedbacks
        .map(f => `[${new Date(f.created_at).toLocaleDateString('fr-FR')}] ${f.message}${f.reply_email ? ` (${f.reply_email})` : ''}`)
        .join('\n---\n') || tester.feedback || '';

      const info = [
        ['Code', tester.code],
        ['Prénom', tester.first_name || ''],
        ['Nom', tester.last_name || ''],
        ['Email', tester.email || ''],
        // ✅ FEEDBACK EN POSITION D (4e champ = après Email)
        ['Feedback', feedbackText],
        ['Secteur', tester.sector || ''],
        ['Age', tester.age || ''],
        ['Inscription', tester.registered_at ? new Date(tester.registered_at).toLocaleDateString('fr-FR') : ''],
        ['Expiration', tester.expires_at ? new Date(tester.expires_at).toLocaleDateString('fr-FR') : ''],
        ['Recherches', tester.search_count || 0],
        ['Statut', tester.is_active ? 'Actif' : 'Inactif'],
        ['Notes', tester.notes || ''],
        [],
        ['Recherches sauvegardées', ''],
        ['Nom', 'Paramètres', 'Date'],
        ...savedSearches
          .filter(s => s.beta_code === tester.code)
          .map(s => [
            s.name || '—',
            s.params ? Object.entries(s.params).filter(([,v]) => v && v !== '' && v !== 'all').map(([k,v]) => `${k}: ${v}`).join(' · ') : '—',
            new Date(s.created_at).toLocaleDateString('fr-FR')
          ]),
        [],
        ['NOTES ADMIN', ''],
        [tester.notes || '(vide)'],
        ['', ''], ['', ''], ['', ''], ['', ''], ['', ''],
      ];
      const ws = XLSX.utils.aoa_to_sheet(info);
      // ✅ Largeur colonne A: 20, colonne B: 80 (large pour feedback)
      ws['!cols'] = [{ wch: 20 }, { wch: 80 }];
      XLSX.utils.book_append_sheet(wb, ws, (tester.first_name || tester.code).slice(0, 31));
    });
    XLSX.writeFile(wb, `ktrix-beta-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const registered = testers.filter(t => t.email && t.email !== '' && t.email !== 'EMPTY');
  const available = testers.filter(t => !t.email || t.email === '' || t.email === 'EMPTY');
  const expired = testers.filter(t => t.expires_at && new Date(t.expires_at) < new Date());
  const withFeedback = testers.filter(t => t.feedback && t.feedback.trim() !== '');

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
  const isExpired = (d) => d && new Date(d) < new Date();

  const getDaysLeft = (expires_at) => {
    if (!expires_at) return null;
    const diff = new Date(expires_at) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin K Trix</h1>
            <p className="text-gray-500 text-sm mt-1">Beta Testers Management</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Admin password"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-red-500 transition mb-4"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4 justify-center">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <button onClick={handleLogin} disabled={loading} className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition disabled:opacity-50">
              {loading ? 'Loading...' : 'Access'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-400" />
            <h1 className="text-lg font-bold text-white">K Trix Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { const pwd = password || localStorage.getItem('ktrix_admin_pwd'); fetchTesters(pwd); fetchFeedbacks(pwd); }} className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-emerald-800 border border-emerald-700 rounded-lg text-sm text-emerald-300 hover:bg-emerald-700 transition">
              📊 Export Excel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{testers.length}</p>
            <p className="text-gray-500 text-sm">Total Codes</p>
          </div>
          <div className="bg-gray-900 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-400">{registered.length}</p>
            <p className="text-gray-500 text-sm">Registered</p>
          </div>
          <div className="bg-gray-900 border border-blue-500/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-400">{available.length}</p>
            <p className="text-gray-500 text-sm">Available</p>
          </div>
          <div className="bg-gray-900 border border-red-500/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-400">{expired.length}</p>
            <p className="text-gray-500 text-sm">Expired</p>
          </div>
          <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-purple-400">{feedbacks.length}</p>
            <p className="text-gray-500 text-sm">Feedbacks</p>
          </div>
        </div>

        {/* Testers Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-white font-bold">Beta Testers ({registered.length} / {testers.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left p-3 font-medium">Code</th>
                  <th className="text-left p-3 font-medium">Nom</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Secteur</th>
                  <th className="text-center p-3 font-medium">Recherches</th>
                  <th className="text-left p-3 font-medium">Inscription</th>
                  <th className="text-left p-3 font-medium">Expiration</th>
                  <th className="text-center p-3 font-medium">Statut</th>
                  <th className="text-left p-3 font-medium">Notes</th>
                  <th className="text-left p-3 font-medium">Feedback</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testers.map((tester) => {
                  const isReg = tester.email && tester.email !== '' && tester.email !== 'EMPTY';
                  const isExp = isExpired(tester.expires_at);
                  const daysLeft = getDaysLeft(tester.expires_at);
                  const testerFeedbacks = feedbacks.filter(f => f.beta_code === tester.code);
                  const hasFeedback = testerFeedbacks.length > 0 || (tester.feedback && tester.feedback.trim() !== '');
                  const latestFeedback = testerFeedbacks.length > 0
                    ? testerFeedbacks[0].message
                    : tester.feedback || '';
                  return (
                    <tr key={tester.id} className={`border-b border-gray-800/50 hover:bg-gray-800/20 transition ${!tester.is_active ? 'opacity-40' : ''} ${isExp ? 'bg-red-500/5' : ''}`}>
                      <td className="p-3 font-mono text-xs text-cyan-400">{tester.code}</td>
                      <td className="p-3">
                        {isReg ? (
                          <span className="text-white">{tester.last_name} {tester.first_name || ''}</span>
                        ) : (
                          <span className="text-gray-600 italic">Disponible</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-400 text-xs">{isReg ? tester.email : '-'}</td>
                      <td className="p-3 text-gray-400">{isReg ? tester.sector : '-'}</td>
                      <td className="p-3 text-center">
                        <span className={`font-bold ${tester.search_count > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
                          {tester.search_count || 0}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 text-xs">{formatDate(tester.registered_at)}</td>
                      <td className="p-3 text-xs">
                        {isReg ? (
                          <span className={isExp ? 'text-red-400 font-bold' : daysLeft <= 3 ? 'text-orange-400 font-bold' : 'text-gray-500'}>
                            {formatDate(tester.expires_at)}
                            {isExp ? ' ⚠️' : daysLeft !== null && daysLeft <= 7 ? ` (${daysLeft}j)` : ''}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-center">
                        {tester.is_active ? (
                          <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
                        ) : (
                          <span className="inline-block w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                        )}
                      </td>

                      {/* Notes inline */}
                      <td className="p-3 max-w-[160px]">
                        {noteEdit.code === tester.code ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={noteEdit.text}
                              onChange={(e) => setNoteEdit({ ...noteEdit, text: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleNote(tester.code)}
                              className="flex-1 px-2 py-1 bg-gray-800 border border-blue-500 rounded text-white text-xs focus:outline-none"
                              autoFocus
                            />
                            <button onClick={() => handleNote(tester.code)} className="p-1 text-emerald-400 hover:text-emerald-300">
                              <Check className="w-3 h-3" />
                            </button>
                            <button onClick={() => setNoteEdit({ code: null, text: '' })} className="p-1 text-gray-500 hover:text-gray-300">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => setNoteEdit({ code: tester.code, text: tester.notes || '' })}
                            className="text-xs text-gray-400 cursor-pointer hover:text-white transition truncate block"
                            title={tester.notes || 'Cliquer pour ajouter une note'}
                          >
                            {tester.notes || <span className="text-gray-700 italic">+ note</span>}
                          </span>
                        )}
                      </td>

                      {/* Feedback - affiche le nombre de feedbacks + aperçu */}
                      <td className="p-3 max-w-[160px]">
                        {hasFeedback ? (
                          <button
                            onClick={() => setFeedbackView({ code: tester.code, text: latestFeedback })}
                            className="flex items-center gap-1.5 text-left group"
                            title="Voir le feedback complet"
                          >
                            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
                            {testerFeedbacks.length > 1 && (
                              <span className="text-purple-500 text-xs font-bold">{testerFeedbacks.length}</span>
                            )}
                            <span className="text-purple-300 text-xs truncate max-w-28 group-hover:text-purple-200 transition">
                              {latestFeedback.slice(0, 35)}…
                            </span>
                          </button>
                        ) : (
                          <span className="text-gray-700 text-xs">—</span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggle(tester.code)} title={tester.is_active ? 'Désactiver' : 'Activer'} className="p-1.5 rounded hover:bg-gray-800 transition">
                            {tester.is_active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
                          </button>
                          <button onClick={() => handleExtend(tester.code, 180)} title="Prolonger 6 mois" className="p-1.5 rounded hover:bg-gray-800 transition">
                            <Clock className="w-4 h-4 text-blue-400" />
                          </button>
                          <button onClick={() => setNoteEdit({ code: tester.code, text: tester.notes || '' })} title="Note" className="p-1.5 rounded hover:bg-gray-800 transition">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={() => handleReset(tester.code)} title="Reset" className="p-1.5 rounded hover:bg-gray-800 transition">
                            <RefreshCw className="w-4 h-4 text-orange-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ NOUVEAU: Section Feedbacks dédiée */}
        <div className="bg-gray-900 border border-purple-500/20 rounded-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
            <h2 className="text-white font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full inline-block"></span>
              Feedbacks testeurs ({feedbacks.length})
            </h2>
            <button onClick={() => fetchFeedbacks()} className="text-xs text-gray-500 hover:text-gray-300 transition">
              <RefreshCw className={`w-3 h-3 ${loadingFeedbacks ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left p-3 font-medium">Code beta</th>
                  <th className="text-left p-3 font-medium">Message</th>
                  <th className="text-left p-3 font-medium">Email réponse</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingFeedbacks ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Chargement...</td></tr>
                ) : feedbacks.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Aucun feedback pour l'instant</td></tr>
                ) : (
                  feedbacks.map((fb) => (
                    <tr key={fb.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-3 font-mono text-xs text-cyan-400">{fb.beta_code}</td>
                      <td className="p-3 text-white max-w-md">
                        <p className="text-sm leading-relaxed">{fb.message}</p>
                      </td>
                      <td className="p-3 text-xs">
                        {fb.reply_email ? (
                          <a href={`mailto:${fb.reply_email}`} className="text-blue-400 hover:text-blue-300 transition">
                            ✉️ {fb.reply_email}
                          </a>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(fb.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Saved Searches */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-bold">Recherches sauvegardées ({savedSearches.length})</h2>
            <button onClick={() => fetchSavedSearches()} className="text-xs text-gray-500 hover:text-gray-300 transition">
              <RefreshCw className={`w-3 h-3 ${loadingSearches ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left p-3 font-medium">Code beta</th>
                  <th className="text-left p-3 font-medium">Nom recherche</th>
                  <th className="text-left p-3 font-medium">Paramètres</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingSearches ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Chargement...</td></tr>
                ) : savedSearches.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Aucune recherche sauvegardée</td></tr>
                ) : (
                  savedSearches.map((s) => (
                    <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-3 font-mono text-xs text-cyan-400">{s.beta_code}</td>
                      <td className="p-3 text-white">{s.name || '—'}</td>
                      <td className="p-3 text-gray-400 text-xs max-w-xs truncate">
                        {s.params ? (
                          <span title={JSON.stringify(s.params, null, 2)}>
                            {Object.entries(s.params)
                              .filter(([, v]) => v && v !== '' && v !== 'all')
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' · ') || '—'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(s.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Feedback View Modal */}
      {feedbackView.code && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full inline-block"></span>
                Feedback — {feedbackView.code}
              </h3>
              <button onClick={() => setFeedbackView({ code: null, text: '' })} className="text-gray-500 hover:text-white transition text-xl leading-none">✕</button>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 max-h-80 overflow-y-auto space-y-3">
              {/* Afficher les feedbacks de la table dédiée en priorité */}
              {feedbacks.filter(f => f.beta_code === feedbackView.code).length > 0 ? (
                feedbacks.filter(f => f.beta_code === feedbackView.code).map((fb, i) => (
                  <div key={fb.id} className={i > 0 ? 'pt-3 border-t border-gray-700' : ''}>
                    <p className="text-purple-400 text-xs mb-1">
                      {new Date(fb.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-white text-sm">{fb.message}</p>
                    {fb.reply_email && (
                      <a href={`mailto:${fb.reply_email}`} className="text-blue-400 text-xs mt-1 block hover:text-blue-300">
                        ✉️ {fb.reply_email}
                      </a>
                    )}
                  </div>
                ))
              ) : (
                /* Fallback: anciens feedbacks stockés sur le testeur */
                feedbackView.text.split('\n\n').map((entry, i) => (
                  <div key={i} className={i > 0 ? 'pt-3 border-t border-gray-700' : ''}>
                    {entry.match(/^\[(.+?)\]/) ? (
                      <>
                        <p className="text-purple-400 text-xs mb-1">{entry.match(/^\[(.+?)\]/)[1]}</p>
                        <p className="text-white text-sm">{entry.replace(/^\[.+?\]\s*/, '')}</p>
                      </>
                    ) : (
                      <p className="text-white text-sm">{entry}</p>
                    )}
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setFeedbackView({ code: null, text: '' })} className="w-full mt-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition border border-gray-700">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
