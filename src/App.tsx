import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

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
    entryHour: '',
    entryMinute: '',
    entryPeriod: 'AM' as 'AM' | 'PM',
    exitHour: '',
    exitMinute: '',
    exitPeriod: 'PM' as 'AM' | 'PM',
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

  const parseTime12 = (hour: string, minute: string, period: string) => {
    let h = parseInt(hour);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2,'0')}:${minute.padStart(2,'0')}`;
  };

  const convertTo12Hour = (hour24: string) => {
    const h = parseInt(hour24);
    let period: 'AM' | 'PM' = 'AM';
    let hour12 = h;
    if (h >= 12) {
      period = 'PM';
      if (h > 12) hour12 = h - 12;
    }
    if (h === 0) hour12 = 12;
    return { hour: hour12.toString(), period };
  };

  const calculateDuration = (entry: string, exit: string) => {
    const e = new Date(`2000-01-01T${entry}`);
    const x = new Date(`2000-01-01T${exit}`);
    const diff = x.getTime() - e.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
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
    const entryHourNum = parseInt(form.entryHour);
    const exitHourNum = parseInt(form.exitHour);
    if (isNaN(entryHourNum) || entryHourNum < 0 || entryHourNum > 23) {
      setError('Hora de entrada inválida (0-23).');
      return;
    }
    if (isNaN(exitHourNum) || exitHourNum < 0 || exitHourNum > 23) {
      setError('Hora de salida inválida (0-23).');
      return;
    }
    const entryMinuteNum = parseInt(form.entryMinute);
    const exitMinuteNum = parseInt(form.exitMinute);
    if (isNaN(entryMinuteNum) || entryMinuteNum < 0 || entryMinuteNum > 59) {
      setError('Minutos de entrada inválidos.');
      return;
    }
    if (isNaN(exitMinuteNum) || exitMinuteNum < 0 || exitMinuteNum > 59) {
      setError('Minutos de salida inválidos.');
      return;
    }
    
    const entryTime = parseTime12(form.entryHour, form.entryMinute, form.entryPeriod);
    const exitTime = parseTime12(form.exitHour, form.exitMinute, form.exitPeriod);
    
    // Validar que salida sea después de entrada
    if (entryTime >= exitTime) {
      setError('La hora de salida debe ser posterior a la hora de entrada.');
      return;
    }
    
    const schedule: Schedule = {
      id: editingSchedule ? editingSchedule.id : Date.now().toString(),
      name: form.name.trim(),
      date: form.date,
      entryTime,
      exitTime,
      entryPeriod: form.entryPeriod,
      exitPeriod: form.exitPeriod,
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
      const [eh, em] = schedule.entryTime.split(':');
      let entryHour = parseInt(eh);
      let entryPeriod: 'AM' | 'PM' = 'AM';
      if (entryHour >= 12) {
        entryPeriod = 'PM';
        if (entryHour > 12) entryHour -= 12;
      }
      if (entryHour === 0) entryHour = 12;
      const [xh, xm] = schedule.exitTime.split(':');
      let exitHour = parseInt(xh);
      let exitPeriod: 'AM' | 'PM' = 'AM';
      if (exitHour >= 12) {
        exitPeriod = 'PM';
        if (exitHour > 12) exitHour -= 12;
      }
      if (exitHour === 0) exitHour = 12;
      setForm({
        name: schedule.name,
        date: schedule.date,
        entryHour: entryHour.toString(),
        entryMinute: em,
        entryPeriod,
        exitHour: exitHour.toString(),
        exitMinute: xm,
        exitPeriod,
      });
      setEditingSchedule(schedule);
    } else {
      setForm({
        name: '',
        date: '',
        entryHour: '',
        entryMinute: '',
        entryPeriod: 'AM',
        exitHour: '',
        exitMinute: '',
        exitPeriod: 'PM',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-8 py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">Sistema de Asignación de Horarios</h1>
            <p className="text-blue-100 text-center mt-2 text-sm sm:text-base">Gestión profesional de horarios laborales</p>
          </div>
          
          <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
              <button
                onClick={() => openModal()}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Plus size={20} />
                Agregar Horario
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-gray-700">Filtrar por fecha:</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 w-full sm:w-auto"
                  />
                </div>
                <button
                  onClick={() => {
                    setFilterDate('');
                    setExpandedDates(new Set());
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
                >
                  Ver Todos
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Indicador del día filtrado */}
              {filterDate && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Horarios del {formatDate(filterDate)}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {sortedSchedules.length} horario{sortedSchedules.length !== 1 ? 's' : ''} programado{sortedSchedules.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              {/* Tabla para desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Empleado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Entrada</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Salida</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duración</th>
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
                            {calculateDuration(schedule.entryTime, schedule.exitTime)}
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
                            <td colSpan={6} className="px-6 py-4">
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
                                {calculateDuration(schedule.entryTime, schedule.exitTime)}
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
              <div className="md:hidden">
                {filterDate && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-3 mb-4 rounded-lg">
                    <h2 className="text-lg font-bold text-gray-900">
                      Horarios del {formatDate(filterDate)}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {sortedSchedules.length} horario{sortedSchedules.length !== 1 ? 's' : ''} programado{sortedSchedules.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                <div className="divide-y divide-gray-200">
                  {filterDate ? (
                    // Vista filtrada por fecha
                    sortedSchedules.map((schedule, index) => (
                      <div key={schedule.id} className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                            <p className="text-sm text-gray-600">{formatDate(schedule.date)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(schedule)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-100 transition-colors duration-150"
                              title="Editar"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => deleteSchedule(schedule.id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-100 transition-colors duration-150"
                              title="Eliminar"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm mt-1">
                              {formatTime12(schedule.entryTime)}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 shadow-sm mt-1">
                              {formatTime12(schedule.exitTime)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</p>
                          <p className="text-sm font-semibold text-gray-900">{calculateDuration(schedule.entryTime, schedule.exitTime)}</p>
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
                          <div key={schedule.id} className={`p-4 pl-8 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openModal(schedule)}
                                  className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-100 transition-colors duration-150"
                                  title="Editar"
                                >
                                  <Edit size={20} />
                                </button>
                                <button
                                  onClick={() => deleteSchedule(schedule.id)}
                                  className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-100 transition-colors duration-150"
                                  title="Eliminar"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm mt-1">
                                  {formatTime12(schedule.entryTime)}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 shadow-sm mt-1">
                                  {formatTime12(schedule.exitTime)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</p>
                              <p className="text-sm font-semibold text-gray-900">{calculateDuration(schedule.entryTime, schedule.exitTime)}</p>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-6 py-4 rounded-t-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-white text-center">
                  {editingSchedule ? 'Editar Horario' : 'Agregar Nuevo Horario'}
                </h3>
              </div>
              <div className="p-4 sm:p-6">
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
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 border"
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hora Entrada</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={form.entryHour}
                        onChange={(e) => setForm({...form, entryHour: e.target.value})}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const { hour, period } = convertTo12Hour(val);
                            setForm({...form, entryHour: hour, entryPeriod: period});
                          }
                        }}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 border"
                        placeholder="0-23"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Minuto</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={form.entryMinute}
                        onChange={(e) => setForm({...form, entryMinute: e.target.value})}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 border"
                        placeholder="0-59"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">AM/PM</label>
                      <select
                        value={form.entryPeriod}
                        onChange={(e) => setForm({...form, entryPeriod: e.target.value as 'AM' | 'PM'})}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 border"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hora Salida</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={form.exitHour}
                        onChange={(e) => setForm({...form, exitHour: e.target.value})}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const { hour, period } = convertTo12Hour(val);
                            setForm({...form, exitHour: hour, exitPeriod: period});
                          }
                        }}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 border"
                        placeholder="0-23"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Minuto</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={form.exitMinute}
                        onChange={(e) => setForm({...form, exitMinute: e.target.value})}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 border"
                        placeholder="0-59"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">AM/PM</label>
                      <select
                        value={form.exitPeriod}
                        onChange={(e) => setForm({...form, exitPeriod: e.target.value as 'AM' | 'PM'})}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-3 border"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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