import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://bkdmdiwqdbyimfpzzlcy.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_YQvIcQl-DbTD48tlMuIdGA_5EmW-fW_';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'TRACOLLEGHI';
const COMPANY_SUBTITLE = import.meta.env.VITE_COMPANY_SUBTITLE || 'MARKET';
const COMPANY_LOGO = import.meta.env.VITE_COMPANY_LOGO || '/icona-full-v2.jpg';

const DEFAULT_ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '2026';

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
  { id: 'carta', label: 'Visa / Mastercard', icon: '💳' },
  { id: 'contanti', label: 'Contanti', icon: '💶' },
  { id: 'bonifico', label: 'Bonifico / Instant', icon: '🏦' },
  { id: 'wallet', label: 'PayPal / Apple Pay / Google Pay', icon: '📲' },
  { id: 'crypto', label: 'Criptovalute', icon: '₿' },
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
  { emoji: '☕', punti: 10, label: 'Pausa Caffè +10' },
  { emoji: '🛠️', punti: 15, label: 'Attrezzo +15' },
  { emoji: '⭐', punti: 25, label: 'Stella Bonus +25' },
  { emoji: '⚡', punti: 35, label: 'Super Turbo +35' },
  { emoji: '⚠️', punti: -15, label: 'Imprevisto -15' },
  { emoji: '💣', punti: -25, label: 'Fermo Linea -25' },
];

function extractBaseName(value) {
  return String(value || '').split(' • ')[0].trim();
}

function normalizeBadgeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
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

function parseBulkBadgeText(rawText, defaultReparto = REPARTI_AZIENDA[0]) {
  const lines = String(rawText || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const parsed = [];
  for (let i = 0; i < lines.length; i++) {
    const sep = lines[i].includes(';') ? ';' : lines[i].includes('\t') ? '\t' : ',';
    const cols = lines[i].split(sep).map((c) => c.replace(/^["']|["']$/g, '').trim());
    if (!cols[0]) continue;
    const badge = normalizeBadgeCode(cols[0]);
    if (!badge) continue;
    parsed.push({
      badge,
      nome: extractBaseName(cols[1]) || `Collega #${badge}`,
      reparto: cols[2] ? normalizeRepartoMatch(cols[2]) : defaultReparto,
      email: cols[3] && cols[3].includes('@') ? cols[3].toLowerCase() : '',
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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(soundId === 'pop' ? 720 : 660, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
}

async function sendSystemNotification(title, body, tag = 'tracolleghi-msg') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const notif = new Notification(title, { body, icon: COMPANY_LOGO, tag });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch {}
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
  if (Array.isArray(item.immagini) && item.immagini.length > 0) return item.immagini.slice(0, 4);
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
  const pair = [extractBaseName(userA).toLowerCase(), extractBaseName(userB).toLowerCase()].sort();
  return `${annuncioId}__${pair[0]}__${pair[1]}`;
}

function isAnnuncioVenduto(item) {
  return Boolean(item?.venduto) || /\[venduto\]/i.test(item?.descrizione || '');
}

function isPostCercoAiuto(item) {
  return item?.categoria === 'Cerco / Aiuto' || TIPI_CERCO_AIUTO_FORM.includes(item?.tipo);
}

function extractPagamentiFromDesc(desc) {
  const match = String(desc || '').match(/\[PAGAMENTI:\s*([^\]]+)\]/i);
  if (!match) return [];
  return match[1].split(',').map((s) => s.trim()).filter(Boolean);
}

function cleanDescrizione(desc) {
  return (desc || '')
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

export default function App() {
  const INTRO_VIDEO_VERSION = '2026-11-20-v2';
  const introVideoRef = useRef(null);
  const profilePanelRef = useRef(null);
  const waitingWorkerRef = useRef(null);
  const bersaglioIndexRef = useRef(4);

  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  const [swBannerDismissed, setSwBannerDismissed] = useState(false);
  const [swUpdating, setSwUpdating] = useState(false);

  const [introMuted, setIntroMuted] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(() => {
    try {
      return localStorage.getItem('tracolleghi_intro_seen_version') !== INTRO_VIDEO_VERSION;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!showIntroVideo || !introVideoRef.current) return;
    const vid = introVideoRef.current;
    vid.muted = introMuted;
    vid.volume = 1.0;
    vid.play().catch(() => {
      vid.muted = true;
      vid.play().catch(() => {});
    });
  }, [showIntroVideo, introMuted]);

  function chiudiIntroVideo() {
    setShowIntroVideo(false);
    try {
      localStorage.setItem('tracolleghi_intro_seen_version', INTRO_VIDEO_VERSION);
    } catch {}
  }

  function toggleIntroAudio() {
    const next = !introMuted;
    setIntroMuted(next);
    if (introVideoRef.current) {
      introVideoRef.current.muted = next;
      introVideoRef.current.volume = 1.0;
      if (!next) introVideoRef.current.play().catch(() => {});
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (reg.waiting) {
          waitingWorkerRef.current = reg.waiting;
          setSwUpdateAvailable(true);
        }
        reg.addEventListener('updatefound', () => {
          const w = reg.installing;
          if (!w) return;
          w.addEventListener('statechange', () => {
            if (w.state === 'installed' && navigator.serviceWorker.controller) {
              waitingWorkerRef.current = w;
              setSwUpdateAvailable(true);
            }
          });
        });
      })
      .catch(() => {});
  }, []);

  function applicaAggiornamentoApp() {
    setSwUpdating(true);
    try {
      localStorage.removeItem('tracolleghi_intro_seen_version');
    } catch {}
    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
    }
    setTimeout(() => window.location.reload(), 600);
  }

  const [sezioneAttiva, setSezioneAttiva] = useState('bacheca');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [filtroCercoAiuto, setFiltroCercoAiuto] = useState('Tutti');
  const [filtroConvenzioneCat, setFiltroConvenzioneCat] = useState('Tutte');
  const [filtroEventoCat, setFiltroEventoCat] = useState('Tutte');
  const [codiceCopiatoId, setCodiceCopiatoId] = useState(null);
  const [schedaAnnuncio, setSchedaAnnuncio] = useState(null);

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
        }
      );
    } catch {
      return { nome: '', badge: '', email: '', reparto: REPARTI_AZIENDA[0], fotoProfilo: '', registrato: false };
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

  useEffect(() => {
    if (!showProfileModal) return;
    const onDown = (e) => {
      if (profilePanelRef.current && !profilePanelRef.current.contains(e.target)) {
        setShowProfileModal(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showProfileModal]);

  const [adminPin] = useState(() => {
    try {
      return localStorage.getItem('tracolleghi_admin_pin_v1') || DEFAULT_ADMIN_PIN;
    } catch {
      return DEFAULT_ADMIN_PIN;
    }
  });
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTab, setAdminTab] = useState('importa');
  const [adminSavedCheck, setAdminSavedCheck] = useState(false);
  const [badgeRegistry, setBadgeRegistry] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tracolleghi_badge_registry_v1')) || [];
    } catch {
      return [];
    }
  });
  const [bulkBadgeText, setBulkBadgeText] = useState('');
  const [bulkDefaultReparto] = useState(REPARTI_AZIENDA[0]);
  const [singleBadgeForm, setSingleBadgeForm] = useState({ badge: '', nome: '', reparto: REPARTI_AZIENDA[0], email: '' });
  const [adminSearchBadge, setAdminSearchBadge] = useState('');

  const canSeeAdminOption = useMemo(() => {
    if (isAdminUnlocked) return true;
    const nomeLower = extractBaseName(userProfile.nome).toLowerCase();
    const badgeNorm = normalizeBadgeCode(userProfile.badge);
    return Boolean(
      (nomeLower && ADMIN_IDENTIFIERS.names.includes(nomeLower)) ||
        (badgeNorm && ADMIN_IDENTIFIERS.badges.includes(badgeNorm))
    );
  }, [isAdminUnlocked, userProfile.nome, userProfile.badge]);

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_badge_registry_v1', JSON.stringify(badgeRegistry));
    } catch {}
  }, [badgeRegistry]);

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
        (b.reparto || '').toLowerCase().includes(q)
    );
  }, [badgeRegistry, adminSearchBadge]);

  function showSavedPill() {
    setAdminSavedCheck(true);
    setTimeout(() => setAdminSavedCheck(false), 2400);
  }

  function handleUnlockAdmin(e) {
    e.preventDefault();
    if (adminPinInput.trim() === adminPin) {
      setIsAdminUnlocked(true);
      setAdminPinInput('');
      setErrore('');
    } else {
      setErrore('PIN Admin non corretto.');
    }
  }

  function handleConfirmBulkBadgeImport() {
    if (!bulkPreviewList.length) return;
    const map = new Map(badgeRegistry.map((b) => [normalizeBadgeCode(b.badge), b]));
    bulkPreviewList.forEach((item) => map.set(normalizeBadgeCode(item.badge), item));
    setBadgeRegistry(Array.from(map.values()));
    setBulkBadgeText('');
    setAdminTab('elenco');
    showSavedPill();
  }

  function handleAddSingleBadge(e) {
    e.preventDefault();
    const code = normalizeBadgeCode(singleBadgeForm.badge);
    if (!code) return;
    const entry = {
      badge: code,
      nome: extractBaseName(singleBadgeForm.nome) || `Collega #${code}`,
      reparto: singleBadgeForm.reparto || REPARTI_AZIENDA[0],
      email: singleBadgeForm.email.trim().toLowerCase(),
      attivo: true,
    };
    setBadgeRegistry([entry, ...badgeRegistry.filter((b) => normalizeBadgeCode(b.badge) !== code)]);
    setSingleBadgeForm({ badge: '', nome: '', reparto: REPARTI_AZIENDA[0], email: '' });
    showSavedPill();
  }

  const [eventiZona, setEventiZona] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_eventi_zona_v1'));
      return Array.isArray(saved) && saved.length > 0 ? saved : EVENTI_ZONA_INIZIALI;
    } catch {
      return EVENTI_ZONA_INIZIALI;
    }
  });
  const [showEventoForm, setShowEventoForm] = useState(false);
  const [eventoForm, setEventoForm] = useState({ categoria: 'Oggi / Weekend', titolo: '', dataOra: '', luogo: '', descrizione: '' });

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_eventi_zona_v1', JSON.stringify(eventiZona));
    } catch {}
  }, [eventiZona]);

  function handleSalvaEventoZona(e) {
    e.preventDefault();
    if (!eventoForm.titolo.trim() || !eventoForm.descrizione.trim()) return;
    setEventiZona((prev) => [
      {
        id: `ev-${Date.now()}`,
        categoria: eventoForm.categoria,
        titolo: eventoForm.titolo.trim(),
        dataOra: eventoForm.dataOra.trim() || 'Prossimamente',
        luogo: eventoForm.luogo.trim() || 'Zona locale',
        descrizione: eventoForm.descrizione.trim(),
        autore: extractBaseName(userProfile.nome) || 'Collega',
      },
      ...prev,
    ]);
    setEventoForm({ categoria: 'Oggi / Weekend', titolo: '', dataOra: '', luogo: '', descrizione: '' });
    setShowEventoForm(false);
    setAvviso('Evento aggiunto in Eventi di Zona!');
    setTimeout(() => setAvviso(''), 2500);
  }

  const eventiZonaFiltrati = useMemo(() => {
    const q = ricerca.trim().toLowerCase();
    return eventiZona.filter((ev) => {
      const okCat = filtroEventoCat === 'Tutte' || ev.categoria === filtroEventoCat;
      const okQ = !q || (ev.titolo || '').toLowerCase().includes(q) || (ev.descrizione || '').toLowerCase().includes(q) || (ev.luogo || '').toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [eventiZona, filtroEventoCat, ricerca]);

  const [settings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_settings_v3')) || {};
      return {
        suoneria: saved.suoneria || 'chime',
        notificheAttive: saved.notificheAttive !== undefined ? saved.notificheAttive : true,
        badgeNonLetti: saved.badgeNonLetti || 0,
        pagamentiPreferiti: saved.pagamentiPreferiti || ['Visa / Mastercard', 'Contanti'],
      };
    } catch {
      return { suoneria: 'chime', notificheAttive: true, badgeNonLetti: 0, pagamentiPreferiti: ['Visa / Mastercard', 'Contanti'] };
    }
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('attivi');

  const [preferitiIds, setPreferitiIds] = useState(() => {
    try {
      return (JSON.parse(localStorage.getItem('tracolleghi_preferiti_v1')) || []).map(String);
    } catch {
      return [];
    }
  });
  const [soloPreferiti, setSoloPreferiti] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_preferiti_v1', JSON.stringify(preferitiIds));
    } catch {}
  }, [preferitiIds]);

  function togglePreferito(id) {
    const key = String(id);
    setPreferitiIds((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  const [giocoAttivo, setGiocoAttivo] = useState(false);
  const [, setGiocoFinito] = useState(false);
  const [tempoRimasto, setTempoRimasto] = useState(20);
  const [punteggioGioco, setPunteggioGioco] = useState(0);
  const [cellaBersaglio, setCellaBersaglio] = useState({ index: 4, item: BERSAGLI_GIOCO[0] });
  const [classificaGioco, setClassificaGioco] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tracolleghi_classifica_v1')) || [];
    } catch {
      return [];
    }
  });

  function generaBersaglio(prevIdx = -1) {
    let idx = Math.floor(Math.random() * 9);
    if (idx === prevIdx) idx = (idx + 1) % 9;
    const item = BERSAGLI_GIOCO[Math.floor(Math.random() * BERSAGLI_GIOCO.length)];
    bersaglioIndexRef.current = idx;
    setCellaBersaglio({ index: idx, item });
  }

  function avviaPartitaGioco() {
    setPunteggioGioco(0);
    setTempoRimasto(20);
    setGiocoFinito(false);
    setGiocoAttivo(true);
    generaBersaglio(-1);
  }

  function toccaCellaGioco(idx) {
    if (!giocoAttivo || idx !== cellaBersaglio.index) return;
    const nextPts = Math.max(0, punteggioGioco + cellaBersaglio.item.punti);
    setPunteggioGioco(nextPts);
    playNotificationSound(settings.suoneria);
    generaBersaglio(idx);
  }

  useEffect(() => {
    if (!giocoAttivo) return;
    const t = setInterval(() => {
      setTempoRimasto((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setGiocoAttivo(false);
          setGiocoFinito(true);
          if (punteggioGioco > 0) {
            const rec = {
              giocatore: extractBaseName(userProfile.nome) || 'Ospite Pausa',
              reparto: userProfile.reparto || 'Altro Reparto',
              punteggio: punteggioGioco,
            };
            setClassificaGioco((curr) => {
              const updated = [rec, ...curr].sort((a, b) => b.punteggio - a.punteggio).slice(0, 30);
              try {
                localStorage.setItem('tracolleghi_classifica_v1', JSON.stringify(updated));
              } catch {}
              return updated;
            });
            supabase.from('punteggi_gioco').insert([rec]).catch(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    const m = setInterval(() => generaBersaglio(bersaglioIndexRef.current), 950);
    return () => {
      clearInterval(t);
      clearInterval(m);
    };
  }, [giocoAttivo, punteggioGioco, userProfile.nome, userProfile.reparto]);

  const [annunci, setAnnunci] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('Tutte');
  const [filtroTipo, setFiltroTipo] = useState('Tutti');
  const [ricerca, setRicerca] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [tipoAnnuncio] = useState('In vendita');
  const [categoria, setCategoria] = useState('Motori');
  const [pagamentiAnnuncio] = useState(settings.pagamentiPreferiti);
  const [fotoAnnuncio, setFotoAnnuncio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');
  const [avviso, setAvviso] = useState('');
  const [chatAperta, setChatAperta] = useState(null);
  const [messaggi, setMessaggi] = useState([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState('');

  async function fetchAnnunci() {
    try {
      const { data, error } = await supabase.from('annunci').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) setAnnunci(data);
    } catch {}
  }

  async function fetchMessaggi() {
    try {
      const { data, error } = await supabase.from('messaggi').select('*').order('created_at', { ascending: true });
      if (!error && Array.isArray(data)) setMessaggi(data);
    } catch {}
  }

  useEffect(() => {
    fetchAnnunci();
    fetchMessaggi();
    const id = setInterval(() => {
      fetchAnnunci();
      fetchMessaggi();
    }, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_user_v3', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_settings_v3', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  function handleSaveProfile(e) {
    e.preventDefault();
    if (!authForm.nome.trim()) return;
    const updated = {
      ...authForm,
      nome: extractBaseName(authForm.nome),
      badge: normalizeBadgeCode(authForm.badge),
      registrato: true,
    };
    setUserProfile(updated);
    setShowProfileModal(false);
    setAvviso(`Profilo salvato: ${updated.nome}`);
    setTimeout(() => setAvviso(''), 2500);
  }

  function apriModalePubblica() {
    if (!userProfile.registrato || !userProfile.nome.trim()) {
      setShowProfileModal(true);
      return;
    }
    if (sezioneAttiva === 'eventi') {
      setShowEventoForm(true);
      return;
    }
    if (sezioneAttiva === 'cerco_aiuto') {
      setCategoria('Cerco / Aiuto');
    } else if (categoria === 'Cerco / Aiuto') {
      setCategoria('Motori');
    }
    setShowPublishModal(true);
  }

  async function handleFotoAnnuncioChange(e) {
    const files = Array.from(e.target.files || []).slice(0, 4 - fotoAnnuncio.length);
    if (!files.length) return;
    const imgs = await Promise.all(files.map((f) => compressImageFile(f, 800, 0.68)));
    setFotoAnnuncio((prev) => [...prev, ...imgs].slice(0, 4));
  }

  const isFormCercoAiuto = categoria === 'Cerco / Aiuto';

  async function handleSubmitAnnuncio(e) {
    e.preventDefault();
    if (!titolo.trim() || !descrizione.trim()) return;
    setLoading(true);
    const prezzoNum = isFormCercoAiuto
      ? null
      : tipoAnnuncio === 'In regalo'
      ? 0
      : prezzo !== '' && !Number.isNaN(parseFloat(prezzo))
      ? parseFloat(prezzo)
      : null;

    const tagPag =
      !isFormCercoAiuto && tipoAnnuncio !== 'In regalo' && pagamentiAnnuncio.length > 0
        ? ` [PAGAMENTI: ${pagamentiAnnuncio.join(', ')}]`
        : '';

    const { error } = await supabase.from('annunci').insert([
      {
        titolo: titolo.trim(),
        descrizione: `${descrizione.trim()}${tagPag}`,
        prezzo: prezzoNum,
        categoria,
        tipo: isFormCercoAiuto ? 'Cerco / Mi serve' : tipoAnnuncio,
        reparto: userProfile.reparto || '',
        autore: `${extractBaseName(userProfile.nome)}${userProfile.reparto ? ` • ${userProfile.reparto}` : ''}`,
        autore_foto: userProfile.fotoProfilo || '',
        immagine: fotoAnnuncio.length > 0 ? JSON.stringify(fotoAnnuncio) : null,
      },
    ]);

    setLoading(false);
    if (!error) {
      setTitolo('');
      setDescrizione('');
      setPrezzo('');
      setFotoAnnuncio([]);
      setShowPublishModal(false);
      await fetchAnnunci();
    }
  }

  const annunciFiltrati = useMemo(() => {
    const q = ricerca.trim().toLowerCase();
    return annunci.filter((item) => {
      if (isPostCercoAiuto(item)) return false;
      if (soloPreferiti && !preferitiIds.includes(String(item.id))) return false;
      const okCat = filtroCategoria === 'Tutte' || item.categoria === filtroCategoria;
      const okTipo = filtroTipo === 'Tutti' || (item.tipo || 'In vendita') === filtroTipo;
      const okQ = !q || (item.titolo || '').toLowerCase().includes(q) || (item.descrizione || '').toLowerCase().includes(q);
      return okCat && okTipo && okQ;
    });
  }, [annunci, filtroCategoria, filtroTipo, ricerca, soloPreferiti, preferitiIds]);

  const postCercoAiutoFiltrati = useMemo(() => {
    const q = ricerca.trim().toLowerCase();
    return annunci.filter((item) => {
      if (!isPostCercoAiuto(item)) return false;
      const okTipo = filtroCercoAiuto === 'Tutti' || (item.tipo || 'Cerco / Mi serve') === filtroCercoAiuto;
      const okQ = !q || (item.titolo || '').toLowerCase().includes(q) || (item.descrizione || '').toLowerCase().includes(q);
      return okTipo && okQ;
    });
  }, [annunci, filtroCercoAiuto, ricerca]);

  const convenzioniFiltrate = useMemo(() => {
    const q = ricerca.trim().toLowerCase();
    return CONVENZIONI_COLLEGI.filter((c) => {
      const okCat = filtroConvenzioneCat === 'Tutte' || c.categoria === filtroConvenzioneCat;
      const okQ = !q || c.locale.toLowerCase().includes(q) || c.sconto.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [filtroConvenzioneCat, ricerca]);

  const mieiAnnunci = useMemo(() => {
    const mio = extractBaseName(userProfile.nome).toLowerCase();
    if (!mio) return [];
    return annunci.filter((a) => extractBaseName(a.autore).toLowerCase() === mio);
  }, [annunci, userProfile.nome]);

  const mieiAttivi = useMemo(() => mieiAnnunci.filter((a) => !isAnnuncioVenduto(a)), [mieiAnnunci]);
  const mieiVenduti = useMemo(() => mieiAnnunci.filter((a) => isAnnuncioVenduto(a)), [mieiAnnunci]);

  async function toggleVenduto(item) {
    const nextSold = !isAnnuncioVenduto(item);
    const base = cleanDescrizione(item.descrizione);
    const pays = extractPagamentiFromDesc(item.descrizione);
    const desc = `${base}${pays.length ? ` [PAGAMENTI: ${pays.join(', ')}]` : ''}${nextSold ? ' [VENDUTO]' : ''}`.trim();
    await supabase.from('annunci').update({ descrizione: desc }).eq('id', item.id);
    await fetchAnnunci();
  }

  async function eliminaAnnuncio(id) {
    await supabase.from('annunci').delete().eq('id', id);
    await fetchAnnunci();
  }

  const messaggiChatAttiva = useMemo(() => {
    if (!chatAperta || !userProfile.nome) return [];
    const key = buildThreadKey(chatAperta.annuncio.id, userProfile.nome, chatAperta.altroUtente);
    return messaggi.filter((m) => m.thread_key === key);
  }, [messaggi, chatAperta, userProfile.nome]);

  async function handleInviaMessaggio(e) {
    e.preventDefault();
    if (!nuovoMessaggio.trim() || !chatAperta || !userProfile.nome) return;
    const mittente = extractBaseName(userProfile.nome);
    const destinatario = extractBaseName(chatAperta.altroUtente);
    await supabase.from('messaggi').insert([
      {
        annuncio_id: String(chatAperta.annuncio.id),
        thread_key: buildThreadKey(chatAperta.annuncio.id, mittente, destinatario),
        mittente,
        destinatario,
        testo: nuovoMessaggio.trim(),
      },
    ]);
    setNuovoMessaggio('');
    await fetchMessaggi();
    if (settings.notificheAttive) {
      sendSystemNotification(COMPANY_NAME, `Messaggio inviato a ${destinatario}`, 'tracolleghi-sent');
    }
  }

  const fontHeading = "'Syne', 'Plus Jakarta Sans', sans-serif";
  const fontBody = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  const sezioneExtraAttiva = SEZIONI_EXTRA.find((s) => s.id === sezioneAttiva);

  function renderCard(item, isCerco = false) {
    const foto = normalizeImages(item);
    const venduto = isAnnuncioVenduto(item);
    const autore = extractBaseName(item.autore) || 'Collega';
    const isFav = preferitiIds.includes(String(item.id));

    return (
      <article key={item.id} className="tm-card-v" style={{ opacity: venduto ? 0.85 : 1 }}>
        <div className="tm-card-v-top">
          <div className="tm-card-v-author">
            <span className="tm-card-v-avatar">{autore.charAt(0).toUpperCase()}</span>
            <span className="tm-card-v-name">{autore}</span>
          </div>
        </div>
        <div className="tm-card-v-media" onClick={() => setSchedaAnnuncio({ item, isCerco })}>
          {foto[0] ? (
            <img src={foto[0]} alt={item.titolo} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
              {isCerco ? '🤝 Richiesta' : '📦 Nessuna foto'}
            </div>
          )}
          {venduto && (
            <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#dc2626', color: '#fff', fontSize: '0.66rem', fontWeight: 800, padding: '3px 8px', borderRadius: '7px' }}>
              VENDUTO
            </span>
          )}
          <button
            type="button"
            className="tm-card-v-heart"
            onClick={(e) => {
              e.stopPropagation();
              togglePreferito(item.id);
            }}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="tm-card-v-body" onClick={() => setSchedaAnnuncio({ item, isCerco })}>
          <div className="tm-card-v-price">{isCerco ? item.tipo || 'Richiesta' : formatPrezzoCard(item)}</div>
          <div className="tm-card-v-title">{item.titolo}</div>
          <div className="tm-card-v-meta">{isCerco ? item.reparto || 'Colleghi' : item.categoria || 'Generale'}</div>
        </div>
      </article>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: fontBody }}>
      {showIntroVideo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <video
            ref={introVideoRef}
            src="/intro-tracolleghi.mp4"
            autoPlay
            playsInline
            onEnded={chiudiIntroVideo}
            onError={chiudiIntroVideo}
            style={{ width: '100%', maxWidth: '480px', maxHeight: '82vh', borderRadius: '18px', objectFit: 'cover' }}
          />
          <div style={{ position: 'fixed', top: 'calc(18px + env(safe-area-inset-top))', right: '18px', display: 'flex', gap: '8px', zIndex: 121 }}>
            <button type="button" onClick={toggleIntroAudio} style={{ background: 'rgba(6,182,212,0.28)', color: '#fff', border: '1px solid #38bdf8', borderRadius: '999px', padding: '7px 12px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
              {introMuted ? '🔇 Audio' : '🔊 Muto'}
            </button>
            <button type="button" onClick={chiudiIntroVideo} style={{ background: 'rgba(15,23,42,0.8)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '999px', padding: '7px 14px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
              Salta ›
            </button>
          </div>
        </div>
      )}

      <style>{`
        input, textarea, select { font-size: 16px !important; }
        .tm-container { max-width: 1280px; margin: 0 auto; padding: 0 14px; }
        .tm-top-header { background: #ffffff; position: sticky; top: 0; z-index: 40; padding-top: calc(env(safe-area-inset-top) + 12px); border-bottom: 3px solid #2563eb; box-shadow: 0 4px 16px rgba(15,23,42,0.06); }
        .tm-header-top-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0; }
        .tm-brand-logo-wrap { width: 44px; height: 44px; border-radius: 12px; overflow: hidden; background: #0f172a; flex-shrink: 0; }
        .tm-brand-logo { width: 100%; height: 100%; object-fit: cover; transform: scale(1.15); display: block; }
        .tm-brand-name { font-family: ${fontHeading}; font-weight: 800; font-size: 1.05rem; color: #0f172a; line-height: 1.05; }
        .tm-brand-sub { display: inline-block; font-family: ${fontHeading}; font-weight: 800; font-size: 0.68rem; letter-spacing: 0.14em; color: #fff; background: #1d4ed8; padding: 2px 8px; border-radius: 6px; margin-top: 3px; }
        .tm-search-row { padding-bottom: 8px; }
        .tm-search-input { width: 100%; box-sizing: border-box; padding: 9px 13px; border-radius: 11px; border: 1.5px solid #e2e8f0; background: #f8fafc; outline: none; }
        .tm-filter-strip { display: flex; overflow-x: auto; gap: 7px; padding-bottom: 10px; scrollbar-width: none; }
        .tm-filter-strip::-webkit-scrollbar { display: none; }
        .tm-pill { white-space: nowrap; flex-shrink: 0; padding: 6px 13px; border-radius: 999px; border: 1.5px solid #e2e8f0; background: #fff; color: #1e293b; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
        .tm-pill.is-active { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }
        .tm-board-wrapper { padding: 14px 0 92px; }
        .tm-grid-v { display: grid; grid-template-columns: repeat(2, 1fr); gap: 13px; }
        @media (min-width: 768px) { .tm-grid-v { grid-template-columns: repeat(4, 1fr); gap: 18px; } }
        .tm-card-v { background: #fff; border-radius: 14px; overflow: hidden; border: 1.5px solid #e2e8f0; display: flex; flex-direction: column; }
        .tm-card-v-top { display: flex; align-items: center; padding: 8px 9px; gap: 6px; }
        .tm-card-v-author { display: flex; align-items: center; gap: 6px; min-width: 0; }
        .tm-card-v-avatar { width: 23px; height: 23px; border-radius: 50%; background: #dbeafe; color: #0f172a; font-size: 0.7rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; }
        .tm-card-v-name { font-size: 0.76rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tm-card-v-media { position: relative; width: 100%; aspect-ratio: 4 / 5; background: #f1f5f9; cursor: pointer; }
        .tm-card-v-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tm-card-v-heart { position: absolute; bottom: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; }
        .tm-card-v-body { padding: 9px 10px 11px; display: flex; flex-direction: column; gap: 3px; cursor: pointer; }
        .tm-card-v-price { font-size: 0.96rem; font-weight: 800; color: #0f172a; }
        .tm-card-v-title { font-size: 0.82rem; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tm-card-v-meta { font-size: 0.72rem; font-weight: 700; color: #0284c7; }
        .tm-rep-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
        .tm-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 64px; background: #fff; border-top: 1.5px solid #e2e8f0; display: grid; grid-template-columns: repeat(5, 1fr); align-items: center; z-index: 50; padding-bottom: env(safe-area-inset-bottom); }
        .tm-bottom-btn { background: transparent; border: none; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 0.67rem; font-weight: 800; color: #64748b; cursor: pointer; }
        .tm-bottom-btn.is-active { color: #1d4ed8; }
        .tm-bottom-plus { width: 44px; height: 44px; border-radius: 15px; border: none; background: #1d4ed8; color: #fff; font-size: 1.5rem; font-weight: 700; cursor: pointer; }
        .tm-more-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.48); z-index: 65; display: flex; align-items: flex-end; justify-content: center; }
        .tm-more-sheet { width: 100%; max-width: 540px; background: #fff; border-radius: 22px 22px 0 0; padding: 18px; display: flex; flex-direction: column; gap: 8px; }
        .tm-more-item { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #f8fafc; cursor: pointer; text-align: left; }
        .tm-saved-badge { background: #059669; color: #fff; border-radius: 999px; padding: 3px 10px; font-size: 0.74rem; font-weight: 800; }
      `}</style>

      {swUpdateAvailable && !swBannerDismissed && (
        <div style={{ background: '#0f172a', color: '#fff', padding: '8px 0', fontSize: '0.8rem' }}>
          <div className="tm-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Nuova versione disponibile</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={applicaAggiornamentoApp} disabled={swUpdating} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 11px', fontWeight: 700, cursor: 'pointer' }}>
                {swUpdating ? 'Aggiorno...' : 'Aggiorna'}
              </button>
              <button type="button" onClick={() => setSwBannerDismissed(true)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        </div>
      )}

      <header className="tm-top-header">
        <div className="tm-container">
          <div className="tm-header-top-row">
            <div ref={profilePanelRef} style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  setAuthForm({
                    nome: userProfile.nome || '',
                    badge: userProfile.badge || '',
                    email: userProfile.email || '',
                    reparto: userProfile.reparto || REPARTI_AZIENDA[0],
                    fotoProfilo: userProfile.fotoProfilo || '',
                  });
                  setShowProfileModal((p) => !p);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              >
                <div className="tm-brand-logo-wrap">
                  <img src={COMPANY_LOGO} alt={COMPANY_NAME} className="tm-brand-logo" />
                </div>
                <div>
                  <div className="tm-brand-name">{COMPANY_NAME}</div>
                  <span className="tm-brand-sub">{COMPANY_SUBTITLE}</span>
                </div>
              </div>

              {showProfileModal && (
                <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 10px)', left: 0, background: '#fff', borderRadius: '18px', padding: '18px', width: 'min(92vw, 400px)', boxShadow: '0 18px 40px rgba(15,23,42,0.22)', border: '1.5px solid #e2e8f0', zIndex: 90 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ fontFamily: fontHeading }}>Profilo Collega & Badge</strong>
                    <button type="button" onClick={() => setShowProfileModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" placeholder="Numero Badge (es. 1001)" value={authForm.badge} onChange={(e) => setAuthForm((p) => ({ ...p, badge: e.target.value }))} style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                    <input type="text" placeholder="Nome e Cognome *" value={authForm.nome} onChange={(e) => setAuthForm((p) => ({ ...p, nome: e.target.value }))} required style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                    <select value={authForm.reparto} onChange={(e) => setAuthForm((p) => ({ ...p, reparto: e.target.value }))} style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                      {REPARTI_AZIENDA.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button type="submit" style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Salva profilo</button>
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
              }}
              style={{ height: '36px', borderRadius: '11px', border: '1.5px solid #cbd5e1', background: '#eff6ff', color: '#0f172a', fontWeight: 800, fontSize: '0.78rem', padding: '0 12px', cursor: 'pointer' }}
            >
              🏠 Home
            </button>
          </div>

          <div className="tm-search-row">
            <input type="search" className="tm-search-input" placeholder="Cerca tra i colleghi..." value={ricerca} onChange={(e) => setRicerca(e.target.value)} />
          </div>

          {sezioneAttiva === 'bacheca' && (
            <div className="tm-filter-strip">
              {MACRO_CATEGORIE.map((cat) => (
                <button key={cat.id} type="button" className={`tm-pill ${filtroCategoria === cat.id ? 'is-active' : ''}`} onClick={() => setFiltroCategoria(cat.id)}>
                  {cat.icon} {cat.label}
                </button>
              ))}
              {TIPI_ANNUNCIO.map((t) => (
                <button key={t} type="button" className={`tm-pill ${filtroTipo === t ? 'is-active' : ''}`} onClick={() => setFiltroTipo(t)}>{t}</button>
              ))}
              <button type="button" className={`tm-pill ${soloPreferiti ? 'is-active' : ''}`} onClick={() => setSoloPreferiti((p) => !p)}>
                ❤️ Preferiti ({preferitiIds.length})
              </button>
            </div>
          )}

          {sezioneAttiva === 'cerco_aiuto' && (
            <div className="tm-filter-strip">
              {SOTTOCATEGORIE_CERCO_AIUTO.map((s) => (
                <button key={s} type="button" className={`tm-pill ${filtroCercoAiuto === s ? 'is-active' : ''}`} onClick={() => setFiltroCercoAiuto(s)}>{s}</button>
              ))}
            </div>
          )}

          {sezioneAttiva === 'convenzioni' && (
            <div className="tm-filter-strip">
              {['Tutte', 'Food & Pausa', 'Auto & Moto', 'Sport & Benessere', 'Negozi & Servizi'].map((c) => (
                <button key={c} type="button" className={`tm-pill ${filtroConvenzioneCat === c ? 'is-active' : ''}`} onClick={() => setFiltroConvenzioneCat(c)}>{c}</button>
              ))}
            </div>
          )}

          {sezioneAttiva === 'eventi' && (
            <div className="tm-filter-strip">
              <button type="button" className="tm-pill is-active" onClick={() => setShowEventoForm((p) => !p)}>
                {showEventoForm ? '✕ Chiudi' : '+ Proponi evento'}
              </button>
              {CATEGORIE_EVENTI_ZONA.map((c) => (
                <button key={c} type="button" className={`tm-pill ${filtroEventoCat === c ? 'is-active' : ''}`} onClick={() => setFiltroEventoCat(c)}>{c}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="tm-container tm-board-wrapper">
        {avviso && <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '12px', marginBottom: '12px', fontWeight: 700 }}>{avviso}</div>}
        {errore && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '12px', marginBottom: '12px', fontWeight: 700 }}>{errore}</div>}

        {sezioneAttiva === 'bacheca' && (
          <section className="tm-grid-v">
            {annunciFiltrati.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
                Nessun annuncio trovato. Premi + per pubblicare!
              </div>
            ) : (
              annunciFiltrati.map((item) => renderCard(item, false))
            )}
          </section>
        )}

        {sezioneAttiva === 'cerco_aiuto' && (
          <section className="tm-grid-v">
            {postCercoAiutoFiltrati.map((item) => renderCard(item, true))}
          </section>
        )}

        {sezioneAttiva === 'convenzioni' && (
          <section className="tm-rep-grid">
            {convenzioniFiltrate.map((conv) => (
              <article key={conv.id} style={{ background: '#fff', borderRadius: '14px', padding: '15px', border: '1.5px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8' }}>{conv.categoria} • {conv.zona}</div>
                <h3 style={{ margin: '6px 0 4px', fontFamily: fontHeading }}>{conv.locale}</h3>
                <div style={{ fontWeight: 800, color: '#047857', marginBottom: '6px' }}>{conv.sconto}</div>
                <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#475569' }}>{conv.condizioni}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator?.clipboard?.writeText?.(conv.codice).catch(() => {});
                    setCodiceCopiatoId(conv.id);
                    setTimeout(() => setCodiceCopiatoId(null), 2000);
                  }}
                  style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {codiceCopiatoId === conv.id ? `Copiato ${conv.codice} ✓` : `Copia ${conv.codice}`}
                </button>
              </article>
            ))}
          </section>
        )}

        {sezioneAttiva === 'eventi' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {showEventoForm && (
              <form onSubmit={handleSalvaEventoZona} style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1.5px solid #38bdf8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select value={eventoForm.categoria} onChange={(e) => setEventoForm((p) => ({ ...p, categoria: e.target.value }))} style={{ padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  {CATEGORIE_EVENTI_FORM.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="Titolo evento..." value={eventoForm.titolo} onChange={(e) => setEventoForm((p) => ({ ...p, titolo: e.target.value }))} required style={{ padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="Quando / Luogo..." value={eventoForm.luogo} onChange={(e) => setEventoForm((p) => ({ ...p, luogo: e.target.value }))} style={{ padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                <textarea rows={2} placeholder="Dettagli..." value={eventoForm.descrizione} onChange={(e) => setEventoForm((p) => ({ ...p, descrizione: e.target.value }))} required style={{ padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                <button type="submit" style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Pubblica evento</button>
              </form>
            )}
            <div className="tm-rep-grid">
              {eventiZonaFiltrati.map((ev) => (
                <article key={ev.id} style={{ background: '#fff', borderRadius: '14px', padding: '15px', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7' }}>{ev.categoria} • {ev.dataOra}</div>
                  <h3 style={{ margin: '6px 0 4px', fontFamily: fontHeading }}>{ev.titolo}</h3>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#047857', marginBottom: '6px' }}>📍 {ev.luogo}</div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>{ev.descrizione}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {sezioneAttiva === 'gioco' && (
          <section style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1.5px solid #e2e8f0', maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong style={{ fontFamily: fontHeading }}>Colpo d’Occhio Pausa</strong>
              <span>⏱️ {tempoRimasto}s • 🏆 {punteggioGioco} pt</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                <button key={idx} type="button" onClick={() => toccaCellaGioco(idx)} style={{ height: '68px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '1.6rem', cursor: 'pointer' }}>
                  {giocoAttivo && cellaBersaglio.index === idx ? cellaBersaglio.item.emoji : '•'}
                </button>
              ))}
            </div>
            <button type="button" onClick={avviaPartitaGioco} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
              {giocoAttivo ? 'In corso...' : '▶️ Avvia (20s)'}
            </button>
            {classificaGioco.length > 0 && (
              <div style={{ marginTop: '14px', fontSize: '0.82rem' }}>
                <strong>Classifica:</strong>
                {classificaGioco.slice(0, 5).map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>{i + 1}. {r.giocatore}</span>
                    <strong>{r.punteggio} pt</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {sezioneAttiva === 'chat' && (
          <section style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1.5px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 10px', fontFamily: fontHeading }}>Chat colleghi</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Apri un annuncio per avviare una conversazione diretta.</p>
          </section>
        )}
      </main>

      <nav className="tm-bottom-nav">
        <button type="button" className={`tm-bottom-btn ${sezioneAttiva === 'bacheca' ? 'is-active' : ''}`} onClick={() => { setShowMoreMenu(false); setSezioneAttiva('bacheca'); }}>
          <span>🛍️</span><span>Bacheca</span>
        </button>
        <button type="button" className={`tm-bottom-btn ${sezioneAttiva === 'cerco_aiuto' ? 'is-active' : ''}`} onClick={() => { setShowMoreMenu(false); setSezioneAttiva('cerco_aiuto'); }}>
          <span>🤝</span><span>Aiuto</span>
        </button>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="button" className="tm-bottom-plus" onClick={apriModalePubblica}>+</button>
        </div>
        <button type="button" className={`tm-bottom-btn ${sezioneAttiva === 'chat' ? 'is-active' : ''}`} onClick={() => { setShowMoreMenu(false); setSezioneAttiva('chat'); }}>
          <span>💬</span><span>Chat</span>
        </button>
        <button type="button" className={`tm-bottom-btn ${showMoreMenu || Boolean(sezioneExtraAttiva) ? 'is-active' : ''}`} onClick={() => setShowMoreMenu((p) => !p)}>
          <span>☰</span><span>Altro</span>
        </button>
      </nav>

      {showMoreMenu && (
        <div className="tm-more-backdrop" onClick={() => setShowMoreMenu(false)}>
          <div className="tm-more-sheet" onClick={(e) => e.stopPropagation()}>
            {SEZIONI_EXTRA.map((s) => (
              <button key={s.id} type="button" className="tm-more-item" onClick={() => { setSezioneAttiva(s.id); setShowMoreMenu(false); }}>
                <span>{s.icon} <strong>{s.label}</strong></span>
                <span>›</span>
              </button>
            ))}
            <button type="button" className="tm-more-item" onClick={() => { setShowMoreMenu(false); setShowSettingsModal(true); }}>
              <span>⚙️ <strong>Impostazioni & Annunci</strong></span>
              <span>›</span>
            </button>
            {canSeeAdminOption && (
              <button type="button" className="tm-more-item" onClick={() => { setShowMoreMenu(false); setShowAdminModal(true); }}>
                <span>🛡️ <strong>Admin Badge ({badgeRegistry.length})</strong></span>
                <span>›</span>
              </button>
            )}
          </div>
        </div>
      )}

      {showPublishModal && (
        <div onClick={() => setShowPublishModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 75 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', padding: '18px', width: '100%', maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong style={{ fontFamily: fontHeading }}>Nuovo annuncio</strong>
              <button type="button" onClick={() => setShowPublishModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmitAnnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ padding: '12px', border: '2px dashed #06b6d4', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                📷 Aggiungi foto ({fotoAnnuncio.length}/4)
                <input type="file" accept="image/*" capture="environment" multiple onChange={handleFotoAnnuncioChange} style={{ display: 'none' }} />
              </label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                {CATEGORIE_FORM.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="Cerco / Aiuto">Cerco / Aiuto</option>
              </select>
              <input type="text" placeholder="Titolo *" value={titolo} onChange={(e) => setTitolo(e.target.value)} required style={{ padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
              {!isFormCercoAiuto && tipoAnnuncio !== 'In regalo' && (
                <input type="number" step="0.01" placeholder="Prezzo €" value={prezzo} onChange={(e) => setPrezzo(e.target.value)} style={{ padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
              )}
              <textarea rows={3} placeholder="Descrizione *" value={descrizione} onChange={(e) => setDescrizione(e.target.value)} required style={{ padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
              <button type="submit" disabled={loading} style={{ padding: '11px', borderRadius: '10px', border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                {loading ? 'Pubblicazione...' : 'Pubblica'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div onClick={() => setShowSettingsModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 75 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', padding: '18px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong style={{ fontFamily: fontHeading }}>⚙️ Impostazioni & Annunci</strong>
              <button type="button" onClick={() => setShowSettingsModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button type="button" onClick={() => setSettingsTab('attivi')} style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', background: settingsTab === 'attivi' ? '#eff6ff' : '#fff', fontWeight: 700 }}>Attivi ({mieiAttivi.length})</button>
              <button type="button" onClick={() => setSettingsTab('venduti')} style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', background: settingsTab === 'venduti' ? '#fef2f2' : '#fff', fontWeight: 700 }}>Venduti ({mieiVenduti.length})</button>
            </div>
            {(settingsTab === 'attivi' ? mieiAttivi : mieiVenduti).map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>{item.titolo}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => toggleVenduto(item)} style={{ padding: '4px 8px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>{isAnnuncioVenduto(item) ? 'Riapri' : 'Venduto'}</button>
                  <button type="button" onClick={() => eliminaAnnuncio(item.id)} style={{ padding: '4px 8px', borderRadius: '7px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Elimina</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdminModal && (
        <div onClick={() => setShowAdminModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 80 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', padding: '18px', width: '100%', maxWidth: '580px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontFamily: fontHeading }}>🛡️ Admin Badge</strong>
                {adminSavedCheck && <span className="tm-saved-badge">✓ Salvato</span>}
              </div>
              <button type="button" onClick={() => setShowAdminModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            {!isAdminUnlocked ? (
              <form onSubmit={handleUnlockAdmin} style={{ display: 'flex', gap: '8px' }}>
                <input type="password" placeholder="PIN Admin (2026)" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} required style={{ flex: 1, padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                <button type="submit" style={{ padding: '9px 14px', borderRadius: '10px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>✓ Sblocca</button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => setAdminTab('importa')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: adminTab === 'importa' ? '#eff6ff' : '#fff', fontWeight: 700, fontSize: '0.78rem' }}>📥 Importa</button>
                  <button type="button" onClick={() => setAdminTab('elenco')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: adminTab === 'elenco' ? '#eff6ff' : '#fff', fontWeight: 700, fontSize: '0.78rem' }}>📋 Registro ({badgeRegistry.length})</button>
                </div>

                {adminTab === 'importa' ? (
                  <>
                    <textarea rows={4} placeholder="1001;Giancarlo Gentile;Ufficio Tecnico / Progettazione" value={bulkBadgeText} onChange={(e) => setBulkBadgeText(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }} />
                    <button type="button" onClick={handleConfirmBulkBadgeImport} style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#059669', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                      ✓ Salva {bulkPreviewList.length} Badge
                    </button>
                  </>
                ) : (
                  <>
                    <form onSubmit={handleAddSingleBadge} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <input type="text" placeholder="Badge" value={singleBadgeForm.badge} onChange={(e) => setSingleBadgeForm((p) => ({ ...p, badge: e.target.value }))} required style={{ padding: '7px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '90px' }} />
                      <input type="text" placeholder="Nome" value={singleBadgeForm.nome} onChange={(e) => setSingleBadgeForm((p) => ({ ...p, nome: e.target.value }))} style={{ padding: '7px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: 1 }} />
                      <button type="submit" style={{ padding: '7px 12px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>✓ Salva</button>
                    </form>
                    <input type="search" placeholder="Cerca badge..." value={adminSearchBadge} onChange={(e) => setAdminSearchBadge(e.target.value)} style={{ padding: '8px', borderRadius: '9px', border: '1px solid #cbd5e1' }} />
                    {filteredBadgeRegistry.map((b) => (
                      <div key={b.badge} style={{ fontSize: '0.82rem', padding: '6px 8px', background: '#f8fafc', borderRadius: '8px' }}>
                        <strong>#{b.badge}</strong> • {b.nome} ({b.reparto})
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {schedaAnnuncio && (
        <div onClick={() => setSchedaAnnuncio(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 75 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', padding: '18px', width: '100%', maxWidth: '460px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontFamily: fontHeading }}>{schedaAnnuncio.item.titolo}</strong>
              <button type="button" onClick={() => setSchedaAnnuncio(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#334155' }}>{cleanDescrizione(schedaAnnuncio.item.descrizione)}</p>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>Autore: {schedaAnnuncio.item.autore}</div>
            {extractBaseName(schedaAnnuncio.item.autore).toLowerCase() !== extractBaseName(userProfile.nome).toLowerCase() && (
              <button
                type="button"
                onClick={() => {
                  const item = schedaAnnuncio.item;
                  setSchedaAnnuncio(null);
                  setChatAperta({ annuncio: item, altroUtente: extractBaseName(item.autore) });
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                💬 Scrivi in chat
              </button>
            )}
          </div>
        </div>
      )}

      {chatAperta && (
        <div onClick={() => setChatAperta(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 85 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', width: '100%', maxWidth: '440px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: '#0f172a', color: '#fff', padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>💬 {chatAperta.altroUtente}</strong>
              <button type="button" onClick={() => setChatAperta(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {messaggiChatAttiva.map((m, idx) => (
                <div key={m.id || idx} style={{ padding: '8px 11px', borderRadius: '10px', background: '#f1f5f9', fontSize: '0.84rem' }}>
                  <strong>{m.mittente}:</strong> {m.testo}
                </div>
              ))}
            </div>
            <form onSubmit={handleInviaMessaggio} style={{ display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid #e2e8f0' }}>
              <input type="text" placeholder="Messaggio..." value={nuovoMessaggio} onChange={(e) => setNuovoMessaggio(e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: '9px', border: '1px solid #cbd5e1' }} />
              <button type="submit" style={{ padding: '8px 13px', borderRadius: '9px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Invia</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
