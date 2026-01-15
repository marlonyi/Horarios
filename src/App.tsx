import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Download, FileText, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas';

// Estilos corporativos
import 'lucide-react';

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
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState(''); // Iniciar sin filtro para mostrar todos los horarios
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [reportBaseDate, setReportBaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const toggleEmployeeDetails = (employeeName: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeName)) {
      newExpanded.delete(employeeName);
    } else {
      newExpanded.add(employeeName);
    }
    setExpandedEmployees(newExpanded);
  };

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
          { id: '6', name: 'Andrea', date: '2025-12-18', entryTime: '10:00', exitTime: '19:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '7', name: 'Danna', date: '2025-12-18', entryTime: '11:00', exitTime: '20:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '8', name: 'Gloria', date: '2025-12-18', entryTime: '12:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '9', name: 'Keilly', date: '2025-12-18', entryTime: '14:00', exitTime: '22:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '10', name: 'Kasiel', date: '2025-12-18', entryTime: '13:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '11', name: 'Yina', date: '2025-12-18', entryTime: '15:00', exitTime: '23:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          // Día 19 - Mismos horarios
          { id: '11', name: 'Julie', date: '2025-12-19', entryTime: '08:00', exitTime: '21:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '12', name: 'Paola', date: '2025-12-19', entryTime: '08:00', exitTime: '17:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '13', name: 'Katia', date: '2025-12-19', entryTime: '09:00', exitTime: '21:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '14', name: 'Kendry', date: '2025-12-19', entryTime: '09:00', exitTime: '18:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '15', name: 'Claudia', date: '2025-12-19', entryTime: '10:00', exitTime: '19:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '16', name: 'Andrea', date: '2025-12-19', entryTime: '10:00', exitTime: '19:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '17', name: 'Danna', date: '2025-12-19', entryTime: '11:00', exitTime: '20:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '18', name: 'Gloria', date: '2025-12-19', entryTime: '12:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '19', name: 'Keilly', date: '2025-12-19', entryTime: '14:00', exitTime: '22:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '20', name: 'Kasiel', date: '2025-12-19', entryTime: '13:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '21', name: 'Yina', date: '2025-12-19', entryTime: '15:00', exitTime: '23:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          // Día 20 - Mismos horarios
          { id: '21', name: 'Julie', date: '2025-12-20', entryTime: '08:00', exitTime: '21:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '22', name: 'Paola', date: '2025-12-20', entryTime: '08:00', exitTime: '17:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '23', name: 'Katia', date: '2025-12-20', entryTime: '09:00', exitTime: '21:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '24', name: 'Kendry', date: '2025-12-20', entryTime: '09:00', exitTime: '18:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '25', name: 'Claudia', date: '2025-12-20', entryTime: '10:00', exitTime: '19:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '26', name: 'Andrea', date: '2025-12-20', entryTime: '10:00', exitTime: '19:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '27', name: 'Danna', date: '2025-12-20', entryTime: '11:00', exitTime: '20:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '28', name: 'Gloria', date: '2025-12-20', entryTime: '12:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '29', name: 'Keilly', date: '2025-12-20', entryTime: '14:00', exitTime: '22:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '30', name: 'Kasiel', date: '2025-12-20', entryTime: '13:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '31', name: 'Yina', date: '2025-12-20', entryTime: '15:00', exitTime: '23:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          // Día 21
          { id: '32', name: 'Danna', date: '2025-12-21', entryTime: '09:00', exitTime: '18:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '33', name: 'Julie', date: '2025-12-21', entryTime: '09:00', exitTime: '18:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '34', name: 'Andrea', date: '2025-12-21', entryTime: '10:00', exitTime: '19:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '35', name: 'Yina', date: '2025-12-21', entryTime: '10:00', exitTime: '19:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '36', name: 'Gloria', date: '2025-12-21', entryTime: '11:00', exitTime: '20:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '37', name: 'Keilly', date: '2025-12-21', entryTime: '11:00', exitTime: '20:00', entryPeriod: 'AM', exitPeriod: 'PM' },
          { id: '38', name: 'Katia', date: '2025-12-21', entryTime: '12:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '39', name: 'Paola', date: '2025-12-21', entryTime: '12:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '40', name: 'Kendry', date: '2025-12-21', entryTime: '12:00', exitTime: '21:00', entryPeriod: 'PM', exitPeriod: 'PM' },
          { id: '41', name: 'Angela', date: '2025-12-22', entryTime: '00:00', exitTime: '00:01', entryPeriod: 'AM', exitPeriod: 'AM' },
          { id: '42', name: 'Diosely', date: '2025-12-23', entryTime: '00:00', exitTime: '00:01', entryPeriod: 'AM', exitPeriod: 'AM' },
        ];
        setSchedules(testData);
      } else {
        setSchedules(saved);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveSchedulesToDB(schedules);
    }
  }, [schedules, isLoading]);

  // Limpiar empleados seleccionados que ya no están disponibles para la fecha
  useEffect(() => {
    if (form.date && selectedEmployees.length > 0) {
      const availableEmployees = getAvailableEmployeesForDate(form.date);
      const availableSelected = selectedEmployees.filter(employee =>
        availableEmployees.some(available =>
          available.toLowerCase() === employee.toLowerCase()
        ) || (editingSchedule && employee === editingSchedule.name)
      );

      if (availableSelected.length !== selectedEmployees.length) {
        setSelectedEmployees(availableSelected);
        if (availableSelected.length === 0) {
          setEmployeeSearch('');
        }
      }
    }
  }, [form.date, schedules, selectedEmployees.length]);

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


  const calculateWorkHours = (entry: string, exit: string, _entryPeriod: 'AM' | 'PM') => {
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
    const preferWhatsAppFallback = !(navigator && (navigator as any).share);
    let waPopup: Window | null = null;
    if (preferWhatsAppFallback) {
      try { waPopup = window.open('', '_blank'); } catch (e) { waPopup = null; }
    }

    // Calcular totales para el reporte
    let totalEffective = 0;
    let totalOvertime = 0;
    let totalLunch = 0;

    sortedSchedules.forEach(schedule => {
      const stats = calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod);
      totalEffective += stats.effectiveHours;
      totalOvertime += stats.overtimeHours;
      totalLunch += stats.lunchHours;
    });

    const summaryElement = document.createElement('div');
    // Forzar dimensiones y posición para asegurar captura completa en móviles
    summaryElement.style.position = 'fixed';
    summaryElement.style.left = '0';
    summaryElement.style.top = '0';
    summaryElement.style.width = '1200px';
    summaryElement.style.height = 'auto';
    summaryElement.style.zIndex = '-9999';
    summaryElement.style.backgroundColor = '#ffffff';

    // Corporate Styles for the Report
    summaryElement.innerHTML = `
      <div class="summary-card" style="padding:40px; background: #fff; width:1200px; margin:0 auto; font-family: 'Inter', sans-serif; color: #1e293b;">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .summary-card { position: relative; overflow: hidden; }
          .report-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .company-info h1 { margin: 0; font-size: 32px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; }
          .company-info p { margin: 5px 0 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          .report-meta { text-align: right; }
          .report-meta h2 { margin: 0; font-size: 24px; color: #3b82f6; font-weight: 600; }
          .report-meta p { margin: 5px 0 0; color: #64748b; font-size: 16px; }
          
          .summary-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; margin-bottom: 30px; }
          .summary-table th { background: #f8fafc; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; padding: 12px 16px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.5px; }
          .summary-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; vertical-align: middle; }
          .summary-table tr:last-child td { border-bottom: none; }
          .summary-table tfoot td { border-top: 2px solid #e2e8f0; border-bottom: none; font-weight: 700; background: #f8fafc; color: #0f172a; font-size: 15px; }
          
          .employee-name { font-weight: 600; color: #0f172a; font-size: 15px; }
          .time-cell { font-family: 'Inter', monospace; color: #475569; }
          
          .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
          .course-hours { background: #f0f9ff; color: #0284c7; }
          
          .notes-section { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
          .notes-section h4 { margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #475569; text-transform: uppercase; }
          .notes-section ul { margin: 0; padding-left: 20px; color: #64748b; font-size: 13px; }
          .notes-section li { margin-bottom: 4px; }
          
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; color: #94a3b8; font-size: 12px; }
        </style>

        <div class="report-header">
          <div class="company-info">
             <h1>Resumen de Horarios</h1>
             <p>Reporte Oficial de Asistencia</p>
          </div>
          <div class="report-meta">
            <h2>${formatDate(filterDate)}</h2>
            <p>${sortedSchedules.length} empleados programados</p>
          </div>
        </div>

        <table class="summary-table">
          <thead>
            <tr>
              <th style="width: 25%">Empleado</th>
              <th style="width: 20%">Entrada</th>
              <th style="width: 20%">Salida</th>
              <th style="text-align:center">Efectivas</th>
              <th style="text-align:center">Almuerzo</th>
              <th style="text-align:center">Extras</th>
            </tr>
          </thead>
          <tbody>
            ${sortedSchedules.map((schedule) => {
      const workHours = calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod);
      return `
              <tr>
                <td class="employee-name">${schedule.name}</td>
                <td class="time-cell">${formatTime12(schedule.entryTime)}</td>
                <td class="time-cell">${formatTime12(schedule.exitTime)}</td>
                <td style="text-align:center"><span class="badge ${workHours.effectiveHours >= 8 ? 'course-hours' : ''}">${workHours.effectiveHours}h</span></td>
                <td style="text-align:center; color: #94a3b8;">${workHours.lunchHours > 0 ? workHours.lunchHours + 'h' : '-'}</td>
                <td style="text-align:center; ${workHours.overtimeHours > 0 ? 'color:#ef4444; font-weight:600;' : 'color:#94a3b8;'}">${workHours.overtimeHours > 0 ? '+' + workHours.overtimeHours + 'h' : '-'}</td>
              </tr>
              `;
    }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align:right; padding-right: 20px;">TOTALES</td>
              <td style="text-align:center; color: #0284c7;">${totalEffective.toFixed(1)}h</td>
              <td style="text-align:center; color: #64748b;">${totalLunch.toFixed(1)}h</td>
              <td style="text-align:center; color: #ef4444;">${totalOvertime > 0 ? '+' + totalOvertime.toFixed(1) + 'h' : '-'}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="notes-section">
          <h4>Notas Importantes:</h4>
          <ul>
            <li>Las horas efectivas incluyen la deducción del tiempo de almuerzo.</li>
            <li>Se considera hora extra todo tiempo laborado después de las 8 horas diarias.</li>
            <li>Este reporte es generado automáticamente y sirve como registro oficial.</li>
          </ul>
        </div>

        <div class="footer">
          <span>Generado automáticamente por Control de Horarios</span>
          <span>${new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</span>
        </div>
      </div>
    `;

    document.body.appendChild(summaryElement);

    try {
      const canvas = await html2canvas(summaryElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        windowWidth: 1200,
      });

      document.body.removeChild(summaryElement);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte-${filterDate}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Intentar compartir usando Web Share API con archivo
          try {
            const file = new File([blob], `horarios-${filterDate}.png`, { type: 'image/png' });
            const nav: any = navigator;

            // Intento 1: API Nativa de Compartir
            if (nav.share) {
              try {
                await nav.share({
                  files: [file],
                  title: `Horarios del ${formatDate(filterDate)}`,
                  text: `Resumen de horarios para ${formatDate(filterDate)}`,
                });
                return; // Éxito
              } catch (shareErr: any) {
                const errorMsg = shareErr instanceof Error ? shareErr.message : String(shareErr);
                if (!errorMsg.includes('AbortError')) {
                  alert(`Error intentando compartir: ${errorMsg}`);
                }
                console.warn('Share API failed:', shareErr);
              }
            } else {
              alert('Tu navegador no soporta compartir archivos automáticamente.');
            }

            // Intento 2: Fallback
            alert('La imagen se ha descargado en tu dispositivo.\n\nSe abrirá WhatsApp para que puedas adjuntarla manualmente.');

            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Horarios del ' + formatDate(filterDate) + ' - Adjunto reporte (imagen ya descargada).')}`;

            if (waPopup) {
              try { waPopup.location.href = whatsappUrl; } catch (e) { window.open(whatsappUrl, '_blank'); }
            } else {
              window.open(whatsappUrl, '_blank');
            }

          } catch (err: any) {
            console.warn('General share error:', err);
            alert(`Error General: ${err.message}`);
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image', error);
      if (summaryElement.parentElement) document.body.removeChild(summaryElement);
    }
  };


  // Obtener lista de empleados únicos de los horarios existentes
  const getUniqueEmployees = () => {
    const employees = new Set<string>();

    // Lista base de empleados disponibles
    const baseEmployees = [
      'Julie', 'Paola', 'Katia', 'Kendry', 'Claudia', 'Andrea',
      'Danna', 'Gloria', 'Keilly', 'Kasiel', 'Yina', 'Angela'
    ];

    // Agregar empleados base
    baseEmployees.forEach(employee => employees.add(employee.trim()));

    // Agregar empleados de horarios existentes
    schedules.forEach(schedule => {
      if (schedule.name.trim()) {
        employees.add(schedule.name.trim());
      }
    });

    return Array.from(employees).sort();
  };

  // Obtener empleados disponibles para una fecha específica (que no tienen horario ese día)
  const getAvailableEmployeesForDate = (date: string) => {
    const allEmployees = getUniqueEmployees();
    const scheduledEmployees = new Set(
      schedules
        .filter(schedule => schedule.date === date)
        .map(schedule => schedule.name.toLowerCase().trim())
    );

    return allEmployees.filter(employee =>
      !scheduledEmployees.has(employee.toLowerCase().trim())
    );
  };

  // Calcular estadísticas de trabajo por empleado y período
  const calculateEmployeeStats = (employeeName: string, startDate: string, endDate: string) => {
    const employeeSchedules = schedules.filter(schedule =>
      schedule.name.toLowerCase() === employeeName.toLowerCase() &&
      schedule.date >= startDate &&
      schedule.date <= endDate
    );

    let totalHours = 0;
    let effectiveHours = 0;
    let overtimeHours = 0;
    let lunchHours = 0;
    const workDays: string[] = [];
    const workDetails: Array<{
      date: string;
      entryTime: string;
      exitTime: string;
      entryPeriod: string;
      exitPeriod: string;
      totalHours: number;
      effectiveHours: number;
      overtimeHours: number;
      lunchHours: number;
    }> = [];

    employeeSchedules.forEach(schedule => {
      const workStats = calculateWorkHours(schedule.entryTime, schedule.exitTime, schedule.entryPeriod);
      totalHours += workStats.totalHours;
      effectiveHours += workStats.effectiveHours;
      overtimeHours += workStats.overtimeHours;
      lunchHours += workStats.lunchHours;
      workDays.push(schedule.date);

      workDetails.push({
        date: schedule.date,
        entryTime: schedule.entryTime,
        exitTime: schedule.exitTime,
        entryPeriod: schedule.entryPeriod,
        exitPeriod: schedule.exitPeriod,
        totalHours: workStats.totalHours,
        effectiveHours: workStats.effectiveHours,
        overtimeHours: workStats.overtimeHours,
        lunchHours: workStats.lunchHours
      });
    });

    return {
      employeeName,
      workDays: workDays.length,
      workDaysList: workDays,
      workDetails,
      totalHours: Math.round(totalHours * 100) / 100,
      effectiveHours: Math.round(effectiveHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      lunchHours: Math.round(lunchHours * 100) / 100,
      avgDailyHours: workDays.length > 0 ? Math.round((totalHours / workDays.length) * 100) / 100 : 0
    };
  };

  // Generar reporte por período
  const generatePeriodReport = (periodType: 'daily' | 'weekly' | 'biweekly' | 'monthly', startDate?: string) => {
    const employees = getUniqueEmployees();
    let reportStartDate: string;
    let reportEndDate: string;
    let periodName: string;

    // Crear fecha base sin problemas de zona horaria
    let baseDate: Date;
    if (startDate) {
      // Parsear fecha en formato YYYY-MM-DD correctamente
      const [year, month, day] = startDate.split('-').map(Number);
      baseDate = new Date(year, month - 1, day); // Meses van de 0-11
    } else {
      baseDate = new Date();
    }

    switch (periodType) {
      case 'daily':
        reportStartDate = baseDate.toISOString().split('T')[0];
        reportEndDate = baseDate.toISOString().split('T')[0];
        periodName = `Día ${formatDate(reportStartDate)}`;
        break;
      case 'weekly':
        // Calcular semana dentro del mes actual
        const currentMonth = baseDate.getMonth();
        const currentYear = baseDate.getFullYear();
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);

        // Encontrar el inicio de semana más cercano dentro del mes
        let weekStart = new Date(baseDate);
        weekStart.setDate(baseDate.getDate() - baseDate.getDay()); // Domingo

        // Si el inicio de semana está antes del inicio del mes, usar el inicio del mes
        if (weekStart < monthStart) {
          weekStart = new Date(monthStart);
        }

        // Calcular el fin de semana
        let weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Si el fin de semana está después del fin del mes, usar el fin del mes
        if (weekEnd > monthEnd) {
          weekEnd = new Date(monthEnd);
        }

        reportStartDate = weekStart.toISOString().split('T')[0];
        reportEndDate = weekEnd.toISOString().split('T')[0];
        periodName = `Semana del ${formatDate(reportStartDate)} al ${formatDate(reportEndDate)}`;
        break;
      case 'biweekly':
        // Mantener la lógica actual pero asegurar que esté dentro del mes
        const biweekStart = new Date(baseDate);
        const dayOfMonth = baseDate.getDate();
        const monthForBiweek = baseDate.getMonth();
        const yearForBiweek = baseDate.getFullYear();

        if (dayOfMonth <= 15) {
          biweekStart.setDate(1);
        } else {
          biweekStart.setDate(16);
        }

        const biweekEnd = new Date(biweekStart);
        biweekEnd.setDate(biweekStart.getDate() + 14);

        // Asegurar que no exceda el fin del mes
        const actualMonthEnd = new Date(yearForBiweek, monthForBiweek + 1, 0);
        if (biweekEnd > actualMonthEnd) {
          biweekEnd.setTime(actualMonthEnd.getTime());
        }

        reportStartDate = biweekStart.toISOString().split('T')[0];
        reportEndDate = biweekEnd.toISOString().split('T')[0];
        periodName = `Quincena del ${formatDate(reportStartDate)} al ${formatDate(reportEndDate)}`;
        break;
      case 'monthly':
        const monthlyStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const monthlyEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
        reportStartDate = monthlyStart.toISOString().split('T')[0];
        reportEndDate = monthlyEnd.toISOString().split('T')[0];
        periodName = `Mes de ${baseDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
        break;
    }

    switch (periodType) {
      case 'daily':
        reportStartDate = baseDate.toISOString().split('T')[0];
        reportEndDate = baseDate.toISOString().split('T')[0];
        periodName = `Día ${formatDate(reportStartDate)}`;
        break;
      case 'weekly':
        // Calcular semana dentro del mes actual
        const currentMonth = baseDate.getMonth();
        const currentYear = baseDate.getFullYear();
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);

        // Encontrar el inicio de semana más cercano dentro del mes
        let weekStart = new Date(baseDate);
        weekStart.setDate(baseDate.getDate() - baseDate.getDay()); // Domingo

        // Si el inicio de semana está antes del inicio del mes, usar el inicio del mes
        if (weekStart < monthStart) {
          weekStart = new Date(monthStart);
        }

        // Calcular el fin de semana
        let weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Si el fin de semana está después del fin del mes, usar el fin del mes
        if (weekEnd > monthEnd) {
          weekEnd = new Date(monthEnd);
        }

        reportStartDate = weekStart.toISOString().split('T')[0];
        reportEndDate = weekEnd.toISOString().split('T')[0];
        periodName = `Semana del ${formatDate(reportStartDate)} al ${formatDate(reportEndDate)}`;
        break;
      case 'biweekly':
        // Mantener la lógica actual pero asegurar que esté dentro del mes
        const biweekStart = new Date(baseDate);
        const dayOfMonth = baseDate.getDate();
        const monthForBiweek = baseDate.getMonth();
        const yearForBiweek = baseDate.getFullYear();

        if (dayOfMonth <= 15) {
          biweekStart.setDate(1);
        } else {
          biweekStart.setDate(16);
        }

        const biweekEnd = new Date(biweekStart);
        biweekEnd.setDate(biweekStart.getDate() + 14);

        // Asegurar que no exceda el fin del mes
        const actualMonthEnd = new Date(yearForBiweek, monthForBiweek + 1, 0);
        if (biweekEnd > actualMonthEnd) {
          biweekEnd.setTime(actualMonthEnd.getTime());
        }

        reportStartDate = biweekStart.toISOString().split('T')[0];
        reportEndDate = biweekEnd.toISOString().split('T')[0];
        periodName = `Quincena del ${formatDate(reportStartDate)} al ${formatDate(reportEndDate)}`;
        break;
      case 'monthly':
        const monthlyStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const monthlyEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
        reportStartDate = monthlyStart.toISOString().split('T')[0];
        reportEndDate = monthlyEnd.toISOString().split('T')[0];
        periodName = `Mes de ${baseDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
        break;
    }

    const employeeStats = employees.map(employee =>
      calculateEmployeeStats(employee, reportStartDate, reportEndDate)
    ).filter(stat => stat.workDays > 0); // Solo empleados que trabajaron

    return {
      periodName,
      startDate: reportStartDate,
      endDate: reportEndDate,
      employeeStats,
      summary: {
        totalEmployees: employeeStats.length,
        totalWorkDays: employeeStats.reduce((sum, stat) => sum + stat.workDays, 0),
        totalHours: employeeStats.reduce((sum, stat) => sum + stat.totalHours, 0),
        totalEffectiveHours: employeeStats.reduce((sum, stat) => sum + stat.effectiveHours, 0),
        totalOvertimeHours: employeeStats.reduce((sum, stat) => sum + stat.overtimeHours, 0),
        avgHoursPerEmployee: employeeStats.length > 0 ?
          Math.round((employeeStats.reduce((sum, stat) => sum + stat.totalHours, 0) / employeeStats.length) * 100) / 100 : 0
      }
    };
  };

  // Exportar reporte a CSV
  const exportReportToCSV = (report: any) => {
    const csvRows: string[][] = [];

    // === ENCABEZADO DEL REPORTE ===
    csvRows.push([`REPORTE DE HORARIOS - ${report.periodName}`]);
    csvRows.push([`PERIODO: ${formatDate(report.startDate)} - ${formatDate(report.endDate)}`]);
    csvRows.push([`GENERADO: ${new Date().toLocaleString('es-ES')}`]);
    csvRows.push([`TOTAL EMPLEADOS: ${report.summary.totalEmployees}`]);
    csvRows.push([]); // Línea vacía

    // === RESUMEN GENERAL ===
    csvRows.push(['RESUMEN GENERAL']);
    csvRows.push(['METRICA', 'VALOR']);
    csvRows.push(['Empleados Totales', report.summary.totalEmployees.toString()]);
    csvRows.push(['Dias Trabajados Totales', report.summary.totalWorkDays.toString()]);
    csvRows.push(['Horas Totales', report.summary.totalHours.toFixed(2)]);
    csvRows.push(['Horas Efectivas Totales', report.summary.totalEffectiveHours.toFixed(2)]);
    csvRows.push(['Horas Extras Totales', report.summary.totalOvertimeHours.toFixed(2)]);
    csvRows.push([]); // Línea vacía

    // === ESTADISTICAS POR EMPLEADO ===
    if (report.employeeStats.length > 0) {
      csvRows.push(['ESTADISTICAS POR EMPLEADO']);
      csvRows.push(['Empleado', 'Dias Trabajados', 'Horas Totales', 'Horas Efectivas', 'Horas Extras', 'Horas Almuerzo']);

      // Agregar cada empleado
      report.employeeStats.forEach((stat: any) => {
        csvRows.push([
          stat.employeeName,
          stat.workDays.toString(),
          stat.totalHours.toFixed(2),
          stat.effectiveHours.toFixed(2),
          stat.overtimeHours.toFixed(2),
          stat.lunchHours.toFixed(2)
        ]);
      });

      // Fila de totales
      csvRows.push([
        'TOTAL',
        report.summary.totalWorkDays.toString(),
        report.summary.totalHours.toFixed(2),
        report.summary.totalEffectiveHours.toFixed(2),
        report.summary.totalOvertimeHours.toFixed(2),
        '' // Horas almuerzo no se suman
      ]);
      csvRows.push([]); // Línea vacía

      // === DETALLES POR DIA ===
      csvRows.push(['DETALLES POR DIA']);

      report.employeeStats.forEach((stat: any) => {
        csvRows.push([`EMPLEADO: ${stat.employeeName}`]);
        csvRows.push(['Fecha', 'Entrada', 'Salida', 'Horas Totales', 'Horas Efectivas', 'Horas Extras', 'Horas Almuerzo']);

        // Ordenar los detalles por fecha
        stat.workDetails
          .sort((a: any, b: any) => a.date.localeCompare(b.date))
          .forEach((detail: any) => {
            csvRows.push([
              formatDate(detail.date),
              `${detail.entryTime} ${detail.entryPeriod}`,
              `${detail.exitTime} ${detail.exitPeriod}`,
              detail.totalHours.toFixed(2),
              detail.effectiveHours.toFixed(2),
              detail.overtimeHours.toFixed(2),
              detail.lunchHours.toFixed(2)
            ]);
          });

        csvRows.push([]); // Línea vacía entre empleados
      });
    } else {
      csvRows.push(['NO HAY DATOS PARA EL PERIODO SELECCIONADO']);
    }

    // === NOTAS ===
    csvRows.push(['NOTAS:']);
    csvRows.push(['- Las horas efectivas ya incluyen deduccion de tiempo de almuerzo']);
    csvRows.push(['- Las horas extras son aquellas trabajadas mas alla de 8 horas diarias']);
    csvRows.push(['- Los calculos se basan unicamente en los dias que tienen horarios registrados']);

    const csvContent = csvRows
      .map(row => row.map((cell: string | number) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${report.periodName.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Obtener la siguiente fecha disponible (considerando variabilidad diaria)
  const getNextAvailableDate = (startDate?: string) => {
    let currentDate = startDate ? new Date(startDate) : new Date();

    // Buscar hasta 30 días hacia adelante
    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const scheduledToday = schedules.filter(s => s.date === dateStr);

      // Una fecha es "disponible" si:
      // 1. No tiene horarios asignados (fecha completamente libre)
      // 2. Tiene algunos horarios pero no está "muy llena" (menos del 80% de empleados asignados)
      const maxReasonableAssignments = Math.max(5, Math.floor(getUniqueEmployees().length * 0.8));

      if (scheduledToday.length === 0 || scheduledToday.length < maxReasonableAssignments) {
        return dateStr;
      }

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Si no se encontró fecha disponible, devolver la fecha actual + 1 día
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Función para validar si hay conflicto de horarios
  const validateScheduleConflict = (name: string, date: string, entryTime: string, exitTime: string, excludeId?: string) => {
    const entry = new Date(`${date}T${entryTime}`);
    const exit = new Date(`${date}T${exitTime}`);

    if (exit <= entry) {
      return 'La hora de salida debe ser posterior a la hora de entrada';
    }

    // Verificar conflictos con otros horarios del mismo empleado en la misma fecha
    const conflicts = schedules.filter(schedule =>
      schedule.id !== excludeId &&
      schedule.name.toLowerCase() === name.toLowerCase() &&
      schedule.date === date
    );

    for (const conflict of conflicts) {
      const conflictEntry = new Date(`${conflict.date}T${conflict.entryTime}`);
      const conflictExit = new Date(`${conflict.date}T${conflict.exitTime}`);

      // Verificar si hay superposición
      if ((entry >= conflictEntry && entry < conflictExit) ||
        (exit > conflictEntry && exit <= conflictExit) ||
        (entry <= conflictEntry && exit >= conflictExit)) {
        return `Conflicto de horario: ${conflict.entryTime} - ${conflict.exitTime}`;
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que haya empleados seleccionados
    if (selectedEmployees.length === 0) {
      setError('Debe seleccionar al menos un empleado.');
      return;
    }
    if (!form.date) {
      setError('La fecha es obligatoria.');
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

    // Validar conflictos de horario para todos los empleados seleccionados
    for (const employeeName of selectedEmployees) {
      const conflictError = validateScheduleConflict(
        employeeName,
        form.date,
        form.entryTime,
        form.exitTime,
        editingSchedule?.id
      );
      if (conflictError) {
        setError(`Conflicto para ${employeeName}: ${conflictError}`);
        return;
      }
    }

    // Crear horarios para todos los empleados seleccionados
    const newSchedules: Schedule[] = selectedEmployees.map(employeeName => ({
      id: editingSchedule && selectedEmployees.length === 1 ? editingSchedule.id : Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: employeeName,
      date: form.date,
      entryTime: form.entryTime,
      exitTime: form.exitTime,
      entryPeriod: form.entryTime < '12:00' ? 'AM' : 'PM',
      exitPeriod: form.exitTime < '12:00' ? 'AM' : 'PM',
    }));

    if (editingSchedule && selectedEmployees.length === 1) {
      setSchedules(schedules.map(s => s.id === editingSchedule.id ? newSchedules[0] : s));
    } else {
      setSchedules([...schedules, ...newSchedules]);
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
      setEmployeeSearch(schedule.name);
      setSelectedEmployees([schedule.name]);
    } else {
      // Usar la fecha filtrada actual o la siguiente fecha disponible
      const suggestedDate = filterDate || getNextAvailableDate();
      setForm({
        name: '',
        date: suggestedDate,
        entryTime: '',
        exitTime: '',
      });
      setEditingSchedule(null);
      setEmployeeSearch('');
      setSelectedEmployees([]);
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
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Control de Horarios</h1>
            <p className="text-slate-500 mt-1">Sistema de gestión de asistencia y turnos</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          <div className="p-3 sm:p-4 md:p-6 lg:p-8 min-h-[calc(100vh-8rem)] sm:min-h-0">
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => openModal()}
                className="button-primary bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 sm:py-3 px-4 sm:px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
              >
                <Plus size={20} />
                Agregar Horario
              </button>

              <button
                onClick={() => setShowReportsModal(true)}
                className="button-secondary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 sm:py-3 px-4 sm:px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
              >
                📊 Generar Reportes
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

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
              {/* Indicador del día filtrado */}
              {filterDate && (
                <div className="hidden sm:block bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-6 py-4">
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
              <div className="hidden sm:block overflow-x-auto">
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
                                  <div className="flex gap-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                      {daySchedules.length} empleado{daySchedules.length !== 1 ? 's' : ''}
                                    </span>
                                    {(() => {
                                      const totalEmployees = getUniqueEmployees().length;
                                      const occupancyRate = totalEmployees > 0 ? Math.round((daySchedules.length / totalEmployees) * 100) : 0;
                                      const occupancyColor = occupancyRate >= 80 ? 'bg-red-100 text-red-800' :
                                        occupancyRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-green-100 text-green-800';
                                      return (
                                        <span className={`${occupancyColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                                          {occupancyRate}% ocupado
                                        </span>
                                      );
                                    })()}
                                  </div>
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
              <div className="block sm:hidden">
                {filterDate && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-3 mb-4 rounded-xl">
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-200 scale-100">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
                <h3 className="text-lg font-semibold text-slate-800">
                  {editingSchedule ? 'Editar Horario' :
                    selectedEmployees.length > 1 ? `Programar (${selectedEmployees.length})` :
                      'Nuevo Horario'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Empleados ({selectedEmployees.length})
                    </label>

                    {/* Selected Employees Tags */}
                    {selectedEmployees.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {selectedEmployees.map((employee, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            <span>{employee}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEmployees(selectedEmployees.filter(e => e !== employee));
                                if (selectedEmployees.length === 1) {
                                  setForm({ ...form, name: '' });
                                  setEmployeeSearch('');
                                }
                              }}
                              className="ml-1.5 text-blue-400 hover:text-blue-600 focus:outline-none"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Employee Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={employeeSearch}
                        onChange={(e) => {
                          setEmployeeSearch(e.target.value);
                          setShowEmployeeDropdown(true);
                        }}
                        onFocus={() => setShowEmployeeDropdown(true)}
                        onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 text-sm"
                        placeholder="Buscar empleado..."
                      />
                      {showEmployeeDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                          {(form.date ? getAvailableEmployeesForDate(form.date) : getUniqueEmployees())
                            .filter(employee =>
                              employee.toLowerCase().includes(employeeSearch.toLowerCase()) &&
                              !selectedEmployees.includes(employee)
                            )
                            .map((employee, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-slate-700 text-sm flex items-center justify-between transition-colors"
                                onMouseDown={() => {
                                  setSelectedEmployees([...selectedEmployees, employee]);
                                  setEmployeeSearch('');
                                  setShowEmployeeDropdown(false);
                                }}
                              >
                                <span className="font-medium">{employee}</span>
                                <Plus size={14} className="text-slate-400" />
                              </div>
                            ))}
                          {(form.date ? getAvailableEmployeesForDate(form.date) : getUniqueEmployees())
                            .filter(employee =>
                              employee.toLowerCase().includes(employeeSearch.toLowerCase()) &&
                              !selectedEmployees.includes(employee)
                            ).length === 0 && employeeSearch.trim() && (
                              <div
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-blue-700 text-sm flex items-center justify-between border-t border-slate-100"
                                onMouseDown={() => {
                                  setSelectedEmployees([...selectedEmployees, employeeSearch.trim()]);
                                  setEmployeeSearch('');
                                  setShowEmployeeDropdown(false);
                                }}
                              >
                                <span>Crear "{employeeSearch.trim()}"</span>
                                <Plus size={14} />
                              </div>
                            )}
                          {(form.date ? getAvailableEmployeesForDate(form.date) : getUniqueEmployees())
                            .filter(employee =>
                              employee.toLowerCase().includes(employeeSearch.toLowerCase()) &&
                              !selectedEmployees.includes(employee)
                            ).length === 0 && !employeeSearch.trim() && (
                              <div className="px-4 py-3 text-slate-500 text-xs text-center italic">
                                {form.date ? 'Todos asignados este día' : 'No hay empleados'}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Fecha
                      {form.date && (() => {
                        const scheduledToday = schedules.filter(s => s.date === form.date).length;
                        const maxReasonable = Math.max(5, Math.floor(getUniqueEmployees().length * 0.8));
                        return scheduledToday >= maxReasonable ? (
                          <span className="text-amber-600 text-xs ml-2 font-normal">(Fecha con alta ocupación)</span>
                        ) : null;
                      })()}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          const availableEmployees = getAvailableEmployeesForDate(newDate);

                          // Si la fecha está completa, sugerir la siguiente disponible
                          if (availableEmployees.length === 0) {
                            const nextDate = getNextAvailableDate(newDate);
                            setForm({ ...form, date: nextDate, name: '' });
                            setEmployeeSearch('');
                            alert(`La fecha ${newDate} ya está completa. Se cambió automáticamente a ${nextDate}.`);
                          } else {
                            setForm({ ...form, date: newDate, name: '' });
                            setEmployeeSearch('');
                          }
                        }}
                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 text-slate-900 text-sm"
                        required
                      />
                      <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Entrada</label>
                      <input
                        type="time"
                        value={form.entryTime}
                        onChange={(e) => setForm({ ...form, entryTime: e.target.value })}
                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 text-slate-900 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Salida</label>
                      <input
                        type="time"
                        value={form.exitTime}
                        onChange={(e) => setForm({ ...form, exitTime: e.target.value })}
                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 text-slate-900 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-colors duration-200 text-sm"
                    >
                      {editingSchedule ? 'Guardar Cambios' : 'Agregar Horario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reports Modal */}
        {showReportsModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-200 scale-100">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <FileText size={20} className="text-slate-500" />
                  Reportes y Estadísticas
                </h3>
                <button
                  onClick={() => setShowReportsModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-8 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    Configuración
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Periodo</label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly')}
                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 text-slate-900 text-sm bg-white"
                      >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="biweekly">Quincenal</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Referencia</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={reportBaseDate}
                          onChange={(e) => setReportBaseDate(e.target.value)}
                          className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 text-slate-900 text-sm"
                        />
                        <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {(() => {
                  const report = generatePeriodReport(reportType, reportBaseDate);
                  return (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{report.periodName}</h4>
                          <p className="text-sm text-slate-500 mt-1">Del {formatDate(report.startDate)} al {formatDate(report.endDate)}</p>
                        </div>
                        <button
                          onClick={() => exportReportToCSV(report)}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 text-sm"
                        >
                          <Download size={18} />
                          Exportar Excel / CSV
                        </button>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Días</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Horas Total</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Efectivas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Extras</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                              {report.employeeStats.map((stat, index) => (
                                <React.Fragment key={stat.employeeName}>
                                  <tr className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                      <button
                                        onClick={() => toggleEmployeeDetails(stat.employeeName)}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors focus:outline-none group"
                                      >
                                        <span className={`transform transition-transform ${expandedEmployees.has(stat.employeeName) ? 'rotate-90' : ''} text-slate-400 group-hover:text-blue-500`}>▶</span>
                                        {stat.employeeName}
                                      </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                      {stat.workDays}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                      {stat.totalHours.toFixed(1)}h
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-medium bg-green-50/50">
                                      {stat.effectiveHours.toFixed(1)}h
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700 font-medium">
                                      {stat.overtimeHours > 0 ? stat.overtimeHours.toFixed(1) + 'h' : '-'}
                                    </td>
                                  </tr>
                                  {expandedEmployees.has(stat.employeeName) && (
                                    <tr className="bg-slate-50/80">
                                      <td colSpan={5} className="px-6 py-4">
                                        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                                          <table className="min-w-full text-sm divide-y divide-slate-100">
                                            <thead className="bg-slate-100">
                                              <tr>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Horario</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Total</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Efectivas</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Extras</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                              {stat.workDetails
                                                .sort((a, b) => a.date.localeCompare(b.date))
                                                .map((detail) => (
                                                  <tr key={detail.date} className="hover:bg-slate-50">
                                                    <td className="px-4 py-2 whitespace-nowrap text-slate-700">{formatDate(detail.date)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-slate-500">
                                                      {detail.entryTime} - {detail.exitTime}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-slate-600">{detail.totalHours.toFixed(1)}h</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-green-700 font-medium">{detail.effectiveHours.toFixed(1)}h</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-amber-700">{detail.overtimeHours > 0 ? detail.overtimeHours.toFixed(1) + 'h' : '-'}</td>
                                                  </tr>
                                                ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                              {report.employeeStats.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                    No hay registros para este período
                                  </td>
                                </tr>
                              )}
                            </tbody>
                            {report.employeeStats.length > 0 && (
                              <tfoot className="bg-slate-50 border-t border-slate-200">
                                <tr>
                                  <td className="px-6 py-3 text-sm font-bold text-slate-900">TOTALES</td>
                                  <td className="px-6 py-3 text-sm font-bold text-slate-700">{report.summary.totalWorkDays}</td>
                                  <td className="px-6 py-3 text-sm font-bold text-slate-700">{report.summary.totalHours.toFixed(1)}h</td>
                                  <td className="px-6 py-3 text-sm font-bold text-green-700">{report.summary.totalEffectiveHours.toFixed(1)}h</td>
                                  <td className="px-6 py-3 text-sm font-bold text-amber-700">{report.summary.totalOvertimeHours.toFixed(1)}h</td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setShowReportsModal(false)}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 px-6 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;