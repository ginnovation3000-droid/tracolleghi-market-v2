import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Credenziali Supabase del progetto tracolleghi-market (bkdmdiwqdbyimfpzzlcy)
const SUPABASE_URL = 'https://bkdmdiwqdbyimfpzzlcy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YQvIcQl-DbTD48tlMuIdGA_5EmW-fW_';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SEZIONI_APP = [
  { id: 'bacheca', label: 'Bacheca', icon: '🛍️' },
  { id: 'cerco_aiuto', label: 'Cerco / Aiuto', icon: '🤝' },
  { id: 'convenzioni', label: 'Convenzioni', icon: '🏷️' },
  { id: 'qualita', label: 'Reparti & Qualità', icon: '📊' },
  { id: 'gioco', label: 'Pausa Gioco', icon: '🎮' },
  { id: 'chat', label: 'Chat', icon: '💬' },
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

const INDICATORI_INIZIALI_REPARTI = {
  'Produzione / Linea': { giorniSenzaInfortuni: 142, livelloQualita: 98.2, infortuniAnno: 0 },
  'Ufficio Tecnico / Progettazione': { giorniSenzaInfortuni: 310, livelloQualita: 99.1, infortuniAnno: 0 },
  'Logistica / Magazzino': { giorniSenzaInfortuni: 196, livelloQualita: 97.8, infortuniAnno: 0 },
  'Qualità & Collaudo': { giorniSenzaInfortuni: 280, livelloQualita: 99.4, infortuniAnno: 0 },
  Manutenzione: { giorniSenzaInfortuni: 165, livelloQualita: 98.0, infortuniAnno: 0 },
  'Amministrazione / Acquisti / HR': { giorniSenzaInfortuni: 420, livelloQualita: 99.5, infortuniAnno: 0 },
  'Altro Reparto': { giorniSenzaInfortuni: 120, livelloQualita: 98.0, infortuniAnno: 0 },
};

const TIPI_SEGNALAZIONE_QUALITA = [
  'Difetto ripetitivo',
  'Qualità / Miglioramento',
  'Sicurezza / Quasi-infortunio',
];

const STATI_SEGNALAZIONE = ['Da verificare', 'In lavorazione', 'Risolto'];

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

  // Registrazione Service Worker per notifiche di sistema
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Sezione attiva dell'app unica: bacheca | cerco_aiuto | convenzioni | qualita | gioco | chat
  const [sezioneAttiva, setSezioneAttiva] = useState('bacheca');
  const [filtroCercoAiuto, setFiltroCercoAiuto] = useState('Tutti');
  const [filtroConvenzioneCat, setFiltroConvenzioneCat] = useState('Tutte');
  const [filtroRepartoQualita, setFiltroRepartoQualita] = useState('Tutti');
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

  // Preferiti (cuoricino ❤️) + notifica quando un preferito viene venduto
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

  // STATO REPARTI, SICUREZZA, INFORTUNI & QUALITÀ
  const [indicatoriReparti, setIndicatoriReparti] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_reparti_kpi_v1'));
      return { ...INDICATORI_INIZIALI_REPARTI, ...(saved || {}) };
    } catch {
      return INDICATORI_INIZIALI_REPARTI;
    }
  });

  const [segnalazioniQualita, setSegnalazioniQualita] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tracolleghi_qualita_logs_v1'));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [showQualitaForm, setShowQualitaForm] = useState(false);
  const [qualitaForm, setQualitaForm] = useState({
    reparto: userProfile.reparto || REPARTI_AZIENDA[0],
    tipo: 'Difetto ripetitivo',
    titolo: '',
    descrizione: '',
    foto: '',
  });
  const [repartoInModificaKpi, setRepartoInModificaKpi] = useState(null);
  const [kpiEditForm, setKpiEditForm] = useState({
    giorniSenzaInfortuni: 0,
    livelloQualita: 98.5,
    infortuniAnno: 0,
  });

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_reparti_kpi_v1', JSON.stringify(indicatoriReparti));
    } catch {}
  }, [indicatoriReparti]);

  useEffect(() => {
    try {
      localStorage.setItem('tracolleghi_qualita_logs_v1', JSON.stringify(segnalazioniQualita));
    } catch {}
  }, [segnalazioniQualita]);

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
        setShowPublishModal(false);
        setShowProfileModal(false);
        setShowSettingsModal(false);
        setAnnuncioInModifica(null);
        setAnnuncioDaEliminare(null);
        setChatAperta(null);
        setUtenteDaValutare(null);
        setRepartoInModificaKpi(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchAnnunci();
    fetchValutazioni();
    fetchClassificaGioco();
    fetchSegnalazioniQualita();
    const timerAnnunci = setInterval(() => {
      fetchAnnunci();
    }, 10000);
    return () => clearInterval(timerAnnunci);
  }, []);

  async function fetchSegnalazioniQualita() {
    try {
      const { data, error } = await supabase
        .from('segnalazioni_qualita')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        setSegnalazioniQualita(data);
      }
    } catch {
      // Fallback locale
    }
  }

  async function handleFotoQualitaChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const comp = await compressImageFile(file, 760, 0.7);
      setQualitaForm((prev) => ({ ...prev, foto: comp }));
    } catch {
      setErrore('Impossibile caricare la foto della segnalazione.');
    }
  }

  async function handleSalvaSegnalazioneQualita(e) {
    e.preventDefault();
    if (!qualitaForm.titolo.trim() || !qualitaForm.descrizione.trim()) {
      setErrore('Inserisci titolo e descrizione della segnalazione.');
      return;
    }

    const autoreNome = extractBaseName(userProfile.nome) || 'Collega';
    const record = {
      reparto: qualitaForm.reparto || REPARTI_AZIENDA[0],
      tipo: qualitaForm.tipo || 'Difetto ripetitivo',
      titolo: qualitaForm.titolo.trim(),
      descrizione: qualitaForm.descrizione.trim(),
      stato: 'Da verificare',
      autore: autoreNome,
      immagine: qualitaForm.foto || null,
      created_at: new Date().toISOString(),
    };

    setSegnalazioniQualita((prev) => [{ ...record, id: Date.now() }, ...prev]);
    setQualitaForm({
      reparto: userProfile.reparto || REPARTI_AZIENDA[0],
      tipo: 'Difetto ripetitivo',
      titolo: '',
      descrizione: '',
      foto: '',
    });
    setShowQualitaForm(false);
    setAvviso(`Segnalazione "${record.tipo}" registrata per ${record.reparto}.`);
    setTimeout(() => setAvviso(''), 3000);

    try {
      const { error } = await supabase.from('segnalazioni_qualita').insert([
        {
          reparto: record.reparto,
          tipo: record.tipo,
          titolo: record.titolo,
          descrizione: record.descrizione,
          stato: record.stato,
          autore: record.autore,
          immagine: record.immagine,
        },
      ]);
      if (!error) {
        await fetchSegnalazioniQualita();
      }
    } catch {
      // Rimane salvata in locale
    }
  }

  async function cambiaStatoSegnalazione(item, nuovoStato) {
    setSegnalazioniQualita((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, stato: nuovoStato } : s))
    );
    try {
      await supabase.from('segnalazioni_qualita').update({ stato: nuovoStato }).eq('id', item.id);
    } catch {
      // Silenzioso
    }
  }

  function incrementaGiornoSicurezzaReparto(repNome) {
    setIndicatoriReparti((prev) => {
      const att = prev[repNome] || INDICATORI_INIZIALI_REPARTI[repNome] || {
        giorniSenzaInfortuni: 0,
        livelloQualita: 98.0,
        infortuniAnno: 0,
      };
      return {
        ...prev,
        [repNome]: {
          ...att,
          giorniSenzaInfortuni: (Number(att.giorniSenzaInfortuni) || 0) + 1,
        },
      };
    });
  }

  function apriModificaKpiReparto(repNome) {
    const att = indicatoriReparti[repNome] || INDICATORI_INIZIALI_REPARTI[repNome] || {
      giorniSenzaInfortuni: 0,
      livelloQualita: 98.0,
      infortuniAnno: 0,
    };
    setRepartoInModificaKpi(repNome);
    setKpiEditForm({
      giorniSenzaInfortuni: Number(att.giorniSenzaInfortuni) || 0,
      livelloQualita: Number(att.livelloQualita) || 98.0,
      infortuniAnno: Number(att.infortuniAnno) || 0,
    });
  }

  function handleSalvaKpiReparto(e) {
    e.preventDefault();
    if (!repartoInModificaKpi) return;
    setIndicatoriReparti((prev) => ({
      ...prev,
      [repartoInModificaKpi]: {
        giorniSenzaInfortuni: Math.max(0, Number(kpiEditForm.giorniSenzaInfortuni) || 0),
        livelloQualita: Math.min(100, Math.max(0, Number(kpiEditForm.livelloQualita) || 0)),
        infortuniAnno: Math.max(0, Number(kpiEditForm.infortuniAnno) || 0),
      },
    }));
    setRepartoInModificaKpi(null);
    setAvviso('Indicatori di reparto aggiornati.');
    setTimeout(() => setAvviso(''), 2500);
  }

  const riepilogoAziendaleQualita = useMemo(() => {
    const repList = REPARTI_AZIENDA.map((rep) => {
      const kpi = indicatoriReparti[rep] || INDICATORI_INIZIALI_REPARTI[rep] || {
        giorniSenzaInfortuni: 0,
        livelloQualita: 98.0,
        infortuniAnno: 0,
      };
      const difettiAperti = segnalazioniQualita.filter(
        (s) => s.reparto === rep && s.tipo === 'Difetto ripetitivo' && s.stato !== 'Risolto'
      ).length;
      const segnalazioniAperte = segnalazioniQualita.filter(
        (s) => s.reparto === rep && s.stato !== 'Risolto'
      ).length;
      return {
        reparto: rep,
        ...kpi,
        difettiAperti,
        segnalazioniAperte,
      };
    });

    const qualitaMedia =
      repList.length > 0
        ? repList.reduce((acc, r) => acc + (Number(r.livelloQualita) || 0), 0) / repList.length
        : 0;
    const infortuniTotali = repList.reduce((acc, r) => acc + (Number(r.infortuniAnno) || 0), 0);
    const difettiRipetitiviAperti = segnalazioniQualita.filter(
      (s) => s.tipo === 'Difetto ripetitivo' && s.stato !== 'Risolto'
    ).length;

    return { repList, qualitaMedia, infortuniTotali, difettiRipetitiviAperti };
  }, [indicatoriReparti, segnalazioniQualita]);

  const segnalazioniQualitaFiltrate = useMemo(() => {
    return segnalazioniQualita.filter((s) => {
      const okRep = filtroRepartoQualita === 'Tutti' || s.reparto === filtroRepartoQualita;
      const q = ricerca.trim().toLowerCase();
      const okQ =
        !q ||
        (s.titolo || '').toLowerCase().includes(q) ||
        (s.descrizione || '').toLowerCase().includes(q) ||
        (s.reparto || '').toLowerCase().includes(q) ||
        (s.tipo || '').toLowerCase().includes(q);
      return okRep && okQ;
    });
  }, [segnalazioniQualita, filtroRepartoQualita, ricerca]);

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
        ? `❤️ Il tuo preferito "${primo.titolo}" è stato segnato come VENDUTO!`
        : `❤️ ${nuoviVenduti.length} annunci tra i tuoi preferiti sono stati venduti (tra cui "${primo.titolo}").`;

    setAvviso(testoAvviso);
    setTimeout(() => setAvviso(''), 5000);

    if (settings.notificheAttive) {
      playNotificationSound(settings.suoneria);
      sendSystemNotification(
        'Preferito venduto • TRACOLLEGHI Market',
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
      generaProssimoBersaglio(cellaBersaglio.index);
    }, 950);
    return () => clearInterval(mover);
  }, [giocoAttivo, cellaBersaglio.index]);

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
      setShowProfileModal(true);
      setErrore('Registrati prima con Badge o Email aziendale per lasciare una valutazione con stelle.');
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
            'TRACOLLEGHI Market',
            'Notifiche attive! Riceverai qui i messaggi dei tuoi colleghi.',
            'tracolleghi-test'
          );
          setAvviso('Notifiche sul telefono attivate!');
          setTimeout(() => setAvviso(''), 3000);
        }
      } else if (mostraFeedback && res === 'denied') {
        setErrore('Notifiche bloccate dal browser: abilitale nelle impostazioni del telefono per TRACOLLEGHI Market.');
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
    const updated = {
      nome: extractBaseName(authForm.nome),
      badge: authForm.badge.trim(),
      email: authForm.email.trim(),
      reparto: authForm.reparto || REPARTI_AZIENDA[0],
      fotoProfilo: authForm.fotoProfilo,
      registrato: true,
    };
    setUserProfile(updated);
    setShowProfileModal(false);
    setErrore('');
    setAvviso(`Profilo aziendale salvato: ${updated.nome} (${updated.reparto})`);
    setTimeout(() => setAvviso(''), 3500);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      richiediPermessoNotifiche(false);
    }
  }

  function apriModalePubblica(modalitaIniziale = sezioneAttiva) {
    setErrore('');
    if (modalitaIniziale === 'qualita') {
      setQualitaForm((prev) => ({
        ...prev,
        reparto: userProfile.reparto || REPARTI_AZIENDA[0],
      }));
      setShowQualitaForm(true);
      return;
    }
    if (!userProfile.registrato || !userProfile.nome.trim()) {
      setShowProfileModal(true);
      setErrore('Registrati prima con Badge o Email aziendale per pubblicare.');
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
      setShowProfileModal(true);
      setErrore('Registrati prima con Badge o Email aziendale per pubblicare.');
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
    return annunci.filter((item) => !isPostCercoAiuto(item) && !isAnnuncioVenduto(item)).slice(0, 3);
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

  function getMittentiRicevuti(annuncioId) {
    const mioNome = extractBaseName(userProfile.nome).toLowerCase();
    if (!mioNome) return [];
    const visti = new Set();
    const mittenti = [];
    for (const m of messaggi) {
      if (String(m.annuncio_id) !== String(annuncioId)) continue;
      const mittPulito = extractBaseName(m.mittente);
      const destPulito = extractBaseName(m.destinatario);
      if (mittPulito && mittPulito.toLowerCase() !== mioNome && (!destPulito || destPulito.toLowerCase() === mioNome)) {
        const key = mittPulito.toLowerCase();
        if (!visti.has(key)) {
          visti.add(key);
          mittenti.push(mittPulito);
        }
      }
    }
    return mittenti;
  }

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
      setShowProfileModal(true);
      setErrore('Registrati prima con Badge o Email aziendale per avviare una chat privata.');
      return;
    }
    const nomePulito = extractBaseName(altroUtente);
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

  function renderCardAnnuncio(item, isCercoAiutoCard = false) {
    const foto = normalizeImages(item);
    const pagamentiItem = !isCercoAiutoCard ? extractPagamentiFromDesc(item.descrizione) : [];
    const venduto = isAnnuncioVenduto(item);
    const descrizionePulita = cleanDescrizione(item.descrizione);
    const mioNome = extractBaseName(userProfile.nome).toLowerCase();
    const autorePulito = extractBaseName(item.autore);
    const isOwner = Boolean(mioNome && autorePulito.toLowerCase() === mioNome);
    const mittentiRicevuti = isOwner ? getMittentiRicevuti(item.id) : [];
    const isPreferito = preferitiIds.includes(String(item.id));
    const statsAutore = getStatsUtente(autorePulito);

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
          opacity: venduto ? 0.85 : 1,
          position: 'relative',
          border: isCercoAiutoCard
            ? '1px solid #bfdbfe'
            : venduto
            ? '1px solid #fecaca'
            : '1px solid transparent',
        }}
      >
        <button
          type="button"
          onClick={() => togglePreferito(item.id)}
          aria-label={isPreferito ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          title={isPreferito ? 'Rimuovi dai preferiti' : 'Salva nei preferiti'}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 5,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: isPreferito ? '1px solid #fecdd3' : '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.94)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.14)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          {isPreferito ? '❤️' : '🤍'}
        </button>

        <div>
          {foto.length > 0 && (
            <div
              style={{
                position: 'relative',
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
                    height: foto.length === 1 ? '185px' : '96px',
                    objectFit: 'cover',
                    display: 'block',
                    filter: venduto ? 'grayscale(45%)' : 'none',
                  }}
                />
              ))}
              {venduto && (
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: '#dc2626',
                    color: '#fff',
                    fontFamily: fontHeading,
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    letterSpacing: '0.04em',
                  }}
                >
                  VENDUTO
                </span>
              )}
            </div>
          )}

          <div style={{ padding: '14px 16px', paddingRight: foto.length === 0 ? '48px' : '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '6px',
              }}
            >
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: fontHeading,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: isCercoAiutoCard ? '#dbeafe' : '#eff6ff',
                    color: isCercoAiutoCard ? '#1e40af' : '#1d4ed8',
                    padding: '3px 9px',
                    borderRadius: '999px',
                  }}
                >
                  {isCercoAiutoCard ? item.tipo || 'Cerco / Mi serve' : item.categoria || 'Generale'}
                </span>
                {venduto && foto.length === 0 && (
                  <span
                    style={{
                      fontFamily: fontHeading,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: '#fee2e2',
                      color: '#b91c1c',
                      padding: '3px 9px',
                      borderRadius: '999px',
                    }}
                  >
                    VENDUTO
                  </span>
                )}
              </div>

              {!isCercoAiutoCard && (
                <span
                  style={{
                    fontWeight: 700,
                    color: venduto ? '#94a3b8' : '#0f766e',
                    textDecoration: venduto ? 'line-through' : 'none',
                    fontSize: '0.94rem',
                  }}
                >
                  {item.tipo === 'In regalo' || item.prezzo === 0
                    ? 'IN REGALO'
                    : item.prezzo != null
                    ? `€ ${item.prezzo}${item.tipo === 'A noleggio' ? '/gg' : ''}`
                    : item.tipo || 'In vendita'}
                </span>
              )}
            </div>

            <h3 style={{ margin: '6px 0', fontFamily: fontHeading, fontSize: '1.06rem' }}>{item.titolo}</h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.45 }}>
              {descrizionePulita}
            </p>

            {pagamentiItem.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                {pagamentiItem.map((p) => (
                  <span
                    key={p}
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #e2e8f0',
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
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
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {item.autore_foto ? (
              <img
                src={item.autore_foto}
                alt={item.autore}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : null}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.autore || 'Collega'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                {renderStarsInline(statsAutore.media, statsAutore.totale)}
                {!isOwner && autorePulito && (
                  <button
                    type="button"
                    onClick={() => apriModaleValutaUtente(autorePulito)}
                    style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      padding: '1px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {statsAutore.mieStelle > 0 ? `Tuo voto: ${statsAutore.mieStelle}★` : 'Valuta ★'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
            {!isOwner && autorePulito && !venduto && (
              <button
                type="button"
                onClick={() => apriChatPrivata(item, autorePulito)}
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
                {isCercoAiutoCard ? 'Rispondi' : 'Chatta'}
              </button>
            )}

            {isOwner && mittentiRicevuti.length > 0 && (
              <button
                type="button"
                onClick={() => apriChatPrivata(item, mittentiRicevuti[0])}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                💬 Chat ({mittentiRicevuti.length})
              </button>
            )}

            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  setSettingsTab(venduto ? 'venduti' : 'attivi');
                  setShowSettingsModal(true);
                }}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  borderRadius: '9px',
                  padding: '5px 9px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Gestisci
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', color: '#182230', fontFamily: fontBody }}>
      <style>{`
        input, textarea, select {
          font-size: 16px !important;
        }
        .tm-container {
          max-width: 1280px;
          margin: 0 auto;
          padding-left: 20px;
          padding-right: 20px;
        }
        .tm-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .tm-header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .tm-header-logo {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          object-fit: cover;
          display: block;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
        }
        .tm-header-title-wrap {
          flex-shrink: 0;
        }
        .tm-header-title {
          margin: 0;
          font-family: ${fontHeading};
          font-weight: 800;
          font-size: 1.42rem;
          letter-spacing: -0.02em;
          line-height: 1.1;
          white-space: nowrap;
        }
        .tm-header-subtitle {
          margin: 3px 0 0;
          font-size: 0.74rem;
          color: rgba(255, 255, 255, 0.85);
          white-space: nowrap;
        }
        .tm-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          min-width: 0;
        }
        .tm-profile-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255, 255, 255, 0.16);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 999px;
          padding: 5px 12px 5px 5px;
          cursor: pointer;
          font-family: ${fontBody};
          font-weight: 600;
          font-size: 0.82rem;
          backdrop-filter: blur(6px);
          max-width: 190px;
        }
        .tm-profile-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tm-main-tabs {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 8px;
          padding-bottom: 6px;
          margin-bottom: 10px;
          border-bottom: 1px solid #e2e8f0;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }
        .tm-categories-strip {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 8px;
          padding-bottom: 4px;
          margin-bottom: 10px;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }
        .tm-category-pill {
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tm-search-row {
          display: flex;
          gap: 10px;
          align-items: stretch;
          flex-wrap: wrap;
        }
        .tm-board-wrapper {
          padding-top: 18px;
          padding-bottom: 108px;
        }
        .tm-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
        }
        .tm-kpi-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
        }
        .tm-rep-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
        }
        .tm-game-layout {
          display: grid;
          grid-template-columns: minmax(290px, 430px) minmax(280px, 1fr);
          gap: 18px;
          align-items: start;
        }
        .tm-fab-publish {
          position: fixed;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 45;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1b365d 0%, #2563eb 100%);
          color: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.92);
          border-radius: 999px;
          padding: 14px 34px;
          font-family: ${fontHeading};
          font-weight: 800;
          font-size: 1.02rem;
          letter-spacing: 0.02em;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.38), 0 4px 10px rgba(15, 23, 42, 0.18);
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }
        .tm-fab-publish:hover {
          transform: translateX(-50%) translateY(-2px);
          box-shadow: 0 16px 32px rgba(37, 99, 235, 0.45), 0 6px 14px rgba(15, 23, 42, 0.22);
        }
        .tm-fab-publish:active {
          transform: translateX(-50%) scale(0.97);
        }
        @media (max-width: 900px) {
          .tm-container {
            padding-left: 14px;
            padding-right: 14px;
          }
          .tm-board-wrapper {
            padding-top: 14px;
            padding-bottom: 104px;
          }
          .tm-header-subtitle {
            display: none;
          }
          .tm-game-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .tm-header-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .tm-header-brand {
            justify-content: flex-start;
            width: 100%;
          }
          .tm-header-logo {
            width: 44px;
            height: 44px;
          }
          .tm-header-title {
            font-size: 1.24rem;
          }
          .tm-header-actions {
            width: 100%;
            justify-content: space-between;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.14);
          }
          .tm-profile-btn {
            max-width: calc(100% - 54px);
          }
        }
      `}</style>

      <header
        style={{
          background: 'linear-gradient(135deg, #13294b 0%, #1b365d 52%, #2563eb 100%)',
          color: '#fff',
          padding: '12px 0',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 4px 14px rgba(19, 41, 75, 0.16)',
        }}
      >
        <div className="tm-container tm-header-bar">
          <div className="tm-header-brand">
            <img
              src="/icona-tracolleghi.jpg"
              alt="TRACOLLEGHI Market"
              className="tm-header-logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="tm-header-title-wrap">
              <h1 className="tm-header-title">
                TRACOLLEGHI <span style={{ color: '#93c5fd', fontWeight: 700 }}>Market</span>
              </h1>
              <p className="tm-header-subtitle">
                L’app unica tra colleghi • Bacheca, Cerco/Aiuto, Convenzioni, Qualità, Gioco & Chat
              </p>
            </div>
          </div>

          <div className="tm-header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              {settings.badgeNonLetti > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '999px',
                    flexShrink: 0,
                  }}
                >
                  {settings.badgeNonLetti}
                </span>
              )}

              <button
                type="button"
                className="tm-profile-btn"
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
              >
                {userProfile.fotoProfilo ? (
                  <img
                    src={userProfile.fotoProfilo}
                    alt={userProfile.nome || 'Profilo'}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      color: '#1b365d',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      flexShrink: 0,
                    }}
                  >
                    {(userProfile.nome || 'B').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="tm-profile-label">
                  {userProfile.registrato && userProfile.nome
                    ? `${userProfile.nome}${userProfile.badge ? ` • #${userProfile.badge}` : ''}`
                    : 'Accedi con Badge'}
                </span>
              </button>
            </div>

            <button
              type="button"
              aria-label="Impostazioni e Annunci"
              title="Impostazioni & Gestione Annunci"
              onClick={() => {
                setSettingsTab('attivi');
                setShowSettingsModal(true);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.28)',
                background: 'rgba(255,255,255,0.16)',
                color: '#fff',
                fontSize: '1.05rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backdropFilter: 'blur(6px)',
              }}
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <section
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          padding: '10px 0 14px',
        }}
      >
        <div className="tm-container">
          <nav className="tm-main-tabs" aria-label="Sezioni principali">
            {SEZIONI_APP.map((sez) => {
              const attiva = sezioneAttiva === sez.id;
              return (
                <button
                  key={sez.id}
                  type="button"
                  className="tm-category-pill"
                  onClick={() => {
                    setSezioneAttiva(sez.id);
                    if (sez.id === 'chat') {
                      setSettings((prev) => ({ ...prev, badgeNonLetti: 0 }));
                      fetchMessaggi();
                    }
                    if (sez.id === 'gioco') {
                      fetchClassificaGioco();
                    }
                    if (sez.id === 'qualita') {
                      fetchSegnalazioniQualita();
                    }
                  }}
                  style={{
                    fontFamily: fontHeading,
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    padding: '8px 15px',
                    borderRadius: '12px',
                    border: attiva ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    background: attiva ? '#2563eb' : '#f8fafc',
                    color: attiva ? '#fff' : '#1e293b',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                  }}
                >
                  <span>{sez.icon}</span>
                  <span>{sez.label}</span>
                  {sez.id === 'chat' && settings.badgeNonLetti > 0 && (
                    <span
                      style={{
                        background: attiva ? '#fff' : '#ef4444',
                        color: attiva ? '#2563eb' : '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '999px',
                      }}
                    >
                      {settings.badgeNonLetti}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {sezioneAttiva === 'bacheca' && (
            <>
              <div className="tm-categories-strip">
                {MACRO_CATEGORIE.map((cat) => {
                  const attiva = filtroCategoria === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className="tm-category-pill"
                      onClick={() => setFiltroCategoria(cat.id)}
                      style={{
                        fontFamily: fontHeading,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        border: attiva ? '1px solid #1b365d' : '1px solid #e2e8f0',
                        background: attiva ? '#1b365d' : '#f8fafc',
                        color: attiva ? '#fff' : '#334155',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="tm-search-row">
                <div style={{ position: 'relative', flex: '1 1 320px' }}>
                  <input
                    type="search"
                    placeholder="Cerca tra i colleghi (es. Bici, Trapano, Reparto...)"
                    value={ricerca}
                    onChange={(e) => setRicerca(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 14px',
                      borderRadius: '11px',
                      border: '2px solid #cbd5e1',
                      fontFamily: fontBody,
                      background: '#f8fafc',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
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
                          fontSize: '0.78rem',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: attivo ? '1px solid #2563eb' : '1px solid #dbe2ec',
                          background: attivo ? '#eff6ff' : '#fff',
                          color: attivo ? '#1d4ed8' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {tipo}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setSoloPreferiti((prev) => !prev)}
                    style={{
                      fontFamily: fontHeading,
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: soloPreferiti ? '1px solid #e11d48' : '1px solid #dbe2ec',
                      background: soloPreferiti ? '#fff1f2' : '#fff',
                      color: soloPreferiti ? '#be123c' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    ❤️ Preferiti ({preferitiIds.length})
                  </button>
                </div>
              </div>
            </>
          )}

          {sezioneAttiva === 'cerco_aiuto' && (
            <>
              <div className="tm-categories-strip">
                {SOTTOCATEGORIE_CERCO_AIUTO.map((sub) => {
                  const attiva = filtroCercoAiuto === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      className="tm-category-pill"
                      onClick={() => setFiltroCercoAiuto(sub)}
                      style={{
                        fontFamily: fontHeading,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        border: attiva ? '1px solid #1b365d' : '1px solid #e2e8f0',
                        background: attiva ? '#1b365d' : '#f8fafc',
                        color: attiva ? '#fff' : '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
              <input
                type="search"
                placeholder="Cerca richieste, passaggi turno, oggetti trovati o avvisi..."
                value={ricerca}
                onChange={(e) => setRicerca(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: '11px',
                  border: '2px solid #cbd5e1',
                  fontFamily: fontBody,
                  background: '#f8fafc',
                }}
              />
            </>
          )}

          {sezioneAttiva === 'convenzioni' && (
            <>
              <div className="tm-categories-strip">
                {['Tutte', 'Food & Pausa', 'Auto & Moto', 'Sport & Benessere', 'Negozi & Servizi'].map((cat) => {
                  const attiva = filtroConvenzioneCat === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className="tm-category-pill"
                      onClick={() => setFiltroConvenzioneCat(cat)}
                      style={{
                        fontFamily: fontHeading,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        border: attiva ? '1px solid #1b365d' : '1px solid #e2e8f0',
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
              <input
                type="search"
                placeholder="Cerca convenzioni per locale, sconto o zona..."
                value={ricerca}
                onChange={(e) => setRicerca(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: '11px',
                  border: '2px solid #cbd5e1',
                  fontFamily: fontBody,
                  background: '#f8fafc',
                }}
              />
            </>
          )}

          {sezioneAttiva === 'qualita' && (
            <>
              <div className="tm-categories-strip">
                {['Tutti', ...REPARTI_AZIENDA].map((rep) => {
                  const attiva = filtroRepartoQualita === rep;
                  return (
                    <button
                      key={rep}
                      type="button"
                      className="tm-category-pill"
                      onClick={() => setFiltroRepartoQualita(rep)}
                      style={{
                        fontFamily: fontHeading,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        border: attiva ? '1px solid #1b365d' : '1px solid #e2e8f0',
                        background: attiva ? '#1b365d' : '#f8fafc',
                        color: attiva ? '#fff' : '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      {rep}
                    </button>
                  );
                })}
              </div>
              <div className="tm-search-row">
                <input
                  type="search"
                  placeholder="Cerca difetti ripetitivi, segnalazioni qualità o sicurezza..."
                  value={ricerca}
                  onChange={(e) => setRicerca(e.target.value)}
                  style={{
                    flex: '1 1 280px',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    borderRadius: '11px',
                    border: '2px solid #cbd5e1',
                    fontFamily: fontBody,
                    background: '#f8fafc',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowQualitaForm((prev) => !prev)}
                  style={{
                    fontFamily: fontHeading,
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    padding: '10px 15px',
                    borderRadius: '11px',
                    border: 'none',
                    background: '#1b365d',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {showQualitaForm ? 'Chiudi modulo' : '+ Segnala difetto / qualità'}
                </button>
              </div>
            </>
          )}

          {sezioneAttiva === 'gioco' && (
            <div style={{ fontSize: '0.84rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>
                <strong>🎮 Sfida Pausa Caffè (20 secondi):</strong> tocca al volo ☕ (+10), 🛠️ (+15), ⭐ (+25), ⚡ (+35) ed evita ⚠️/💣!
              </span>
              <span style={{ fontWeight: 700, color: '#1b365d' }}>
                Reparto attivo: {userProfile.reparto || 'Altro Reparto'}
              </span>
            </div>
          )}
        </div>
      </section>

      <main className="tm-container tm-board-wrapper">
        {showInstallBanner && (
          <div
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #93c5fd',
              color: '#1e3a8a',
              padding: '11px 14px',
              borderRadius: '14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <strong>📲 App unica sul telefono:</strong> salva <strong>TRACOLLEGHI Market</strong> sulla Schermata Home
              (su iPhone: <em>Condividi → Aggiungi alla schermata Home</em>; su Android: <em>Menu → Installa app</em>) per
              averla sempre a portata di mano.
            </div>
            <button
              type="button"
              onClick={() => {
                setShowInstallBanner(false);
                try {
                  localStorage.setItem('tracolleghi_install_dismissed', '1');
                } catch {}
              }}
              style={{
                background: '#fff',
                border: '1px solid #93c5fd',
                color: '#1e3a8a',
                borderRadius: '8px',
                padding: '4px 10px',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              OK, capito
            </button>
          </div>
        )}

        {avviso && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              fontWeight: 600,
            }}
          >
            {avviso}
          </div>
        )}
        {errore && !showPublishModal && !showProfileModal && !annuncioInModifica && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              fontWeight: 600,
            }}
          >
            {errore}
          </div>
        )}

        {sezioneAttiva === 'bacheca' && (
          <section className="tm-cards-grid">
            {annunciFiltrati.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  color: '#64748b',
                  gridColumn: '1 / -1',
                }}
              >
                {soloPreferiti
                  ? 'Non hai ancora salvato nessun annuncio nei preferiti. Tocca il cuoricino ❤️ su un annuncio per salvarlo qui!'
                  : 'Nessun annuncio trovato con i filtri selezionati. Premi Pubblica qui in basso per inserire il primo!'}
              </div>
            ) : (
              annunciFiltrati.map((item) => renderCardAnnuncio(item, false))
            )}
          </section>
        )}

        {sezioneAttiva === 'cerco_aiuto' && (
          <section className="tm-cards-grid">
            {postCercoAiutoFiltrati.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '28px',
                  textAlign: 'center',
                  color: '#64748b',
                  gridColumn: '1 / -1',
                }}
              >
                Nessuna richiesta o avviso attivo in questa categoria. Premi <strong>Pubblica</strong> per chiedere un aiuto,
                un passaggio turno o segnalare un oggetto trovato!
              </div>
            ) : (
              postCercoAiutoFiltrati.map((item) => renderCardAnnuncio(item, true))
            )}
          </section>
        )}

        {sezioneAttiva === 'convenzioni' && (
          <section className="tm-cards-grid">
            {convenzioniFiltrate.map((conv) => (
              <article
                key={conv.id}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 2px 12px rgba(15, 23, 42, 0.05)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: fontHeading,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '3px 9px',
                        borderRadius: '999px',
                      }}
                    >
                      {conv.categoria}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>{conv.zona}</span>
                  </div>

                  <h3 style={{ margin: '10px 0 4px', fontFamily: fontHeading, fontSize: '1.06rem', color: '#0f172a' }}>
                    {conv.locale}
                  </h3>
                  <div style={{ fontWeight: 800, color: '#047857', fontSize: '0.96rem', marginBottom: '6px' }}>
                    🎁 {conv.sconto}
                  </div>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.86rem', lineHeight: 1.45 }}>
                    {conv.condizioni}
                  </p>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                  }}
                >
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Codice / Riferimento:</span>
                  <strong style={{ color: '#1b365d', letterSpacing: '0.03em' }}>{conv.codice}</strong>
                </div>
              </article>
            ))}
          </section>
        )}

        {sezioneAttiva === 'qualita' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="tm-kpi-summary">
              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>📈 LIVELLO QUALITÀ MEDIO</div>
                <div style={{ fontFamily: fontHeading, fontSize: '1.45rem', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
                  {riepilogoAziendaleQualita.qualitaMedia.toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>Media sui reparti attivi</div>
              </div>

              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>🛡️ INFORTUNI SEGNALATI</div>
                <div
                  style={{
                    fontFamily: fontHeading,
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: riepilogoAziendaleQualita.infortuniTotali === 0 ? '#1d4ed8' : '#dc2626',
                    marginTop: '4px',
                  }}
                >
                  {riepilogoAziendaleQualita.infortuniTotali}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>Totale aggregato reparti</div>
              </div>

              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>🔁 DIFETTI RIPETITIVI APERTI</div>
                <div
                  style={{
                    fontFamily: fontHeading,
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: riepilogoAziendaleQualita.difettiRipetitiviAperti === 0 ? '#047857' : '#d97706',
                    marginTop: '4px',
                  }}
                >
                  {riepilogoAziendaleQualita.difettiRipetitiviAperti}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>In attesa di chiusura</div>
              </div>
            </div>

            {showQualitaForm && (
              <form
                onSubmit={handleSalvaSegnalazioneQualita}
                style={{
                  background: '#fff',
                  borderRadius: '18px',
                  padding: '18px',
                  border: '1px solid #93c5fd',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.05rem', color: '#1b365d' }}>
                    Nuova segnalazione per Caporeparto & Qualità
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowQualitaForm(false)}
                    style={{ background: 'transparent', border: 'none', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <select
                    value={qualitaForm.reparto}
                    onChange={(e) => setQualitaForm((prev) => ({ ...prev, reparto: e.target.value }))}
                    style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                  >
                    {REPARTI_AZIENDA.map((rep) => (
                      <option key={rep} value={rep}>
                        {rep}
                      </option>
                    ))}
                  </select>

                  <select
                    value={qualitaForm.tipo}
                    onChange={(e) => setQualitaForm((prev) => ({ ...prev, tipo: e.target.value }))}
                    style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                  >
                    {TIPI_SEGNALAZIONE_QUALITA.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Titolo sintetico (es. Bava su bordo stampaggio, Perdita aria linea 2...)"
                  value={qualitaForm.titolo}
                  onChange={(e) => setQualitaForm((prev) => ({ ...prev, titolo: e.target.value }))}
                  required
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />

                <textarea
                  rows={2}
                  placeholder="Descrivi dove si ripete il problema o come migliorare la qualità/sicurezza..."
                  value={qualitaForm.descrizione}
                  onChange={(e) => setQualitaForm((prev) => ({ ...prev, descrizione: e.target.value }))}
                  required
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
                    📷 {qualitaForm.foto ? 'Foto allegata ✓ (cambia)' : 'Allega foto (opzionale)'}
                    <input type="file" accept="image/*" onChange={handleFotoQualitaChange} style={{ display: 'none' }} />
                  </label>

                  <button
                    type="submit"
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#2563eb',
                      color: '#fff',
                      fontFamily: fontHeading,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Invia segnalazione
                  </button>
                </div>
              </form>
            )}

            <div>
              <h2 style={{ margin: '0 0 10px', fontFamily: fontHeading, fontSize: '1.08rem', color: '#1b365d' }}>
                🏭 Stato Sicurezza & Qualità per Reparto
              </h2>
              <div className="tm-rep-grid">
                {riepilogoAziendaleQualita.repList
                  .filter((r) => filtroRepartoQualita === 'Tutti' || r.reparto === filtroRepartoQualita)
                  .map((rep) => {
                    const qNum = Number(rep.livelloQualita) || 0;
                    const coloreQualita = qNum >= 99 ? '#047857' : qNum >= 97.5 ? '#1d4ed8' : '#d97706';
                    return (
                      <article
                        key={rep.reparto}
                        style={{
                          background: '#fff',
                          borderRadius: '16px',
                          padding: '14px 16px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <h3 style={{ margin: 0, fontFamily: fontHeading, fontSize: '0.96rem', color: '#0f172a' }}>
                            {rep.reparto}
                          </h3>
                          <button
                            type="button"
                            onClick={() => apriModificaKpiReparto(rep.reparto)}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '3px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            Aggiorna KPI
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '10px' }}>
                            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>SENZA INFORTUNI</div>
                            <div style={{ fontWeight: 800, color: '#1b365d', fontSize: '0.96rem' }}>
                              {rep.giorniSenzaInfortuni} gg
                            </div>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '10px' }}>
                            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>LIVELLO QUALITÀ</div>
                            <div style={{ fontWeight: 800, color: coloreQualita, fontSize: '0.96rem' }}>
                              {qNum.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#475569' }}>
                          <span>
                            Difetti aperti: <strong>{rep.difettiAperti}</strong> • Infortuni: <strong>{rep.infortuniAnno}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementaGiornoSicurezzaReparto(rep.reparto)}
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#047857',
                              borderRadius: '8px',
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            +1 gg sicuro
                          </button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </div>

            <div
              style={{
                background: '#fff',
                borderRadius: '18px',
                padding: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h3 style={{ margin: '0 0 12px', fontFamily: fontHeading, fontSize: '1.02rem', color: '#1b365d' }}>
                🛠️ Registro Difetti Ripetitivi, Qualità & Sicurezza ({segnalazioniQualitaFiltrate.length})
              </h3>

              {segnalazioniQualitaFiltrate.length === 0 ? (
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                  Nessuna segnalazione registrata per questo filtro. Premi <strong>+ Segnala difetto / qualità</strong> per
                  aprire la prima scheda di miglioramento.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {segnalazioniQualitaFiltrate.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: '1 1 280px' }}>
                        {s.immagine && (
                          <img
                            src={s.immagine}
                            alt={s.titolo}
                            style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                          />
                        )}
                        <div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: '#dbeafe',
                                color: '#1e40af',
                                padding: '2px 8px',
                                borderRadius: '999px',
                              }}
                            >
                              {s.reparto}
                            </span>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: s.tipo === 'Difetto ripetitivo' ? '#fef3c7' : '#e0e7ff',
                                color: s.tipo === 'Difetto ripetitivo' ? '#92400e' : '#3730a3',
                                padding: '2px 8px',
                                borderRadius: '999px',
                              }}
                            >
                              {s.tipo}
                            </span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a' }}>{s.titolo}</div>
                          <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '2px' }}>{s.descrizione}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                            Segnalato da {s.autore || 'Collega'}
                          </div>
                        </div>
                      </div>

                      <select
                        value={s.stato || 'Da verificare'}
                        onChange={(e) => cambiaStatoSegnalazione(s, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '9px',
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          color: s.stato === 'Risolto' ? '#047857' : '#1b365d',
                          cursor: 'pointer',
                        }}
                      >
                        {STATI_SEGNALAZIONE.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {sezioneAttiva === 'gioco' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="tm-game-layout">
              <div
                style={{
                  background: '#fff',
                  borderRadius: '18px',
                  padding: '18px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.14rem', color: '#1b365d' }}>
                      Colpo d’Occhio Pausa
                    </h2>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      3 colpi di fila = +5 bonus combo!
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span
                      style={{
                        background: tempoRimasto <= 5 && giocoAttivo ? '#fee2e2' : '#eff6ff',
                        color: tempoRimasto <= 5 && giocoAttivo ? '#dc2626' : '#1d4ed8',
                        fontFamily: fontHeading,
                        fontWeight: 800,
                        padding: '6px 11px',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                      }}
                    >
                      ⏱️ {tempoRimasto}s
                    </span>
                    <span
                      style={{
                        background: '#ecfdf5',
                        color: '#047857',
                        fontFamily: fontHeading,
                        fontWeight: 800,
                        padding: '6px 11px',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                      }}
                    >
                      🏆 {punteggioGioco} pt
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '12px',
                  }}
                >
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
                          height: '78px',
                          borderRadius: '14px',
                          border: hasTarget
                            ? isDanger
                              ? '2px solid #ef4444'
                              : '2px solid #2563eb'
                            : '1px solid #cbd5e1',
                          background: hasTarget
                            ? isDanger
                              ? '#fef2f2'
                              : '#eff6ff'
                            : '#ffffff',
                          fontSize: '2rem',
                          cursor: giocoAttivo ? 'pointer' : 'default',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: hasTarget ? '0 4px 12px rgba(37, 99, 235, 0.18)' : 'none',
                          transition: 'transform 0.08s ease',
                        }}
                      >
                        {hasTarget ? (
                          <>
                            <span>{cellaBersaglio.item.emoji}</span>
                            <span
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                color: isDanger ? '#dc2626' : '#1d4ed8',
                              }}
                            >
                              {cellaBersaglio.item.punti > 0
                                ? `+${cellaBersaglio.item.punti}`
                                : cellaBersaglio.item.punti}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '1rem' }}>•</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div style={{ minHeight: '22px', textAlign: 'center', fontSize: '0.84rem', fontWeight: 700, color: '#2563eb', marginBottom: '10px' }}>
                  {giocoAttivo
                    ? feedbackColpo || 'Tocca al volo le icone positive!'
                    : giocoFinito
                    ? `Partita terminata! Hai totalizzato ${punteggioGioco} punti!`
                    : 'Pronto per una sfida veloce da 20 secondi?'}
                </div>

                <button
                  type="button"
                  onClick={avviaPartitaGioco}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: giocoAttivo ? '#64748b' : 'linear-gradient(135deg, #1b365d 0%, #2563eb 100%)',
                    color: '#fff',
                    fontFamily: fontHeading,
                    fontWeight: 800,
                    fontSize: '0.96rem',
                    cursor: 'pointer',
                  }}
                >
                  {giocoAttivo ? 'Partita in corso...' : giocoFinito ? '🔄 Gioca ancora' : '▶️ Inizia sfida (20s)'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <h3 style={{ margin: '0 0 10px', fontFamily: fontHeading, fontSize: '1.02rem', color: '#1b365d' }}>
                    🏢 Classifica Reparti (Punti cumulativi)
                  </h3>
                  {classificaReparti.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                      Nessun punteggio registrato ancora. Gioca la prima partita per portare in testa il tuo reparto!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {classificaReparti.map((r, i) => (
                        <div
                          key={r.reparto}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 11px',
                            borderRadius: '10px',
                            background: i === 0 ? '#fef3c7' : '#f8fafc',
                            border: i === 0 ? '1px solid #fde68a' : '1px solid #e2e8f0',
                            fontSize: '0.84rem',
                          }}
                        >
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : `${i + 1}. `}
                            {r.reparto}
                          </span>
                          <span style={{ fontWeight: 800, color: '#1b365d' }}>{r.totale} pt</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: '#fff',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <h3 style={{ margin: '0 0 10px', fontFamily: fontHeading, fontSize: '1.02rem', color: '#1b365d' }}>
                    🏆 Record Individuale Colleghi
                  </h3>
                  {classificaIndividualeTop.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                      Nessun record personale ancora. Fai il primo punteggio!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {classificaIndividualeTop.map((row, idx) => {
                        const st = getStatsUtente(row.giocatore);
                        return (
                          <div
                            key={`${row.giocatore}-${idx}`}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 11px',
                              borderRadius: '10px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              fontSize: '0.83rem',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                #{idx + 1} {row.giocatore}{' '}
                                <span style={{ color: '#64748b', fontWeight: 500 }}>({row.reparto})</span>
                              </div>
                              <div>{renderStarsInline(st.media, st.totale)}</div>
                            </div>
                            <span style={{ fontWeight: 800, color: '#2563eb' }}>{row.punteggio} pt</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {ultimiAnnunciPerVetrinaGioco.length > 0 && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '18px',
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1rem', color: '#1b365d' }}>
                    🛍️ Ultime occasioni in Bacheca Colleghi
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSezioneAttiva('bacheca')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Vedi tutta la bacheca →
                  </button>
                </div>
                <div className="tm-cards-grid">
                  {ultimiAnnunciPerVetrinaGioco.map((item) => renderCardAnnuncio(item, false))}
                </div>
              </div>
            )}
          </section>
        )}

        {sezioneAttiva === 'chat' && (
          <section
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '18px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.05)',
            }}
          >
            <h2 style={{ margin: '0 0 12px', fontFamily: fontHeading, fontSize: '1.12rem', color: '#1b365d' }}>
              💬 Le tue chat private con i colleghi
            </h2>

            {!userProfile.registrato || !userProfile.nome.trim() ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                <p style={{ margin: '0 0 12px' }}>
                  Accedi con il tuo profilo Badge / Email aziendale per leggere e inviare messaggi privati.
                </p>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Accedi con Badge
                </button>
              </div>
            ) : conversazioniAttive.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                Non hai ancora conversazioni attive. Apri un annuncio o una richiesta in <strong>Bacheca</strong> o{' '}
                <strong>Cerco / Aiuto</strong> e premi <strong>Chatta</strong> / <strong>Rispondi</strong>.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {conversazioniAttive.map((conv) => {
                  const stAltro = getStatsUtente(conv.altroUtente);
                  return (
                    <div
                      key={conv.key}
                      onClick={() => apriChatPrivata(conv.annuncio, conv.altroUtente)}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ fontFamily: fontHeading, color: '#0f172a', fontSize: '0.95rem' }}>
                            {conv.altroUtente}
                          </strong>
                          {renderStarsInline(stAltro.media, stAltro.totale)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                          Oggetto: {conv.annuncio?.titolo || 'Annuncio'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: '#475569',
                            marginTop: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {conv.ultimoTesto}
                        </div>
                      </div>
                      <span
                        style={{
                          background: '#1b365d',
                          color: '#fff',
                          borderRadius: '9px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        Apri chat
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      <button
        type="button"
        className="tm-fab-publish"
        onClick={() => apriModalePubblica(sezioneAttiva)}
      >
        {sezioneAttiva === 'qualita'
          ? '📋 Segnala Qualità'
          : sezioneAttiva === 'cerco_aiuto'
          ? '🤝 Chiedi / Pubblica'
          : '➕ Pubblica'}
      </button>

      {/* MODALE PUBBLICA ANNUNCIO / RICHIESTA */}
      {showPublishModal && (
        <div
          onClick={() => setShowPublishModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
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
              padding: '22px',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.2rem' }}>
                {isFormCercoAiuto ? 'Pubblica richiesta / avviso Cerco & Aiuto' : 'Pubblica nuovo annuncio'}
              </h2>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {errore && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px', fontSize: '0.86rem', fontWeight: 600 }}>
                {errore}
              </div>
            )}

            <form onSubmit={handleSubmitAnnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Categoria
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoria(val);
                      if (val === 'Cerco / Aiuto') {
                        setTipoAnnuncio('Cerco / Mi serve');
                      } else if (TIPI_CERCO_AIUTO_FORM.includes(tipoAnnuncio)) {
                        setTipoAnnuncio('In vendita');
                      }
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                  >
                    {CATEGORIE_FORM.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Cerco / Aiuto">Cerco / Aiuto</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    {isFormCercoAiuto ? 'Tipo richiesta' : 'Tipologia'}
                  </label>
                  <select
                    value={tipoAnnuncio}
                    onChange={(e) => setTipoAnnuncio(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                  >
                    {(isFormCercoAiuto ? TIPI_CERCO_AIUTO_FORM : TIPI_FORM).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Titolo *
                </label>
                <input
                  type="text"
                  placeholder={
                    isFormCercoAiuto
                      ? 'Es. Cerco passaggio turno mattina o chiave dinamometrica...'
                      : 'Es. Bicicletta città, Trapano Bosch, Seggiolone...'
                  }
                  value={titolo}
                  onChange={(e) => setTitolo(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />
              </div>

              {!isFormCercoAiuto && tipoAnnuncio !== 'In regalo' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Prezzo (€){tipoAnnuncio === 'A noleggio' ? ' al giorno' : ' (opzionale)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Es. 45"
                    value={prezzo}
                    onChange={(e) => setPrezzo(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                  />
                </div>
              )}

              {!isFormCercoAiuto && tipoAnnuncio !== 'In regalo' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                    Modalità di pagamento accettate
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {MODALITA_PAGAMENTO.map((m) => {
                      const attiva = pagamentiAnnuncio.includes(m.label);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => togglePagamentoInLista(pagamentiAnnuncio, setPagamentiAnnuncio, m.label)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '999px',
                            border: attiva ? '1px solid #2563eb' : '1px solid #cbd5e1',
                            background: attiva ? '#eff6ff' : '#fff',
                            color: attiva ? '#1d4ed8' : '#475569',
                            fontSize: '0.76rem',
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
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Descrizione *
                </label>
                <textarea
                  rows={3}
                  placeholder="Condizioni, ritiro in azienda o dettagli utili per i colleghi..."
                  value={descrizione}
                  onChange={(e) => setDescrizione(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                  Foto (fino a 4 immagini)
                </label>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f1f5f9',
                    border: '1px dashed #94a3b8',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#1b365d',
                    cursor: 'pointer',
                  }}
                >
                  📷 Aggiungi foto ({fotoAnnuncio.length}/4)
                  <input type="file" accept="image/*" multiple onChange={handleFotoAnnuncioChange} style={{ display: 'none' }} />
                </label>

                {fotoAnnuncio.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {fotoAnnuncio.map((src, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img
                          src={src}
                          alt={`Anteprima ${idx + 1}`}
                          style={{ width: '72px', height: '72px', borderRadius: '10px', objectFit: 'cover', display: 'block' }}
                        />
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

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '4px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontFamily: fontHeading,
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Pubblicazione in corso...' : 'Pubblica ora'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE PROFILO BADGE */}
      {showProfileModal && (
        <div
          onClick={() => setShowProfileModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
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
              padding: '22px',
              width: '100%',
              maxWidth: '460px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.18rem' }}>
                Profilo Collega & Badge
              </h2>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {errore && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px', fontSize: '0.84rem', fontWeight: 600 }}>
                {errore}
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {authForm.fotoProfilo ? (
                  <img
                    src={authForm.fotoProfilo}
                    alt="Foto profilo"
                    style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#1b365d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                    }}
                  >
                    {(authForm.nome || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
                  Carica foto profilo
                  <input type="file" accept="image/*" onChange={handleFotoProfiloChange} style={{ display: 'none' }} />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Nome e Cognome *
                </label>
                <input
                  type="text"
                  placeholder="Es. Marco Rossi"
                  value={authForm.nome}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, nome: e.target.value }))}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Numero Badge
                  </label>
                  <input
                    type="text"
                    placeholder="Es. 0412"
                    value={authForm.badge}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, badge: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Email aziendale
                  </label>
                  <input
                    type="email"
                    placeholder="nome@azienda.it"
                    value={authForm.email}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Reparto di appartenenza
                </label>
                <select
                  value={authForm.reparto}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, reparto: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                >
                  {REPARTI_AZIENDA.map((rep) => (
                    <option key={rep} value={rep}>
                      {rep}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '4px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#1b365d',
                  color: '#fff',
                  fontFamily: fontHeading,
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                }}
              >
                Salva profilo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE IMPOSTAZIONI, PAGAMENTI & GESTIONE ANNUNCI */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
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
              padding: '22px',
              width: '100%',
              maxWidth: '580px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.18rem' }}>
                Impostazioni & I tuoi annunci
              </h2>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifiche messaggi & preferiti venduti</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    Stato telefono: <strong>{notifPermission}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => richiediPermessoNotifiche(true)}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '9px',
                    padding: '7px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Abilita / Testa notifica
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Suoneria interna:</label>
                <select
                  value={settings.suoneria}
                  onChange={(e) => setSettings((prev) => ({ ...prev, suoneria: e.target.value }))}
                  style={{ padding: '7px 10px', borderRadius: '9px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                >
                  {SUONERIE.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => playNotificationSound(settings.suoneria)}
                  style={{
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9px',
                    padding: '7px 11px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🔊 Ascolta
                </button>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Metodi di pagamento preferiti (inclusi contanti e criptovalute)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {MODALITA_PAGAMENTO.map((m) => {
                    const attivo = (settings.pagamentiPreferiti || []).includes(m.label);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => togglePagamentoPreferito(m.label)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '999px',
                          border: attiva ? '1px solid #1b365d' : '1px solid #cbd5e1',
                          background: attiva ? '#1b365d' : '#fff',
                          color: attiva ? '#fff' : '#475569',
                          fontSize: '0.76rem',
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
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: settingsTab === 'attivi' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: settingsTab === 'attivi' ? '#eff6ff' : '#fff',
                  color: settingsTab === 'attivi' ? '#1d4ed8' : '#475569',
                  fontFamily: fontHeading,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Annunci attivi ({mieiAnnunciAttivi.length})
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('venduti')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: settingsTab === 'venduti' ? '1px solid #dc2626' : '1px solid #e2e8f0',
                  background: settingsTab === 'venduti' ? '#fef2f2' : '#fff',
                  color: settingsTab === 'venduti' ? '#b91c1c' : '#475569',
                  fontFamily: fontHeading,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Venduti / Chiusi ({mieiAnnunciVenduti.length})
              </button>
            </div>

            {!userProfile.nome ? (
              <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                Imposta prima il tuo nome nel profilo Badge per gestire i tuoi annunci.
              </p>
            ) : listaAnnunciImpostazioni.length === 0 ? (
              <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                Nessun annuncio in questa scheda.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{item.titolo}</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {item.categoria} • {item.prezzo != null && item.prezzo > 0 ? `€ ${item.prezzo}` : item.tipo || 'In regalo'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => apriModificaAnnuncio(item)}
                          style={{
                            background: '#fff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '5px 9px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatoVenduto(item)}
                          style={{
                            background: venduto ? '#ecfdf5' : '#fef3c7',
                            border: venduto ? '1px solid #a7f3d0' : '1px solid #fde68a',
                            color: venduto ? '#047857' : '#92400e',
                            borderRadius: '8px',
                            padding: '5px 9px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {venduto ? 'Riapri' : 'Segna venduto'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnnuncioDaEliminare(item)}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#b91c1c',
                            borderRadius: '8px',
                            padding: '5px 9px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
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

      {/* MODALE MODIFICA ANNUNCIO */}
      {annuncioInModifica && (
        <div
          onClick={() => setAnnuncioInModifica(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
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
              padding: '22px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.15rem' }}>Modifica annuncio</h2>
              <button
                type="button"
                onClick={() => setAnnuncioInModifica(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvaModificaAnnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Titolo</label>
                <input
                  type="text"
                  value={editForm.titolo}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, titolo: e.target.value }))}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Categoria</label>
                  <select
                    value={editForm.categoria}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, categoria: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                  >
                    {[...CATEGORIE_FORM, 'Cerco / Aiuto'].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Prezzo (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.prezzo}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, prezzo: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>Pagamenti</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {MODALITA_PAGAMENTO.map((m) => {
                    const attiva = (editForm.pagamenti || []).includes(m.label);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          togglePagamentoInLista(
                            editForm.pagamenti || [],
                            (next) => setEditForm((prev) => ({ ...prev, pagamenti: next })),
                            m.label
                          )
                        }
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

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={Boolean(editForm.venduto)}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, venduto: e.target.checked }))}
                />
                Segna come VENDUTO
              </label>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Descrizione</label>
                <textarea
                  rows={3}
                  value={editForm.descrizione}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, descrizione: e.target.value }))}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />
              </div>

              <button
                type="submit"
                disabled={salvataggioModifica}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontFamily: fontHeading,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {salvataggioModifica ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE CONFERMA ELIMINAZIONE */}
      {annuncioDaEliminare && (
        <div
          onClick={() => setAnnuncioDaEliminare(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 85,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '20px',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontFamily: fontHeading, fontSize: '1.1rem' }}>Eliminare l’annuncio?</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: '#475569' }}>
              Vuoi rimuovere definitivamente <strong>"{annuncioDaEliminare.titolo}"</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setAnnuncioDaEliminare(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
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
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CHAT PRIVATA */}
      {chatAperta && (
        <div
          onClick={() => setChatAperta(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
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
              maxWidth: '480px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                background: '#1b365d',
                color: '#fff',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontFamily: fontHeading, fontWeight: 800, fontSize: '1rem' }}>
                  💬 {chatAperta.altroUtente}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#bfdbfe' }}>
                  {chatAperta.annuncio?.titolo || 'Chat tra colleghi'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatAperta(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
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
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.84rem', margin: '20px 0' }}>
                  Scrivi il primo messaggio a <strong>{chatAperta.altroUtente}</strong>.
                </p>
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
                        padding: '9px 12px',
                        fontSize: '0.88rem',
                        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.05)',
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
              style={{
                padding: '12px',
                borderTop: '1px solid #e2e8f0',
                background: '#fff',
                display: 'flex',
                gap: '8px',
              }}
            >
              <input
                type="text"
                placeholder="Scrivi un messaggio..."
                value={nuovoMessaggio}
                onChange={(e) => setNuovoMessaggio(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontFamily: fontBody,
                }}
              />
              <button
                type="submit"
                disabled={invioMessaggio}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#1b365d',
                  color: '#fff',
                  fontFamily: fontHeading,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Invia
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE VALUTAZIONE STELLE COLLEGA */}
      {utenteDaValutare && (
        <div
          onClick={() => setUtenteDaValutare(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 85,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '22px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <h3 style={{ margin: '0 0 6px', fontFamily: fontHeading, fontSize: '1.12rem' }}>
              Valuta {utenteDaValutare}
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#64748b' }}>
              Seleziona da 1 a 5 stelle in base alla correttezza e disponibilità tra colleghi.
            </p>

            <form onSubmit={handleSalvaValutazione} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '6px 0' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStelleSelezionate(n)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '2rem',
                      color: n <= stelleSelezionate ? '#f59e0b' : '#cbd5e1',
                      cursor: 'pointer',
                    }}
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
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setUtenteDaValutare(null)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={invioValutazione}
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
                  {invioValutazione ? 'Invio...' : 'Salva voto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE AGGIORNA KPI REPARTO */}
      {repartoInModificaKpi && (
        <div
          onClick={() => setRepartoInModificaKpi(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.56)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 85,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '22px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontFamily: fontHeading, fontSize: '1.1rem', color: '#1b365d' }}>
              Aggiorna KPI • {repartoInModificaKpi}
            </h3>

            <form onSubmit={handleSalvaKpiReparto} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Giorni senza infortuni
                </label>
                <input
                  type="number"
                  min="0"
                  value={kpiEditForm.giorniSenzaInfortuni}
                  onChange={(e) => setKpiEditForm((prev) => ({ ...prev, giorniSenzaInfortuni: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Livello qualità (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={kpiEditForm.livelloQualita}
                  onChange={(e) => setKpiEditForm((prev) => ({ ...prev, livelloQualita: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Infortuni registrati
                </label>
                <input
                  type="number"
                  min="0"
                  value={kpiEditForm.infortuniAnno}
                  onChange={(e) => setKpiEditForm((prev) => ({ ...prev, infortuniAnno: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setRepartoInModificaKpi(null)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#1b365d',
                    color: '#fff',
                    fontFamily: fontHeading,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Salva KPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
