import { useState, useRef, useEffect } from 'react';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:4000';

const QUICK_ACTIONS = [
  { label: 'O que tenho pra hoje?', msg: 'Resuma meu dia de hoje com base nos dados.' },
  { label: 'Criar rotina de estudos', msg: 'Sugira uma rotina de estudos baseada nas minhas metas atuais.' },
  { label: 'Como estão as finanças?', msg: 'Analise minhas finanças e sugira economia.' },
  { label: 'Sugerir treino', msg: 'Baseado no meu último treino, o que devo fazer hoje?' },
];

export function AIChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actions, setActions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const saveMessage = async (sid, role, text) => {
    try {
      await fetch(`${API_BASE}/api/ai?action=add_message&id=${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, text }),
      });
    } catch {}
  };

  const createSession = async (firstMsg) => {
    const title = firstMsg.length > 40 ? firstMsg.slice(0, 40) + '...' : firstMsg;
    try {
      const res = await fetch(`${API_BASE}/api/ai?action=create_session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      return data.id;
    } catch { return null; }
  };

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai?action=sessions`);
      const data = await res.json();
      setSessions(data);
    } catch {} finally { setLoadingSessions(false); }
  };

  const loadSession = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/ai?action=session&id=${id}`);
      const data = await res.json();
      setSessionId(data.id);
      setMessages(data.messages.map(m => ({ role: m.role, text: m.text })));
      setShowHistory(false);
      setActions([]);
    } catch {}
  };

  const newConversation = () => {
    setSessionId(null);
    setMessages([]);
    setActions([]);
    setError(null);
    setShowHistory(false);
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE}/api/ai?action=delete_session&id=${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
      if (sessionId === id) newConversation();
    } catch {}
  };

  const send = async (msg) => {
    const text = msg || input;
    if (!text.trim()) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);
    setActions([]);

    let sid = sessionId;
    if (!sid) {
      sid = await createSession(text);
      if (!sid) { setError('Erro ao criar sessão'); setLoading(false); return; }
      setSessionId(sid);
    }

    await saveMessage(sid, 'user', text);

    try {
      const res = await fetch(`${API_BASE}/api/ai?action=chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro');

      const assistantMsg = { role: 'assistant', text: data.reply };
      setMessages(prev => [...prev, assistantMsg]);
      await saveMessage(sid, 'assistant', data.reply);
      if (data.actions?.length) setActions(data.actions);
    } catch (e) {
      setError(e.message || 'Erro ao conectar com a IA');
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action) => {
    try {
      const res = await fetch(`${API_BASE}/api/ai?action=execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      const data = await res.json();
      if (data.success) {
        const sysMsg = { role: 'system', text: `✅ Ação executada: ${action.type.replace('criar_', '')} criado(a)!` };
        setMessages(prev => [...prev, sysMsg]);
        if (sessionId) saveMessage(sessionId, 'system', sysMsg.text);
        setActions(prev => prev.filter(a => a !== action));
      }
    } catch {
      const errMsg = { role: 'system', text: '❌ Erro ao executar ação.' };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const visibleMessages = showHistory ? [] : messages;

  return (
    <>
      <button
        onClick={() => { setOpen(!open); if (!open) setShowHistory(false); }}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200,
          width: '3.5rem', height: '3.5rem', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-start), var(--primary-end))',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(226, 138, 75, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Assistente IA"
      >
        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '1.5rem' }}>
          {open ? 'close' : 'psychology'}
        </span>
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: '5.5rem', right: '1.5rem', zIndex: 200,
          width: '400px', maxWidth: 'calc(100vw - 2rem)', height: '520px', maxHeight: 'calc(100vh - 8rem)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}>
          {/* Header */}
          <div style={{
            padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontWeight: 600, fontSize: '0.875rem', color: 'var(--foreground)',
          }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>psychology</span>
            {showHistory ? 'Histórico' : 'Assistente Boroska'}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem' }}>
              {!showHistory && (
                <button
                  onClick={newConversation}
                  style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: '0.25rem', lineHeight: 0 }}
                  title="Nova conversa"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>add</span>
                </button>
              )}
              <button
                onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadSessions(); }}
                style={{ background: 'none', border: 'none', color: showHistory ? 'var(--primary)' : 'var(--foreground-muted)', cursor: 'pointer', padding: '0.25rem', lineHeight: 0 }}
                title="Histórico"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>history</span>
              </button>
            </div>
          </div>

          {/* History View */}
          {showHistory ? (
            <div style={{ flex: 1, overflow: 'auto', padding: '0.75rem' }}>
              {loadingSessions ? (
                <p style={{ textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.8125rem', padding: '2rem' }}>Carregando...</p>
              ) : sessions.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.8125rem', padding: '2rem' }}>
                  Nenhuma conversa ainda. Inicie uma nova!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => loadSession(s.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', background: s.id === sessionId ? 'var(--surface-hover)' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                      }}
                      onMouseEnter={e => { if (s.id !== sessionId) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                      onMouseLeave={e => { if (s.id !== sessionId) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--foreground)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.title}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--foreground-muted)' }}>
                          {s._count.messages} msgs · {new Date(s.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <button onClick={(e) => deleteSession(s.id, e)} style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: '0.25rem', opacity: 0.4, lineHeight: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.color = 'var(--foreground-muted)'; }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Chat messages */}
              <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {visibleMessages.length === 0 && !loading && (
                  <div style={{ color: 'var(--foreground-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '1rem 0' }}>
                    <p style={{ marginBottom: '0.75rem' }}>👋 Olá! Sou seu assistente do Boroska. Pergunte algo ou use uma sugestão:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                      {QUICK_ACTIONS.map((qa, i) => (
                        <button key={i} onClick={() => send(qa.msg)} style={{
                          background: 'var(--surface-hover)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-full)', padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem', color: 'var(--foreground-muted)', cursor: 'pointer', fontFamily: 'inherit',
                        }}>{qa.label}</button>
                      ))}
                    </div>
                  </div>
                )}

                {visibleMessages.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%',
                    padding: m.role === 'system' ? '0.5rem 0.75rem' : '0.625rem 0.875rem',
                    borderRadius: m.role === 'user' ? 'var(--radius-md) var(--radius-md) 0 var(--radius-md)' : 'var(--radius-md) var(--radius-md) var(--radius-md) 0',
                    background: m.role === 'user' ? 'var(--primary-start)' : m.role === 'system' ? 'transparent' : 'var(--surface-hover)',
                    color: m.role === 'user' ? '#fff' : m.role === 'system' ? 'var(--success)' : 'var(--foreground)',
                    fontSize: '0.8125rem', lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  }}>{m.text}</div>
                ))}

                {loading && (
                  <div style={{ alignSelf: 'flex-start', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', color: 'var(--foreground-muted)', fontSize: '0.8125rem' }}>
                    Pensando...
                  </div>
                )}

                {error && (
                  <div style={{ alignSelf: 'flex-start', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.75rem' }}>
                    ⚠️ {error}
                  </div>
                )}

                {actions.map((a, i) => (
                  <button key={i} onClick={() => executeAction(a)} style={{
                    alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--success-bg)', border: '1px solid rgba(126, 179, 86, 0.2)',
                    color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add_circle</span>
                    Executar: {a.type.replace('criar_', '').replace('_', ' ')}
                  </button>
                ))}

                <div ref={endRef} />
              </div>

              {/* Input */}
              <form onSubmit={e => { e.preventDefault(); send(); }} style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Pergunte algo..."
                  style={{ flex: 1, background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', color: 'var(--foreground)', fontSize: '0.8125rem', outline: 'none', fontFamily: 'inherit' }} />
                <button type="submit" disabled={loading || !input.trim()} style={{
                  background: 'linear-gradient(135deg, var(--primary-start), var(--primary-end))', border: 'none',
                  borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', color: '#fff',
                  cursor: loading ? 'wait' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>send</span>
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
