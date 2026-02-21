import { useState } from 'react';
import { Lock, Users, RefreshCw, ToggleLeft, ToggleRight, Clock, MessageSquare, Shield, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [testers, setTesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noteEdit, setNoteEdit] = useState({ code: null, text: '' });

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
      }
    } catch (err) {
      setError('Connection error');
    }
    setLoading(false);
  };

  const handleLogin = () => {
    if (!password) return;
    fetchTesters(password);
  };

  const handleToggle = async (code) => {
    await fetch('/api/admin-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'toggle', code }),
    });
    fetchTesters();
  };

  const handleExtend = async (code, days) => {
    await fetch('/api/admin-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'extend', code, data: { days } }),
    });
    fetchTesters();
  };

  const handleNote = async (code) => {
    await fetch('/api/admin-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'note', code, data: { note: noteEdit.text } }),
    });
    setNoteEdit({ code: null, text: '' });
    fetchTesters();
  };

  const registered = testers.filter(t => t.email && t.email !== '' && t.email !== 'EMPTY');
  const available = testers.filter(t => !t.email || t.email === '' || t.email === 'EMPTY');
  const active = testers.filter(t => t.is_active);
  const expired = testers.filter(t => t.expires_at && new Date(t.expires_at) < new Date());

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
  const isExpired = (d) => d && new Date(d) < new Date();

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
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left p-3 font-medium">Code</th>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Sector</th>
                  <th className="text-left p-3 font-medium">Device</th>
                  <th className="text-center p-3 font-medium">Searches</th>
                  <th className="text-left p-3 font-medium">Registered</th>
                  <th className="text-left p-3 font-medium">Expires</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testers.map((tester) => {
                  const isReg = tester.email && tester.email !== '' && tester.email !== 'EMPTY';
                  const isExp = isExpired(tester.expires_at);
                  return (
                    <tr key={tester.id} className={`border-b border-gray-800/50 ${!tester.is_active ? 'opacity-40' : ''} ${isExp ? 'bg-red-500/5' : ''}`}>
                      <td className="p-3 font-mono text-xs text-cyan-400">{tester.code}</td>
                      <td className="p-3">
                        {isReg ? (
                          <span className="text-white">{tester.last_name} {tester.first_name || ''}</span>
                        ) : (
                          <span className="text-gray-600 italic">Available</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-400">{isReg ? tester.email : '-'}</td>
                      <td className="p-3 text-gray-400">{isReg ? tester.sector : '-'}</td>
                      <td className="p-3 text-gray-400">{isReg ? tester.device : '-'}</td>
                      <td className="p-3 text-center">
                        <span className={`font-bold ${tester.search_count > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
                          {tester.search_count}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 text-xs">{formatDate(tester.registered_at)}</td>
                      <td className={`p-3 text-xs ${isExp ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                        {formatDate(tester.expires_at)}
                        {isExp && ' ⚠️'}
                      </td>
                      <td className="p-3 text-center">
                        {tester.is_active ? (
                          <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
                        ) : (
                          <span className="inline-block w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(tester.code)}
                            title={tester.is_active ? 'Deactivate' : 'Activate'}
                            className="p-1.5 rounded hover:bg-gray-800 transition"
                          >
                            {tester.is_active ? (
                              <ToggleRight className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={() => handleExtend(tester.code, 180)}
                            title="Extend 6 months"
                            className="p-1.5 rounded hover:bg-gray-800 transition"
                          >
                            <Clock className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => setNoteEdit({ code: tester.code, text: tester.notes || '' })}
                            title="Add note"
                            className="p-1.5 rounded hover:bg-gray-800 transition"
                          >
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                  onClick={() => handleReset(tester.code)}
                  title="Reset searches"
                  className="p-1.5 rounded hover:bg-gray-800 transition"
                >
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

        {/* Note Editor Modal */}
        {noteEdit.code && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-white font-bold mb-2">Note — {noteEdit.code}</h3>
              <textarea
                value={noteEdit.text}
                onChange={(e) => setNoteEdit({...noteEdit, text: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition mb-4"
                rows={4}
                placeholder="Add notes about this tester..."
              />
              <div className="flex gap-3">
                <button onClick={() => handleNote(noteEdit.code)} className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
                  Save
                </button>
                <button onClick={() => setNoteEdit({ code: null, text: '' })} className="flex-1 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition border border-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
