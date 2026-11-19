import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Credenziali Supabase del progetto
const SUPABASE_URL = 'https://ajuynrryavcidskcxjal.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YQvIcQl-DbTD48tlMuIdGA_5EmW-fW_';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORIE = ['Tutte', 'Elettronica', 'Motori', 'Casa & Tempo Libero', 'Generale'];
const CATEGORIE_FORM = ['Elettronica', 'Motori', 'Casa & Tempo Libero', 'Generale'];
const TIPI_ANNUNCIO = ['Tutti', 'In vendita', 'In regalo', 'A noleggio'];
const TIPI_FORM = ['In vendita', 'In regalo', 'A noleggio'];

const SUONERIE = [
  { id: 'chime', label: 'Trillo Gentile' },
  { id: 'pop', label: 'Pop Veloce' },
  { id: 'radar', label: 'Segnale Market' },
  { id: 'silent', label: 'Silenzioso' },
];

// Suoni di notifica generati localmente senza file audio esterni
function playNotificationSound(soundId = 'chime') {
  if (!soundId || soundId === 'silent') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const tone = (freq, start, duration, type = 'sine', gainVal = 0.12) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.001, now + start);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.02);
    };

    if (soundId === 'pop') {
      tone(520, 0, 0.09, 'triangle', 0.14);
      tone(780, 0.09, 0.12, 'triangle', 0.14);
    } else if (soundId === 'radar') {
      tone(880, 0, 0.11, 'sine', 0.11);
      tone(660, 0.14, 0.14, 'sine', 0.11);
    } else {
      tone(587.33, 0, 0.18, 'sine', 0.12);
      tone(880, 0.14, 0.25, 'sine', 0.11);
    }
  } catch {
    // Ignora eventuali blocchi autoplay audio
  }
}

// Ridimensiona e comprime leggermente le foto (max 4 per annuncio)
function compressImageFile(file, maxWidth = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeImages(item) {
  if (Array.isArray(item.immagini) && item.immagini.length > 0) {
    return item.immagini.slice(0, 4);
  }
  if (typeof item.immagine === 'string' && item.immagine.trim()) {
    try {
      const parsed = JSON.parse(item.immagine);
      if (Array.isArray(parsed)) return parsed.slice(0, 4);
    } catch {
      return [item.immagine];
    }
  }
  return [];
}

function buildThreadKey(annuncioId, userA, userB) {
  const pair = [String(userA || '').trim().toLowerCase(), String(userB || '').trim().toLowerCase()].sort();
  return `${annuncioId}__${pair[0]}__${pair[1]}`;
}

export default function App() {
  // Caricamento Google Fonts: Syne (titoli/brand) + Plus Jakarta Sans (testi/UI)
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Profilo utente registrato + foto profilo
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('tracolleghi_user_v2')) || {
          nome: '',
          email: '',
          fotoProfilo: '',
          registrato: false,
        }
      );
    } catch {
      return { nome: '', email: '', fotoProfilo: '', registrato: false };
    }
  });

  const [authForm, setAuthForm] = useState({
    nome: userProfile.nome || '',
    email: userProfile.email || '',
    fotoProfilo: userProfile.fotoProfilo || '',
  });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Impostazioni app (rotella)
  const [settings, setSettings] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('tracolleghi_settings_v2')) || {
          suoneria: 'chime',
          notificheAttive: true,
          badgeNonLetti: 0,
        }
      );
    } catch {
      return { suoneria: 'chime', notificheAttive: true, badgeNonLetti: 0 };
    }
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Annunci e filtri
  const [annunci, setAnnunci] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('Tutte');
  const [filtroTipo, setFiltroTipo] = useState('Tutti');
  const [ricerca, setRicerca] = useState('');

  // Form pubblicazione annuncio
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [tipoAnnuncio, setTipoAnnuncio] = useState('In vendita');
  const [categoria, setCategoria] = useState('Elettronica');
  const [fotoAnnuncio, setFotoAnnuncio] = useState([]); // max 4
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');
  const [avviso, setAvviso] = useState('');

  // Conferma eliminazione annuncio
  const [annuncioDaEliminare, setAnnuncioDaEliminare] = useState(null);

  // Chat privata 1-a-1
  const [chatAperta, setChatAperta] = useState(null); // { annuncio, altroUtente }
  const [messaggi, setMessaggi] = useState([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState('');
  const [invioMessaggio, setInvioMessaggio] = useState(false);
  const prevMsgCountRef = useRef(0);

  // Salvataggio profilo in localStorage
  useEffect(() => {
    localStorage.setItem('tracolleghi_user_v2', JSON.stringify(userProfile));
  }, [userProfile]);

  // Salvataggio impostazioni e aggiornamento badge icona (smartphone + PC PWA)
  useEffect(() => {
    localStorage.setItem('tracolleghi_settings_v2', JSON.stringify(settings));
    if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      if (settings.badgeNonLetti > 0) {
        navigator.setAppBadge(settings.badgeNonLetti).catch(() => {});
      } else {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }, [settings]);

  // Chiusura modali con tasto ESC su PC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowProfileModal(false);
        setShowSettingsModal(false);
        setAnnuncioDaEliminare(null);
        setChatAperta(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchAnnunci();
    fetchMessaggi(false);
  }, []);

  async function fetchAnnunci() {
    try {
      const { data, error } = await supabase
        .from('annunci')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnunci(data || []);
    } catch (err) {
      console.error('Errore caricamento annunci:', err.message);
    }
  }

  async function fetchMessaggi(playSoundIfNew = false) {
    try {
      const { data, error } = await supabase
        .from('messaggi')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) return;
      const lista = data || [];
      if (playSoundIfNew && lista.length > prevMsgCountRef.current) {
        const ultimo = lista[lista.length - 1];
        const mioNome = (userProfile.nome || '').trim().toLowerCase();
        const isDestinatario =
          !ultimo.destinatario || String(ultimo.destinatario || '').trim().toLowerCase() === mioNome;

        if (ultimo && mioNome && String(ultimo.mittente || '').trim().toLowerCase() !== mioNome && isDestinatario) {
          if (settings.notificheAttive) {
            playNotificationSound(settings.suoneria);
          }
          setSettings((prev) => ({ ...prev, badgeNonLetti: (prev.badgeNonLetti || 0) + 1 }));
        }
      }
      prevMsgCountRef.current = lista.length;
      setMessaggi(lista);
    } catch {
      // Silenzioso se la tabella messaggi non è ancora popolata
    }
  }

  // Controllo periodico per nuovi messaggi personali
  useEffect(() => {
    const timer = setInterval(() => {
      fetchMessaggi(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [userProfile.nome, settings.notificheAttive, settings.suoneria]);

  async function handleFotoProfiloChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 360, 0.78);
      setAuthForm((prev) => ({ ...prev, fotoProfilo: compressed }));
    } catch {
      setErrore('Impossibile leggere la foto profilo.');
    }
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    if (!authForm.nome.trim()) {
      setErrore('Inserisci il tuo nome o cognome per registrarti.');
      return;
    }
    const updated = {
      nome: authForm.nome.trim(),
      email: authForm.email.trim(),
      fotoProfilo: authForm.fotoProfilo,
      registrato: true,
    };
    setUserProfile(updated);
    setShowProfileModal(false);
    setErrore('');
    setAvviso(`Profilo salvato per ${updated.nome}!`);
    setTimeout(() => setAvviso(''), 3000);
  }

  async function handleFotoAnnuncioChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setErrore('');

    const postiLiberi = 4 - fotoAnnuncio.length;
    if (postiLiberi <= 0) {
      setErrore('Puoi inserire al massimo 4 foto per annuncio.');
      return;
    }

    const selezionate = files.slice(0, postiLiberi);
    if (files.length > postiLiberi) {
      setErrore(`Puoi aggiungere al massimo 4 foto: ho caricato le prime ${postiLiberi}.`);
    }

    try {
      const elaborate = await Promise.all(
        selezionate.map((file) => compressImageFile(file, 900, 0.7))
      );
      setFotoAnnuncio((prev) => [...prev, ...elaborate].slice(0, 4));
    } catch {
      setErrore('Errore durante il caricamento di una o più foto.');
    }
    e.target.value = '';
  }

  function removeFotoAnnuncio(index) {
    setFotoAnnuncio((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmitAnnuncio(e) {
    e.preventDefault();
    const autoreFinale = userProfile.nome?.trim() || 'Collega';
    if (!titolo.trim() || !descrizione.trim()) {
      setErrore('Compila almeno titolo e descrizione.');
      return;
    }

    setLoading(true);
    setErrore('');

    const prezzoNum =
      tipoAnnuncio === 'In regalo'
        ? 0
        : prezzo !== '' && !Number.isNaN(parseFloat(prezzo))
        ? parseFloat(prezzo)
        : null;

    const payloadBase = {
      titolo: titolo.trim(),
      descrizione: descrizione.trim(),
      prezzo: prezzoNum,
      categoria,
      autore: autoreFinale,
    };

    const payloadEsteso = {
      ...payloadBase,
      tipo: tipoAnnuncio,
      immagine: JSON.stringify(fotoAnnuncio),
      autore_foto: userProfile.fotoProfilo || '',
    };

    try {
      let { error } = await supabase.from('annunci').insert([payloadEsteso]);
      if (error) {
        const fallbackPayload = {
          ...payloadBase,
          descrizione: `[${tipoAnnuncio}] ${descrizione.trim()}`,
          immagine: fotoAnnuncio[0] || null,
        };
        const resFallback = await supabase.from('annunci').insert([fallbackPayload]);
        error = resFallback.error;
      }

      if (error) throw error;

      setTitolo('');
      setDescrizione('');
      setPrezzo('');
      setTipoAnnuncio('In vendita');
      setFotoAnnuncio([]);
      setAvviso('Annuncio pubblicato correttamente!');
      setTimeout(() => setAvviso(''), 3000);
      await fetchAnnunci();
    } catch (err) {
      setErrore('Errore durante il salvataggio: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function confermaEliminazioneAnnuncio() {
    if (!annuncioDaEliminare) return;
    try {
      const { error } = await supabase.from('annunci').delete().eq('id', annuncioDaEliminare.id);
      if (error) throw error;
      setAnnunci((prev) => prev.filter((a) => a.id !== annuncioDaEliminare.id));
      if (chatAperta?.annuncio?.id === annuncioDaEliminare.id) {
        setChatAperta(null);
      }
      setAvviso('Annuncio eliminato.');
      setTimeout(() => setAvviso(''), 2500);
    } catch (err) {
      setErrore('Impossibile eliminare l’annuncio: ' + err.message);
    } finally {
      setAnnuncioDaEliminare(null);
    }
  }

  // Filtraggio combinato per categoria, tipologia e ricerca
  const annunciFiltrati = useMemo(() => {
    return annunci.filter((item) => {
      const okCat = filtroCategoria === 'Tutte' || item.categoria === filtroCategoria;
      const tipoRilevato =
        item.tipo ||
        (item.prezzo === 0 || /\[in regalo\]/i.test(item.descrizione || '')
          ? 'In regalo'
          : /\[a noleggio\]/i.test(item.descrizione || '')
          ? 'A noleggio'
          : 'In vendita');
      const okTipo = filtroTipo === 'Tutti' || tipoRilevato === filtroTipo;
      const q = ricerca.trim().toLowerCase();
      const okRicerca =
        !q ||
        (item.titolo || '').toLowerCase().includes(q) ||
        (item.descrizione || '').toLowerCase().includes(q) ||
        (item.autore || '').toLowerCase().includes(q);
      return okCat && okTipo && okRicerca;
    });
  }, [annunci, filtroCategoria, filtroTipo, ricerca]);

  // Messaggi esclusivi della chat privata 1-a-1 attiva
  const messaggiChatAttiva = useMemo(() => {
    if (!chatAperta || !userProfile.nome) return [];
    const key = buildThreadKey(chatAperta.annuncio.id, userProfile.nome, chatAperta.altroUtente);
    return messaggi.filter((m) => {
      if (m.thread_key) return m.thread_key === key;
      const sameItem = String(m.annuncio_id) === String(chatAperta.annuncio.id);
      const pair = [String(m.mittente || '').toLowerCase(), String(m.destinatario || '').toLowerCase()].sort();
      const expectedPair = [
        String(userProfile.nome || '').toLowerCase(),
        String(chatAperta.altroUtente || '').toLowerCase(),
      ].sort();
      return sameItem && pair[0] === expectedPair[0] && pair[1] === expectedPair[1];
    });
  }, [messaggi, chatAperta, userProfile.nome]);

  function apriChatPrivata(annuncio, altroUtente) {
    if (!userProfile.registrato || !userProfile.nome.trim()) {
      setShowProfileModal(true);
      setErrore('Completa prima il tuo profilo per avviare una chat privata.');
      return;
    }
    setChatAperta({ annuncio, altroUtente });
    setSettings((prev) => ({ ...prev, badgeNonLetti: 0 }));
    fetchMessaggi(false);
  }

  async function handleInviaMessaggio(e) {
    e.preventDefault();
    if (!nuovoMessaggio.trim() || !chatAperta || !userProfile.nome.trim()) return;
    setInvioMessaggio(true);

    const mittente = userProfile.nome.trim();
    const destinatario = chatAperta.altroUtente.trim();
    const threadKey = buildThreadKey(chatAperta.annuncio.id, mittente, destinatario);

    const record = {
      annuncio_id: chatAperta.annuncio.id,
      thread_key: threadKey,
      mittente,
      destinatario,
      testo: nuovoMessaggio.trim(),
    };

    try {
      const { data, error } = await supabase.from('messaggi').insert([record]).select();
      if (error) {
        setMessaggi((prev) => [...prev, { ...record, id: Date.now(), created_at: new Date().toISOString() }]);
      } else if (data) {
        setMessaggi((prev) => [...prev, ...data]);
      }
      setNuovoMessaggio('');
      if (settings.notificheAttive) {
        playNotificationSound('pop');
      }
    } finally {
      setInvioMessaggio(false);
    }
  }

  const fontHeading = "'Syne', 'Plus Jakarta Sans', sans-serif";
  const fontBody = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', color: '#182230', fontFamily: fontBody }}>
      <style>{`
        .tm-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .tm-layout {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 20px 64px;
          display: grid;
          grid-template-columns: 370px 1fr;
          gap: 24px;
          align-items: start;
        }
        .tm-sidebar {
          position: sticky;
          top: 20px;
        }
        .tm-grid-annunci {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
          gap: 18px;
        }
        @media (max-width: 900px) {
          .tm-layout {
            grid-template-columns: 1fr;
            padding: 18px 14px 60px;
          }
          .tm-sidebar {
            position: static;
          }
        }
      `}</style>

      <header
        style={{
          background: 'linear-gradient(135deg, #1b365d 0%, #2563eb 100%)',
          color: '#fff',
          padding: '18px 20px',
          boxShadow: '0 4px 18px rgba(27, 54, 93, 0.16)',
        }}
      >
        <div className="tm-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/icona-tracolleghi.jpg"
              alt="TRACOLLEGHI Market"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                objectFit: 'cover',
                background: '#fff',
              }}
            />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: fontHeading,
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  letterSpacing: '-0.03em',
                }}
              >
                TRACOLLEGHI <span style={{ color: '#93c5fd', fontWeight: 700 }}>Market</span>
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '0.84rem', opacity: 0.9 }}>
                Bacheca colleghi • Vendita, Regalo & Noleggio
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {settings.badgeNonLetti > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '999px',
                }}
              >
                {settings.badgeNonLetti} nuove
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setAuthForm({
                  nome: userProfile.nome || '',
                  email: userProfile.email || '',
                  fotoProfilo: userProfile.fotoProfilo || '',
                });
                setShowProfileModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.16)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.28)',
                borderRadius: '999px',
                padding: '5px 13px 5px 6px',
                cursor: 'pointer',
                fontFamily: fontBody,
                fontWeight: 600,
                fontSize: '0.86rem',
              }}
            >
              {userProfile.fotoProfilo ? (
                <img
                  src={userProfile.fotoProfilo}
                  alt={userProfile.nome || 'Profilo'}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    color: '#1b365d',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {(userProfile.nome || 'U').charAt(0).toUpperCase()}
                </span>
              )}
              <span>{userProfile.registrato && userProfile.nome ? userProfile.nome : 'Registrati'}</span>
            </button>

            <button
              type="button"
              aria-label="Impostazioni"
              title="Impostazioni"
              onClick={() => setShowSettingsModal(true)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.28)',
                background: 'rgba(255,255,255,0.16)',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <main className="tm-layout">
        <aside className="tm-sidebar">
          {avviso && (
            <div
              style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '14px',
                fontWeight: 600,
              }}
            >
              {avviso}
            </div>
          )}
          {errore && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '14px',
                fontWeight: 600,
              }}
            >
              {errore}
            </div>
          )}

          <section
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.05)',
            }}
          >
            <h2 style={{ margin: '0 0 14px', fontFamily: fontHeading, fontSize: '1.15rem', color: '#1b365d' }}>
              Pubblica un annuncio
            </h2>

            <form onSubmit={handleSubmitAnnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              <input
                type="text"
                placeholder="Titolo (es. Bici, Trapano, Tavolo...)"
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                required
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  style={{ padding: '10px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                >
                  {CATEGORIE_FORM.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={tipoAnnuncio}
                  onChange={(e) => setTipoAnnuncio(e.target.value)}
                  style={{ padding: '10px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                >
                  {TIPI_FORM.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {tipoAnnuncio !== 'In regalo' && (
                <input
                  type="number"
                  step="0.01"
                  placeholder={tipoAnnuncio === 'A noleggio' ? 'Tariffa (€ / giorno)' : 'Prezzo (€)'}
                  value={prezzo}
                  onChange={(e) => setPrezzo(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />
              )}

              <textarea
                placeholder="Descrivi l'oggetto, le condizioni e come ritirarlo..."
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                rows={3}
                required
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontFamily: fontBody,
                  resize: 'vertical',
                }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: fotoAnnuncio.length >= 4 ? '#e2e8f0' : '#eff6ff',
                      color: fotoAnnuncio.length >= 4 ? '#64748b' : '#1d4ed8',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: fotoAnnuncio.length >= 4 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    📷 Foto ({fotoAnnuncio.length}/4)
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={fotoAnnuncio.length >= 4}
                      onChange={handleFotoAnnuncioChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Max 4 foto</span>
                </div>

                {fotoAnnuncio.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {fotoAnnuncio.map((src, idx) => (
                      <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
                        <img
                          src={src}
                          alt={`Anteprima ${idx + 1}`}
                          style={{ width: '100%', height: '64px', objectFit: 'cover', display: 'block' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeFotoAnnuncio(idx)}
                          style={{
                            position: 'absolute',
                            top: '3px',
                            right: '3px',
                            background: 'rgba(15,23,42,0.78)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '999px',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  fontFamily: fontHeading,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Pubblicazione...' : 'Pubblica annuncio'}
              </button>
            </form>
          </section>
        </aside>

        <div>
          <section
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '20px',
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.05)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {CATEGORIE.map((cat) => {
                const attiva = filtroCategoria === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFiltroCategoria(cat)}
                    style={{
                      fontFamily: fontHeading,
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      letterSpacing: '0.01em',
                      padding: '8px 14px',
                      borderRadius: '999px',
                      border: attiva ? 'none' : '1px solid #dbe2ec',
                      background: attiva ? '#1b365d' : '#f8fafc',
                      color: attiva ? '#fff' : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {TIPI_ANNUNCIO.map((tipo) => {
                const attivo = filtroTipo === tipo;
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFiltroTipo(tipo)}
                    style={{
                      fontFamily: fontHeading,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      border: attivo ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      background: attivo ? '#eff6ff' : '#fff',
                      color: attivo ? '#1d4ed8' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {tipo}
                  </button>
                );
              })}

              <input
                type="search"
                placeholder="Cerca oggetto o collega..."
                value={ricerca}
                onChange={(e) => setRicerca(e.target.value)}
                style={{
                  flex: '1 1 200px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontFamily: fontBody,
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </section>

          <section className="tm-grid-annunci">
            {annunciFiltrati.length === 0 ? (
              <p style={{ color: '#64748b', gridColumn: '1 / -1' }}>
                Nessun annuncio trovato con i filtri selezionati.
              </p>
            ) : (
              annunciFiltrati.map((item) => {
                const foto = normalizeImages(item);
                const isOwner =
                  userProfile.nome &&
                  String(item.autore || '').trim().toLowerCase() === userProfile.nome.trim().toLowerCase();

                return (
                  <article
                    key={item.id}
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(15, 23, 42, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      {foto.length > 0 && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: foto.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                            gap: '2px',
                            background: '#e2e8f0',
                          }}
                        >
                          {foto.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt={`${item.titolo} ${i + 1}`}
                              style={{
                                width: '100%',
                                height: foto.length === 1 ? '185px' : '94px',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                          <span
                            style={{
                              fontFamily: fontHeading,
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '3px 9px',
                              borderRadius: '999px',
                            }}
                          >
                            {item.categoria || 'Generale'}
                          </span>
                          <span style={{ fontWeight: 700, color: '#0f766e', fontSize: '0.92rem' }}>
                            {item.tipo === 'In regalo' || item.prezzo === 0
                              ? 'IN REGALO'
                              : item.prezzo != null
                              ? `€ ${item.prezzo}${item.tipo === 'A noleggio' ? '/gg' : ''}`
                              : item.tipo || 'In vendita'}
                          </span>
                        </div>

                        <h3 style={{ margin: '6px 0', fontFamily: fontHeading, fontSize: '1.08rem' }}>{item.titolo}</h3>
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.45 }}>
                          {item.descrizione}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '12px 16px',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.autore_foto ? (
                          <img
                            src={item.autore_foto}
                            alt={item.autore}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : null}
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                          {item.autore || 'Collega'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {!isOwner && item.autore && (
                          <button
                            type="button"
                            onClick={() => apriChatPrivata(item, item.autore)}
                            style={{
                              background: '#1b365d',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '9px',
                              padding: '6px 11px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Chatta
                          </button>
                        )}

                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => setAnnuncioDaEliminare(item)}
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: 'none',
                              borderRadius: '9px',
                              padding: '6px 10px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Elimina
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </main>

      {annuncioDaEliminare && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50,
          }}
        >
          <div style={{ background: '#fff', borderRadius: '16px', padding: '22px', maxWidth: '380px', width: '100%' }}>
            <h3 style={{ margin: '0 0 8px', fontFamily: fontHeading }}>Conferma eliminazione</h3>
            <p style={{ margin: '0 0 18px', color: '#475569', fontSize: '0.92rem' }}>
              Vuoi davvero eliminare l’annuncio <strong>"{annuncioDaEliminare.titolo}"</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setAnnuncioDaEliminare(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={confermaEliminazioneAnnuncio}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Sì, elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50,
          }}
        >
          <form
            onSubmit={handleSaveProfile}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '22px',
              maxWidth: '400px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h3 style={{ margin: 0, fontFamily: fontHeading }}>Registrazione & Profilo</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {authForm.fotoProfilo ? (
                <img
                  src={authForm.fotoProfilo}
                  alt="Foto profilo"
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}
                >
                  👤
                </div>
              )}
              <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}>
                Scegli foto profilo
                <input type="file" accept="image/*" onChange={handleFotoProfiloChange} style={{ display: 'none' }} />
              </label>
            </div>

            <input
              type="text"
              placeholder="Nome e Cognome"
              value={authForm.nome}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, nome: e.target.value }))}
              required
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
            />
            <input
              type="email"
              placeholder="Email aziendale (opzionale)"
              value={authForm.email}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                Chiudi
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                Salva profilo
              </button>
            </div>
          </form>
        </div>
      )}

      {showSettingsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '22px',
              maxWidth: '400px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <h3 style={{ margin: 0, fontFamily: fontHeading }}>⚙️ Impostazioni</h3>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>Suoni e notifiche</span>
              <input
                type="checkbox"
                checked={settings.notificheAttive}
                onChange={(e) => setSettings((prev) => ({ ...prev, notificheAttive: e.target.checked }))}
              />
            </label>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Suoneria notifica</label>
              <select
                value={settings.suoneria}
                onChange={(e) => {
                  const val = e.target.value;
                  setSettings((prev) => ({ ...prev, suoneria: val }));
                  playNotificationSound(val);
                }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              >
                {SUONERIE.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, badgeNonLetti: 0 }))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Azzera badge icona
              </button>

              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#1b365d',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Fatto
              </button>
            </div>
          </div>
        </div>
      )}

      {chatAperta && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 60,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: '#1b365d',
                color: '#fff',
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontFamily: fontHeading }}>Chat privata con {chatAperta.altroUtente}</div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Annuncio: {chatAperta.annuncio.titolo}</div>
              </div>
              <button
                type="button"
                onClick={() => setChatAperta(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                flex: 1,
                padding: '14px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: '#f8fafc',
              }}
            >
              {messaggiChatAttiva.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.88rem', textAlign: 'center' }}>
                  Nessun messaggio ancora. Scrivi in privato a {chatAperta.altroUtente}!
                </p>
              ) : (
                messaggiChatAttiva.map((m, idx) => {
                  const mio = String(m.mittente || '').toLowerCase() === String(userProfile.nome || '').toLowerCase();
                  return (
                    <div
                      key={m.id || idx}
                      style={{
                        alignSelf: mio ? 'flex-end' : 'flex-start',
                        background: mio ? '#2563eb' : '#fff',
                        color: mio ? '#fff' : '#1e293b',
                        border: mio ? 'none' : '1px solid #e2e8f0',
                        padding: '9px 12px',
                        borderRadius: '12px',
                        maxWidth: '78%',
                        fontSize: '0.9rem',
                      }}
                    >
                      {m.testo}
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleInviaMessaggio}
              style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #e2e8f0', background: '#fff' }}
            >
              <input
                type="text"
                placeholder="Scrivi un messaggio privato..."
                value={nuovoMessaggio}
                onChange={(e) => setNuovoMessaggio(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <button
                type="submit"
                disabled={invioMessaggio}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Invia
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
