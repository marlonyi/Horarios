import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';

// Estilos y tipografías navideñas
import './fonts.css';
import './christmas-styles.css';

interface Schedule {
  id: string;
  name: string;
  date: string;
  entryTime: string; // HH:MM
  exitTime: string;
  entryPeriod: 'AM' | 'PM';
  exitPeriod: 'AM' | 'PM';
}

// IndexedDB functions
const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('HorariosDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('schedules')) {
        db.createObjectStore('schedules', { keyPath: 'id' });
      }
    };
  });
};

const saveSchedulesToDB = async (schedules: Schedule[]) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['schedules'], 'readwrite');
    const store = transaction.objectStore('schedules');
    store.clear(); // Clear existing
    schedules.forEach(schedule => store.add(schedule));
    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error saving to DB:', error);
  }
};

const loadSchedulesFromDB = async (): Promise<Schedule[]> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['schedules'], 'readonly');
    const store = transaction.objectStore('schedules');
    return new Promise<Schedule[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error loading from DB:', error);
    return [];
  }
};

function App() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [form, setForm] = useState({
    name: '',
    date: '',
    entryTime: '',
    exitTime: '',
  });
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  });
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      const saved = await loadSchedulesFromDB();
      if (saved.length === 0) {
        // Pre-load test data
        const testData: Schedule[] = [
          // Día 18
          { id: '1', name: 'Julie', date: '2025-12-18', entryTime: '08:00', exitTime: '21:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '2', name: 'Paola', date: '2025-12-18', entryTime: '08:00', exitTime: '17:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '3', name: 'Katia', date: '2025-12-18', entryTime: '09:00', exitTime: '21:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '4', name: 'Kendry', date: '2025-12-18', entryTime: '09:00', exitTime: '18:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '5', name: 'Claudia', date: '2025-12-18', entryTime: '10:00', exitTime: '19:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '6', name: 'Danna', date: '2025-12-18', entryTime: '11:00', exitTime: '20:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '7', name: 'Gloria', date: '2025-12-18', entryTime: '12:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '8', name: 'Kasiel', date: '2025-12-18', entryTime: '13:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '9', name: 'Yina', date: '2025-12-18', entryTime: '15:00', exitTime: '23:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          // Día 19 - Mismos horarios
          { id: '10', name: 'Julie', date: '2025-12-19', entryTime: '08:00', exitTime: '21:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '11', name: 'Paola', date: '2025-12-19', entryTime: '08:00', exitTime: '17:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '12', name: 'Katia', date: '2025-12-19', entryTime: '09:00', exitTime: '21:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '13', name: 'Kendry', date: '2025-12-19', entryTime: '09:00', exitTime: '18:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '14', name: 'Claudia', date: '2025-12-19', entryTime: '10:00', exitTime: '19:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '15', name: 'Danna', date: '2025-12-19', entryTime: '11:00', exitTime: '20:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '16', name: 'Gloria', date: '2025-12-19', entryTime: '12:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '17', name: 'Kasiel', date: '2025-12-19', entryTime: '13:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '18', name: 'Yina', date: '2025-12-19', entryTime: '15:00', exitTime: '23:00', entryPeriod: 'PM', exitPeriod: 'PM' },
        ];
        setSchedules(testData);
      } else {
        setSchedules(saved);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (schedules.length > 0 || schedules.length === 0) { // Save even when empty
      saveSchedulesToDB(schedules);
    }
  }, [schedules]);

  const sortedSchedules = [...schedules]
    .filter(schedule => !filterDate || schedule.date === filterDate)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.entryTime.localeCompare(b.entryTime);
    });

  // Agrupar por fecha cuando no hay filtro
  const groupedSchedules = filterDate ? {} : sortedSchedules.reduce((groups, schedule) => {
    const date = schedule.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(schedule);
    return groups;
  }, {} as Record<string, Schedule[]>);

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };


  const calculateDuration = (entry: string, exit: string) => {
    const e = new Date(`2000-01-01T${entry}`);
    const x = new Date(`2000-01-01T${exit}`);
    const diff = x.getTime() - e.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const calculateWorkHours = (entry: string, exit: string, entryPeriod: 'AM' | 'PM') => {
    const e = new Date(`2000-01-01T${entry}`);
    const x = new Date(`2000-01-01T${exit}`);
    const diff = x.getTime() - e.getTime();
    const totalMinutes = Math.floor(diff / 60000);
    const totalHours = totalMinutes / 60;

    // Verificar si entra hasta las 12 PM (mediodía) para aplicar almuerzo
    const entryHour = parseInt(entry.split(':')[0]);
    const hasLunch = entryHour <= 12;
    const lunchHours = hasLunch ? 1 : 0;

    // Calcular horas esperadas: 8 efectivas + almuerzo si aplica
    const expectedHours = 8 + lunchHours;

    // Horas efectivas = total - almuerzo (máximo 8 horas)
    const effectiveHours = Math.min(8, Math.max(0, totalHours - lunchHours));

    // Horas extras: tiempo trabajado más allá de lo esperado
    const overtimeHours = Math.max(0, totalHours - expectedHours);

    return {
      totalHours,
      lunchHours,
      effectiveHours,
      overtimeHours,
      formattedTotal: `${Math.floor(totalHours)}h ${Math.floor((totalHours % 1) * 60)}m`,
      formattedEffective: `${Math.floor(effectiveHours)}h ${Math.floor((effectiveHours % 1) * 60)}m`,
      formattedOvertime: overtimeHours > 0 ? `${Math.floor(overtimeHours)}h ${Math.floor((overtimeHours % 1) * 60)}m` : '0h 0m'
    };
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime12 = (time24: string) => {
    const [h, m] = time24.split(':');
    let hour = parseInt(h);
    let period = 'AM';
    let displayHour = hour;
    if (hour === 0) {
      displayHour = 12;
    } else if (hour >= 12) {
      period = 'PM';
      if (hour > 12) displayHour = hour - 12;
    }
    return `${displayHour.toString().padStart(2, '0')}:${m} ${period}`;
  };

  const generateDailySummaryImage = async () => {
    if (!filterDate || sortedSchedules.length === 0) return;

    // Preparar una ventana popup vacía si el navegador no soporta Web Share API
    // (esto ayuda a evitar que window.open sea bloqueado por el navegador)
    const preferWhatsAppFallback = !(navigator && (navigator as any).share);
    let waPopup: Window | null = null;
    if (preferWhatsAppFallback) {
      try { waPopup = window.open('', '_blank'); } catch (e) { waPopup = null; }
    }

    // Intento 1: capturar la vista principal directamente (ocultando controles interactivos temporalmente)
    const source = document.querySelector('.max-w-7xl') as HTMLElement | null;
    if (source) {
      // Guardar estilos originales del contenedor
      const originalMaxWidth = source.style.maxWidth;
      const originalWidth = source.style.width;
      const originalMinHeight = source.style.minHeight;
      
      // Hacer el contenedor más ancho para que el título quepa
      source.style.maxWidth = '1200px';
      source.style.width = '1200px';
      source.style.minHeight = '800px'; // Altura suficiente
      const interactive = Array.from(source.querySelectorAll<HTMLElement>('button, input, select, textarea, a[role="button"]'));
      const originals: {el: HTMLElement, visibility: string, display: string}[] = [];
      interactive.forEach(el => {
        originals.push({ el, visibility: el.style.visibility || '', display: el.style.display || '' });
        el.style.visibility = 'hidden';
      });

      // Ocultar también las decoraciones navideñas
      const decorations = Array.from(source.querySelectorAll<HTMLElement>('.string-lights, .decor-emoji, .ornament'));
      decorations.forEach(el => {
        originals.push({ el, visibility: el.style.visibility || '', display: el.style.display || '' });
        el.style.display = 'none';
      });

      // Ocultar también el panel de filtro para que no aparezca en la captura
      const filterEl = source.querySelector<HTMLElement>('.bg-gray-50.rounded-lg');
      if (filterEl) {
        originals.push({ el: filterEl, visibility: filterEl.style.visibility || '', display: filterEl.style.display || '' });
        filterEl.style.display = 'none';
      }

      // Esperar a que las imágenes y fuentes carguen
      await Promise.all(Array.from(source.querySelectorAll<HTMLImageElement>('img')).map(img => {
        return new Promise<void>(res => {
          if (img.complete) return res();
          img.onload = img.onerror = () => res();
        });
      }));
      try { if ((document as any).fonts && (document as any).fonts.ready) await (document as any).fonts.ready; } catch(e) {}

      // Centrar el encabezado "Horarios del ..." y el contador dentro del área antes de capturar
      const headings = Array.from(source.querySelectorAll<HTMLElement>('h2'));
      headings.forEach(h => {
        if (h.textContent && h.textContent.includes('Horarios del')) {
          const parent = h.parentElement;
          if (parent) {
            parent.style.textAlign = 'center';
            // si existe un <p> con el conteo, centrarlo también
            const p = parent.querySelector('p');
            if (p) p.style.textAlign = 'center';
          }
        }
      });

      // Centrar el título principal del header
      const header = source.querySelector('.christmas-header') as HTMLElement;
      if (header) {
        header.style.textAlign = 'center';
        // Crear versión alternativa del título para la captura (más compatible con html2canvas)
        const title = header.querySelector('.christmas-title') as HTMLElement;
        if (title) {
          // Guardar estilos originales
          originals.push({ el: title, visibility: '', display: '' });
          (originals[originals.length - 1] as any).innerHTML = title.innerHTML;
          (originals[originals.length - 1] as any).className = title.className;
          (originals[originals.length - 1] as any).style = { ...title.style };

          // Crear título con estilo femenino y novedoso similar a la vista principal
          title.innerHTML = `🎅 ${title.innerHTML} 🎅`; // Agregar Papá Noel a cada costado
          title.className = 'capture-title'; // Cambiar clase temporalmente
          title.style.cssText = `
            font-size: 2.8rem !important;
            font-weight: 600 !important;
            font-family: 'Lucida Handwriting', 'Brush Script MT', cursive !important;
            font-style: italic !important;
            background: linear-gradient(135deg, #f472b6 0%, #fb7185 40%, #10b981 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            text-shadow:
              0 2px 4px rgba(0, 0, 0, 0.1),
              0 4px 8px rgba(245, 158, 11, 0.2) !important;
            box-shadow:
              0 8px 32px rgba(245, 158, 11, 0.3),
              0 0 64px rgba(16, 185, 129, 0.2) !important;
            animation: none !important;
            padding: 1.5rem 3rem !important;
            border-radius: 2rem !important;
            display: inline-block !important;
            margin: 0 auto !important;
            border: none !important;
            position: relative !important;
            letter-spacing: 0.5px !important;
            text-align: center !important;
            line-height: 1.3 !important;
            text-transform: none !important;
          `;
          // Agregar efecto de brillo sutil como en la vista principal
          title.style.filter = 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.4))';
        }
        // Guardar el estilo original del header
        originals.push({ el: header, visibility: '', display: '' });
        (originals[originals.length - 1] as any).textAlign = header.style.textAlign;
      }

      // Añadir decoración ligera en la parte superior del área (guirnalda SVG)
      const container = source.querySelector<HTMLElement>('.bg-white.rounded-xl.shadow-lg') || source.querySelector<HTMLElement>('.max-w-7xl');
      let decoEl: HTMLElement | null = null;
      if (container) {
        decoEl = document.createElement('div');
        decoEl.style.width = '100%';
        decoEl.style.display = 'flex';
        decoEl.style.justifyContent = 'center';
        decoEl.style.pointerEvents = 'none';
        decoEl.style.marginBottom = '0px';
        decoEl.innerHTML = `<img src="/imagen.png" style="width:100%; height:250px; object-fit:cover;" />`;
        // Insertar antes del primer hijo útil (tabla o similar)
        const firstContent = container.querySelector('table, div');
        if (firstContent && firstContent.parentElement) firstContent.parentElement.insertBefore(decoEl, firstContent);
      }

      try {
        const canvas = await html2canvas(source, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true });
        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(b => res(b), 'image/png'));
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `horarios-${filterDate}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Intentar compartir usando Web Share API con archivo (si está disponible)
          try {
            const file = new File([blob], `horarios-${filterDate}.png`, { type: 'image/png' });
            const nav: any = navigator;
            if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
              await nav.share({
                title: `Horarios del ${formatDate(filterDate)}`,
                text: `Resumen de horarios para ${formatDate(filterDate)}`,
                files: [file],
              });
            } else {
              // Fallback a WhatsApp mediante enlace de texto (no puede adjuntar archivos desde el navegador)
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Horarios del ' + formatDate(filterDate) + ' - he descargado la imagen en mi dispositivo.')}`;
              if (waPopup) {
                try { waPopup.location = whatsappUrl; } catch (e) { window.open(whatsappUrl, '_blank'); }
              } else {
                window.open(whatsappUrl, '_blank');
              }
            }
          } catch (shareErr) {
            // Silenciar errores de compartido y dejar que el flujo de descarga continúe
            console.warn('Share failed:', shareErr);
          }
        }
        originals.forEach(o => { 
          o.el.style.visibility = o.visibility; 
          o.el.style.display = o.display; 
          if ((o as any).textAlign !== undefined) o.el.style.textAlign = (o as any).textAlign;
          // Restaurar título completamente
          if (o.el.classList.contains('christmas-title') || o.el.classList.contains('capture-title')) {
            if ((o as any).innerHTML !== undefined) o.el.innerHTML = (o as any).innerHTML;
            if ((o as any).className !== undefined) o.el.className = (o as any).className;
            if ((o as any).style !== undefined) Object.assign(o.el.style, (o as any).style);
          }
        });
        // Restaurar estilos originales del contenedor
        source.style.maxWidth = originalMaxWidth;
        source.style.width = originalWidth;
        source.style.minHeight = originalMinHeight;
        if (decoEl && decoEl.parentElement) decoEl.parentElement.removeChild(decoEl);
        return;
      } catch (e) {
        // si falla, restaurar y continuar al fallback
        originals.forEach(o => { 
          o.el.style.visibility = o.visibility; 
          o.el.style.display = o.display; 
          if ((o as any).textAlign !== undefined) o.el.style.textAlign = (o as any).textAlign;
          // Restaurar título completamente
          if (o.el.classList.contains('christmas-title') || o.el.classList.contains('capture-title')) {
            if ((o as any).innerHTML !== undefined) o.el.innerHTML = (o as any).innerHTML;
            if ((o as any).className !== undefined) o.el.className = (o as any).className;
            if ((o as any).style !== undefined) Object.assign(o.el.style, (o as any).style);
          }
        });
        // Restaurar estilos originales del contenedor
        source.style.maxWidth = originalMaxWidth;
        source.style.width = originalWidth;
        source.style.minHeight = originalMinHeight;
        if (decoEl && decoEl.parentElement) decoEl.parentElement.removeChild(decoEl);
      }
    }

    // Crear un elemento temporal con clases reutilizables del tema navideño (fallback)
    const summaryElement = document.createElement('div');
    summaryElement.className = 'summary-wrapper';

    summaryElement.innerHTML = `
      <div class="summary-card" style="padding:20px; background: #fff; border-radius:12px; box-shadow:0 8px 30px rgba(2,6,23,0.08); max-width:1200px; margin:16px auto; font-family:inherit; color:inherit;">
        <style>
          :root{ --accent-green:#10b981; --accent-red:#ef4444; }
          .summary-card{ padding:20px; background:#fff; border-radius:12px; box-shadow:0 8px 30px rgba(2,6,23,0.08); max-width:1200px; margin:16px auto; }
          .christmas-header{ display:flex; align-items:center; justify-content:center; gap:12px; padding-bottom:8px; }
          .christmas-title{
            font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
            font-size: clamp(24px, 5vw, 40px);
            color:#f8fafc;
            background: linear-gradient(90deg,#f472b6 0%, #fb7185 40%, #10b981 100%);
            padding: clamp(6px, 2vw, 8px) clamp(12px, 3vw, 18px);
            border-radius: clamp(12px, 3vw, 16px);
            box-shadow:0 10px 18px rgba(2,6,23,0.22);
            letter-spacing:1px;
            font-weight:800;
            -webkit-text-stroke:1px rgba(0,0,0,0.12);
            display:inline-block;
            line-height: 1.2;
            word-wrap: break-word;
            max-width: 90vw;
          }
          .christmas-subtitle{
            font-size: clamp(12px, 2.5vw, 16px);
            color:#f3f4f6;
            margin: clamp(4px, 1vw, 8px) 0 0 0;
            font-style:italic;
            text-shadow:0 2px 6px rgba(0,0,0,0.12);
            line-height: 1.3;
          }
          .summary-table{ width:100%; border-collapse:collapse; margin-top:10px; }
          .summary-table th{ padding:12px 10px; text-align:left; font-size:12px; color:#374151; }
          .summary-table td{ padding:12px 10px; color:#0f172a; font-size:13px; }
          .time-badge{ background:#dbeafe; color:#1e40af; padding:6px 10px; border-radius:18px; display:inline-block; font-weight:700; }
          .time-badge.exit{ background:#fed7aa; color:#9a3412; font-weight:700; }
          .summary-footer{ margin-top:18px; text-align:right; font-size:12px; color:#6b7280; }
          .logo{ width:36px; height:36px; }
          .christmas-header{ position:relative; overflow:hidden; }
          .christmas-header .ornament{ position:absolute; top:6px; width:14px; height:14px; border-radius:50%; box-shadow:0 6px 12px rgba(2,6,23,0.12); }
          .christmas-header .ornament::before{ content:''; position:absolute; left:50%; top:-8px; width:2px; height:10px; background:rgba(255,255,255,0.35); transform:translateX(-50%); border-radius:1px; }
          .christmas-header .ornament-left{ left:18px; background: radial-gradient(circle at 30% 30%, #fff 0%, rgba(255,255,255,0.12) 20%, #ef4444 60%); }
          .christmas-header .ornament-center{ left:50%; transform:translateX(-50%); background: radial-gradient(circle at 30% 30%, #fff 0%, rgba(255,255,255,0.12) 20%, #10b981 60%); }
          .christmas-header .ornament-right{ right:18px; background: radial-gradient(circle at 30% 30%, #fff 0%, rgba(255,255,255,0.12) 20%, #f59e0b 60%); }

          /* Elementos decorativos responsive */
          .christmas-header .snowflake{
            position:absolute;
            color:#ffffff;
            opacity:0.8;
            font-size: clamp(12px, 3vw, 16px);
            animation:snowfall 3s ease-in-out infinite;
            display: none;
          }
          .christmas-header .snowflake:nth-child(1){ top:10px; left:10%; animation-delay:0s; }
          .christmas-header .snowflake:nth-child(2){ top:15px; left:25%; animation-delay:1s; }
          .christmas-header .snowflake:nth-child(3){ top:8px; left:75%; animation-delay:2s; }
          .christmas-header .snowflake:nth-child(4){ top:20px; left:90%; animation-delay:0.5s; }

          .christmas-header .star-decoration{
            position:absolute;
            color:#fbbf24;
            opacity:0.9;
            font-size: clamp(10px, 2.5vw, 14px);
            animation:twinkle 2s ease-in-out infinite;
            display: none;
          }
          .christmas-header .star-decoration:nth-child(1){ top:12px; left:5%; animation-delay:0.5s; }
          .christmas-header .star-decoration:nth-child(2){ top:18px; left:95%; animation-delay:1.5s; }

          .christmas-header .gift-decoration{
            position:absolute;
            color:#f472b6;
            opacity:0.85;
            font-size: clamp(8px, 2vw, 12px);
            animation:bounce 2.5s ease-in-out infinite;
            display: none;
          }
          .christmas-header .gift-decoration:nth-child(1){ top:25px; left:15%; animation-delay:0s; }
          .christmas-header .gift-decoration:nth-child(2){ top:30px; left:85%; animation-delay:1s; }

          /* Mostrar decoraciones solo en pantallas medianas y grandes */
          @media (min-width: 768px) {
            .christmas-header .snowflake,
            .christmas-header .star-decoration,
            .christmas-header .gift-decoration {
              display: block;
            }
          }

          @keyframes snowfall{ 0%,100%{ transform:translateY(0px) rotate(0deg); } 50%{ transform:translateY(10px) rotate(180deg); } }
          @keyframes twinkle{ 0%,100%{ opacity:0.9; transform:scale(1); } 50%{ opacity:0.3; transform:scale(1.2); } }
          @keyframes bounce{ 0%,100%{ transform:translateY(0px); } 50%{ transform:translateY(-5px); } }
        </style>

        <div class="christmas-header" style="padding-bottom: clamp(8px, 2vw, 16px); text-align:center; position:relative;">
              <!-- Elementos decorativos navideños -->
              <div class="snowflake">❄️</div>
              <div class="snowflake">❄️</div>
              <div class="snowflake">❄️</div>
              <div class="snowflake">❄️</div>
              <div class="star-decoration">⭐</div>
              <div class="star-decoration">⭐</div>
              <div class="gift-decoration">🎁</div>
              <div class="gift-decoration">🎁</div>

              <div style="display:flex; align-items:center; justify-content:center; gap: clamp(8px, 2vw, 12px); flex-wrap: wrap;">
                <svg width="clamp(24px, 8vw, 36px)" height="clamp(24px, 8vw, 36px)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden style="flex-shrink: 0;">
                  <path d="M12 21s-7-4.35-9-7.18C0.73 10.78 3.3 6 7.5 6c2.04 0 3.5 1.2 4.5 2.4C12.99 7.2 14.45 6 16.5 6 20.7 6 23.27 10.78 21 13.82 19 16.65 12 21 12 21z" fill="#fff" opacity="0.92" />
                  <path d="M12 21s-7-4.35-9-7.18C0.73 10.78 3.3 6 7.5 6c2.04 0 3.5 1.2 4.5 2.4C12.99 7.2 14.45 6 16.5 6 20.7 6 23.27 10.78 21 13.82 19 16.65 12 21 12 21z" fill="#f97373" opacity="0.95" />
                </svg>
                <div style="text-align:center; flex: 1; min-width: 0;">
                  <div class="christmas-title">Horario de las mamacitas FRAULOVERS</div>
                  <div class="christmas-subtitle">¡Organiza tu tiempo con amor, dedicación y un toque de magia navideña! ✨🎄</div>
                </div>
                <svg width="clamp(24px, 8vw, 36px)" height="clamp(24px, 8vw, 36px)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden style="flex-shrink: 0;">
                  <path d="M12 21s-7-4.35-9-7.18C0.73 10.78 3.3 6 7.5 6c2.04 0 3.5 1.2 4.5 2.4C12.99 7.2 14.45 6 16.5 6 20.7 6 23.27 10.78 21 13.82 19 16.65 12 21 12 21z" fill="#fff" opacity="0.92" />
                  <path d="M12 21s-7-4.35-9-7.18C0.73 10.78 3.3 6 7.5 6c2.04 0 3.5 1.2 4.5 2.4C12.99 7.2 14.45 6 16.5 6 20.7 6 23.27 10.78 21 13.82 19 16.65 12 21 12 21z" fill="#fb7185" opacity="0.95" />
                </svg>
              </div>
            </div>

        <div style="text-align:center; margin:18px 0;">
          <h2 style="margin:0; font-size:22px; font-weight:700;">Resumen de Horarios</h2>
          <h3 style="margin:6px 0 0 0; font-size:14px; color:#374151;">${formatDate(filterDate)}</h3>
          <p style="margin:8px 0 0 0; color:#6b7280;">${sortedSchedules.length} empleado${sortedSchedules.length !== 1 ? 's' : ''} programado${sortedSchedules.length !== 1 ? 's' : ''}</p>
        </div>

        <table class="summary-table">
          <thead>
            <tr style="background:linear-gradient(90deg,#f3f4f6,#e6eef9);">
              <th>EMPLEADO</th>
              <th>ENTRADA</th>
              <th>SALIDA</th>
              <th style="text-align:center">EFECTIVAS</th>
              <th style="text-align:center">ALMUERZO</th>
              <th style="text-align:center">EXTRAS</th>
            </tr>
          </thead>
          <tbody>
            ${sortedSchedules.map((schedule, index) => {
              const workHours = calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod);
              return `
              <tr style="background:${index % 2 === 0 ? '#ffffff' : '#fbfcff'};">
                <td style="font-weight:600;">${schedule.name}</td>
                <td><span class="time-badge">${formatTime12(schedule.entryTime)}</span></td>
                <td><span class="time-badge exit">${formatTime12(schedule.exitTime)}</span></td>
                <td style="text-align:center">${workHours.effectiveHours}h</td>
                <td style="text-align:center">${workHours.lunchHours}h</td>
                <td style="text-align:center">${workHours.overtimeHours}h</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="summary-footer">Generado por Horario de las mamacitas FRAULOVERS - ${new Date().toLocaleString('es-ES')}</div>
      </div>
    `;

    // Esperar fuentes y aplicar estilos computados, luego agregar al DOM para capturar
    const inlineAllComputedStyles = (root: HTMLElement) => {
      const nodes = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
      nodes.forEach((node) => {
        try {
          const cs = window.getComputedStyle(node);
          for (let i = 0; i < cs.length; i++) {
            const prop = cs[i];
            const val = cs.getPropertyValue(prop);
            const pr = cs.getPropertyPriority(prop);
            node.style.setProperty(prop, val, pr);
          }
        } catch (e) {
          // Ignorar cualquier error al leer estilos computados
        }
      });
    };

    try {
      if ((document as any).fonts && (document as any).fonts.ready) {
        await (document as any).fonts.ready;
      }
    } catch (e) {
      // Si no está disponible, continuamos
    }

    inlineAllComputedStyles(summaryElement);
    document.body.appendChild(summaryElement);

    try {
      const canvas = await html2canvas(summaryElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      // Remover el elemento temporal
      document.body.removeChild(summaryElement);

      // Convertir a blob y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `horarios-${filterDate}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Intentar compartir por WhatsApp si está disponible
          if (navigator.share) {
            navigator.share({
              title: `Horarios del ${formatDate(filterDate)}`,
              text: `Resumen de horarios para ${formatDate(filterDate)}`,
              files: [new File([blob], `horarios-${filterDate}.png`, { type: 'image/png' })],
            }).catch(() => {
              // Fallback: mostrar mensaje para compartir manualmente
              alert('Imagen descargada. Puedes compartirla por WhatsApp manualmente.');
            });
          } else {
            // Fallback para navegadores sin Web Share API
            const whatsappUrl = `https://wa.me/?text=Horarios%20del%20${encodeURIComponent(formatDate(filterDate))}`;
            if (waPopup) {
              try { waPopup.location = whatsappUrl; } catch (e) { window.open(whatsappUrl, '_blank'); }
            } else {
              window.open(whatsappUrl, '_blank');
            }
            alert('Imagen descargada. Abre WhatsApp para compartir.');
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generando imagen:', error);
      alert('Error al generar la imagen. Inténtalo de nuevo.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validar campos
    if (!form.name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!form.date) {
      setError('La fecha es obligatoria.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (form.date < today) {
      setError('La fecha no puede ser anterior a hoy.');
      return;
    }
    if (!form.entryTime) {
      setError('La hora de entrada es obligatoria.');
      return;
    }
    if (!form.exitTime) {
      setError('La hora de salida es obligatoria.');
      return;
    }
    
    // Validar que salida sea después de entrada
    if (form.entryTime >= form.exitTime) {
      setError('La hora de salida debe ser posterior a la hora de entrada.');
      return;
    }
    
    const schedule: Schedule = {
      id: editingSchedule ? editingSchedule.id : Date.now().toString(),
      name: form.name.trim(),
      date: form.date,
      entryTime: form.entryTime,
      exitTime: form.exitTime,
      entryPeriod: form.entryTime < '12:00' ? 'AM' : 'PM',
      exitPeriod: form.exitTime < '12:00' ? 'AM' : 'PM',
    };
    if (editingSchedule) {
      setSchedules(schedules.map(s => s.id === editingSchedule.id ? schedule : s));
    } else {
      setSchedules([...schedules, schedule]);
    }
    closeModal();
  };

  const openModal = (schedule?: Schedule) => {
    if (schedule) {
      setForm({
        name: schedule.name,
        date: schedule.date,
        entryTime: schedule.entryTime,
        exitTime: schedule.exitTime,
      });
      setEditingSchedule(schedule);
    } else {
      setForm({
        name: '',
        date: '',
        entryTime: '',
        exitTime: '',
      });
      setEditingSchedule(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    setError('');
  };

  const deleteSchedule = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este horario?')) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  return (
    <div className="app-root holiday-display min-h-screen p-2 sm:p-4 md:p-6" style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <style>{`\
        .christmas-header{ position:relative; overflow:visible; }\
        .string-lights{ position:absolute; top:-28px; left:0; width:100%; display:flex; justify-content:center; pointer-events:none; z-index:2; }\
        .string-lights svg{ width:82%; max-width:820px; height:40px; display:block; }\
        .string-lights .bulb{ transform-origin:center; filter: drop-shadow(0 2px 6px rgba(2,6,23,0.12)); animation:twinkle 2.2s infinite ease-in-out; }\
        .string-lights .bulb:nth-child(1){ animation-delay:0s; }\
        .string-lights .bulb:nth-child(2){ animation-delay:0.18s; }\
        .string-lights .bulb:nth-child(3){ animation-delay:0.36s; }\
        .string-lights .bulb:nth-child(4){ animation-delay:0.54s; }\
        .string-lights .bulb:nth-child(5){ animation-delay:0.72s; }\
        .string-lights .bulb:nth-child(6){ animation-delay:0.9s; }\
        @keyframes twinkle{ 0%,100%{ opacity:0.92; transform: translateY(0) scale(1); } 50%{ opacity:1; transform: translateY(-3px) scale(1.06); } }\
        /* Título estilo "bubble" con contorno y sombra */\
        .title-wrap{ display:flex; align-items:center; justify-content:center; gap:14px; z-index:3; }\
        .christmas-title{ 
          font-size:48px; 
          font-weight:800; 
          color:#f8fafc; 
          display:inline-block; 
          padding:12px 24px; 
          border-radius:20px; 
          letter-spacing:1px; 
          line-height:1; 
          -webkit-text-stroke:1px rgba(0,0,0,0.12); 
          text-shadow: 
            0 12px 20px rgba(2,6,23,0.3), 
            0 4px 8px rgba(255,255,255,0.1),
            0 2px 4px rgba(239, 68, 68, 0.3),
            0 -2px 4px rgba(16, 185, 129, 0.2);
          background: linear-gradient(135deg, #f472b6 0%, #fb7185 30%, #f59e0b 60%, #10b981 100%);
          box-shadow: 
            0 15px 25px rgba(2,6,23,0.25),
            inset 0 2px 4px rgba(255,255,255,0.2),
            0 0 20px rgba(245, 158, 11, 0.3);
          position: relative;
          transform: translateZ(0);
          animation: christmas-glow 3s ease-in-out infinite alternate;
        }
        @keyframes christmas-glow {
          0% { box-shadow: 0 15px 25px rgba(2,6,23,0.25), inset 0 2px 4px rgba(255,255,255,0.2), 0 0 20px rgba(245, 158, 11, 0.3); }
          100% { box-shadow: 0 15px 25px rgba(2,6,23,0.25), inset 0 2px 4px rgba(255,255,255,0.2), 0 0 30px rgba(245, 158, 11, 0.5), 0 0 40px rgba(16, 185, 129, 0.2); }
        }\
        .christmas-subtitle{ font-style:italic; font-size:18px; color:#f3f4f6; margin-top:8px; text-shadow:0 2px 6px rgba(0,0,0,0.12); opacity:0.95; }\
        .heart-icon{ width:36px; height:36px; display:inline-block; filter: drop-shadow(0 6px 12px rgba(2,6,23,0.14)); transform:translateY(2px); }
      `}</style>
      <div className="max-w-7xl mx-auto h-full">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden min-h-[calc(100vh-1rem)] sm:min-h-0">
          <div className="christmas-header px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
            <span className="ornament ornament-left" aria-hidden></span>
            <span className="ornament ornament-center" aria-hidden></span>
            <span className="ornament ornament-right" aria-hidden></span>
            <div className="title-wrap">
              <svg className="heart-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 21s-7-4.35-9-7.18C0.73 10.78 3.3 6 7.5 6c2.04 0 3.5 1.2 4.5 2.4C12.99 7.2 14.45 6 16.5 6 20.7 6 23.27 10.78 21 13.82 19 16.65 12 21 12 21z" fill="#fff" opacity="0.92" />
                <path d="M12 21s-7-4.35-9-7.18C0.73 10.78 3.3 6 7.5 6c2.04 0 3.5 1.2 4.5 2.4C12.99 7.2 14.45 6 16.5 6 20.7 6 23.27 10.78 21 13.82 19 16.65 12 21 12 21z" fill="#f97373" opacity="0.95" />
              </svg>
              <h1 className="christmas-title">Horario de las mamacitas FRAULOVERS</h1>
              <svg className="heart-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 21s-7-4.35-9-7.18C0.73 10.78 3.3 6 7.5 6c2.04 0 3.5 1.2 4.5 2.4C12.99 7.2 14.45 6 16.5 6 20.7 6 23.27 10.78 21 13.82 19 16.65 12 21 12 21z" fill="#fff" opacity="0.92" />
                <path d="M12 21s-7-4.35-9-7.18C0.73 10.78 3.3 6 7.5 6c2.04 0 3.5 1.2 4.5 2.4C12.99 7.2 14.45 6 16.5 6 20.7 6 23.27 10.78 21 13.82 19 16.65 12 21 12 21z" fill="#fb7185" opacity="0.95" />
              </svg>
            </div>
            <p className="christmas-subtitle text-center mt-1 sm:mt-2 md:text-base">¡Organiza tu tiempo con amor, dedicación y un toque de magia navideña! ✨🎄</p>
          </div>
          
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 min-h-[calc(100vh-8rem)] sm:min-h-0">
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => openModal()}
                className="button-primary bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 sm:py-3 px-4 sm:px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
              >
                <Plus size={20} />
                Agregar Horario
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-gray-700">Filtrar por fecha:</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 sm:px-3 sm:py-2 w-full sm:w-auto min-h-[44px] text-base"
                  />
                </div>
                <button
                  onClick={() => {
                    setFilterDate('');
                    setExpandedDates(new Set());
                  }}
                  className="button-secondary bg-white text-red-600 font-semibold py-3 sm:py-2 px-4 sm:px-4 rounded-lg shadow-sm transition-all duration-200 w-full sm:w-auto min-h-[44px] touch-manipulation"
                >
                  Ver Todos
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Indicador del día filtrado */}
              {filterDate && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Horarios del {formatDate(filterDate)}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {sortedSchedules.length} horario{sortedSchedules.length !== 1 ? 's' : ''} programado{sortedSchedules.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={generateDailySummaryImage}
                      className="button-primary bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm min-h-[44px] touch-manipulation"
                    >
                      📸 Generar Resumen
                    </button>
                  </div>
                </div>
              )}
              
              {/* Tabla para desktop */}
              <div className="block overflow-x-auto">
                <table className="min-w-full summary-table">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Empleado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Entrada</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Salida</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Horas Efectivas</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Almuerzo</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Extras</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filterDate ? (
                      // Vista filtrada por fecha
                      sortedSchedules.map((schedule, index) => (
                        <tr key={schedule.id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{schedule.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(schedule.date)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
                              {formatTime12(schedule.entryTime)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 shadow-sm">
                              {formatTime12(schedule.exitTime)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                            {(() => {
                              const workHours = calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod);
                              return workHours.formattedEffective;
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {(() => {
                              const workHours = calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod);
                              return workHours.lunchHours > 0 ? `${workHours.lunchHours}h` : '-';
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {(() => {
                              const workHours = calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod);
                              return workHours.overtimeHours > 0 ? workHours.formattedOvertime : '-';
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openModal(schedule)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors duration-150"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => deleteSchedule(schedule.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors duration-150"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Vista agrupada por fecha
                      // Vista agrupada por fecha
                      Object.entries(groupedSchedules).map(([date, daySchedules]) => (
                        <React.Fragment key={date}>
                          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors duration-150">
                            <td colSpan={8} className="px-6 py-4">
                              <button
                                onClick={() => toggleDateExpansion(date)}
                                className="flex items-center justify-between w-full text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`transform transition-transform duration-200 ${expandedDates.has(date) ? 'rotate-90' : ''}`}>
                                    ▶
                                  </span>
                                  <span className="text-lg font-semibold text-gray-900">{formatDate(date)}</span>
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {daySchedules.length} horario{daySchedules.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </button>
                            </td>
                          </tr>
                          {expandedDates.has(date) && daySchedules.map((schedule, index) => (
                            <tr key={schedule.id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 pl-12">{schedule.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"></td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
                                  {formatTime12(schedule.entryTime)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 shadow-sm">
                                  {formatTime12(schedule.exitTime)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                {(() => {
                                  const workHours = calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod);
                                  return workHours.formattedEffective;
                                })()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {(() => {
                                  const workHours = calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod);
                                  return workHours.lunchHours > 0 ? `${workHours.lunchHours}h` : '-';
                                })()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {(() => {
                                  const workHours = calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod);
                                  return workHours.overtimeHours > 0 ? workHours.formattedOvertime : '-';
                                })()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openModal(schedule)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors duration-150"
                                    title="Editar"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => deleteSchedule(schedule.id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors duration-150"
                                    title="Eliminar"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Cards para móviles */}
              <div className="hidden">
                {filterDate && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-3 mb-4 rounded-lg">
                    <div className="flex flex-col gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Horarios del {formatDate(filterDate)}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {sortedSchedules.length} horario{sortedSchedules.length !== 1 ? 's' : ''} programado{sortedSchedules.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={generateDailySummaryImage}
                        className="button-primary bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm min-h-[44px] touch-manipulation w-full"
                      >
                        📸 Generar Resumen
                      </button>
                    </div>
                  </div>
                )}
                <div className="divide-y divide-gray-200">
                  {filterDate ? (
                    // Vista filtrada por fecha
                    sortedSchedules.map((schedule, index) => (
                      <div key={schedule.id} className={`p-4 sm:p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-lg font-semibold text-gray-900 truncate">{schedule.name}</h3>
                            <p className="text-sm text-gray-600">{formatDate(schedule.date)}</p>
                          </div>
                          <div className="flex gap-1 sm:gap-2 ml-2">
                            <button
                              onClick={() => openModal(schedule)}
                              className="text-blue-600 hover:text-blue-800 p-2 sm:p-2 rounded hover:bg-blue-100 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                              title="Editar"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => deleteSchedule(schedule.id)}
                              className="text-red-600 hover:text-red-800 p-2 sm:p-2 rounded hover:bg-red-100 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                              title="Eliminar"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Entrada</p>
                            <span className="inline-flex items-center px-3 py-2 sm:px-3 sm:py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                              {formatTime12(schedule.entryTime)}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Salida</p>
                            <span className="inline-flex items-center px-3 py-2 sm:px-3 sm:py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 shadow-sm">
                              {formatTime12(schedule.exitTime)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-gray-100">
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Efectivas</p>
                            <p className="text-sm sm:text-sm font-semibold text-gray-900">{calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod).effectiveHours}h</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Almuerzo</p>
                            <p className="text-sm sm:text-sm font-semibold text-gray-900">{calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod).lunchHours}h</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Extras</p>
                            <p className="text-sm sm:text-sm font-semibold text-gray-900">{calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod).overtimeHours}h</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Vista agrupada por fecha
                    Object.entries(groupedSchedules).map(([date, daySchedules]) => (
                      <React.Fragment key={date}>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors duration-150 p-4">
                          <button
                            onClick={() => toggleDateExpansion(date)}
                            className="flex items-center justify-between w-full text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`transform transition-transform duration-200 ${expandedDates.has(date) ? 'rotate-90' : ''}`}>
                                ▶
                              </span>
                              <span className="text-lg font-semibold text-gray-900">{formatDate(date)}</span>
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {daySchedules.length} horario{daySchedules.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </button>
                        </div>
                        {expandedDates.has(date) && daySchedules.map((schedule, index) => (
                          <div key={schedule.id} className={`p-4 pl-6 sm:pl-8 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-lg font-semibold text-gray-900 truncate">{schedule.name}</h3>
                              </div>
                              <div className="flex gap-1 sm:gap-2 ml-2">
                                <button
                                  onClick={() => openModal(schedule)}
                                  className="text-blue-600 hover:text-blue-800 p-2 sm:p-2 rounded hover:bg-blue-100 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                                  title="Editar"
                                >
                                  <Edit size={20} />
                                </button>
                                <button
                                  onClick={() => deleteSchedule(schedule.id)}
                                  className="text-red-600 hover:text-red-800 p-2 sm:p-2 rounded hover:bg-red-100 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                                  title="Eliminar"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Entrada</p>
                                <span className="inline-flex items-center px-3 py-2 sm:px-3 sm:py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                                  {formatTime12(schedule.entryTime)}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Salida</p>
                                <span className="inline-flex items-center px-3 py-2 sm:px-3 sm:py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 shadow-sm">
                                  {formatTime12(schedule.exitTime)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-gray-100">
                              <div className="text-center">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Efectivas</p>
                                <p className="text-sm sm:text-sm font-semibold text-gray-900">{calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod).effectiveHours}h</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Almuerzo</p>
                                <p className="text-sm sm:text-sm font-semibold text-gray-900">{calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod).lunchHours}h</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Extras</p>
                                <p className="text-sm sm:text-sm font-semibold text-gray-900">{calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod).overtimeHours}h</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-full sm:max-w-md w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
              <div className="christmas-header px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl" style={{ position: 'relative', overflow: 'visible' }}>
                <div className="string-lights" aria-hidden>
                  <svg viewBox="0 0 600 80" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M10 40 C120 5, 240 75, 360 30 C460 0, 540 50, 590 40" stroke="#2d2926" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.9" />
                    <g transform="translate(10,0)">
                      <circle className="bulb" cx="40" cy="38" r="6" fill="#ef4444" />
                      <circle className="bulb" cx="110" cy="30" r="6" fill="#10b981" />
                      <circle className="bulb" cx="190" cy="46" r="6" fill="#f59e0b" />
                      <circle className="bulb" cx="280" cy="28" r="6" fill="#8b5cf6" />
                      <circle className="bulb" cx="370" cy="40" r="6" fill="#3b82f6" />
                    </g>
                  </svg>
                </div>
                <h3 className="christmas-title text-center text-sm sm:text-lg">
                  {editingSchedule ? 'Editar Horario' : 'Agregar Nuevo Horario'}
                </h3>
              </div>
              <div className="p-4 sm:p-6 flex-1 sm:flex-none">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 sm:px-4 sm:py-3 border text-base min-h-[44px]"
                      placeholder="Ingrese el nombre"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({...form, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 border"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Entrada</label>
                      <input
                        type="time"
                        value={form.entryTime}
                        onChange={(e) => setForm({...form, entryTime: e.target.value})}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 sm:px-4 sm:py-3 border text-base min-h-[44px]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Salida</label>
                      <input
                        type="time"
                        value={form.exitTime}
                        onChange={(e) => setForm({...form, exitTime: e.target.value})}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 sm:px-4 sm:py-3 border text-base min-h-[44px]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 sm:py-3 px-4 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-h-[48px] text-base touch-manipulation"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 sm:py-3 px-4 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-h-[48px] text-base touch-manipulation"
                    >
                      {editingSchedule ? 'Actualizar' : 'Agregar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;