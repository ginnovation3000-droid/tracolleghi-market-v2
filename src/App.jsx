import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Credenziali Supabase lette da variabili d'ambiente (con fallback sul progetto tracolleghi-market)
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://bkdmdiwqdbyimfpzzlcy.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_YQvIcQl-DbTD48tlMuIdGA_5EmW-fW_';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configurazione azienda dinamica per istanza
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'TRACOLLEGHI';
const COMPANY_SUBTITLE = import.meta.env.VITE_COMPANY_SUBTITLE || 'MARKET';
const COMPANY_LOGO = import.meta.env.VITE_COMPANY_LOGO || '/icona-tracolleghi.jpg';

// PIN predefinito per sbloccare l'area Admin (modificabile nelle impostazioni Admin o via env)
const DEFAULT_ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '2026';

// Identificativi predefiniti amministratore (visibilità voce Admin solo a te)
const ADMIN_IDENTIFIERS = {
  names: (import.meta.env.VITE_ADMIN_NAMES || 'giancarlo gentile')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  badges: (import.meta.env.VITE_ADMIN_BADGES || '1001')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean),
  emails: (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
};

const SEZIONI_EXTRA = [
  {
    id: 'convenzioni',
    label: 'Convenzioni',
    icon: '🏷️',
    desc: 'Sconti e codici partner per i colleghi',
  },
  {
    id: 'eventi',
    label: 'Eventi di Zona',
    icon: '🎉',
    desc: 'Sagre, serate, uscite e dritte tra colleghi',
  },
  {
    id: 'gioco',
    label: 'Pausa Gioco',
    icon: '🎮',
    desc: 'Sfida lampo da 20s e classifica reparti',
  },
];

const CATEGORIE_EVENTI_ZONA = [
  'Tutte',
  'Oggi / Weekend',
  'Sagre & Cibo',
  'Musica & Locali',
  'Sport & Aria aperta',
];

const CATEGORIE_EVENTI_FORM = [
  'Oggi / Weekend',
  'Sagre & Cibo',
  'Musica & Locali',
  'Sport & Aria aperta',
];

const EVENTI_ZONA_INIZIALI = [
  {
    id: 'ev-1',
    categoria: 'Sagre & Cibo',
    titolo: 'Pizza & chiacchiere del venerdì sera',
    dataOra: 'Venerdì • 20:30',
    luogo: 'Centro / Dintorni',
    descrizione: 'Serata informale tra colleghi per staccare dalla settimana. Chi vuole aggregarsi scriva in chat!',
    autore: 'Colleghi',
  },
  {
    id: 'ev-2',
    categoria: 'Sport & Aria aperta',
    titolo: 'Giro in bici / passeggiata nel weekend',
    dataOra: 'Sabato • 09:00',
    luogo: 'Percorsi locali',
    descrizione: 'Uscita tranquilla aperta a tutti, ritmo rilassato e caffè finale.',
    autore: 'Colleghi',
  },
];

const MACRO_CATEGORIE = [
  { id: 'Tutte', label: 'Tutte le categorie', icon: '🏷️' },
  { id: 'Motori', label: 'Motori & Ricambi', icon: '🛵' },
  { id: 'Elettronica', label: 'Elettronica & Tech', icon: '📱' },
  { id: 'Casa & Tempo Libero', label: 'Casa & Tempo Libero', icon: '🏡' },
  { id: 'Generale', label: 'Sport, Bambini & Altro', icon: '🎒' },
];

const CATEGORIE_FORM = ['Motori', 'Elettronica', 'Casa & Tempo Libero', 'Generale'];
const TIPI_ANNUNCIO = ['Tutti', 'In vendita', 'In regalo', 'A noleggio'];
const TIPI_FORM = ['In vendita', 'In regalo', 'A noleggio'];

const MODALITA_PAGAMENTO = [
  {
    id: 'carta',
    label: 'Visa / Mastercard',
    icon: '💳',
    nota: 'Pagamento con carta tramite link/POS/app di pagamento concordato tra le parti.',
  },
  {
    id: 'contanti',
    label: 'Contanti',
    icon: '💶',
    nota: 'Scambio a mano diretto in azienda o in zona concordata al ritiro.',
  },
  {
    id: 'bonifico',
    label: 'Bonifico / Instant',
    icon: '🏦',
    nota: 'Bonifico bancario standard o istantaneo con IBAN scambiato in chat.',
  },
  {
    id: 'wallet',
    label: 'PayPal / Apple Pay / Google Pay',
    icon: '📲',
    nota: 'Trasferimento rapido tramite portafoglio digitale o app di pagamento.',
  },
  {
    id: 'crypto',
    label: 'Criptovalute',
    icon: '₿',
    nota: 'Scambio in crypto (es. BTC, ETH, USDC) su rete e indirizzo concordati in chat.',
  },
];

const SOTTOCATEGORIE_CERCO_AIUTO = [
  'Tutti',
  'Cerco / Mi serve',
  'Passaggi / Turni',
  'Oggetti trovati',
  'Avvisi flash',
];

const TIPI_CERCO_AIUTO_FORM = [
  'Cerco / Mi serve',
  'Passaggi / Turni',
  'Oggetti trovati',
  'Avvisi flash',
];

const CONVENZIONI_COLLEGI = [
  {
    id: 'conv-1',
    categoria: 'Food & Pausa',
    locale: 'Ristorante & Pizzeria Convenzionata Locale',
    sconto: '-15% su pranzo e asporto',
    condizioni: 'Valido dal lunedì al venerdì mostrando il profilo TRACOLLEGHI Market.',
    codice: 'TRACO-FOOD15',
    zona: 'Zona industriale & centro',
  },
  {
    id: 'conv-2',
    categoria: 'Auto & Moto',
    locale: 'Officina, Gommista & Elettrauto Partner',
    sconto: '-10% su manodopera e cambio gomme',
    condizioni: 'Prenotazione indicando di far parte del gruppo colleghi.',
    codice: 'TRACO-AUTO10',
    zona: 'Area artigianale',
  },
  {
    id: 'conv-3',
    categoria: 'Sport & Benessere',
    locale: 'Palestra, Piscina & Tempo Libero',
    sconto: 'Iscrizione agevolata o mese omaggio',
    condizioni: 'Riservato a dipendenti e familiari stretti.',
    codice: 'TRACO-SPORT',
    zona: 'Territorio locale',
  },
  {
    id: 'conv-4',
    categoria: 'Negozi & Servizi',
    locale: 'Ottica, Ferramenta & Servizi Quotidiani',
    sconto: 'Sconto dedicato su acquisti in negozio',
    condizioni: 'Mostra il badge o il profilo verificato alla cassa.',
    codice: 'TRACO-SHOP',
    zona: 'Dintorni azienda',
  },
];

const REPARTI_AZIENDA = [
  'Produzione / Linea',
  'Ufficio Tecnico / Progettazione',
  'Logistica / Magazzino',
  'Qualità & Collaudo',
  'Manutenzione',
  'Amministrazione / Acquisti / HR',
  'Altro Reparto',
];

const SUONERIE = [
  { id: 'chime', label: 'Trillo Gentile' },
  { id: 'pop', label: 'Pop Veloce' },
  { id: 'radar', label: 'Segnale Market' },
  { id: 'silent', label: 'Silenzioso' },
];

const BERSAGLI_GIOCO = [
  { emoji: '☕', punti: 10, label: 'Pausa Caffè +10', bonus: false },
  { emoji: '🛠️', punti: 15, label: 'Attrezzo +15', bonus: false },
  { emoji: '⭐', punti: 25, label: 'Stella Bonus +25', bonus: true },
  { emoji: '⚡', punti: 35, label: 'Super Turbo +35', bonus: true },
  { emoji: '⚠️', punti: -15, label: 'Imprevisto -15', bonus: false },
  { emoji: '💣', punti: -25, label: 'Fermo Linea -25', bonus: false },
];

function extractBaseName(value) {
  return String(value || '').split(' • ')[0].trim();
}

function normalizeBadgeCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function normalizeRepartoMatch(rawReparto) {
  const clean = String(rawReparto || '').trim().toLowerCase();
  if (!clean) return REPARTI_AZIENDA[0];
  const exact = REPARTI_AZIENDA.find((r) => r.toLowerCase() === clean);
  if (exact) return exact;
  const partial = REPARTI_AZIENDA.find(
    (r) => r.toLowerCase().includes(clean) || clean.includes(r.split('/')[0].trim().toLowerCase())
  );
  return partial || REPARTI_AZIENDA[0];
}

// Parser intelligente per elenco massivo badge (supporta CSV con ; o , o TAB o righe libere)
function parseBulkBadgeText(rawText, defaultReparto = REPARTI_AZIENDA[0]) {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parsed = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const sep = line.includes(';') ? ';' : line.includes('\t') ? '\t' : ',';
    const cols = line
      .split(sep)
      .map((c) => c.replace(/^["']|["']$/g, '').trim())
      .filter((c, idx) => idx < 4);

    if (cols.length === 0) continue;

    const firstLower = cols[0].toLowerCase();
    const secondLower = (cols[1] || '').toLowerCase();
    if (
      i === 0 &&
      (firstLower === 'badge' ||
        firstLower === 'matricola' ||
        firstLower === 'codice' ||
        firstLower === 'nome' ||
        secondLower === 'badge' ||
        secondLower === 'matricola')
    ) {
      continue;
    }

    let badge = '';
    let nome = '';
    let reparto = defaultReparto;
    let email = '';

    if (cols.length === 1) {
      badge = normalizeBadgeCode(cols[0]);
    } else {
      const c0 = cols[0];
      const c1 = cols[1] || '';
      const c2 = cols[2] || '';
      const c3 = cols[3] || '';

      const c0LooksLikeBadge = /^[a-z0-9\-_.]{1,16}$/i.test(c0) && /\d/.test(c0);
      if (c0LooksLikeBadge) {
        badge = normalizeBadgeCode(c0);
        nome = extractBaseName(c1);
      } else {
        nome = extractBaseName(c0);
        badge = normalizeBadgeCode(c1);
      }

      if (c2) {
        if (c2.includes('@')) email = c2.toLowerCase();
        else reparto = normalizeRepartoMatch(c2);
      }
      if (c3) {
        if (c3.includes('@')) email = c3.toLowerCase();
        else if (!c2 || c2.includes('@')) reparto = normalizeRepartoMatch(c3);
      }
    }

    if (!badge) continue;
    parsed.push({
      badge,
      nome: nome || `Collega #${badge}`,
      reparto: reparto || defaultReparto,
      email,
      attivo: true,
    });
  }

  return parsed;
}

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
    // Ignora eventuali blocchi audio
  }
}

async function sendSystemNotification(title, body, tag = 'tracolleghi-msg') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const options = {
    body,
    icon: '/icona-tracolleghi.jpg',
    badge: '/icona-tracolleghi.jpg',
    tag,
    renotify: true,
    vibrate: [180, 90, 180],
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return;
      }
    }
    const notif = new Notification(title, options);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch {
    // Fallback silenzioso
  }
}

function compressImageFile(file, maxWidth = 800, quality = 0.68) {
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
  const pair = [
    extractBaseName(userA).toLowerCase(),
    extractBaseName(userB).toLowerCase(),
  ].sort();
  return `${annuncioId}__${pair[0]}__${pair[1]}`;
}

function isAnnuncioVenduto(item) {
  return Boolean(item?.venduto) || /\[venduto\]/i.test(item?.descrizione || '');
}

function isPostCercoAiuto(item) {
  return (
    item?.categoria === 'Cerco / Aiuto' ||
    TIPI_CERCO_AIUTO_FORM.includes(item?.tipo)
  );
}

function extractPagamentiFromDesc(desc) {
  const match = String(desc || '').match(/\[PAGAMENTI:\s*([^\]]+)\]/i);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function cleanDescrizione(desc) {
  return (desc || '')
    .replace(/\s*\[WELFARE OK\]\s*/gi, ' ')
    .replace(/\s*\[PAGAMENTI:\s*[^\]]+\]\s*/gi, ' ')
    .replace(/\s*\[VENDUTO\]\s*/gi, ' ')
    .trim();
}

function formatPrezzoCard(item) {
  if (item.tipo === 'In regalo' || item.prezzo === 0) return 'In regalo';
  if (item.prezzo != null) {
    const val = Number(item.prezzo).toFixed(2).replace('.', ',');
    return `€ ${val}${item.tipo === 'A noleggio' ? '/gg' : ''}`;
  }
  return item.tipo || 'In vendita';
}

function renderStarsInline(media, totale) {
  const arrotondato = Math.round(media || 0);
  return (
    <span
      title={totale > 0 ? `Valutazione media: ${media.toFixed(1)} su 5 (${totale} voti)` : 'Nessuna valutazione ancora'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        fontSize: '0.75rem',
        lineHeight: 1,
      }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            color: totale > 0 && n <= arrotondato ? '#f59e0b' : '#cbd5e1',
          }}
        >
          ★
        </span>
      ))}
      <span style={{ color: '#64748b', fontWeight: 600, marginLeft: '3px', fontSize: '0.72rem' }}>
        {totale > 0 ? `${media.toFixed(1)} (${totale})` : 'Nuovo'}
      </span>
    </span>
  );
}

export default function App() {
  // Stato aggiornamento Service Worker (nuova versione app disponibile)
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  const [swBannerDismissed, setSwBannerDismissed] = useState(false);
  const [swUpdating, setSwUpdating] = useState(false);
  const waitingWorkerRef = useRef(null);
  const profilePanelRef = useRef(null);

  // Video intro al primo caricamento e a ogni nuovo aggiornamento
  const INTRO_VIDEO_VERSION = '2026-11-20-v1';
  const introVideoRef = useRef(null);
  const [introMuted, setIntroMuted] = useState(false);
  const [introAudioBlockedNotice, setIntroAudioBlockedNotice] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(() => {
    try {
      return localStorage.getItem('tracolleghi_intro_seen_version') !== INTRO_VIDEO_VERSION;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!showIntroVideo) return;
    const vid = introVideoRef.current;
    if (!vid) return;

    vid.muted = introMuted;
    const playPromise = vid.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          setIntroAudioBlockedNotice(false);
        })
        .catch(() => {
          if (!introMuted) {
            vid.muted = true;
            vid.play().catch(() => {});
            setIntroAudioBlockedNotice(true);
          }
        });
    }
  }, [showIntroVideo, introMuted]);

  function segnaIntroPerAggiornamento() {
    try {
      localStorage.removeItem('tracolleghi_intro_seen_version');
    } catch {}
  }

  function chiudiIntroVideo() {
    setShowIntroVideo(false);
    setIntroMuted(false);
    try {
      localStorage.setItem('tracolleghi_intro_seen_version', INTRO_VIDEO_VERSION);
    } catch {}
  }

  function toggleIntroAudio() {
    const nextMuted = !introMuted;
    setIntroMuted(nextMuted);
    setIntroAudioBlockedNotice(false);
    if (introVideoRef.current) {
      introVideoRef.current.muted = nextMuted;
      if (!nextMuted) {
        introVideoRef.current.play().catch(() => {});
      }
    }
  }

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Registrazione Service Worker + rilevamento immediato di nuove versioni dell'app
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let refreshing = false;
    let updateInterval = null;
    let mounted = true;

    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    const notifyWaitingWorker = (worker) => {
      if (!worker || !mounted) return;
      waitingWorkerRef.current = worker;
      segnaIntroPerAggiornamento();
      setSwUpdateAvailable(true);
      setSwBannerDismissed(false);
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (!mounted) return;

        if (reg.waiting) {
          notifyWaitingWorker(reg.waiting);
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyWaitingWorker(newWorker);
            }
          });
        });

        updateInterval = setInterval(() => {
          reg.update().catch(() => {});
        }, 60000);
      })
      .catch(() => {});

    return () => {
      mounted = false;
      if (updateInterval) clearInterval(updateInterval);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  function applicaAggiornamentoApp() {
    setSwUpdating(true);
    segnaIntroPerAggiornamento();
    const waiting = waitingWorkerRef.current;
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      window.location.reload();
    }
  }

  // Sezione attiva: bacheca | cerco_aiuto | convenzioni | eventi | gioco | chat
  const [sezioneAttiva, setSezioneAttiva] = useState('bacheca');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [filtroCercoAiuto, setFiltroCercoAiuto] = useState('Tutti');
  const [filtroConvenzioneCat, setFiltroConvenzioneCat] = useState('Tutte');
  const [filtroEventoCat, setFiltroEventoCat] = useState('Tutte');
  const [codiceCopiatoId, setCodiceCopiatoId] = useState(null);
  const [schedaAnnuncio, setSchedaAnnuncio] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(() => {
    try {
      return localStorage.getItem('tracolleghi_install_dismissed') !== '1';
    } catch {
      return true;
    }
  });

  // Stato permesso notifiche telefono
  const [notifPermission, setNotifPermission] = useState(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Profilo dipendente
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('tracolleghi_user_v3')) || {
          nome: '',
          badge: '',
          email: '',
          reparto: REPARTI_AZIENDA[0],
          fotoProfilo: '',
          registrato: false,
          badgeVerificato: false,
        }
      );
    } catch {
      return {
        nome: '',
        badge: '',
        email: '',
        reparto: REPARTI_AZIENDA[0],
        fotoProfilo: '',
        registrato: false,
        badgeVerificato: false,
      };
    }
  });

  const [authForm, setAuthForm] = useState({
    nome: userProfile.nome || '',
    badge: userProfile.badge || '',
    email: userProfile.email || '',
    reparto: userProfile.reparto || REPARTI_AZIENDA[0],
    fotoProfilo: userProfile.fotoProfilo || '',
  });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Chiude il pannello Profilo Collega & Badge quando si clicca fuori dal riquadro
  useEffect(() => {
    if (!showProfileModal) return;

    const handleClickOutside = (e) => {
      if (profilePanelRef.current && !profilePanelRef.current.contains(e.target)) {
        setShowProfileModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileModal]);

  // --- STATO ADMIN & IMPORTAZIONE MASSIVA BADGE ---
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('tracolleghi_admin_unlocked') === '1';
    } catch {
      return false;
    }
  });
  const [adminPin, setAdminPin] = useState(() => {
    try {
      return localStorage.getItem('tracolleghi_admin_pin_v1') || DEFAULT_ADMIN_PIN;
    } catch {
      return DEFAULT_ADMIN_PIN;
    }
  });
  const [adminPinInput, setAdminPinInput] = useState('');
  const [newAdminPinInput, setNewAdminPinInput] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTab, setAdminTab] = useState('importa'); // 'importa' | 'elenco' | 'sicurezza'
  const [adminSavedCheck, setAdminSavedCheck] = useState(false); // Spunta "Salvato ✓"
  const [badgeRegistry, setBadgeRegistry] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_badge_registry_v1'));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [strictBadgeCheck, setStrictBadgeCheck] = useState(() => {
    try {
      return localStorage.getItem('tracolleghi_strict_badge_v1') === '1';
    } catch {
      return false;
    }
  });
  const [bulkBadgeText, setBulkBadgeText] = useState('');
  const [bulkDefaultReparto, setBulkDefaultReparto] = useState(REPARTI_AZIENDA[0]);
  const [bulkReplaceMode, setBulkReplaceMode] = useState(false);
  const [singleBadgeForm, setSingleBadgeForm] = useState({
    badge: '',
    nome: '',
    reparto: REPARTI_AZIENDA[0],
    email: '',
  });
  const [adminSearchBadge, setAdminSearchBadge] = useState('');
  const [adminLoadingImport, setAdminLoadingImport] = useState(false);

  // L'icona Admin è visibile solo all'amministratore (o se già sbloccata in sessione)
  const canSeeAdminOption = useMemo(() => {
    if (isAdminUnlocked) return true;
    const nomeLower = extractBaseName(userProfile.nome).toLowerCase();
    const badgeNorm = normalizeBadgeCode(userProfile.badge);
    const emailLower = (userProfile.email || '').trim().toLowerCase();

    const byName = nomeLower && ADMIN_IDENTIFIERS.names.includes(nomeLower);
    const byBadge = badgeNorm && ADMIN_IDENTIFIERS.badges.includes(badgeNorm);
    const byEmail = emailLower && ADMIN_IDENTIFIERS.emails.includes(emailLower);

    const inRegistryAsAdmin = badgeRegistry.some(
      (b) =>
        b.attivo !== false &&
        String(b.ruolo || '').toLowerCase().includes('admin') &&
        ((badgeNorm && normalizeBadgeCode(b.badge) === badgeNorm) ||
          (nomeLower && extractBaseName(b.nome).toLowerCase() === nomeLower))
    );

    return Boolean(byName || byBadge || byEmail || inRegistryAsAdmin);
  }, [isAdminUnlocked, userProfile.nome, userProfile.badge, userProfile.email, badgeRegistry]);

  function triggerAdminSavedCheck() {
    setAdminSavedCheck(true);
    setTimeout(() => {
      setAdminSavedCheck(false);
    }, 2600);
  }

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_badge_registry_v1', JSON.stringify(badgeRegistry));
    } catch {}
  }, [badgeRegistry]);

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_strict_badge_v1', strictBadgeCheck ? '1' : '0');
    } catch {}
  }, [strictBadgeCheck]);

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_admin_pin_v1', adminPin);
    } catch {}
  }, [adminPin]);

  const bulkPreviewList = useMemo(
    () => parseBulkBadgeText(bulkBadgeText, bulkDefaultReparto),
    [bulkBadgeText, bulkDefaultReparto]
  );

  const filteredBadgeRegistry = useMemo(() => {
    const q = adminSearchBadge.trim().toLowerCase();
    if (!q) return badgeRegistry;
    return badgeRegistry.filter(
      (b) =>
        (b.badge || '').toLowerCase().includes(q) ||
        (b.nome || '').toLowerCase().includes(q) ||
        (b.reparto || '').toLowerCase().includes(q) ||
        (b.email || '').toLowerCase().includes(q)
    );
  }, [badgeRegistry, adminSearchBadge]);

  async function fetchBadgeRegistry() {
    try {
      const { data, error } = await supabase
        .from('badge_autorizzati')
        .select('*')
        .order('badge', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        setBadgeRegistry(data);
      }
    } catch {
      // Fallback silenzioso su localStorage se la tabella non esiste ancora su Supabase
    }
  }

  // Modale Pubblica Annuncio / Richiesta
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Impostazioni, Gestione Annunci & Modalità di Pagamento
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_settings_v3')) || {};
      return {
        suoneria: saved.suoneria || 'chime',
        notificheAttive: saved.notificheAttive !== undefined ? saved.notificheAttive : true,
        badgeNonLetti: saved.badgeNonLetti || 0,
        pagamentiPreferiti:
          Array.isArray(saved.pagamentiPreferiti) && saved.pagamentiPreferiti.length > 0
            ? saved.pagamentiPreferiti
            : ['Visa / Mastercard', 'Contanti', 'Bonifico / Instant', 'Criptovalute'],
      };
    } catch {
      return {
        suoneria: 'chime',
        notificheAttive: true,
        badgeNonLetti: 0,
        pagamentiPreferiti: ['Visa / Mastercard', 'Contanti', 'Bonifico / Instant', 'Criptovalute'],
      };
    }
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('attivi');

  // Preferiti (cuoricino) + notifica quando un preferito viene venduto
  const [preferitiIds, setPreferitiIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_preferiti_v1'));
      return Array.isArray(saved) ? saved.map(String) : [];
    } catch {
      return [];
    }
  });
  const [soloPreferiti, setSoloPreferiti] = useState(false);
  const [preferitiVendutiNotificati, setPreferitiVendutiNotificati] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_sold_favs_v1'));
      return Array.isArray(saved) ? saved.map(String) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_preferiti_v1', JSON.stringify(preferitiIds));
    } catch {}
  }, [preferitiIds]);

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_sold_favs_v1', JSON.stringify(preferitiVendutiNotificati));
    } catch {}
  }, [preferitiVendutiNotificati]);

  function togglePreferito(annuncioId) {
    const idStr = String(annuncioId);
    setPreferitiIds((prev) =>
      prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr]
    );
  }

  function handleCopiaCodiceConvenzione(conv) {
    if (!conv?.codice) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(conv.codice).catch(() => {});
    }
    setCodiceCopiatoId(conv.id);
    setAvviso(`Codice convenzione ${conv.codice} copiato!`);
    setTimeout(() => {
      setAvviso('');
      setCodiceCopiatoId((prev) => (prev === conv.id ? null : prev));
    }, 2200);
  }

  // STATO EVENTI DI ZONA (tempo libero, sagre, uscite, serate tra colleghi)
  const [eventiZona, setEventiZona] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_eventi_zona_v1'));
      return Array.isArray(saved) && saved.length > 0 ? saved : EVENTI_ZONA_INIZIALI;
    } catch {
      return EVENTI_ZONA_INIZIALI;
    }
  });
  const [showEventoForm, setShowEventoForm] = useState(false);
  const [eventoForm, setEventoForm] = useState({
    categoria: 'Oggi / Weekend',
    titolo: '',
    dataOra: '',
    luogo: '',
    descrizione: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_eventi_zona_v1', JSON.stringify(eventiZona));
    } catch {}
  }, [eventiZona]);

  // Valutazioni utenti da 1 a 5 stelle
  const [valutazioni, setValutazioni] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_valutazioni_v1'));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [utenteDaValutare, setUtenteDaValutare] = useState(null);
  const [stelleSelezionate, setStelleSelezionate] = useState(5);
  const [commentoValutazione, setCommentoValutazione] = useState('');
  const [invioValutazione, setInvioValutazione] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_valutazioni_v1', JSON.stringify(valutazioni));
    } catch {}
  }, [valutazioni]);

  // STATO MINI-GIOCO PAUSA CAFFÈ ("Colpo d'Occhio Pausa")
  const [giocoAttivo, setGiocoAttivo] = useState(false);
  const [giocoFinito, setGiocoFinito] = useState(false);
  const [tempoRimasto, setTempoRimasto] = useState(20);
  const [punteggioGioco, setPunteggioGioco] = useState(0);
  const [comboGioco, setComboGioco] = useState(0);
  const [cellaBersaglio, setCellaBersaglio] = useState({ index: 4, item: BERSAGLI_GIOCO[0], id: 1 });
  const [feedbackColpo, setFeedbackColpo] = useState('');
  const bersaglioIndexRef = useRef(4);
  const [classificaGioco, setClassificaGioco] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_classifica_v1'));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_classifica_v1', JSON.stringify(classificaGioco));
    } catch {}
  }, [classificaGioco]);

  // Modifica annuncio
  const [annuncioInModifica, setAnnuncioInModifica] = useState(null);
  const [editForm, setEditForm] = useState({
    titolo: '',
    categoria: 'Motori',
    tipo: 'In vendita',
    prezzo: '',
    pagamenti: [],
    venduto: false,
    descrizione: '',
  });
  const [salvataggioModifica, setSalvataggioModifica] = useState(false);

  // Annunci e filtri
  const [annunci, setAnnunci] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('Tutte');
  const [filtroTipo, setFiltroTipo] = useState('Tutti');
  const [ricerca, setRicerca] = useState('');

  // Form pubblicazione annuncio o richiesta Cerco / Aiuto
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [tipoAnnuncio, setTipoAnnuncio] = useState('In vendita');
  const [categoria, setCategoria] = useState('Motori');
  const [pagamentiAnnuncio, setPagamentiAnnuncio] = useState(() => settings.pagamentiPreferiti);
  const [fotoAnnuncio, setFotoAnnuncio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');
  const [avviso, setAvviso] = useState('');

  // Modali eliminazione & chat
  const [annuncioDaEliminare, setAnnuncioDaEliminare] = useState(null);
  const [chatAperta, setChatAperta] = useState(null);
  const [messaggi, setMessaggi] = useState([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState('');
  const [invioMessaggio, setInvioMessaggio] = useState(false);

  // Tracciamento messaggi già visti (suoneria e push SOLO in ricezione)
  const seenMsgIdsRef = useRef(new Set());
  const initializedMsgsRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('tracolleghi_user_v3', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('tracolleghi_settings_v3', JSON.stringify(settings));
    if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      if (settings.badgeNonLetti > 0) {
        navigator.setAppBadge(settings.badgeNonLetti).catch(() => {});
      } else {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowMoreMenu(false);
        setShowPublishModal(false);
        setShowProfileModal(false);
        setShowSettingsModal(false);
        setShowAdminModal(false);
        setAnnuncioInModifica(null);
        setAnnuncioDaEliminare(null);
        setChatAperta(null);
        setUtenteDaValutare(null);
        setSchedaAnnuncio(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchAnnunci();
    fetchValutazioni();
    fetchClassificaGioco();
    fetchBadgeRegistry();
    const timerAnnunci = setInterval(() => {
      fetchAnnunci();
    }, 10000);
    return () => clearInterval(timerAnnunci);
  }, []);

  // --- FUNZIONI ADMIN & IMPORTAZIONE MASSIVA BADGE ---
  function handleUnlockAdmin(e) {
    e.preventDefault();
    if (adminPinInput.trim() === adminPin) {
      setIsAdminUnlocked(true);
      setAdminPinInput('');
      setErrore('');
      try {
        sessionStorage.setItem('tracolleghi_admin_unlocked', '1');
      } catch {}
    } else {
      setErrore('PIN Admin non corretto.');
    }
  }

  function handleLockAdmin() {
    setIsAdminUnlocked(false);
    try {
      sessionStorage.removeItem('tracolleghi_admin_unlocked');
    } catch {}
  }

  function handleUpdateAdminPin(e) {
    e.preventDefault();
    const clean = newAdminPinInput.trim();
    if (clean.length < 4) {
      setErrore('Il nuovo PIN Admin deve contenere almeno 4 caratteri.');
      return;
    }
    setAdminPin(clean);
    setNewAdminPinInput('');
    triggerAdminSavedCheck();
    setAvviso('PIN Admin salvato correttamente ✓');
    setTimeout(() => setAvviso(''), 2500);
  }

  async function handleCsvFileImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setBulkBadgeText((prev) => (prev.trim() ? `${prev.trim()}\n${text.trim()}` : text.trim()));
      setAvviso(`File "${file.name}" letto: verifica l'anteprima e clicca Salva.`);
      setTimeout(() => setAvviso(''), 3500);
    } catch {
      setErrore('Impossibile leggere il file selezionato. Usa un file .csv o .txt oppure incolla i dati.');
    }
    e.target.value = '';
  }

  async function handleConfirmBulkBadgeImport() {
    if (bulkPreviewList.length === 0) {
      setErrore('Nessun badge valido rilevato. Inserisci almeno un codice badge per riga.');
      return;
    }
    setAdminLoadingImport(true);
    setErrore('');

    try {
      const map = new Map();
      if (!bulkReplaceMode) {
        badgeRegistry.forEach((item) => {
          const code = normalizeBadgeCode(item.badge);
          if (code) map.set(code, { ...item, badge: code, attivo: item.attivo !== false });
        });
      }

      bulkPreviewList.forEach((item) => {
        const code = normalizeBadgeCode(item.badge);
        if (!code) return;
        const prev = map.get(code);
        map.set(code, {
          badge: code,
          nome: item.nome || prev?.nome || `Collega #${code}`,
          reparto: item.reparto || prev?.reparto || bulkDefaultReparto,
          email: item.email || prev?.email || '',
          attivo: true,
        });
      });

      const merged = Array.from(map.values()).sort((a, b) => a.badge.localeCompare(b.badge));
      setBadgeRegistry(merged);

      try {
        if (bulkReplaceMode) {
          await supabase.from('badge_autorizzati').delete().neq('badge', '');
        }
        await supabase.from('badge_autorizzati').upsert(
          merged.map((m) => ({
            badge: m.badge,
            nome: m.nome,
            reparto: m.reparto,
            email: m.email || null,
            attivo: m.attivo !== false,
          })),
          { onConflict: 'badge' }
        );
      } catch {
        // Rimane comunque salvato in locale
      }

      setBulkBadgeText('');
      setAdminTab('elenco');
      triggerAdminSavedCheck();
      setAvviso(`Salvati ${bulkPreviewList.length} badge (totale attivo: ${merged.length}) ✓`);
      setTimeout(() => setAvviso(''), 3500);
    } finally {
      setAdminLoadingImport(false);
    }
  }

  async function handleAddSingleBadge(e) {
    e.preventDefault();
    const code = normalizeBadgeCode(singleBadgeForm.badge);
    if (!code) {
      setErrore('Inserisci un codice badge valido.');
      return;
    }
    const entry = {
      badge: code,
      nome: extractBaseName(singleBadgeForm.nome) || `Collega #${code}`,
      reparto: singleBadgeForm.reparto || REPARTI_AZIENDA[0],
      email: singleBadgeForm.email.trim().toLowerCase(),
      attivo: true,
    };

    const updated = [entry, ...badgeRegistry.filter((b) => normalizeBadgeCode(b.badge) !== code)];
    setBadgeRegistry(updated);
    setSingleBadgeForm({ badge: '', nome: '', reparto: REPARTI_AZIENDA[0], email: '' });
    triggerAdminSavedCheck();
    setAvviso(`Badge ${code} salvato ✓`);
    setTimeout(() => setAvviso(''), 2500);

    try {
      await supabase.from('badge_autorizzati').upsert([entry], { onConflict: 'badge' });
    } catch {}
  }

  async function toggleBadgeAttivo(badgeCode) {
    const code = normalizeBadgeCode(badgeCode);
    let nuovoStato = true;
    const updated = badgeRegistry.map((b) => {
      if (normalizeBadgeCode(b.badge) === code) {
        nuovoStato = b.attivo === false;
        return { ...b, attivo: nuovoStato };
      }
      return b;
    });
    setBadgeRegistry(updated);
    triggerAdminSavedCheck();
    try {
      await supabase.from('badge_autorizzati').update({ attivo: nuovoStato }).eq('badge', code);
    } catch {}
  }

  async function removeBadgeFromRegistry(badgeCode) {
    const code = normalizeBadgeCode(badgeCode);
    setBadgeRegistry((prev) => prev.filter((b) => normalizeBadgeCode(b.badge) !== code));
    triggerAdminSavedCheck();
    try {
      await supabase.from('badge_autorizzati').delete().eq('badge', code);
    } catch {}
  }

  function handleExportBadgeCsv() {
    const header = 'Badge;Nome e Cognome;Reparto;Email;Stato';
    const rows = badgeRegistry.map(
      (b) =>
        `${b.badge};${b.nome || ''};${b.reparto || ''};${b.email || ''};${
          b.attivo === false ? 'Sospeso' : 'Attivo'
        }`
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `badge-tracolleghi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleBadgeInputInProfile(val) {
    setAuthForm((prev) => {
      const code = normalizeBadgeCode(val);
      const found = badgeRegistry.find(
        (b) => normalizeBadgeCode(b.badge) === code && b.attivo !== false
      );
      if (found) {
        return {
          ...prev,
          badge: val,
          nome: prev.nome.trim() ? prev.nome : found.nome && !found.nome.startsWith('Collega #') ? found.nome : prev.nome,
          reparto: found.reparto || prev.reparto,
          email: prev.email.trim() ? prev.email : found.email || prev.email,
        };
      }
      return { ...prev, badge: val };
    });
  }

  function handleSalvaEventoZona(e) {
    e.preventDefault();
    if (!eventoForm.titolo.trim() || !eventoForm.descrizione.trim()) {
      setErrore("Inserisci titolo e dettagli dell'evento o della proposta.");
      return;
    }

    const autoreNome = extractBaseName(userProfile.nome) || 'Collega';
    const nuovoEvento = {
      id: `ev-${Date.now()}`,
      categoria: eventoForm.categoria || 'Oggi / Weekend',
      titolo: eventoForm.titolo.trim(),
      dataOra: eventoForm.dataOra.trim() || 'Prossimamente',
      luogo: eventoForm.luogo.trim() || 'Zona locale',
      descrizione: eventoForm.descrizione.trim(),
      autore: autoreNome,
    };

    setEventiZona((prev) => [nuovoEvento, ...prev]);
    setEventoForm({
      categoria: 'Oggi / Weekend',
      titolo: '',
      dataOra: '',
      luogo: '',
      descrizione: '',
    });
    setShowEventoForm(false);
    setErrore('');
    setAvviso(`Evento "${nuovoEvento.titolo}" aggiunto in Eventi di Zona!`);
    setTimeout(() => setAvviso(''), 3000);
  }

  const eventiZonaFiltrati = useMemo(() => {
    return eventiZona.filter((ev) => {
      const okCat = filtroEventoCat === 'Tutte' || ev.categoria === filtroEventoCat;
      const q = ricerca.trim().toLowerCase();
      const okQ =
        !q ||
        (ev.titolo || '').toLowerCase().includes(q) ||
        (ev.descrizione || '').toLowerCase().includes(q) ||
        (ev.luogo || '').toLowerCase().includes(q) ||
        (ev.categoria || '').toLowerCase().includes(q) ||
        (ev.autore || '').toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [eventiZona, filtroEventoCat, ricerca]);

  // Notifica quando uno dei tuoi preferiti passa allo stato VENDUTO
  useEffect(() => {
    if (!annunci.length || !preferitiIds.length) return;

    const nuoviVenduti = annunci.filter((item) => {
      const idStr = String(item.id);
      return (
        preferitiIds.includes(idStr) &&
        isAnnuncioVenduto(item) &&
        !preferitiVendutiNotificati.includes(idStr)
      );
    });

    if (nuoviVenduti.length === 0) return;

    const idsAppenaNotificati = nuoviVenduti.map((item) => String(item.id));
    setPreferitiVendutiNotificati((prev) => Array.from(new Set([...prev, ...idsAppenaNotificati])));

    const primo = nuoviVenduti[0];
    const testoAvviso =
      nuoviVenduti.length === 1
        ? `Il tuo preferito "${primo.titolo}" è stato segnato come VENDUTO!`
        : `${nuoviVenduti.length} annunci tra i tuoi preferiti sono stati venduti (tra cui "${primo.titolo}").`;

    setAvviso(testoAvviso);
    setTimeout(() => setAvviso(''), 5000);

    if (settings.notificheAttive) {
      playNotificationSound(settings.suoneria);
      sendSystemNotification(
        `Preferito venduto • ${COMPANY_NAME} ${COMPANY_SUBTITLE}`,
        nuoviVenduti.length === 1
          ? `"${primo.titolo}" è ora VENDUTO.`
          : `${nuoviVenduti.length} tuoi preferiti sono stati venduti.`,
        `fav-sold-${primo.id}`
      );
    }
  }, [annunci, preferitiIds, preferitiVendutiNotificati, settings.notificheAttive, settings.suoneria]);

  async function fetchClassificaGioco() {
    try {
      const { data, error } = await supabase
        .from('punteggi_gioco')
        .select('*')
        .order('punteggio', { ascending: false })
        .limit(50);
      if (!error && Array.isArray(data)) {
        setClassificaGioco(data);
      }
    } catch {
      // Fallback silenzioso su localStorage
    }
  }

  function generaProssimoBersaglio(indicePrecedente = -1) {
    let idx = Math.floor(Math.random() * 9);
    if (idx === indicePrecedente) {
      idx = (idx + 1) % 9;
    }
    const r = Math.random();
    let item = BERSAGLI_GIOCO[0];
    if (r < 0.36) item = BERSAGLI_GIOCO[0];
    else if (r < 0.62) item = BERSAGLI_GIOCO[1];
    else if (r < 0.78) item = BERSAGLI_GIOCO[2];
    else if (r < 0.87) item = BERSAGLI_GIOCO[3];
    else if (r < 0.95) item = BERSAGLI_GIOCO[4];
    else item = BERSAGLI_GIOCO[5];

    bersaglioIndexRef.current = idx;
    setCellaBersaglio({ index: idx, item, id: Date.now() + Math.random() });
  }

  function avviaPartitaGioco() {
    setPunteggioGioco(0);
    setComboGioco(0);
    setTempoRimasto(20);
    setGiocoFinito(false);
    setFeedbackColpo('');
    setGiocoAttivo(true);
    generaProssimoBersaglio(-1);
  }

  function toccaCellaGioco(idx) {
    if (!giocoAttivo) return;
    if (idx !== cellaBersaglio.index) {
      setComboGioco(0);
      setFeedbackColpo('Mancato!');
      return;
    }

    const target = cellaBersaglio.item;
    if (target.punti > 0) {
      const nuovaCombo = comboGioco + 1;
      const bonusCombo = nuovaCombo >= 3 ? 5 : 0;
      const guadagno = target.punti + bonusCombo;
      setPunteggioGioco((p) => p + guadagno);
      setComboGioco(nuovaCombo);
      setFeedbackColpo(bonusCombo > 0 ? `+${guadagno} (Combo x${nuovaCombo}!)` : `+${guadagno}`);
      playNotificationSound('pop');
    } else {
      setPunteggioGioco((p) => Math.max(0, p + target.punti));
      setComboGioco(0);
      setFeedbackColpo(`${target.punti} (${target.label})`);
    }
    generaProssimoBersaglio(idx);
  }

  async function salvaPunteggioPartita(puntiFinali) {
    if (puntiFinali <= 0) return;
    const nomeGiocatore = extractBaseName(userProfile.nome) || 'Ospite Pausa';
    const repartoGiocatore = userProfile.reparto || 'Altro Reparto';

    const nuovoRecord = {
      giocatore: nomeGiocatore,
      reparto: repartoGiocatore,
      punteggio: puntiFinali,
      created_at: new Date().toISOString(),
    };

    setClassificaGioco((prev) => {
      const aggiornata = [{ ...nuovoRecord, id: Date.now() }, ...prev];
      return aggiornata.sort((a, b) => (Number(b.punteggio) || 0) - (Number(a.punteggio) || 0)).slice(0, 50);
    });

    try {
      const { error } = await supabase.from('punteggi_gioco').insert([
        {
          giocatore: nomeGiocatore,
          reparto: repartoGiocatore,
          punteggio: puntiFinali,
        },
      ]);
      if (!error) {
        await fetchClassificaGioco();
      }
    } catch {
      // Fallback locale già salvato
    }
  }

  useEffect(() => {
    if (!giocoAttivo) return;
    const countdown = setInterval(() => {
      setTempoRimasto((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setGiocoAttivo(false);
          setGiocoFinito(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [giocoAttivo]);

  useEffect(() => {
    if (!giocoAttivo) return;
    const mover = setInterval(() => {
      generaProssimoBersaglio(bersaglioIndexRef.current);
    }, 950);
    return () => clearInterval(mover);
  }, [giocoAttivo]);

  useEffect(() => {
    if (giocoFinito && punteggioGioco > 0) {
      salvaPunteggioPartita(punteggioGioco);
    }
  }, [giocoFinito]);

  const classificaIndividualeTop = useMemo(() => {
    const bestPerUtente = new Map();
    for (const row of classificaGioco) {
      const nome = extractBaseName(row.giocatore) || 'Collega';
      const key = nome.toLowerCase();
      const pts = Number(row.punteggio) || 0;
      const attuale = bestPerUtente.get(key);
      if (!attuale || pts > attuale.punteggio) {
        bestPerUtente.set(key, {
          giocatore: nome,
          reparto: row.reparto || 'Altro Reparto',
          punteggio: pts,
        });
      }
    }
    return Array.from(bestPerUtente.values())
      .sort((a, b) => b.punteggio - a.punteggio)
      .slice(0, 8);
  }, [classificaGioco]);

  const classificaReparti = useMemo(() => {
    const mapRep = new Map();
    for (const row of classificaGioco) {
      const rep = row.reparto || 'Altro Reparto';
      const pts = Number(row.punteggio) || 0;
      const attuale = mapRep.get(rep) || { reparto: rep, totale: 0, partite: 0 };
      attuale.totale += pts;
      attuale.partite += 1;
      mapRep.set(rep, attuale);
    }
    return Array.from(mapRep.values()).sort((a, b) => b.totale - a.totale);
  }, [classificaGioco]);

  async function fetchValutazioni() {
    try {
      const { data, error } = await supabase
        .from('valutazioni')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        setValutazioni(data);
      }
    } catch {
      // Fallback silenzioso su localStorage se la tabella non esiste ancora
    }
  }

  function getStatsUtente(nomeUtente) {
    const target = extractBaseName(nomeUtente).toLowerCase();
    if (!target) return { media: 0, totale: 0, mieStelle: 0, recensioni: [] };
    const delCollega = valutazioni.filter(
      (v) => extractBaseName(v.autore_valutato).toLowerCase() === target
    );
    const totale = delCollega.length;
    const somma = delCollega.reduce((acc, v) => acc + (Number(v.stelle) || 0), 0);
    const media = totale > 0 ? somma / totale : 0;

    const mioNome = extractBaseName(userProfile.nome).toLowerCase();
    const miaRec = mioNome
      ? delCollega.find((v) => extractBaseName(v.valutatore).toLowerCase() === mioNome)
      : null;

    return {
      media,
      totale,
      mieStelle: miaRec ? Number(miaRec.stelle) : 0,
      recensioni: delCollega,
    };
  }

  function apriModaleValutaUtente(nomeCollega) {
    if (!userProfile.registrato || !userProfile.nome.trim()) {
      setErrore('Registrati prima con Badge o Email aziendale per lasciare una valutazione con stelle.');
      setAuthForm({
        nome: userProfile.nome || '',
        badge: userProfile.badge || '',
        email: userProfile.email || '',
        reparto: userProfile.reparto || REPARTI_AZIENDA[0],
        fotoProfilo: userProfile.fotoProfilo || '',
      });
      setShowProfileModal(true);
      return;
    }
    const nomePulito = extractBaseName(nomeCollega);
    if (!nomePulito) return;
    if (nomePulito.toLowerCase() === extractBaseName(userProfile.nome).toLowerCase()) {
      setAvviso('Non puoi autovalutarti.');
      setTimeout(() => setAvviso(''), 2500);
      return;
    }
    const stats = getStatsUtente(nomePulito);
    const mioNome = extractBaseName(userProfile.nome).toLowerCase();
    const precedente = stats.recensioni.find(
      (v) => extractBaseName(v.valutatore).toLowerCase() === mioNome
    );
    setUtenteDaValutare(nomePulito);
    setStelleSelezionate(precedente ? Number(precedente.stelle) : 5);
    setCommentoValutazione(precedente?.commento || '');
  }

  async function handleSalvaValutazione(e) {
    e.preventDefault();
    if (!utenteDaValutare || !userProfile.nome.trim()) return;
    setInvioValutazione(true);

    const valutatorePulito = extractBaseName(userProfile.nome);
    const valutatoPulito = extractBaseName(utenteDaValutare);

    const nuovaRec = {
      autore_valutato: valutatoPulito,
      valutatore: valutatorePulito,
      stelle: stelleSelezionate,
      commento: commentoValutazione.trim(),
    };

    try {
      setValutazioni((prev) => {
        const filtrata = prev.filter(
          (v) =>
            !(
              extractBaseName(v.autore_valutato).toLowerCase() === valutatoPulito.toLowerCase() &&
              extractBaseName(v.valutatore).toLowerCase() === valutatorePulito.toLowerCase()
            )
        );
        return [{ ...nuovaRec, id: Date.now(), created_at: new Date().toISOString() }, ...filtrata];
      });

      await supabase
        .from('valutazioni')
        .delete()
        .eq('autore_valutato', valutatoPulito)
        .eq('valutatore', valutatorePulito);
      const { error } = await supabase.from('valutazioni').insert([nuovaRec]);
      if (!error) {
        await fetchValutazioni();
      }

      setUtenteDaValutare(null);
      setCommentoValutazione('');
      setAvviso(`Valutazione di ${stelleSelezionate} ★ inviata per ${valutatoPulito}!`);
      setTimeout(() => setAvviso(''), 3000);
    } finally {
      setInvioValutazione(false);
    }
  }

  function togglePagamentoPreferito(label) {
    setSettings((prev) => {
      const attuali = prev.pagamentiPreferiti || [];
      const esiste = attuali.includes(label);
      const aggiornati = esiste ? attuali.filter((x) => x !== label) : [...attuali, label];
      return { ...prev, pagamentiPreferiti: aggiornati };
    });
  }

  function togglePagamentoInLista(listaCorrente, setter, label) {
    const esiste = listaCorrente.includes(label);
    setter(esiste ? listaCorrente.filter((x) => x !== label) : [...listaCorrente, label]);
  }

  async function richiediPermessoNotifiche(mostraFeedback = true) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      if (mostraFeedback) {
        setErrore('Su iPhone aggiungi prima l’app alla Schermata Home (Condividi -> Aggiungi alla schermata Home) per attivare le notifiche.');
      }
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
      if (res === 'granted') {
        setSettings((prev) => ({ ...prev, notificheAttive: true }));
        if (mostraFeedback) {
          await sendSystemNotification(
            `${COMPANY_NAME} ${COMPANY_SUBTITLE}`,
            'Notifiche attive! Riceverai qui i messaggi dei tuoi colleghi.',
            'tracolleghi-test'
          );
          setAvviso('Notifiche sul telefono attivate!');
          setTimeout(() => setAvviso(''), 3000);
        }
      } else if (mostraFeedback && res === 'denied') {
        setErrore('Notifiche bloccate dal browser: abilitale nelle impostazioni del telefono.');
      }
    } catch {
      // Silenzioso
    }
  }

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

  async function fetchMessaggi() {
    try {
      const { data, error } = await supabase
        .from('messaggi')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) return;
      const lista = data || [];
      const mioNome = extractBaseName(userProfile.nome).toLowerCase();

      if (!initializedMsgsRef.current) {
        lista.forEach((m) => {
          if (m.id != null) seenMsgIdsRef.current.add(String(m.id));
        });
        initializedMsgsRef.current = true;
        setMessaggi(lista);
        return;
      }

      const nuoviRicevutiPerMe = lista.filter((m) => {
        const idStr = m.id != null ? String(m.id) : null;
        const isNuovo = idStr ? !seenMsgIdsRef.current.has(idStr) : false;
        if (!isNuovo) return false;

        const mittNome = extractBaseName(m.mittente).toLowerCase();
        const destNome = extractBaseName(m.destinatario).toLowerCase();
        return Boolean(mioNome) && mittNome !== mioNome && (!destNome || destNome === mioNome);
      });

      lista.forEach((m) => {
        if (m.id != null) seenMsgIdsRef.current.add(String(m.id));
      });

      setMessaggi(lista);

      if (nuoviRicevutiPerMe.length > 0) {
        const ultimoRicevuto = nuoviRicevutiPerMe[nuoviRicevutiPerMe.length - 1];
        const appInBackground = document.visibilityState === 'hidden';
        const chatGiaApertaSuQuestoMittente =
          !appInBackground &&
          chatAperta &&
          extractBaseName(chatAperta.altroUtente).toLowerCase() ===
            extractBaseName(ultimoRicevuto.mittente).toLowerCase() &&
          String(chatAperta.annuncio?.id) === String(ultimoRicevuto.annuncio_id);

        if (!chatGiaApertaSuQuestoMittente) {
          if (settings.notificheAttive) {
            playNotificationSound(settings.suoneria);
            const annuncioRif = annunci.find((a) => String(a.id) === String(ultimoRicevuto.annuncio_id));
            const mittentePulito = extractBaseName(ultimoRicevuto.mittente) || 'Un collega';
            const titoloNotif = annuncioRif
              ? `${mittentePulito} • ${annuncioRif.titolo}`
              : `Nuovo messaggio da ${mittentePulito}`;
            sendSystemNotification(
              titoloNotif,
              ultimoRicevuto.testo,
              `msg-${ultimoRicevuto.annuncio_id}-${mittentePulito}`
            );
          }
          setSettings((prev) => ({
            ...prev,
            badgeNonLetti: (prev.badgeNonLetti || 0) + nuoviRicevutiPerMe.length,
          }));
        }
      }
    } catch {
      // Silenzioso
    }
  }

  useEffect(() => {
    fetchMessaggi();
    const timer = setInterval(() => {
      fetchMessaggi();
    }, 5000);
    return () => clearInterval(timer);
  }, [userProfile.nome, settings.notificheAttive, settings.suoneria, chatAperta, annunci]);

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

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!authForm.nome.trim()) {
      setErrore('Inserisci il tuo Nome e Cognome.');
      return;
    }
    if (!authForm.badge.trim() && !authForm.email.trim()) {
      setErrore('Inserisci almeno il Numero Badge oppure la Email aziendale per la verifica interno-colleghi.');
      return;
    }

    const code = normalizeBadgeCode(authForm.badge);
    const emailClean = authForm.email.trim().toLowerCase();
    const matchedBadge = badgeRegistry.find(
      (b) =>
        (code && normalizeBadgeCode(b.badge) === code) ||
        (emailClean && b.email && b.email.toLowerCase() === emailClean)
    );

    if (matchedBadge && matchedBadge.attivo === false) {
      setErrore(`Il badge ${matchedBadge.badge} risulta sospeso dall'amministratore.`);
      return;
    }

    if (strictBadgeCheck && badgeRegistry.length > 0 && !matchedBadge) {
      setErrore(
        'Accesso riservato ai badge aziendali caricati nel registro. Controlla il codice o contatta un Admin.'
      );
      return;
    }

    const updated = {
      nome: extractBaseName(authForm.nome),
      badge: code || authForm.badge.trim(),
      email: authForm.email.trim(),
      reparto: matchedBadge?.reparto || authForm.reparto || REPARTI_AZIENDA[0],
      fotoProfilo: authForm.fotoProfilo,
      registrato: true,
      badgeVerificato: Boolean(matchedBadge),
    };
    setUserProfile(updated);
    setShowProfileModal(false);
    setErrore('');
    setAvviso(
      updated.badgeVerificato
        ? `Profilo verificato con Badge #${updated.badge}: ${updated.nome} (${updated.reparto})`
        : `Profilo aziendale salvato: ${updated.nome} (${updated.reparto})`
    );
    setTimeout(() => setAvviso(''), 3500);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      richiediPermessoNotifiche(false);
    }
  }

  function apriModalePubblica(modalitaIniziale = sezioneAttiva) {
    setErrore('');
    setShowMoreMenu(false);
    if (modalitaIniziale === 'eventi') {
      setShowEventoForm(true);
      return;
    }
    if (!userProfile.registrato || !userProfile.nome.trim()) {
      setErrore('Registrati prima con Badge o Email aziendale per pubblicare.');
      setAuthForm({
        nome: userProfile.nome || '',
        badge: userProfile.badge || '',
        email: userProfile.email || '',
        reparto: userProfile.reparto || REPARTI_AZIENDA[0],
        fotoProfilo: userProfile.fotoProfilo || '',
      });
      setShowProfileModal(true);
      return;
    }
    if (modalitaIniziale === 'cerco_aiuto') {
      setCategoria('Cerco / Aiuto');
      setTipoAnnuncio(
        filtroCercoAiuto !== 'Tutti' ? filtroCercoAiuto : 'Cerco / Mi serve'
      );
    } else if (categoria === 'Cerco / Aiuto') {
      setCategoria('Motori');
      setTipoAnnuncio('In vendita');
    }
    setPagamentiAnnuncio(
      settings.pagamentiPreferiti && settings.pagamentiPreferiti.length > 0
        ? settings.pagamentiPreferiti
        : ['Visa / Mastercard', 'Contanti']
    );
    setShowPublishModal(true);
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
        selezionate.map((file) => compressImageFile(file, 800, 0.68))
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

  const isFormCercoAiuto = categoria === 'Cerco / Aiuto';

  async function handleSubmitAnnuncio(e) {
    e.preventDefault();
    if (!userProfile.registrato || !userProfile.nome.trim()) {
      setShowPublishModal(false);
      setErrore('Registrati prima con Badge o Email aziendale per pubblicare.');
      setShowProfileModal(true);
      return;
    }

    if (!titolo.trim() || !descrizione.trim()) {
      setErrore('Compila almeno titolo e descrizione.');
      return;
    }

    setLoading(true);
    setErrore('');

    const prezzoNum = isFormCercoAiuto
      ? null
      : tipoAnnuncio === 'In regalo'
      ? 0
      : prezzo !== '' && !Number.isNaN(parseFloat(prezzo))
      ? parseFloat(prezzo)
      : null;

    const tagPagamenti =
      !isFormCercoAiuto && tipoAnnuncio !== 'In regalo' && pagamentiAnnuncio.length > 0
        ? ` [PAGAMENTI: ${pagamentiAnnuncio.join(', ')}]`
        : '';
    const nomePulito = extractBaseName(userProfile.nome);
    const infoReparto = userProfile.reparto ? ` • ${userProfile.reparto}` : '';

    const payload = {
      titolo: titolo.trim(),
      descrizione: `${descrizione.trim()}${tagPagamenti}`,
      prezzo: prezzoNum,
      categoria,
      tipo: tipoAnnuncio,
      reparto: userProfile.reparto || '',
      autore: `${nomePulito}${infoReparto}`,
      autore_foto: userProfile.fotoProfilo || '',
      immagine: fotoAnnuncio.length > 0 ? JSON.stringify(fotoAnnuncio) : null,
    };

    try {
      const { error } = await supabase.from('annunci').insert([payload]);
      if (error) throw error;

      setTitolo('');
      setDescrizione('');
      setPrezzo('');
      setTipoAnnuncio('In vendita');
      setFotoAnnuncio([]);
      setShowPublishModal(false);
      if (isFormCercoAiuto) {
        setSezioneAttiva('cerco_aiuto');
      } else {
        setSezioneAttiva('bacheca');
      }
      setAvviso('Pubblicato in bacheca colleghi!');
      setTimeout(() => setAvviso(''), 3000);
      await fetchAnnunci();
    } catch (err) {
      setErrore('Errore durante il salvataggio: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const mieiAnnunci = useMemo(() => {
    if (!userProfile.nome || !userProfile.nome.trim()) return [];
    const mioNome = extractBaseName(userProfile.nome).toLowerCase();
    return annunci.filter(
      (item) => extractBaseName(item.autore).toLowerCase() === mioNome
    );
  }, [annunci, userProfile.nome]);

  const mieiAnnunciAttivi = useMemo(
    () => mieiAnnunci.filter((item) => !isAnnuncioVenduto(item)),
    [mieiAnnunci]
  );

  const mieiAnnunciVenduti = useMemo(
    () => mieiAnnunci.filter((item) => isAnnuncioVenduto(item)),
    [mieiAnnunci]
  );

  function apriModificaAnnuncio(item) {
    const pagamentiEsistenti = extractPagamentiFromDesc(item.descrizione);
    const isVenduto = isAnnuncioVenduto(item);
    const tipoRilevato =
      item.tipo ||
      (item.prezzo === 0 || /\[in regalo\]/i.test(item.descrizione || '')
        ? 'In regalo'
        : /\[a noleggio\]/i.test(item.descrizione || '')
        ? 'A noleggio'
        : 'In vendita');

    setAnnuncioInModifica(item);
    setEditForm({
      titolo: item.titolo || '',
      categoria: [...CATEGORIE_FORM, 'Cerco / Aiuto'].includes(item.categoria)
        ? item.categoria
        : 'Generale',
      tipo: tipoRilevato,
      prezzo: item.prezzo != null ? String(item.prezzo) : '',
      pagamenti:
        pagamentiEsistenti.length > 0
          ? pagamentiEsistenti
          : settings.pagamentiPreferiti || ['Visa / Mastercard', 'Contanti'],
      venduto: isVenduto,
      descrizione: cleanDescrizione(item.descrizione),
    });
  }

  async function handleSalvaModificaAnnuncio(e) {
    e.preventDefault();
    if (!annuncioInModifica) return;
    if (!editForm.titolo.trim() || !editForm.descrizione.trim()) {
      setErrore('Compila titolo e descrizione per aggiornare l’annuncio.');
      return;
    }

    setSalvataggioModifica(true);
    setErrore('');

    const editIsCerco = editForm.categoria === 'Cerco / Aiuto';
    const prezzoNum = editIsCerco
      ? null
      : editForm.tipo === 'In regalo'
      ? 0
      : editForm.prezzo !== '' && !Number.isNaN(parseFloat(editForm.prezzo))
      ? parseFloat(editForm.prezzo)
      : null;

    const tags = [
      !editIsCerco && editForm.tipo !== 'In regalo' && editForm.pagamenti.length > 0
        ? `[PAGAMENTI: ${editForm.pagamenti.join(', ')}]`
        : '',
      editForm.venduto ? '[VENDUTO]' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const descrizioneFinale = tags ? `${editForm.descrizione.trim()} ${tags}` : editForm.descrizione.trim();

    const updates = {
      titolo: editForm.titolo.trim(),
      categoria: editForm.categoria,
      tipo: editForm.tipo,
      prezzo: prezzoNum,
      descrizione: descrizioneFinale,
    };

    try {
      const { error } = await supabase.from('annunci').update(updates).eq('id', annuncioInModifica.id);
      if (error) throw error;

      setAnnunci((prev) =>
        prev.map((a) => (a.id === annuncioInModifica.id ? { ...a, ...updates } : a))
      );
      setAnnuncioInModifica(null);
      setAvviso('Annuncio aggiornato correttamente!');
      setTimeout(() => setAvviso(''), 3000);
    } catch (err) {
      setErrore('Errore durante la modifica: ' + err.message);
    } finally {
      setSalvataggioModifica(false);
    }
  }

  async function toggleStatoVenduto(item) {
    const attualmenteVenduto = isAnnuncioVenduto(item);
    const nuovoStatoVenduto = !attualmenteVenduto;
    const pagamentiEsistenti = extractPagamentiFromDesc(item.descrizione);
    const baseDesc = cleanDescrizione(item.descrizione);

    const tags = [
      pagamentiEsistenti.length > 0 ? `[PAGAMENTI: ${pagamentiEsistenti.join(', ')}]` : '',
      nuovoStatoVenduto ? '[VENDUTO]' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const descrizioneFinale = tags ? `${baseDesc} ${tags}` : baseDesc;

    try {
      const { error } = await supabase
        .from('annunci')
        .update({ descrizione: descrizioneFinale })
        .eq('id', item.id);
      if (error) throw error;

      setAnnunci((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, descrizione: descrizioneFinale } : a))
      );
      setAvviso(nuovoStatoVenduto ? 'Annuncio spostato in Annunci venduti!' : 'Annuncio rimesso in Annunci attivi.');
      setTimeout(() => setAvviso(''), 3000);
    } catch (err) {
      setErrore('Impossibile aggiornare lo stato: ' + err.message);
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
      if (schedaAnnuncio?.item?.id === annuncioDaEliminare.id) {
        setSchedaAnnuncio(null);
      }
      setAvviso('Annuncio eliminato.');
      setTimeout(() => setAvviso(''), 2500);
    } catch (err) {
      setErrore('Impossibile eliminare l’annuncio: ' + err.message);
    } finally {
      setAnnuncioDaEliminare(null);
    }
  }

  const annunciFiltrati = useMemo(() => {
    return annunci.filter((item) => {
      if (isPostCercoAiuto(item)) return false;
      if (soloPreferiti && !preferitiIds.includes(String(item.id))) return false;
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
        (item.autore || '').toLowerCase().includes(q) ||
        (item.reparto || '').toLowerCase().includes(q);
      return okCat && okTipo && okRicerca;
    });
  }, [annunci, filtroCategoria, filtroTipo, ricerca, soloPreferiti, preferitiIds]);

  const ultimiAnnunciPerVetrinaGioco = useMemo(() => {
    return annunci.filter((item) => !isPostCercoAiuto(item) && !isAnnuncioVenduto(item)).slice(0, 4);
  }, [annunci]);

  const postCercoAiutoFiltrati = useMemo(() => {
    return annunci.filter((item) => {
      if (!isPostCercoAiuto(item)) return false;
      const tipoRilevato = item.tipo || 'Cerco / Mi serve';
      const okTipo = filtroCercoAiuto === 'Tutti' || tipoRilevato === filtroCercoAiuto;
      const q = ricerca.trim().toLowerCase();
      const okRicerca =
        !q ||
        (item.titolo || '').toLowerCase().includes(q) ||
        (item.descrizione || '').toLowerCase().includes(q) ||
        (item.autore || '').toLowerCase().includes(q) ||
        (item.reparto || '').toLowerCase().includes(q);
      return okTipo && okRicerca;
    });
  }, [annunci, filtroCercoAiuto, ricerca]);

  const convenzioniFiltrate = useMemo(() => {
    return CONVENZIONI_COLLEGI.filter((c) => {
      const okCat = filtroConvenzioneCat === 'Tutte' || c.categoria === filtroConvenzioneCat;
      const q = ricerca.trim().toLowerCase();
      const okRicerca =
        !q ||
        c.locale.toLowerCase().includes(q) ||
        c.sconto.toLowerCase().includes(q) ||
        c.categoria.toLowerCase().includes(q) ||
        c.zona.toLowerCase().includes(q);
      return okCat && okRicerca;
    });
  }, [filtroConvenzioneCat, ricerca]);

  const conversazioniAttive = useMemo(() => {
    const mioNome = extractBaseName(userProfile.nome).toLowerCase();
    if (!mioNome) return [];
    const mapThreads = new Map();

    for (const m of messaggi) {
      const mitt = extractBaseName(m.mittente);
      const dest = extractBaseName(m.destinatario);
      if (mitt.toLowerCase() !== mioNome && dest.toLowerCase() !== mioNome) continue;

      const altro = mitt.toLowerCase() === mioNome ? dest : mitt;
      if (!altro) continue;

      const annId = String(m.annuncio_id || '');
      const key = m.thread_key || buildThreadKey(annId, mioNome, altro);
      const annObj = annunci.find((a) => String(a.id) === annId) || {
        id: annId,
        titolo: 'Conversazione tra colleghi',
      };

      mapThreads.set(key, {
        key,
        annuncio: annObj,
        altroUtente: altro,
        ultimoTesto: m.testo,
        ultimoData: m.created_at,
      });
    }

    return Array.from(mapThreads.values()).reverse();
  }, [messaggi, userProfile.nome, annunci]);

  const messaggiChatAttiva = useMemo(() => {
    if (!chatAperta || !userProfile.nome) return [];
    const mioNome = extractBaseName(userProfile.nome).toLowerCase();
    const altroNome = extractBaseName(chatAperta.altroUtente).toLowerCase();
    const key = buildThreadKey(chatAperta.annuncio.id, mioNome, altroNome);

    return messaggi.filter((m) => {
      if (m.thread_key) return m.thread_key === key;
      const sameItem = String(m.annuncio_id) === String(chatAperta.annuncio.id);
      const pair = [
        extractBaseName(m.mittente).toLowerCase(),
        extractBaseName(m.destinatario).toLowerCase(),
      ].sort();
      const expectedPair = [mioNome, altroNome].sort();
      return sameItem && pair[0] === expectedPair[0] && pair[1] === expectedPair[1];
    });
  }, [messaggi, chatAperta, userProfile.nome]);

  function apriChatPrivata(annuncio, altroUtente) {
    if (!userProfile.registrato || !userProfile.nome.trim()) {
      setErrore('Registrati prima con Badge o Email aziendale per avviare una chat privata.');
      setAuthForm({
        nome: userProfile.nome || '',
        badge: userProfile.badge || '',
        email: userProfile.email || '',
        reparto: userProfile.reparto || REPARTI_AZIENDA[0],
        fotoProfilo: userProfile.fotoProfilo || '',
      });
      setShowProfileModal(true);
      return;
    }
    const nomePulito = extractBaseName(altroUtente);
    setSchedaAnnuncio(null);
    setChatAperta({ annuncio, altroUtente: nomePulito });
    setSettings((prev) => ({ ...prev, badgeNonLetti: 0 }));
    fetchMessaggi();
  }

  async function handleInviaMessaggio(e) {
    e.preventDefault();
    if (!nuovoMessaggio.trim() || !chatAperta || !userProfile.nome.trim()) return;
    setInvioMessaggio(true);

    const mittente = extractBaseName(userProfile.nome);
    const destinatario = extractBaseName(chatAperta.altroUtente);
    const threadKey = buildThreadKey(chatAperta.annuncio.id, mittente, destinatario);

    const record = {
      annuncio_id: String(chatAperta.annuncio.id),
      thread_key: threadKey,
      mittente,
      destinatario,
      testo: nuovoMessaggio.trim(),
    };

    try {
      const { data, error } = await supabase.from('messaggi').insert([record]).select();
      if (error) {
        setErrore('Errore invio messaggio: ' + error.message);
        setMessaggi((prev) => [...prev, { ...record, id: Date.now(), created_at: new Date().toISOString() }]);
      } else if (data && data.length > 0) {
        data.forEach((row) => {
          if (row.id != null) seenMsgIdsRef.current.add(String(row.id));
        });
        setMessaggi((prev) => [...prev, ...data]);
      }
      setNuovoMessaggio('');
    } finally {
      setInvioMessaggio(false);
    }
  }

  const fontHeading = "'Syne', 'Plus Jakarta Sans', sans-serif";
  const fontBody = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

  const listaAnnunciImpostazioni = settingsTab === 'attivi' ? mieiAnnunciAttivi : mieiAnnunciVenduti;
  const sezioneExtraAttiva = SEZIONI_EXTRA.find((s) => s.id === sezioneAttiva);

  function renderCardCatalogo(item, isCercoAiutoCard = false) {
    const foto = normalizeImages(item);
    const venduto = isAnnuncioVenduto(item);
    const autorePulito = extractBaseName(item.autore) || 'Collega';
    const mioNome = extractBaseName(userProfile.nome).toLowerCase();
    const isOwner = Boolean(mioNome && autorePulito.toLowerCase() === mioNome);
    const isPreferito = preferitiIds.includes(String(item.id));
    const statsAutore = getStatsUtente(autorePulito);

    return (
      <article
        key={item.id}
        className="tm-card-v"
        style={{ opacity: venduto ? 0.85 : 1 }}
      >
        <div className="tm-card-v-top">
          <div
            className="tm-card-v-author"
            onClick={() => {
              if (!isOwner && autorePulito) apriModaleValutaUtente(autorePulito);
            }}
          >
            {item.autore_foto ? (
              <img src={item.autore_foto} alt={autorePulito} className="tm-card-v-avatar" />
            ) : (
              <span className="tm-card-v-avatar">{autorePulito.charAt(0).toUpperCase()}</span>
            )}
            <span className="tm-card-v-name">{autorePulito}</span>
          </div>

          {statsAutore.totale > 0 && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#d97706',
                flexShrink: 0,
              }}
            >
              ★ {statsAutore.media.toFixed(1)}
            </span>
          )}
        </div>

        <div
          className="tm-card-v-media"
          onClick={() => setSchedaAnnuncio({ item, isCercoAiutoCard })}
        >
          {foto[0] ? (
            <img
              src={foto[0]}
              alt={item.titolo}
              style={{ filter: venduto ? 'grayscale(55%)' : 'none' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: '#64748b',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{isCercoAiutoCard ? '🤝' : '📦'}</span>
              <span style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                {isCercoAiutoCard ? item.tipo || 'Richiesta' : 'Nessuna foto'}
              </span>
            </div>
          )}

          {venduto && (
            <span
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                background: '#dc2626',
                color: '#fff',
                fontFamily: fontHeading,
                fontWeight: 800,
                fontSize: '0.66rem',
                padding: '3px 8px',
                borderRadius: '7px',
                letterSpacing: '0.04em',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
              }}
            >
              VENDUTO
            </span>
          )}

          <button
            type="button"
            className="tm-card-v-heart"
            aria-label={isPreferito ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            onClick={(e) => {
              e.stopPropagation();
              togglePreferito(item.id);
            }}
          >
            {isPreferito ? '❤️' : '🤍'}
          </button>
        </div>

        <div
          className="tm-card-v-body"
          onClick={() => setSchedaAnnuncio({ item, isCercoAiutoCard })}
        >
          {!isCercoAiutoCard ? (
            <div
              className="tm-card-v-price"
              style={{
                color: venduto ? '#94a3b8' : '#0f172a',
                textDecoration: venduto ? 'line-through' : 'none',
              }}
            >
              {formatPrezzoCard(item)}
            </div>
          ) : (
            <div className="tm-card-v-price" style={{ color: '#1d4ed8', fontSize: '0.84rem' }}>
              {item.tipo || 'Cerco / Mi serve'}
            </div>
          )}

          <div className="tm-card-v-title">{item.titolo}</div>
          <div className="tm-card-v-meta">
            {isCercoAiutoCard ? item.reparto || 'Colleghi' : item.categoria || 'Generale'}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: fontBody }}>
      {showIntroVideo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <video
            ref={introVideoRef}
            src="/intro-tracolleghi.mp4"
            autoPlay
            playsInline
            onEnded={chiudiIntroVideo}
            onError={chiudiIntroVideo}
            style={{
              width: '100%',
              maxWidth: '480px',
              maxHeight: '82vh',
              borderRadius: '18px',
              objectFit: 'cover',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55)',
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 'calc(18px + env(safe-area-inset-top))',
              right: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 121,
            }}
          >
            <button
              type="button"
              onClick={toggleIntroAudio}
              aria-label={introMuted ? 'Attiva audio video' : 'Silenzia audio video'}
              style={{
                background: introMuted ? 'rgba(239, 68, 68, 0.28)' : 'rgba(6, 182, 212, 0.28)',
                color: '#ffffff',
                border: introMuted ? '1px solid #fca5a5' : '1px solid #38bdf8',
                borderRadius: '999px',
                padding: '7px 12px',
                fontFamily: fontBody,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {introMuted ? '🔇 Riattiva audio' : '🔊 Silenzia'}
            </button>
            {introAudioBlockedNotice && (
              <span
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#fde68a',
                  border: '1px solid rgba(253, 230, 138, 0.45)',
                  borderRadius: '999px',
                  padding: '6px 11px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                Tocca "Riattiva audio" se il browser blocca il suono
              </span>
            )}
            <button
              type="button"
              onClick={chiudiIntroVideo}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '999px',
                padding: '7px 14px',
                fontFamily: fontBody,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Salta ›
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes tm-pulsar {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes tm-pop-check {
          0% { transform: scale(0.85); opacity: 0; }
          60% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        input, textarea, select {
          font-size: 16px !important;
        }
        .tm-container {
          max-width: 1280px;
          margin: 0 auto;
          padding-left: 14px;
          padding-right: 14px;
        }
        @media (min-width: 768px) {
          .tm-container {
            padding-left: 24px;
            padding-right: 24px;
          }
        }
        /* HEADER PIENO CON SAFE AREA IN ALTO PER NON ESSERE COPERTO DAL TELEFONO */
        .tm-top-header {
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 40;
          padding-top: env(safe-area-inset-top);
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
        }
        .tm-top-header::after {
          content: '';
          display: block;
          height: 3px;
          width: 100%;
          background: linear-gradient(90deg, #0f172a, #2563eb, #06b6d4, #38bdf8, #2563eb);
          background-size: 220% 220%;
          animation: tm-pulsar 6s ease infinite;
        }
        .tm-header-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 10px;
          padding-bottom: 8px;
        }
        .tm-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          cursor: pointer;
        }
        .tm-brand-logo-wrap {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          background: #0f172a;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
          flex-shrink: 0;
        }
        .tm-brand-logo {
          width: 100%;
          height: 100%;
          border-radius: 0;
          object-fit: cover;
          transform: scale(1.16);
          display: block;
        }
        .tm-brand-text-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }
        .tm-brand-name {
          font-family: ${fontHeading};
          font-weight: 800;
          font-size: 1.04rem;
          letter-spacing: -0.03em;
          color: #0f172a;
          line-height: 1.05;
          white-space: nowrap;
        }
        .tm-brand-market-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 3px;
        }
        .tm-brand-sub {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: ${fontHeading};
          font-weight: 800;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          color: #ffffff;
          background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 65%, #0891b2 100%);
          padding: 2px 8px;
          border-radius: 6px;
          line-height: 1.1;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
        }
        .tm-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 6px #38bdf8;
          display: inline-block;
        }
        @media (min-width: 768px) {
          .tm-brand-logo-wrap {
            width: 48px;
            height: 48px;
          }
          .tm-brand-name {
            font-size: 1.18rem;
          }
          .tm-brand-sub {
            font-size: 0.74rem;
            padding: 3px 10px;
          }
        }
        .tm-search-row {
          padding-bottom: 8px;
        }
        .tm-search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 9px 13px;
          border-radius: 11px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          font-family: ${fontBody};
          font-weight: 500;
          outline: none;
          transition: all 0.18s ease;
        }
        .tm-search-input:focus {
          background: #ffffff;
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.16);
        }
        .tm-filter-strip {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 7px;
          padding: 0 0 10px;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .tm-filter-strip::-webkit-scrollbar {
          display: none;
        }
        .tm-pill {
          white-space: nowrap;
          flex-shrink: 0;
          padding: 6px 13px;
          border-radius: 999px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          color: #1e293b;
          font-family: ${fontBody};
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .tm-pill:hover {
          border-color: #38bdf8;
        }
        .tm-pill.is-active {
          background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
          border-color: #1d4ed8;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(29, 78, 216, 0.25);
        }
        .tm-board-wrapper {
          padding-top: 14px;
          padding-bottom: 92px;
        }
        .tm-grid-v {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 13px;
        }
        @media (min-width: 768px) {
          .tm-grid-v {
            grid-template-columns: repeat(4, 1fr);
            gap: 18px;
          }
        }
        @media (min-width: 1180px) {
          .tm-grid-v {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        .tm-card-v {
          background: #ffffff;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .tm-card-v:hover {
          transform: translateY(-3px);
          border-color: #06b6d4;
          box-shadow: 0 10px 24px rgba(6, 182, 212, 0.16);
        }
        .tm-card-v-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 9px;
          gap: 6px;
          background: #ffffff;
        }
        .tm-card-v-author {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          cursor: pointer;
        }
        .tm-card-v-avatar {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          object-fit: cover;
          background: linear-gradient(135deg, #dbeafe 0%, #cffafe 100%);
          color: #0f172a;
          border: 1px solid #93c5fd;
          font-size: 0.7rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tm-card-v-name {
          font-size: 0.76rem;
          color: #1e293b;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tm-card-v-media {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          background: #f1f5f9;
          overflow: hidden;
          cursor: pointer;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }
        .tm-card-v-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tm-card-v-heart {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.96);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.16);
        }
        .tm-card-v-body {
          padding: 9px 10px 11px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          cursor: pointer;
        }
        .tm-card-v-price {
          display: inline-block;
          width: fit-content;
          font-size: 0.96rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .tm-card-v-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tm-card-v-meta {
          font-size: 0.72rem;
          font-weight: 700;
          color: #0284c7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tm-saved-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          border-radius: 999px;
          padding: 3px 10px;
          font-size: 0.75rem;
          font-weight: 800;
          box-shadow: 0 3px 10px rgba(16, 185, 129, 0.35);
          animation: tm-pop-check 0.25s ease-out;
        }
        .tm-rep-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 14px;
        }
        .tm-game-layout {
          display: grid;
          grid-template-columns: minmax(290px, 430px) minmax(280px, 1fr);
          gap: 18px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .tm-game-layout {
            grid-template-columns: 1fr;
          }
        }
        .tm-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: #ffffff;
          border-top: 1.5px solid #e2e8f0;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          align-items: center;
          z-index: 50;
          padding-bottom: env(safe-area-inset-bottom);
          box-shadow: 0 -6px 20px rgba(15, 23, 42, 0.06);
        }
        .tm-bottom-btn {
          background: transparent;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          font-size: 0.67rem;
          font-weight: 800;
          color: #64748b;
          cursor: pointer;
          padding: 4px 2px;
          position: relative;
        }
        .tm-bottom-btn.is-active {
          color: #1d4ed8;
        }
        .tm-bottom-plus {
          width: 44px;
          height: 44px;
          border-radius: 15px;
          border: none;
          background: linear-gradient(135deg, #0f172a 0%, #2563eb 55%, #06b6d4 100%);
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(6, 182, 212, 0.4);
        }
        .tm-more-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.48);
          z-index: 65;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .tm-more-sheet {
          width: 100%;
          max-width: 540px;
          background: #ffffff;
          border-radius: 22px 22px 0 0;
          padding: 18px 18px calc(22px + env(safe-area-inset-bottom));
          box-shadow: 0 -12px 32px rgba(15, 23, 42, 0.2);
          max-height: 85vh;
          overflow-y: auto;
        }
        @media (min-width: 768px) {
          .tm-more-backdrop {
            align-items: center;
            padding: 16px;
          }
          .tm-more-sheet {
            border-radius: 22px;
            padding-bottom: 22px;
          }
        }
        .tm-more-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 15px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          text-align: left;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .tm-more-item:hover {
          border-color: #06b6d4;
          background: #ffffff;
        }
        .tm-more-item.is-selected {
          background: #eff6ff;
          border-color: #2563eb;
        }
        .tm-more-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
      `}</style>

      {swUpdateAvailable && !swBannerDismissed && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
            padding: '8px 0',
            fontSize: '0.8rem',
          }}
        >
          <div
            className="tm-container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <span>
              <strong>Nuova versione disponibile</strong> • Aggiorna {COMPANY_NAME} {COMPANY_SUBTITLE}.
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={applicaAggiornamentoApp}
                disabled={swUpdating}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '5px 11px',
                  fontFamily: fontHeading,
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                }}
              >
                {swUpdating ? 'Aggiornamento...' : 'Aggiorna'}
              </button>
              <button
                type="button"
                aria-label="Chiudi avviso aggiornamento"
                onClick={() => setSwBannerDismissed(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="tm-top-header">
        <div className="tm-container">
          <div className="tm-header-top-row">
            <div ref={profilePanelRef} className="tm-brand" style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  setErrore('');
                  setAuthForm({
                    nome: userProfile.nome || '',
                    badge: userProfile.badge || '',
                    email: userProfile.email || '',
                    reparto: userProfile.reparto || REPARTI_AZIENDA[0],
                    fotoProfilo: userProfile.fotoProfilo || '',
                  });
                  setShowProfileModal((prev) => !prev);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                title="Apri Profilo Collega & Badge"
              >
                <div className="tm-brand-logo-wrap">
                  <img
                    src={COMPANY_LOGO}
                    alt={`${COMPANY_NAME} ${COMPANY_SUBTITLE}`}
                    className="tm-brand-logo"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="tm-brand-text-col">
                  <div className="tm-brand-name">{COMPANY_NAME}</div>
                  <div className="tm-brand-market-row">
                    <span className="tm-brand-sub">
                      <span className="tm-live-dot" />
                      {COMPANY_SUBTITLE}
                    </span>
                  </div>
                </div>
              </div>

              {showProfileModal && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    left: 0,
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '20px',
                    width: 'min(92vw, 440px)',
                    maxHeight: '82vh',
                    overflowY: 'auto',
                    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.24)',
                    border: '1.5px solid #e2e8f0',
                    zIndex: 90,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.12rem' }}>Profilo Collega & Badge</h2>
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      style={{ background: 'transparent', border: 'none', fontSize: '1.15rem', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>

                  {errore && (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '10px', marginBottom: '10px', fontSize: '0.82rem', fontWeight: 600 }}>
                      {errore}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {authForm.fotoProfilo ? (
                        <img src={authForm.fotoProfilo} alt="Foto profilo" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#eff6ff', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.15rem' }}>
                          {(authForm.nome || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
                        Carica foto profilo
                        <input type="file" accept="image/*" onChange={handleFotoProfiloChange} style={{ display: 'none' }} />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>Numero Badge</label>
                        <input
                          type="text"
                          placeholder="Es. 1001"
                          value={authForm.badge}
                          onChange={(e) => handleBadgeInputInProfile(e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>Email aziendale</label>
                        <input
                          type="email"
                          placeholder="nome@azienda.it"
                          value={authForm.email}
                          onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>Nome e Cognome *</label>
                      <input
                        type="text"
                        placeholder="Es. Giancarlo Gentile"
                        value={authForm.nome}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, nome: e.target.value }))}
                        required
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>Reparto</label>
                      <select
                        value={authForm.reparto}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, reparto: e.target.value }))}
                        style={{ width: '100%', padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      >
                        {REPARTI_AZIENDA.map((rep) => (
                          <option key={rep} value={rep}>{rep}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '11px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
                        color: '#fff',
                        fontFamily: fontHeading,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Salva profilo
                    </button>
                  </form>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowMoreMenu(false);
                setShowProfileModal(false);
                setSezioneAttiva('bacheca');
                setFiltroCategoria('Tutte');
                setFiltroTipo('Tutti');
                setSoloPreferiti(false);
                setRicerca('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Torna alla Home"
              aria-label="Torna alla Home"
              style={{
                height: '36px',
                borderRadius: '11px',
                border: sezioneAttiva === 'bacheca' ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                background: sezioneAttiva === 'bacheca' ? '#eff6ff' : '#ffffff',
                color: '#0f172a',
                fontFamily: fontBody,
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '0 12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              }}
            >
              <span>🏠</span>
              <span>Home</span>
            </button>
          </div>

          <div className="tm-search-row">
            <input
              type="search"
              className="tm-search-input"
              placeholder={
                sezioneAttiva === 'cerco_aiuto'
                  ? 'Cerca richieste o passaggi...'
                  : sezioneAttiva === 'convenzioni'
                  ? 'Cerca convenzione o zona...'
                  : sezioneAttiva === 'eventi'
                  ? 'Cerca sagre, serate o uscite...'
                  : 'Cerca tra i colleghi...'
              }
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
            />
          </div>

          {sezioneAttiva === 'bacheca' && (
            <div className="tm-filter-strip">
              {MACRO_CATEGORIE.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`tm-pill ${filtroCategoria === cat.id ? 'is-active' : ''}`}
                  onClick={() => setFiltroCategoria(cat.id)}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
              {TIPI_ANNUNCIO.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  className={`tm-pill ${filtroTipo === tipo ? 'is-active' : ''}`}
                  onClick={() => setFiltroTipo(tipo)}
                >
                  {tipo}
                </button>
              ))}
              <button
                type="button"
                className={`tm-pill ${soloPreferiti ? 'is-active' : ''}`}
                onClick={() => setSoloPreferiti((prev) => !prev)}
              >
                ❤️ Preferiti ({preferitiIds.length})
              </button>
            </div>
          )}

          {sezioneAttiva === 'cerco_aiuto' && (
            <div className="tm-filter-strip">
              {SOTTOCATEGORIE_CERCO_AIUTO.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  className={`tm-pill ${filtroCercoAiuto === sub ? 'is-active' : ''}`}
                  onClick={() => setFiltroCercoAiuto(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {sezioneAttiva === 'convenzioni' && (
            <div className="tm-filter-strip">
              {['Tutte', 'Food & Pausa', 'Auto & Moto', 'Sport & Benessere', 'Negozi & Servizi'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`tm-pill ${filtroConvenzioneCat === cat ? 'is-active' : ''}`}
                  onClick={() => setFiltroConvenzioneCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {sezioneAttiva === 'eventi' && (
            <div className="tm-filter-strip">
              <button
                type="button"
                className="tm-pill is-active"
                onClick={() => setShowEventoForm((prev) => !prev)}
              >
                {showEventoForm ? '✕ Chiudi' : '+ Proponi evento'}
              </button>
              {CATEGORIE_EVENTI_ZONA.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`tm-pill ${filtroEventoCat === cat ? 'is-active' : ''}`}
                  onClick={() => setFiltroEventoCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="tm-container tm-board-wrapper">
        {showInstallBanner && (
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e3a8a',
              padding: '9px 12px',
              borderRadius: '12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '0.8rem',
            }}
          >
            <span>
              <strong>📲 Schermata Home:</strong> aggiungi <strong>{COMPANY_NAME} {COMPANY_SUBTITLE}</strong> all’app per aprirla in un tocco.
            </span>
            <button
              type="button"
              onClick={() => {
                setShowInstallBanner(false);
                try {
                  localStorage.setItem('tracolleghi_install_dismissed', '1');
                } catch {}
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #93c5fd',
                color: '#1e3a8a',
                borderRadius: '8px',
                padding: '3px 9px',
                fontWeight: 700,
                fontSize: '0.74rem',
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        )}

        {avviso && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '10px 14px',
              borderRadius: '12px',
              marginBottom: '12px',
              fontWeight: 600,
              fontSize: '0.86rem',
            }}
          >
            {avviso}
          </div>
        )}

        {errore && !showPublishModal && !showProfileModal && !showAdminModal && !annuncioInModifica && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '12px',
              marginBottom: '12px',
              fontWeight: 600,
              fontSize: '0.86rem',
            }}
          >
            {errore}
          </div>
        )}

        {sezioneAttiva === 'bacheca' && (
          <section className="tm-grid-v">
            {annunciFiltrati.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '28px',
                  textAlign: 'center',
                  color: '#64748b',
                  gridColumn: '1 / -1',
                  fontSize: '0.88rem',
                }}
              >
                {soloPreferiti
                  ? 'Nessun annuncio salvato nei preferiti. Tocca il cuoricino su una card per salvarla qui.'
                  : 'Nessun annuncio trovato con i filtri attivi. Premi + in basso per pubblicare il primo!'}
              </div>
            ) : (
              annunciFiltrati.map((item) => renderCardCatalogo(item, false))
            )}
          </section>
        )}

        {sezioneAttiva === 'cerco_aiuto' && (
          <section className="tm-grid-v">
            {postCercoAiutoFiltrati.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '28px',
                  textAlign: 'center',
                  color: '#64748b',
                  gridColumn: '1 / -1',
                  fontSize: '0.88rem',
                }}
              >
                Nessuna richiesta o avviso in questa categoria. Premi <strong>+</strong> per chiedere aiuto, un passaggio turno o segnalare un oggetto trovato.
              </div>
            ) : (
              postCercoAiutoFiltrati.map((item) => renderCardCatalogo(item, true))
            )}
          </section>
        )}

        {sezioneAttiva === 'convenzioni' && (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {convenzioniFiltrate.map((conv) => {
              const copiato = codiceCopiatoId === conv.id;
              return (
                <article
                  key={conv.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '15px',
                    border: '1.5px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontFamily: fontHeading,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '3px 9px',
                          borderRadius: '999px',
                        }}
                      >
                        {conv.categoria}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{conv.zona}</span>
                    </div>
                    <h3 style={{ margin: '8px 0 4px', fontFamily: fontHeading, fontSize: '1rem', color: '#0f172a' }}>
                      {conv.locale}
                    </h3>
                    <div style={{ fontWeight: 800, color: '#047857', fontSize: '0.92rem', marginBottom: '4px' }}>
                      {conv.sconto}
                    </div>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.82rem', lineHeight: 1.4 }}>
                      {conv.condizioni}
                    </p>
                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <strong style={{ color: '#0f172a', fontSize: '0.78rem' }}>{conv.codice}</strong>
                    <button
                      type="button"
                      onClick={() => handleCopiaCodiceConvenzione(conv)}
                      style={{
                        background: copiato ? '#047857' : '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {copiato ? 'Copiato ✓' : 'Copia'}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {sezioneAttiva === 'eventi' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {showEventoForm && (
              <form
                onSubmit={handleSalvaEventoZona}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1.5px solid #38bdf8',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1rem', color: '#0f172a' }}>
                    Proponi un evento o una dritta di zona
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowEventoForm(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                  <select
                    value={eventoForm.categoria}
                    onChange={(e) => setEventoForm((prev) => ({ ...prev, categoria: e.target.value }))}
                    style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  >
                    {CATEGORIE_EVENTI_FORM.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Quando (es. Sabato ore 20:00)"
                    value={eventoForm.dataOra}
                    onChange={(e) => setEventoForm((prev) => ({ ...prev, dataOra: e.target.value }))}
                    style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    placeholder="Zona / Luogo"
                    value={eventoForm.luogo}
                    onChange={(e) => setEventoForm((prev) => ({ ...prev, luogo: e.target.value }))}
                    style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Titolo (es. Sagra del paese, Concerto, Pizzata...)"
                  value={eventoForm.titolo}
                  onChange={(e) => setEventoForm((prev) => ({ ...prev, titolo: e.target.value }))}
                  required
                  style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />

                <textarea
                  rows={2}
                  placeholder="Dettagli, ritrovo o info utili per i colleghi..."
                  value={eventoForm.descrizione}
                  onChange={(e) => setEventoForm((prev) => ({ ...prev, descrizione: e.target.value }))}
                  required
                  style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#2563eb',
                      color: '#fff',
                      fontFamily: fontHeading,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Pubblica evento
                  </button>
                </div>
              </form>
            )}

            <div className="tm-rep-grid">
              {eventiZonaFiltrati.length === 0 ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '24px',
                    textAlign: 'center',
                    color: '#64748b',
                    gridColumn: '1 / -1',
                    fontSize: '0.86rem',
                  }}
                >
                  Nessun evento trovato per questo filtro. Tocca <strong>+ Proponi evento</strong> per aggiungere una proposta!
                </div>
              ) : (
                eventiZonaFiltrati.map((ev) => {
                  const autorePulito = extractBaseName(ev.autore) || 'Collega';
                  const mioNome = extractBaseName(userProfile.nome).toLowerCase();
                  const canChat = Boolean(autorePulito && autorePulito.toLowerCase() !== 'colleghi' && autorePulito.toLowerCase() !== mioNome);
                  return (
                    <article
                      key={ev.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '15px',
                        border: '1.5px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontFamily: fontHeading,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '3px 9px',
                              borderRadius: '999px',
                            }}
                          >
                            {ev.categoria}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                            {ev.dataOra}
                          </span>
                        </div>
                        <h3 style={{ margin: '8px 0 4px', fontFamily: fontHeading, fontSize: '1rem', color: '#0f172a' }}>
                          {ev.titolo}
                        </h3>
                        <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700, marginBottom: '6px' }}>
                          📍 {ev.luogo}
                        </div>
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.84rem', lineHeight: 1.45 }}>
                          {ev.descrizione}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
                          Proposto da {autorePulito}
                        </span>
                        {canChat && (
                          <button
                            type="button"
                            onClick={() => apriChatPrivata({ id: ev.id, titolo: ev.titolo }, autorePulito)}
                            style={{
                              background: '#0f172a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '5px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Scrivi
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {sezioneAttiva === 'gioco' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="tm-game-layout">
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', border: '1.5px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.08rem', color: '#0f172a' }}>
                    Colpo d’Occhio Pausa
                  </h2>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, padding: '5px 10px', borderRadius: '9px', fontSize: '0.82rem' }}>
                      ⏱️ {tempoRimasto}s
                    </span>
                    <span style={{ background: '#ecfdf5', color: '#047857', fontWeight: 800, padding: '5px 10px', borderRadius: '9px', fontSize: '0.82rem' }}>
                      🏆 {punteggioGioco}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                    const hasTarget = giocoAttivo && cellaBersaglio.index === idx;
                    const isDanger = hasTarget && cellaBersaglio.item.punti < 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toccaCellaGioco(idx)}
                        disabled={!giocoAttivo}
                        style={{
                          height: '72px',
                          borderRadius: '12px',
                          border: hasTarget ? (isDanger ? '2px solid #ef4444' : '2px solid #06b6d4') : '1px solid #cbd5e1',
                          background: hasTarget ? (isDanger ? '#fef2f2' : '#ecfeff') : '#ffffff',
                          fontSize: '1.8rem',
                          cursor: giocoAttivo ? 'pointer' : 'default',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {hasTarget ? (
                          <>
                            <span>{cellaBersaglio.item.emoji}</span>
                            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: isDanger ? '#dc2626' : '#0284c7' }}>
                              {cellaBersaglio.item.punti > 0 ? `+${cellaBersaglio.item.punti}` : cellaBersaglio.item.punti}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>•</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div style={{ minHeight: '20px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', marginBottom: '10px' }}>
                  {giocoAttivo ? feedbackColpo || 'Tocca le icone positive!' : giocoFinito ? `Finito! ${punteggioGioco} punti` : 'Sfida lampo da 20 secondi'}
                </div>

                <button
                  type="button"
                  onClick={avviaPartitaGioco}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '12px',
                    border: 'none',
                    background: giocoAttivo ? '#64748b' : 'linear-gradient(135deg, #0f172a 0%, #2563eb 60%, #06b6d4 100%)',
                    color: '#ffffff',
                    fontFamily: fontHeading,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {giocoAttivo ? 'In corso...' : giocoFinito ? '🔄 Gioca ancora' : '▶️ Inizia (20s)'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '15px', border: '1.5px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 8px', fontFamily: fontHeading, fontSize: '0.98rem', color: '#0f172a' }}>
                    Classifica Reparti
                  </h3>
                  {classificaReparti.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Nessun punteggio ancora.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {classificaReparti.map((r, i) => (
                        <div
                          key={r.reparto}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '7px 10px',
                            borderRadius: '9px',
                            background: i === 0 ? '#fef3c7' : '#f8fafc',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                          }}
                        >
                          <span>{i + 1}. {r.reparto}</span>
                          <span>{r.totale} pt</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '15px', border: '1.5px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 8px', fontFamily: fontHeading, fontSize: '0.98rem', color: '#0f172a' }}>
                    Record Colleghi
                  </h3>
                  {classificaIndividualeTop.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Nessun record personale ancora.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {classificaIndividualeTop.map((row, idx) => (
                        <div
                          key={`${row.giocatore}-${idx}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '7px 10px',
                            borderRadius: '9px',
                            background: '#f8fafc',
                            fontSize: '0.82rem',
                          }}
                        >
                          <strong>#{idx + 1} {row.giocatore}</strong>
                          <span style={{ fontWeight: 800, color: '#2563eb' }}>{row.punteggio} pt</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {ultimiAnnunciPerVetrinaGioco.length > 0 && (
              <div>
                <h3 style={{ margin: '0 0 10px', fontFamily: fontHeading, fontSize: '0.98rem', color: '#0f172a' }}>
                  Ultime occasioni in bacheca
                </h3>
                <div className="tm-grid-v">
                  {ultimiAnnunciPerVetrinaGioco.map((item) => renderCardCatalogo(item, false))}
                </div>
              </div>
            )}
          </section>
        )}

        {sezioneAttiva === 'chat' && (
          <section style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', border: '1.5px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 12px', fontFamily: fontHeading, fontSize: '1.08rem', color: '#0f172a' }}>
              Chat private colleghi
            </h2>

            {!userProfile.registrato || !userProfile.nome.trim() ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                <p style={{ margin: '0 0 12px', fontSize: '0.88rem' }}>
                  Accedi con Badge o Email aziendale per leggere e inviare messaggi.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthForm({
                      nome: userProfile.nome || '',
                      badge: userProfile.badge || '',
                      email: userProfile.email || '',
                      reparto: userProfile.reparto || REPARTI_AZIENDA[0],
                      fotoProfilo: userProfile.fotoProfilo || '',
                    });
                    setShowProfileModal(true);
                  }}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Accedi con Badge
                </button>
              </div>
            ) : conversazioniAttive.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.86rem' }}>
                Nessuna chat attiva. Apri una card in Bacheca o Aiuto per iniziare una conversazione.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {conversazioniAttive.map((conv) => (
                  <div
                    key={conv.key}
                    onClick={() => apriChatPrivata(conv.annuncio, conv.altroUtente)}
                    style={{
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontFamily: fontHeading, fontSize: '0.92rem' }}>{conv.altroUtente}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>
                        {conv.annuncio?.titolo || 'Annuncio'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.ultimoTesto}
                      </div>
                    </div>
                    <span style={{ background: '#0f172a', color: '#fff', borderRadius: '8px', padding: '6px 11px', fontSize: '0.76rem', fontWeight: 700, flexShrink: 0 }}>
                      Apri
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <nav className="tm-bottom-nav" aria-label="Navigazione principale">
        <button
          type="button"
          className={`tm-bottom-btn ${sezioneAttiva === 'bacheca' ? 'is-active' : ''}`}
          onClick={() => {
            setShowMoreMenu(false);
            setSezioneAttiva('bacheca');
          }}
        >
          <span style={{ fontSize: '1.12rem' }}>🛍️</span>
          <span>Bacheca</span>
        </button>

        <button
          type="button"
          className={`tm-bottom-btn ${sezioneAttiva === 'cerco_aiuto' ? 'is-active' : ''}`}
          onClick={() => {
            setShowMoreMenu(false);
            setSezioneAttiva('cerco_aiuto');
          }}
        >
          <span style={{ fontSize: '1.12rem' }}>🤝</span>
          <span>Aiuto</span>
        </button>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            className="tm-bottom-plus"
            aria-label="Pubblica annuncio"
            onClick={() => apriModalePubblica(sezioneAttiva)}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className={`tm-bottom-btn ${sezioneAttiva === 'chat' ? 'is-active' : ''}`}
          onClick={() => {
            setShowMoreMenu(false);
            setSezioneAttiva('chat');
            setSettings((prev) => ({ ...prev, badgeNonLetti: 0 }));
            fetchMessaggi();
          }}
        >
          <span style={{ fontSize: '1.12rem' }}>💬</span>
          <span>Chat</span>
          {settings.badgeNonLetti > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '16px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '999px',
              }}
            >
              {settings.badgeNonLetti}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`tm-bottom-btn ${showMoreMenu || Boolean(sezioneExtraAttiva) ? 'is-active' : ''}`}
          onClick={() => setShowMoreMenu((prev) => !prev)}
        >
          <span style={{ fontSize: '1.12rem' }}>☰</span>
          <span>{sezioneExtraAttiva ? sezioneExtraAttiva.label.split(' ')[0] : 'Altro'}</span>
        </button>
      </nav>

      {showMoreMenu && (
        <div className="tm-more-backdrop" onClick={() => setShowMoreMenu(false)}>
          <div className="tm-more-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontFamily: fontHeading, fontWeight: 800, fontSize: '1.04rem', color: '#0f172a' }}>
                  Altro • {COMPANY_NAME} {COMPANY_SUBTITLE}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Sezioni, impostazioni e strumenti
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#334155',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SEZIONI_EXTRA.map((sez) => {
                const attiva = sezioneAttiva === sez.id;
                return (
                  <button
                    key={sez.id}
                    type="button"
                    className={`tm-more-item ${attiva ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSezioneAttiva(sez.id);
                      setShowMoreMenu(false);
                      if (sez.id === 'gioco') fetchClassificaGioco();
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <span className="tm-more-icon">{sez.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                          {sez.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sez.desc}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: attiva ? '#2563eb' : '#94a3b8', fontWeight: 800, fontSize: '1rem' }}>
                      {attiva ? '✓' : '›'}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                className="tm-more-item"
                onClick={() => {
                  setShowMoreMenu(false);
                  setSettingsTab('attivi');
                  setShowSettingsModal(true);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <span className="tm-more-icon">⚙️</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                      Impostazioni & Annunci
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Notifiche, suonerie, pagamenti e tuoi annunci
                    </div>
                  </div>
                </div>
                <span style={{ color: '#94a3b8', fontWeight: 800, fontSize: '1rem' }}>›</span>
              </button>

              {canSeeAdminOption && (
                <button
                  type="button"
                  className="tm-more-item"
                  style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}
                  onClick={() => {
                    setShowMoreMenu(false);
                    setErrore('');
                    setShowAdminModal(true);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <span className="tm-more-icon">🛡️</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                        Admin & Gestione Badge
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#0284c7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Importazione massiva CSV/Excel e registro ({badgeRegistry.length})
                      </div>
                    </div>
                  </div>
                  <span style={{ color: '#0284c7', fontWeight: 800, fontSize: '1rem' }}>›</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdminModal && (
        <div
          onClick={() => setShowAdminModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 82,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.15rem', color: '#0f172a' }}>
                    🛡️ Area Admin Badge
                  </h2>
                  {adminSavedCheck && (
                    <span className="tm-saved-badge">
                      ✓ Salvato
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Importazione massiva CSV/Excel e controllo badge autorizzati
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.15rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {errore && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '10px', marginBottom: '10px', fontSize: '0.82rem', fontWeight: 600 }}>
                {errore}
              </div>
            )}

            {!isAdminUnlocked ? (
              <form
                onSubmit={handleUnlockAdmin}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                  Inserisci il PIN Amministratore per sbloccare la gestione badge (predefinito: <strong>2026</strong>).
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="PIN Admin..."
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#0f172a',
                      color: '#fff',
                      fontFamily: fontHeading,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Sblocca
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setAdminTab('importa')}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '10px',
                        border: adminTab === 'importa' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        background: adminTab === 'importa' ? '#eff6ff' : '#fff',
                        color: adminTab === 'importa' ? '#1d4ed8' : '#475569',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      📥 Importazione Massiva
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab('elenco')}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '10px',
                        border: adminTab === 'elenco' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        background: adminTab === 'elenco' ? '#eff6ff' : '#fff',
                        color: adminTab === 'elenco' ? '#1d4ed8' : '#475569',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      📋 Registro ({badgeRegistry.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab('sicurezza')}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '10px',
                        border: adminTab === 'sicurezza' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        background: adminTab === 'sicurezza' ? '#eff6ff' : '#fff',
                        color: adminTab === 'sicurezza' ? '#1d4ed8' : '#475569',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      🔐 Regole & PIN
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleLockAdmin}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '5px 9px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🔒 Blocca
                  </button>
                </div>

                {adminTab === 'importa' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '11px 13px',
                        fontSize: '0.8rem',
                        color: '#1e3a8a',
                        lineHeight: 1.45,
                      }}
                    >
                      Carica un file <strong>.CSV / .TXT</strong> oppure incolla le righe (es. <code>1001;Giancarlo Gentile;Ufficio Tecnico / Progettazione</code>).
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#0f172a',
                          color: '#fff',
                          borderRadius: '10px',
                          padding: '8px 13px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📄 Carica CSV / TXT
                        <input
                          type="file"
                          accept=".csv,.txt,text/csv,text/plain"
                          onChange={handleCsvFileImport}
                          style={{ display: 'none' }}
                        />
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Reparto default:</span>
                        <select
                          value={bulkDefaultReparto}
                          onChange={(e) => setBulkDefaultReparto(e.target.value)}
                          style={{ padding: '7px 9px', borderRadius: '9px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                        >
                          {REPARTI_AZIENDA.map((rep) => (
                            <option key={rep} value={rep}>
                              {rep}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <textarea
                      rows={5}
                      placeholder={'Incolla qui l\'elenco badge, es:\n1001;Giancarlo Gentile;Ufficio Tecnico / Progettazione\n1002;Veronica Gianni;Amministrazione / Acquisti / HR'}
                      value={bulkBadgeText}
                      onChange={(e) => setBulkBadgeText(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                      }}
                    />

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={bulkReplaceMode}
                        onChange={(e) => setBulkReplaceMode(e.target.checked)}
                      />
                      Sostituisci l'intero registro esistente
                    </label>

                    {bulkPreviewList.length > 0 && (
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '10px 12px',
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', marginBottom: '6px' }}>
                          Anteprima: {bulkPreviewList.length} badge pronti
                        </div>
                        <div style={{ maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {bulkPreviewList.slice(0, 25).map((row, idx) => (
                            <div
                              key={`${row.badge}-${idx}`}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '8px',
                                fontSize: '0.76rem',
                                background: '#fff',
                                padding: '5px 8px',
                                borderRadius: '7px',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              <span>
                                <strong>#{row.badge}</strong> • {row.nome}
                              </span>
                              <span style={{ color: '#64748b' }}>{row.reparto}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={adminLoadingImport || bulkPreviewList.length === 0}
                      onClick={handleConfirmBulkBadgeImport}
                      style={{
                        padding: '11px',
                        borderRadius: '12px',
                        border: 'none',
                        background: bulkPreviewList.length > 0 ? '#059669' : '#94a3b8',
                        color: '#fff',
                        fontFamily: fontHeading,
                        fontWeight: 800,
                        cursor: bulkPreviewList.length > 0 ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {adminLoadingImport
                        ? 'Salvataggio in corso...'
                        : `✓ Salva ${bulkPreviewList.length} Badge`}
                    </button>
                  </div>
                )}

                {adminTab === 'elenco' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <form
                      onSubmit={handleAddSingleBadge}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '11px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '7px',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Badge (es. 1006)"
                        value={singleBadgeForm.badge}
                        onChange={(e) => setSingleBadgeForm((prev) => ({ ...prev, badge: e.target.value }))}
                        required
                        style={{ padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <input
                        type="text"
                        placeholder="Nome e Cognome"
                        value={singleBadgeForm.nome}
                        onChange={(e) => setSingleBadgeForm((prev) => ({ ...prev, nome: e.target.value }))}
                        style={{ padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <select
                        value={singleBadgeForm.reparto}
                        onChange={(e) => setSingleBadgeForm((prev) => ({ ...prev, reparto: e.target.value }))}
                        style={{ padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      >
                        {REPARTI_AZIENDA.map((rep) => (
                          <option key={rep} value={rep}>
                            {rep}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        style={{
                          background: '#059669',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '7px 11px',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Salva badge
                      </button>
                    </form>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <input
                        type="search"
                        placeholder="Cerca badge, nome o reparto..."
                        value={adminSearchBadge}
                        onChange={(e) => setAdminSearchBadge(e.target.value)}
                        style={{ flex: 1, minWidth: '180px', padding: '8px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                      {badgeRegistry.length > 0 && (
                        <button
                          type="button"
                          onClick={handleExportBadgeCsv}
                          style={{
                            background: '#fff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '9px',
                            padding: '8px 11px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ⬇️ Esporta CSV
                        </button>
                      )}
                    </div>

                    {filteredBadgeRegistry.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', textAlign: 'center', padding: '16px' }}>
                        Nessun badge nel registro.
                      </p>
                    ) : (
                      <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {filteredBadgeRegistry.map((b) => {
                          const sospeso = b.attivo === false;
                          return (
                            <div
                              key={b.badge}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                                flexWrap: 'wrap',
                                background: sospeso ? '#fef2f2' : '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '8px 11px',
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                                  #{b.badge} • {b.nome}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                  {b.reparto} {b.email ? `• ${b.email}` : ''}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => toggleBadgeAttivo(b.badge)}
                                  style={{
                                    background: sospeso ? '#ecfdf5' : '#fef3c7',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '7px',
                                    padding: '4px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {sospeso ? 'Riattiva' : 'Sospendi'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeBadgeFromRegistry(b.badge)}
                                  style={{
                                    background: '#fee2e2',
                                    border: '1px solid #fecaca',
                                    color: '#b91c1c',
                                    borderRadius: '7px',
                                    padding: '4px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {adminTab === 'sicurezza' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '9px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                          <input
                            type="checkbox"
                            checked={strictBadgeCheck}
                            onChange={(e) => {
                              setStrictBadgeCheck(e.target.checked);
                              triggerAdminSavedCheck();
                            }}
                            style={{ marginTop: '3px' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                              Blocco Stretto (solo badge nel registro)
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                              Consente la registrazione solo ai badge presenti nell'elenco.
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: strictBadgeCheck ? '#059669' : '#64748b' }}>
                          {strictBadgeCheck ? '✓ Attivo' : 'Off'}
                        </span>
                      </label>
                    </div>

                    <form
                      onSubmit={handleUpdateAdminPin}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                        Salva nuovo PIN Amministratore
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="password"
                          placeholder="Nuovo PIN (min. 4 caratteri)..."
                          value={newAdminPinInput}
                          onChange={(e) => setNewAdminPinInput(e.target.value)}
                          style={{ flex: 1, padding: '8px 10px', borderRadius: '9px', border: '1px solid #cbd5e1' }}
                        />
                        <button
                          type="submit"
                          style={{
                            background: '#059669',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '9px',
                            padding: '8px 14px',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          ✓ Salva PIN
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {schedaAnnuncio && (() => {
        const { item, isCercoAiutoCard } = schedaAnnuncio;
        const foto = normalizeImages(item);
        const pagamentiItem = !isCercoAiutoCard ? extractPagamentiFromDesc(item.descrizione) : [];
        const venduto = isAnnuncioVenduto(item);
        const descrizionePulita = cleanDescrizione(item.descrizione);
        const autorePulito = extractBaseName(item.autore);
        const mioNome = extractBaseName(userProfile.nome).toLowerCase();
        const isOwner = Boolean(mioNome && autorePulito.toLowerCase() === mioNome);
        const statsAutore = getStatsUtente(autorePulito);
        const isPreferito = preferitiIds.includes(String(item.id));

        return (
          <div
            onClick={() => setSchedaAnnuncio(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.56)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 75,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '20px',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontFamily: fontHeading, fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '3px 9px', borderRadius: '999px' }}>
                  {isCercoAiutoCard ? item.tipo || 'Cerco / Aiuto' : item.categoria || 'Generale'}
                </span>
                <button type="button" onClick={() => setSchedaAnnuncio(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.15rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              {foto.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: foto.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  {foto.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${item.titolo} ${i + 1}`}
                      style={{ width: '100%', height: foto.length === 1 ? '230px' : '125px', objectFit: 'cover', borderRadius: '12px' }}
                    />
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.18rem' }}>{item.titolo}</h2>
                {!isCercoAiutoCard && (
                  <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.02rem' }}>
                    {formatPrezzoCard(item)}
                  </span>
                )}
              </div>

              <p style={{ margin: '10px 0 14px', color: '#334155', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {descrizionePulita}
              </p>

              {pagamentiItem.length > 0 && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    Pagamenti accettati:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {pagamentiItem.map((p) => (
                      <span key={p} style={{ fontSize: '0.72rem', fontWeight: 700, background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '999px' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.autore || 'Collega'}</div>
                  <div>{renderStarsInline(statsAutore.media, statsAutore.totale)}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => togglePreferito(item.id)}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '7px 11px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {isPreferito ? '❤️ Salvato' : '🤍 Preferito'}
                  </button>
                  {!isOwner && autorePulito && !venduto && (
                    <button
                      type="button"
                      onClick={() => apriChatPrivata(item, autorePulito)}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', padding: '7px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {isCercoAiutoCard ? 'Rispondi' : 'Chatta'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {showPublishModal && (
        <div
          onClick={() => setShowPublishModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 60,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.15rem' }}>
                {isFormCercoAiuto ? 'Pubblica richiesta / avviso' : 'Nuovo annuncio'}
              </h2>
              <button type="button" onClick={() => setShowPublishModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.15rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {errore && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '10px', marginBottom: '10px', fontSize: '0.84rem', fontWeight: 600 }}>
                {errore}
              </div>
            )}

            <form onSubmit={handleSubmitAnnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    boxSizing: 'border-box',
                    minHeight: '116px',
                    borderRadius: '16px',
                    border: '2px dashed #06b6d4',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfeff 100%)',
                    color: '#0f172a',
                    cursor: 'pointer',
                    padding: '14px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '2.1rem', lineHeight: 1 }}>📷</span>
                  <span style={{ fontFamily: fontHeading, fontWeight: 800, fontSize: '0.88rem' }}>
                    Tocca la macchina fotografica per aggiungere foto ({fotoAnnuncio.length}/4)
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>
                    Scatta o scegli fino a 4 immagini
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleFotoAnnuncioChange}
                    style={{ display: 'none' }}
                  />
                </label>

                {fotoAnnuncio.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {fotoAnnuncio.map((src, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={src} alt={`Anteprima ${idx + 1}`} style={{ width: '68px', height: '68px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                        <button
                          type="button"
                          onClick={() => removeFotoAnnuncio(idx)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: 'none',
                            background: '#dc2626',
                            color: '#fff',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoria(val);
                      if (val === 'Cerco / Aiuto') setTipoAnnuncio('Cerco / Mi serve');
                      else if (TIPI_CERCO_AIUTO_FORM.includes(tipoAnnuncio)) setTipoAnnuncio('In vendita');
                    }}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  >
                    {CATEGORIE_FORM.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Cerco / Aiuto">Cerco / Aiuto</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                    {isFormCercoAiuto ? 'Tipo richiesta' : 'Tipologia'}
                  </label>
                  <select
                    value={tipoAnnuncio}
                    onChange={(e) => setTipoAnnuncio(e.target.value)}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  >
                    {(isFormCercoAiuto ? TIPI_CERCO_AIUTO_FORM : TIPI_FORM).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>Titolo *</label>
                <input
                  type="text"
                  placeholder="Es. Bici città, Trapano, Passaggio turno..."
                  value={titolo}
                  onChange={(e) => setTitolo(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {!isFormCercoAiuto && tipoAnnuncio !== 'In regalo' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                    Prezzo (€){tipoAnnuncio === 'A noleggio' ? ' al giorno' : ''}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Es. 35"
                    value={prezzo}
                    onChange={(e) => setPrezzo(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              )}

              {!isFormCercoAiuto && tipoAnnuncio !== 'In regalo' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>Pagamenti accettati</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {MODALITA_PAGAMENTO.map((m) => {
                      const attiva = pagamentiAnnuncio.includes(m.label);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => togglePagamentoInLista(pagamentiAnnuncio, setPagamentiAnnuncio, m.label)}
                          style={{
                            padding: '5px 9px',
                            borderRadius: '999px',
                            border: attiva ? '1px solid #2563eb' : '1px solid #cbd5e1',
                            background: attiva ? '#eff6ff' : '#fff',
                            color: attiva ? '#1d4ed8' : '#475569',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {m.icon} {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>Descrizione *</label>
                <textarea
                  rows={3}
                  placeholder="Condizioni, ritiro o dettagli utili..."
                  value={descrizione}
                  onChange={(e) => setDescrizione(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '11px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
                  color: '#fff',
                  fontFamily: fontHeading,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Pubblicazione...' : 'Pubblica'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 70,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.15rem' }}>⚙️ Impostazioni & Annunci</h2>
              <button type="button" onClick={() => setShowSettingsModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.15rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.82rem' }}>
                  <strong>Notifiche telefono:</strong> {notifPermission}
                </div>
                <button
                  type="button"
                  onClick={() => richiediPermessoNotifiche(true)}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 11px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Abilita / Testa
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Suoneria:</label>
                <select
                  value={settings.suoneria}
                  onChange={(e) => setSettings((prev) => ({ ...prev, suoneria: e.target.value }))}
                  style={{ padding: '6px 9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  {SUONERIE.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => playNotificationSound(settings.suoneria)}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🔊 Prova
                </button>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Metodi di pagamento preferiti</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {MODALITA_PAGAMENTO.map((m) => {
                    const attiva = (settings.pagamentiPreferiti || []).includes(m.label);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => togglePagamentoPreferito(m.label)}
                        style={{
                          padding: '5px 9px',
                          borderRadius: '999px',
                          border: attiva ? '1px solid #0f172a' : '1px solid #cbd5e1',
                          background: attiva ? '#0f172a' : '#fff',
                          color: attiva ? '#fff' : '#475569',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {m.icon} {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setSettingsTab('attivi')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '10px',
                  border: settingsTab === 'attivi' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: settingsTab === 'attivi' ? '#eff6ff' : '#fff',
                  color: settingsTab === 'attivi' ? '#1d4ed8' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Attivi ({mieiAnnunciAttivi.length})
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('venduti')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '10px',
                  border: settingsTab === 'venduti' ? '1px solid #dc2626' : '1px solid #e2e8f0',
                  background: settingsTab === 'venduti' ? '#fef2f2' : '#fff',
                  color: settingsTab === 'venduti' ? '#b91c1c' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Venduti ({mieiAnnunciVenduti.length})
              </button>
            </div>

            {listaAnnunciImpostazioni.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Nessun annuncio in questa scheda.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {listaAnnunciImpostazioni.map((item) => {
                  const venduto = isAnnuncioVenduto(item);
                  return (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.titolo}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{formatPrezzoCard(item)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => apriModificaAnnuncio(item)}
                          style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 9px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatoVenduto(item)}
                          style={{ background: venduto ? '#ecfdf5' : '#fef3c7', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 9px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          {venduto ? 'Riapri' : 'Venduto'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnnuncioDaEliminare(item)}
                          style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '5px 9px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {annuncioInModifica && (
        <div
          onClick={() => setAnnuncioInModifica(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 80,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              width: '100%',
              maxWidth: '460px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.12rem' }}>Modifica annuncio</h2>
              <button type="button" onClick={() => setAnnuncioInModifica(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.15rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvaModificaAnnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={editForm.titolo}
                onChange={(e) => setEditForm((prev) => ({ ...prev, titolo: e.target.value }))}
                required
                style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select
                  value={editForm.categoria}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, categoria: e.target.value }))}
                  style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                >
                  {[...CATEGORIE_FORM, 'Cerco / Aiuto'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Prezzo €"
                  value={editForm.prezzo}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, prezzo: e.target.value }))}
                  style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={Boolean(editForm.venduto)}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, venduto: e.target.checked }))}
                />
                Segna come VENDUTO
              </label>
              <textarea
                rows={3}
                value={editForm.descrizione}
                onChange={(e) => setEditForm((prev) => ({ ...prev, descrizione: e.target.value }))}
                required
                style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <button
                type="submit"
                disabled={salvataggioModifica}
                style={{ padding: '11px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', fontFamily: fontHeading, fontWeight: 800, cursor: 'pointer' }}
              >
                {salvataggioModifica ? 'Salvataggio...' : 'Salva'}
              </button>
            </form>
          </div>
        </div>
      )}

      {annuncioDaEliminare && (
        <div
          onClick={() => setAnnuncioDaEliminare(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 85,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', padding: '20px', width: '100%', maxWidth: '370px' }}>
            <h3 style={{ margin: '0 0 8px', fontFamily: fontHeading, fontSize: '1.08rem' }}>Eliminare l’annuncio?</h3>
            <p style={{ margin: '0 0 14px', fontSize: '0.86rem', color: '#475569' }}>
              Rimuovere <strong>"{annuncioDaEliminare.titolo}"</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setAnnuncioDaEliminare(null)} style={{ padding: '8px 13px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                Annulla
              </button>
              <button type="button" onClick={confermaEliminazioneAnnuncio} style={{ padding: '8px 13px', borderRadius: '10px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {chatAperta && (
        <div
          onClick={() => setChatAperta(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 80,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '470px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{ background: '#0f172a', color: '#fff', padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: fontHeading, fontWeight: 800, fontSize: '0.98rem' }}>💬 {chatAperta.altroUtente}</div>
                <div style={{ fontSize: '0.74rem', color: '#38bdf8' }}>{chatAperta.annuncio?.titolo || 'Chat'}</div>
              </div>
              <button type="button" onClick={() => setChatAperta(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.15rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc' }}>
              {messaggiChatAttiva.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>Scrivi il primo messaggio a {chatAperta.altroUtente}.</p>
              ) : (
                messaggiChatAttiva.map((m, idx) => {
                  const mioNome = extractBaseName(userProfile.nome).toLowerCase();
                  const isMio = extractBaseName(m.mittente).toLowerCase() === mioNome;
                  return (
                    <div
                      key={m.id || idx}
                      style={{
                        alignSelf: isMio ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: isMio ? '#2563eb' : '#ffffff',
                        color: isMio ? '#ffffff' : '#0f172a',
                        border: isMio ? 'none' : '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '8px 12px',
                        fontSize: '0.86rem',
                      }}
                    >
                      {m.testo}
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleInviaMessaggio} style={{ padding: '10px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Scrivi un messaggio..."
                value={nuovoMessaggio}
                onChange={(e) => setNuovoMessaggio(e.target.value)}
                style={{ flex: 1, padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <button
                type="submit"
                disabled={invioMessaggio}
                style={{ padding: '9px 14px', borderRadius: '10px', border: 'none', background: '#0f172a', color: '#fff', fontFamily: fontHeading, fontWeight: 800, cursor: 'pointer' }}
              >
                Invia
              </button>
            </form>
          </div>
        </div>
      )}

      {utenteDaValutare && (
        <div
          onClick={() => setUtenteDaValutare(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 85,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '390px' }}>
            <h3 style={{ margin: '0 0 6px', fontFamily: fontHeading, fontSize: '1.1rem' }}>Valuta {utenteDaValutare}</h3>
            <form onSubmit={handleSalvaValutazione} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStelleSelezionate(n)}
                    style={{ background: 'transparent', border: 'none', fontSize: '1.9rem', color: n <= stelleSelezionate ? '#f59e0b' : '#cbd5e1', cursor: 'pointer' }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                placeholder="Commento breve (opzionale)..."
                value={commentoValutazione}
                onChange={(e) => setCommentoValutazione(e.target.value)}
                style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setUtenteDaValutare(null)} style={{ padding: '8px 13px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  Annulla
                </button>
                <button type="submit" disabled={invioValutazione} style={{ padding: '8px 15px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontFamily: fontHeading, fontWeight: 800, cursor: 'pointer' }}>
                  {invioValutazione ? 'Invio...' : 'Salva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
