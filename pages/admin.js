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

  // ✅ BUG 1 FIXÉ — savedPwd déclaré avant utilisation
  useEffect(() => {
    const savedPwd = localStorage.getItem('ktrix_admin_pwd');
    if (savedPwd) {
      setPassword(savedPwd);
      fetchTesters(savedPwd);
      fetchSavedSearches(savedPwd);
    }
  }, []);

  // ✅ BUG 2 FIXÉ — fetchSavedSearches au même niveau que fetchTesters
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

  const registered = testers.filter(t => t.email && t.email !== '' && t.email !== 'EMPTY');
  const available = testers.filter(t => !t.email || t.email === '' || t.email === 'EMPTY');
  const expired = testers.filter(t => t.expires_at && new Date(t.expires_at) < new Date());

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
          <button onClick={() => fetchTesters()} className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                  {/* ✅ NOUVEAU — colonne Notes visible */}
                  <th className="text-left p-3 font-medium">Notes</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testers.map((tester) => {
                  const isReg = tester.email && tester.email !== '' && tester.email !== 'EMPTY';
                  const isExp = isExpired(tester.expires_at);
                  const daysLeft = getDaysLeft(tester.expires_at);
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

                      {/* ✅ NOUVEAU — Notes inline éditable */}
                      <td className="p-3 max-w-[200px]">
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
                          <button onClick={() => handleReset(tester.code)} title="Reset recherches" className="p-1.5 rounded hover:bg-gray-800 transition">
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
    </div>
  );
}
