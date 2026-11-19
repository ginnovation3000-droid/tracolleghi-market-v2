import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Credenziali Supabase del progetto tracolleghi-market (bkdmdiwqdbyimfpzzlcy)
const SUPABASE_URL = 'https://bkdmdiwqdbyimfpzzlcy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YQvIcQl-DbTD48tlMuIdGA_5EmW-fW_';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

function cleanDescrizione(desc) {
  return (desc || '')
    .replace(/\s*\[WELFARE OK\]\s*/gi, ' ')
    .replace(/\s*\[VENDUTO\]\s*/gi, ' ')
    .trim();
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

  // Modale Pubblica Annuncio (aperta dal tasto + Pubblica in basso)
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Impostazioni & Gestione I miei annunci
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
  const [settingsTab, setSettingsTab] = useState('miei_annunci');

  // Modifica annuncio da "I miei annunci"
  const [annuncioInModifica, setAnnuncioInModifica] = useState(null);
  const [editForm, setEditForm] = useState({
    titolo: '',
    categoria: 'Motori',
    tipo: 'In vendita',
    prezzo: '',
    welfare: false,
    venduto: false,
    descrizione: '',
  });
  const [salvataggioModifica, setSalvataggioModifica] = useState(false);

  // Annunci e filtri
  const [annunci, setAnnunci] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('Tutte');
  const [filtroTipo, setFiltroTipo] = useState('Tutti');
  const [soloWelfare, setSoloWelfare] = useState(false);
  const [ricerca, setRicerca] = useState('');

  // Form pubblicazione annuncio
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [tipoAnnuncio, setTipoAnnuncio] = useState('In vendita');
  const [categoria, setCategoria] = useState('Motori');
  const [accettaWelfare, setAccettaWelfare] = useState(false);
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

  // Tracciamento messaggi già visti (suoneria SOLO in ricezione)
  const seenMsgIdsRef = useRef(new Set());
  const initializedMsgsRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('tracolleghi_user_v3', JSON.stringify(userProfile));
  }, [userProfile]);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowPublishModal(false);
        setShowProfileModal(false);
        setShowSettingsModal(false);
        setAnnuncioInModifica(null);
        setAnnuncioDaEliminare(null);
        setChatAperta(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchAnnunci();
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
        const chatGiaApertaSuQuestoMittente =
          chatAperta &&
          extractBaseName(chatAperta.altroUtente).toLowerCase() ===
            extractBaseName(ultimoRicevuto.mittente).toLowerCase() &&
          String(chatAperta.annuncio?.id) === String(ultimoRicevuto.annuncio_id);

        if (!chatGiaApertaSuQuestoMittente) {
          if (settings.notificheAttive) {
            playNotificationSound(settings.suoneria);
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
    }, 6000);
    return () => clearInterval(timer);
  }, [userProfile.nome, settings.notificheAttive, settings.suoneria, chatAperta]);

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
  }

  function apriModalePubblica() {
    setErrore('');
    if (!userProfile.registrato || !userProfile.nome.trim()) {
      setShowProfileModal(true);
      setErrore('Registrati prima con Badge o Email aziendale per pubblicare un annuncio.');
      return;
    }
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

  async function handleSubmitAnnuncio(e) {
    e.preventDefault();
    if (!userProfile.registrato || !userProfile.nome.trim()) {
      setShowPublishModal(false);
      setShowProfileModal(true);
      setErrore('Registrati prima con Badge o Email aziendale per pubblicare un annuncio.');
      return;
    }

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

    const tagWelfare = accettaWelfare ? ' [WELFARE OK]' : '';
    const nomePulito = extractBaseName(userProfile.nome);
    const infoReparto = userProfile.reparto ? ` • ${userProfile.reparto}` : '';

    const payload = {
      titolo: titolo.trim(),
      descrizione: `${descrizione.trim()}${tagWelfare}`,
      prezzo: prezzoNum,
      categoria,
      tipo: tipoAnnuncio,
      welfare: accettaWelfare,
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
      setAccettaWelfare(false);
      setFotoAnnuncio([]);
      setShowPublishModal(false);
      setAvviso('Annuncio pubblicato in bacheca!');
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

  function apriModificaAnnuncio(item) {
    const isWelfare = Boolean(item.welfare) || /\[welfare ok\]/i.test(item.descrizione || '');
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
      categoria: CATEGORIE_FORM.includes(item.categoria) ? item.categoria : 'Generale',
      tipo: tipoRilevato,
      prezzo: item.prezzo != null ? String(item.prezzo) : '',
      welfare: isWelfare,
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

    const prezzoNum =
      editForm.tipo === 'In regalo'
        ? 0
        : editForm.prezzo !== '' && !Number.isNaN(parseFloat(editForm.prezzo))
        ? parseFloat(editForm.prezzo)
        : null;

    const tags = [
      editForm.welfare && editForm.tipo !== 'In regalo' ? '[WELFARE OK]' : '',
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
      welfare: editForm.tipo !== 'In regalo' ? editForm.welfare : false,
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
    const isWelfare = Boolean(item.welfare) || /\[welfare ok\]/i.test(item.descrizione || '');
    const baseDesc = cleanDescrizione(item.descrizione);

    const tags = [
      isWelfare ? '[WELFARE OK]' : '',
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
      setAvviso(nuovoStatoVenduto ? 'Annuncio segnato come VENDUTO!' : 'Annuncio rimesso in bacheca come disponibile.');
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
      const okCat = filtroCategoria === 'Tutte' || item.categoria === filtroCategoria;
      const tipoRilevato =
        item.tipo ||
        (item.prezzo === 0 || /\[in regalo\]/i.test(item.descrizione || '')
          ? 'In regalo'
          : /\[a noleggio\]/i.test(item.descrizione || '')
          ? 'A noleggio'
          : 'In vendita');
      const okTipo = filtroTipo === 'Tutti' || tipoRilevato === filtroTipo;
      const hasWelfare = Boolean(item.welfare) || /\[welfare ok\]/i.test(item.descrizione || '');
      const okWelfare = !soloWelfare || hasWelfare;

      const q = ricerca.trim().toLowerCase();
      const okRicerca =
        !q ||
        (item.titolo || '').toLowerCase().includes(q) ||
        (item.descrizione || '').toLowerCase().includes(q) ||
        (item.autore || '').toLowerCase().includes(q) ||
        (item.reparto || '').toLowerCase().includes(q);
      return okCat && okTipo && okWelfare && okRicerca;
    });
  }, [annunci, filtroCategoria, filtroTipo, soloWelfare, ricerca]);

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
        .tm-categories-strip {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 8px;
          padding-bottom: 4px;
          margin-bottom: 12px;
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
          padding-top: 22px;
          padding-bottom: 108px;
        }
        .tm-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
        }
        .tm-fab-publish {
          position: fixed;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 45;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #1b365d 0%, #2563eb 100%);
          color: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          padding: 13px 26px;
          font-family: ${fontHeading};
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: 0.01em;
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
            padding-top: 16px;
            padding-bottom: 104px;
          }
        }
      `}</style>

      {/* HEADER AZIENDALE CENTRATO */}
      <header
        style={{
          background: 'linear-gradient(145deg, #13294b 0%, #1b365d 48%, #2563eb 100%)',
          color: '#fff',
          padding: '18px 0 22px',
          position: 'relative',
          boxShadow: '0 8px 24px rgba(19, 41, 75, 0.16)',
        }}
      >
        <div className="tm-container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '6px',
            }}
          >
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
                  badge: userProfile.badge || '',
                  email: userProfile.email || '',
                  reparto: userProfile.reparto || REPARTI_AZIENDA[0],
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
                fontSize: '0.84rem',
                backdropFilter: 'blur(6px)',
              }}
            >
              {userProfile.fotoProfilo ? (
                <img
                  src={userProfile.fotoProfilo}
                  alt={userProfile.nome || 'Profilo'}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    color: '#1b365d',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                  }}
                >
                  {(userProfile.nome || 'B').charAt(0).toUpperCase()}
                </span>
              )}
              <span>
                {userProfile.registrato && userProfile.nome
                  ? `${userProfile.nome}${userProfile.badge ? ` • #${userProfile.badge}` : ''}`
                  : 'Accedi con Badge / Mail'}
              </span>
            </button>

            <button
              type="button"
              aria-label="Impostazioni e I miei annunci"
              title="Impostazioni & I miei annunci"
              onClick={() => {
                setSettingsTab('miei_annunci');
                setShowSettingsModal(true);
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.28)',
                background: 'rgba(255,255,255,0.16)',
                color: '#fff',
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                backdropFilter: 'blur(6px)',
              }}
            >
              ⚙️
              {mieiAnnunci.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: '#22c55e',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #1b365d',
                  }}
                >
                  {mieiAnnunci.length}
                </span>
              )}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '8px',
            }}
          >
            <img
              src="/icona-tracolleghi.jpg"
              alt="TRACOLLEGHI Market"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '22px',
                objectFit: 'cover',
                display: 'block',
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.28)',
              }}
            />

            <h1
              style={{
                margin: '2px 0 0',
                fontFamily: fontHeading,
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 3.2vw, 2rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              TRACOLLEGHI <span style={{ color: '#93c5fd', fontWeight: 700 }}>Market</span>
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: '560px',
                fontSize: '0.9rem',
                lineHeight: 1.45,
                color: 'rgba(255, 255, 255, 0.92)',
              }}
            >
              La bacheca tra colleghi di reparto per vendere, regalare o noleggiare con Badge, Mail aziendale e Welfare OK.
            </p>
          </div>
        </div>
      </header>

      {/* FASCIA SUPERIORE: MACRO-CATEGORIE + BARRA DI RICERCA */}
      <section
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          padding: '14px 0 18px',
        }}
      >
        <div className="tm-container">
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
                    fontSize: '0.84rem',
                    padding: '8px 14px',
                    borderRadius: '12px',
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
                placeholder="Cosa stai cercando tra i colleghi? (es. Bici, Trapano, Passeggino, Reparto...)"
                value={ricerca}
                onChange={(e) => setRicerca(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 16px',
                  borderRadius: '12px',
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
                      fontSize: '0.8rem',
                      padding: '10px 13px',
                      borderRadius: '11px',
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
                onClick={() => setSoloWelfare((prev) => !prev)}
                style={{
                  fontFamily: fontHeading,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '10px 13px',
                  borderRadius: '11px',
                  border: soloWelfare ? '1px solid #059669' : '1px solid #dbe2ec',
                  background: soloWelfare ? '#ecfdf5' : '#fff',
                  color: soloWelfare ? '#047857' : '#475569',
                  cursor: 'pointer',
                }}
              >
                🎟️ Solo Welfare OK
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BACHECA ANNUNCI A TUTTA LARGHEZZA */}
      <main className="tm-container tm-board-wrapper">
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
              Nessun annuncio trovato con i filtri selezionati. Premi <strong>+ Pubblica</strong> qui in basso per inserire il primo!
            </div>
          ) : (
            annunciFiltrati.map((item) => {
              const foto = normalizeImages(item);
              const isWelfare = Boolean(item.welfare) || /\[welfare ok\]/i.test(item.descrizione || '');
              const venduto = isAnnuncioVenduto(item);
              const descrizionePulita = cleanDescrizione(item.descrizione);
              const mioNome = extractBaseName(userProfile.nome).toLowerCase();
              const autorePulito = extractBaseName(item.autore);
              const isOwner = Boolean(mioNome && autorePulito.toLowerCase() === mioNome);
              const mittentiRicevuti = isOwner ? getMittentiRicevuti(item.id) : [];

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
                    border: venduto ? '1px solid #fecaca' : '1px solid transparent',
                  }}
                >
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
                              height: foto.length === 1 ? '195px' : '98px',
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

                    <div style={{ padding: '14px 16px' }}>
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
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '3px 9px',
                              borderRadius: '999px',
                            }}
                          >
                            {item.categoria || 'Generale'}
                          </span>
                          {isWelfare && (
                            <span
                              style={{
                                fontFamily: fontHeading,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: '#ecfdf5',
                                color: '#047857',
                                padding: '3px 9px',
                                borderRadius: '999px',
                              }}
                            >
                              🎟️ Welfare OK
                            </span>
                          )}
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
                      </div>

                      <h3 style={{ margin: '6px 0', fontFamily: fontHeading, fontSize: '1.08rem' }}>{item.titolo}</h3>
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.45 }}>
                        {descrizionePulita}
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
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      {item.autore_foto ? (
                        <img
                          src={item.autore_foto}
                          alt={item.autore}
                          style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : null}
                      <span
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
                      </span>
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
                          Chatta
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
                          💬 Chat ricevute ({mittentiRicevuti.length})
                        </button>
                      )}

                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsTab('miei_annunci');
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
            })
          )}
        </section>
      </main>

      {/* PULSANTE FLUTTUANTE CENTRALE IN BASSO: + PUBBLICA */}
      <button
        type="button"
        className="tm-fab-publish"
        onClick={apriModalePubblica}
        aria-label="Pubblica un nuovo annuncio"
      >
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
            fontSize: '1.35rem',
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          +
        </span>
        <span>Pubblica</span>
      </button>

      {/* MODALE PUBBLICA ANNUNCIO */}
      {showPublishModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 60,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '22px',
              maxWidth: '470px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontFamily: fontHeading, fontSize: '1.2rem', color: '#1b365d' }}>
                  Nuovo annuncio
                </h2>
                {userProfile.reparto && userProfile.registrato && (
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    Pubblichi come {userProfile.nome} • {userProfile.reparto}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {errore && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {errore}
              </div>
            )}

            <form onSubmit={handleSubmitAnnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Titolo (es. Bici, Trapano, Tavolo...)"
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                required
                style={{ padding: '11px 13px', borderRadius: '11px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  style={{ padding: '10px 11px', borderRadius: '11px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
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
                  style={{ padding: '10px 11px', borderRadius: '11px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
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
                  style={{ padding: '11px 13px', borderRadius: '11px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
                />
              )}

              {tipoAnnuncio !== 'In regalo' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    background: accettaWelfare ? '#ecfdf5' : '#f8fafc',
                    border: accettaWelfare ? '1px solid #10b981' : '1px solid #e2e8f0',
                    padding: '10px 12px',
                    borderRadius: '11px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: accettaWelfare ? '#065f46' : '#334155',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={accettaWelfare}
                    onChange={(e) => setAccettaWelfare(e.target.checked)}
                  />
                  <span>🎟️ Accetto anche Welfare aziendale / Buoni</span>
                </label>
              )}

              <textarea
                placeholder="Descrivi l'oggetto, le condizioni e come ritirarlo in azienda..."
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                rows={3}
                required
                style={{
                  padding: '11px 13px',
                  borderRadius: '11px',
                  border: '1px solid #cbd5e1',
                  fontFamily: fontBody,
                  resize: 'vertical',
                }}
              />

              {/* RIQUADRO CARICAMENTO FOTO CON ICONA */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '16px 12px',
                    borderRadius: '14px',
                    border: '2px dashed #93c5fd',
                    background: fotoAnnuncio.length >= 4 ? '#f1f5f9' : '#eff6ff',
                    color: fotoAnnuncio.length >= 4 ? '#64748b' : '#1d4ed8',
                    cursor: fotoAnnuncio.length >= 4 ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {fotoAnnuncio.length >= 4 ? 'Limite di 4 foto raggiunto' : 'Aggiungi foto dell’oggetto'}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: '#475569' }}>
                    Tocca per scattare o scegliere dalla galleria ({fotoAnnuncio.length}/4)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={fotoAnnuncio.length >= 4}
                    onChange={handleFotoAnnuncioChange}
                    style={{ display: 'none' }}
                  />
                </label>

                {fotoAnnuncio.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '10px' }}>
                    {fotoAnnuncio.map((src, idx) => (
                      <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
                        <img
                          src={src}
                          alt={`Anteprima ${idx + 1}`}
                          style={{ width: '100%', height: '66px', objectFit: 'cover', display: 'block' }}
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

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    fontFamily: fontHeading,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    fontFamily: fontHeading,
                    fontWeight: 700,
                    fontSize: '0.96rem',
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Pubblicazione...' : 'Pubblica ora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE CONFERMA ELIMINAZIONE */}
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
            zIndex: 70,
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

      {/* MODALE REGISTRAZIONE BADGE / MAIL AZIENDALE E REPARTO */}
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
            zIndex: 65,
          }}
        >
          <form
            onSubmit={handleSaveProfile}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '22px',
              maxWidth: '420px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontFamily: fontHeading, color: '#1b365d' }}>Accesso Colleghi & Reparto</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Inserisci il tuo numero di Badge o la mail aziendale per partecipare alla bacheca interna.
              </p>
            </div>

            {errore && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                {errore}
              </div>
            )}

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
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}
                >
                  🪪
                </div>
              )}
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}>
                Carica foto profilo
                <input type="file" accept="image/*" onChange={handleFotoProfiloChange} style={{ display: 'none' }} />
              </label>
            </div>

            <input
              type="text"
              placeholder="Nome e Cognome *"
              value={authForm.nome}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, nome: e.target.value }))}
              required
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
            />

            <select
              value={authForm.reparto}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, reparto: e.target.value }))}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
            >
              {REPARTI_AZIENDA.map((rep) => (
                <option key={rep} value={rep}>
                  Reparto: {rep}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Numero Badge aziendale (es. 1042)"
              value={authForm.badge}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, badge: e.target.value }))}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
            />

            <input
              type="email"
              placeholder="Email aziendale (es. nome.cognome@trigano.it)"
              value={authForm.email}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setErrore('');
                  setShowProfileModal(false);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                }}
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
                  cursor: 'pointer',
                }}
              >
                Salva profilo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODALE IMPOSTAZIONI & I MIEI ANNUNCI */}
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
            zIndex: 55,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '22px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontFamily: fontHeading, color: '#1b365d' }}>⚙️ Impostazioni & Gestione</h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.15rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setSettingsTab('miei_annunci')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontFamily: fontHeading,
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  background: settingsTab === 'miei_annunci' ? '#1b365d' : '#f1f5f9',
                  color: settingsTab === 'miei_annunci' ? '#fff' : '#334155',
                }}
              >
                📋 I miei annunci ({mieiAnnunci.length})
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('preferenze')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontFamily: fontHeading,
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  background: settingsTab === 'preferenze' ? '#1b365d' : '#f1f5f9',
                  color: settingsTab === 'preferenze' ? '#fff' : '#334155',
                }}
              >
                🔔 Notifiche & Suoni
              </button>
            </div>

            {settingsTab === 'miei_annunci' ? (
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px' }}>
                {!userProfile.registrato || !userProfile.nome ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', margin: '18px 0' }}>
                    Accedi prima con Badge o Mail aziendale per vedere e gestire i tuoi annunci.
                  </p>
                ) : mieiAnnunci.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', margin: '18px 0' }}>
                    Non hai ancora pubblicato nessun annuncio.
                  </p>
                ) : (
                  mieiAnnunci.map((item) => {
                    const venduto = isAnnuncioVenduto(item);
                    const foto = normalizeImages(item);
                    const ricevuti = getMittentiRicevuti(item.id);
                    return (
                      <div
                        key={item.id}
                        style={{
                          border: venduto ? '1px solid #fecaca' : '1px solid #e2e8f0',
                          background: venduto ? '#fff5f5' : '#f8fafc',
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {foto[0] ? (
                            <img
                              src={foto[0]}
                              alt={item.titolo}
                              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                background: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.1rem',
                                flexShrink: 0,
                              }}
                            >
                              📦
                            </div>
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{item.titolo}</strong>
                              {venduto && (
                                <span
                                  style={{
                                    background: '#dc2626',
                                    color: '#fff',
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    padding: '2px 7px',
                                    borderRadius: '6px',
                                  }}
                                >
                                  VENDUTO
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                              {item.categoria} •{' '}
                              {item.tipo === 'In regalo' || item.prezzo === 0
                                ? 'In regalo'
                                : item.prezzo != null
                                ? `€ ${item.prezzo}`
                                : item.tipo}
                            </div>
                          </div>
                        </div>

                        {ricevuti.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {ricevuti.map((mitt) => (
                              <button
                                key={mitt}
                                type="button"
                                onClick={() => {
                                  setShowSettingsModal(false);
                                  apriChatPrivata(item, mitt);
                                }}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #bfdbfe',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  fontWeight: 700,
                                  fontSize: '0.76rem',
                                  cursor: 'pointer',
                                }}
                              >
                                💬 Chat con {mitt}
                              </button>
                            ))}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => toggleStatoVenduto(item)}
                            style={{
                              flex: '1 1 auto',
                              padding: '7px 10px',
                              borderRadius: '9px',
                              border: 'none',
                              background: venduto ? '#059669' : '#f59e0b',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            {venduto ? '↩️ Rimetto disponibile' : '✅ Segna Venduto'}
                          </button>

                          <button
                            type="button"
                            onClick={() => apriModificaAnnuncio(item)}
                            style={{
                              flex: '1 1 auto',
                              padding: '7px 10px',
                              borderRadius: '9px',
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              color: '#1e293b',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            ✏️ Modifica
                          </button>

                          <button
                            type="button"
                            onClick={() => setAnnuncioDaEliminare(item)}
                            style={{
                              padding: '7px 10px',
                              borderRadius: '9px',
                              border: 'none',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            🗑️ Elimina
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

                <div>
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
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
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
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE MODIFICA ANNUNCIO */}
      {annuncioInModifica && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 65,
          }}
        >
          <form
            onSubmit={handleSalvaModificaAnnuncio}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '22px',
              maxWidth: '430px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '11px',
            }}
          >
            <h3 style={{ margin: 0, fontFamily: fontHeading, color: '#1b365d' }}>✏️ Modifica annuncio</h3>

            <input
              type="text"
              placeholder="Titolo"
              value={editForm.titolo}
              onChange={(e) => setEditForm((prev) => ({ ...prev, titolo: e.target.value }))}
              required
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select
                value={editForm.categoria}
                onChange={(e) => setEditForm((prev) => ({ ...prev, categoria: e.target.value }))}
                style={{ padding: '10px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
              >
                {CATEGORIE_FORM.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={editForm.tipo}
                onChange={(e) => setEditForm((prev) => ({ ...prev, tipo: e.target.value }))}
                style={{ padding: '10px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
              >
                {TIPI_FORM.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {editForm.tipo !== 'In regalo' && (
              <input
                type="number"
                step="0.01"
                placeholder="Prezzo (€)"
                value={editForm.prezzo}
                onChange={(e) => setEditForm((prev) => ({ ...prev, prezzo: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: fontBody }}
              />
            )}

            {editForm.tipo !== 'In regalo' && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#065f46',
                  background: '#ecfdf5',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={editForm.welfare}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, welfare: e.target.checked }))}
                />
                <span>🎟️ Accetto Welfare aziendale / Buoni</span>
              </label>
            )}

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#b91c1c',
                background: '#fee2e2',
                padding: '8px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={editForm.venduto}
                onChange={(e) => setEditForm((prev) => ({ ...prev, venduto: e.target.checked }))}
              />
              <span>✅ Segna questo annuncio come VENDUTO</span>
            </label>

            <textarea
              rows={3}
              placeholder="Descrizione"
              value={editForm.descrizione}
              onChange={(e) => setEditForm((prev) => ({ ...prev, descrizione: e.target.value }))}
              required
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontFamily: fontBody,
                resize: 'vertical',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setAnnuncioInModifica(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={salvataggioModifica}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {salvataggioModifica ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CHAT PRIVATA 1-A-1 */}
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
                  const mio = extractBaseName(m.mittente).toLowerCase() === extractBaseName(userProfile.nome).toLowerCase();
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
