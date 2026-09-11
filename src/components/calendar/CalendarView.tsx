import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  Stethoscope,
  ShieldCheck,
  Video,
  Gavel,
  FileWarning,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEventType } from '../../types';

export const CalendarView: React.FC = () => {
  const {
    events,
    clients,
    processes,
    addEvent,
    deleteEvent,
    navigateToClientDetail,
    currentUser,
  } = useApp();

  const [selectedType, setSelectedType] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'lista' | 'grid'>('lista');

  // New Event Form
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventClientId, setEventClientId] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('Perícia Médica');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('09:30');
  const [eventLocation, setEventLocation] = useState('Agência da Previdência Social - APS');
  const [eventNotes, setEventNotes] = useState('');

  const filteredEvents = events.filter((ev) => {
    if (selectedType === 'todos') return true;
    return ev.type === selectedType || ev.category === selectedType;
  });

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    addEvent({
      title: eventTitle.trim(),
      clientId: eventClientId || undefined,
      category: 'Perícia médica',
      type: eventType,
      date: eventDate,
      time: eventTime,
      duration: '1h',
      description: eventNotes.trim() || eventTitle.trim(),
      location: eventLocation.trim() || 'Agência da Previdência Social',
      responsible: currentUser.name,
      notes: eventNotes.trim() || undefined,
    });

    setEventTitle('');
    setEventNotes('');
    setIsAddingEvent(false);
  };

  const getEventBadge = (type: CalendarEventType) => {
    switch (type) {
      case 'Perícia Médica':
        return { bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: Stethoscope };
      case 'Perícia Social':
        return { bg: 'bg-purple-100 text-purple-900 border-purple-300', icon: ShieldCheck };
      case 'Audiência Judicial':
        return { bg: 'bg-red-100 text-red-900 border-red-300', icon: Gavel };
      case 'Prazo Fatal INSS':
      case 'Prazo de Recurso':
        return { bg: 'bg-rose-100 text-rose-900 border-rose-300', icon: FileWarning };
      case 'Atendimento Online':
        return { bg: 'bg-blue-100 text-blue-900 border-blue-300', icon: Video };
      default:
        return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: CalendarIcon };
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A2521]">
            Agenda de Perícias & Prazos
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7770] mt-0.5">
            Controle de perícias médicas do INSS, audiências da Justiça Federal e prazos fatais de exigências.
          </p>
        </div>

        <button
          onClick={() => setIsAddingEvent(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D4739] hover:bg-[#203429] text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>+ Novo Compromisso</span>
        </button>
      </div>

      {/* Filter and View Modes */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E6E4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#2D4739]" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs py-2 px-3 bg-[#F8F9FA] text-[#1A2521] border border-[#D5DDD8] rounded-lg outline-none cursor-pointer focus:border-[#2D4739]"
          >
            <option value="todos">Todos os Tipos de Evento</option>
            <option value="Perícia Médica">Perícia Médica</option>
            <option value="Perícia Social">Perícia Social</option>
            <option value="Audiência Judicial">Audiência Judicial</option>
            <option value="Prazo Fatal INSS">Prazo Fatal INSS</option>
            <option value="Prazo de Recurso">Prazo de Recurso</option>
            <option value="Atendimento Presencial">Atendimento Presencial</option>
            <option value="Atendimento Online">Atendimento Online</option>
          </select>
        </div>

        <div className="text-xs text-[#6B7770]">
          Total de {filteredEvents.length} compromissos agendados
        </div>
      </div>

      {/* New Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D5DDD8] text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F4]">
              <h3 className="text-sm font-bold text-[#1A2521]">Agendar Compromisso Previdenciário</h3>
              <button onClick={() => setIsAddingEvent(false)} className="text-gray-400 hover:text-black font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="font-semibold text-[#1A2521]">Título do Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Perícia Médica no INSS - João Silveira"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Cliente Relacionado</label>
                <select
                  value={eventClientId}
                  onChange={(e) => setEventClientId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                >
                  <option value="">Nenhum (Compromisso institucional)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} (CPF: {c.cpf})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1A2521]">Tipo de Evento</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none font-semibold"
                  >
                    <option value="Perícia Médica">Perícia Médica</option>
                    <option value="Perícia Social">Perícia Social</option>
                    <option value="Audiência Judicial">Audiência Judicial</option>
                    <option value="Prazo Fatal INSS">Prazo Fatal INSS</option>
                    <option value="Prazo de Recurso">Prazo de Recurso</option>
                    <option value="Atendimento Presencial">Atendimento Presencial</option>
                    <option value="Atendimento Online">Atendimento Online</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#1A2521]">Horário</label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Data do Evento *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Local / Endereço / Link da Reunião</label>
                <input
                  type="text"
                  placeholder="Ex: APS Santos - Rua Braz Cubas, 100 ou Link Google Meet"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A2521]">Orientações & Documentos a Levar</label>
                <textarea
                  rows={2}
                  placeholder="Documentos originais com foto, laudos impressos..."
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#F8F9FA] border border-[#D5DDD8] rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F3F4]">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B7770]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2D4739] text-white rounded-xl text-xs font-semibold"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.map((ev) => {
          const badge = getEventBadge(ev.type);
          const Icon = badge.icon;

          return (
            <div
              key={ev.id}
              className="bg-white p-5 rounded-2xl border border-[#E2E6E4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2D4739]/40 transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${badge.bg}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                      {ev.type}
                    </span>
                    <span className="text-xs font-bold text-[#1A2521]">{ev.title}</span>
                  </div>

                  {ev.clientName && (
                    <div className="text-xs text-[#2D4739] font-medium flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <button
                        onClick={() => ev.clientId && navigateToClientDetail(ev.clientId)}
                        className="hover:underline text-left"
                      >
                        Cliente: {ev.clientName}
                      </button>
                    </div>
                  )}

                  {ev.location && (
                    <div className="text-xs text-[#6B7770] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2D4739]" />
                      <span>{ev.location}</span>
                    </div>
                  )}

                  {ev.notes && (
                    <p className="text-[11px] text-[#9E7B36] bg-[#FAF6ED] p-2 rounded-lg border border-[#E8DCC0] mt-1">
                      <strong>Orientações:</strong> {ev.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Date & Time info + Actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F1F3F4]">
                <div className="text-right">
                  <div className="text-sm font-bold text-[#1A2521] flex items-center gap-1 sm:justify-end">
                    <Clock className="w-4 h-4 text-[#C5A059]" />
                    <span>{ev.date} às {ev.time}</span>
                  </div>
                  <div className="text-[10px] text-[#8A968F] mt-0.5">
                    Responsável: {ev.responsible}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Excluir este compromisso da agenda?')) {
                      deleteEvent(ev.id);
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  title="Excluir compromisso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-[#D5DDD8] text-xs text-[#6B7770]">
            Nenhum compromisso encontrado para o filtro selecionado.
          </div>
        )}
      </div>
    </div>
  );
};
