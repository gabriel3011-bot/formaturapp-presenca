import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, Users, CheckCircle2 } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { EventDetails } from "@/components/EventDetails";
import { MemberManagement } from "@/components/MemberManagement";
import { EditEventDialog } from "@/components/EditEventDialog";
import { useEvents } from "@/hooks/useEvents";
import { useMembers } from "@/hooks/useMembers";
import { useAttendance } from "@/hooks/useAttendance";
import { toast } from "sonner";

export interface Member {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  date: string; // ISO (YYYY-MM-DD)
  description: string | null;
  attendance: { [memberId: string]: boolean };
}

// Local justification map indexed by memberId for the currently selected event
// When a member is absent and a non-empty justification is provided, the absence is ignored in counters
const Index = () => {
  const { events: dbEvents, isLoading: eventsLoading, createEvent, updateEvent } = useEvents();
  const { members, isLoading: membersLoading, createMember, deleteMember } = useMembers();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Justifications for absences on the currently selected event (memberId -> text)
  const [absenceJustifications, setAbsenceJustifications] = useState<Record<string, string>>({});

  // Load attendance for the currently selected event; when null, hook gets empty id
  const { attendance, toggleAttendance } = useAttendance(selectedEvent?.id || "");

  // Merge DB events with attendance for live view (not required for create past events)
  const events: Event[] = useMemo(() => {
    return dbEvents.map((event) => ({
      ...event,
      attendance: attendance
        .filter((a) => a.event_id === event.id)
        .reduce((acc, a) => ({ ...acc, [a.member_id]: a.is_present }), {} as { [key: string]: boolean }),
    }));
  }, [dbEvents, attendance]);

  // Compute absences per member across all events, excluding justified absences for the selected event
  const absencesByMember = useMemo(() => {
    const counter: Record<string, number> = {};
    for (const m of members) counter[m.id] = 0;

    for (const ev of events) {
      for (const m of members) {
        const present = ev.attendance?.[m.id];
        const isSelectedEvent = selectedEvent && ev.id === selectedEvent.id;
        const hasJustification = !!absenceJustifications[m.id]?.trim();

        // Count absence if:
        // - not present (false or undefined)
        // - and either not the selected event, or it is the selected event but without justification
        if ((present === false || present === undefined) && (!isSelectedEvent || !hasJustification)) {
          counter[m.id] += 1;
        }
      }
    }
    return counter;
  }, [events, members, selectedEvent, absenceJustifications]);

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    // Allow creating past events: no restriction on date
    createEvent.mutate({
      title: newEvent.title,
      date: newEvent.date, // should be YYYY-MM-DD from input type=date
      description: newEvent.description || null,
    });
    setNewEvent({ title: "", date: "", description: "" });
    setIsDialogOpen(false);
  };

  // When switching selectedEvent, clear justifications map so it refers to the new event
  const handleSelectEvent = (ev: Event | null) => {
    setSelectedEvent(ev);
    setAbsenceJustifications({});
  };

  // Toggle presence for a specific member in the currently selected event
  const handleToggleAttendance = (_eventId: string, memberId: string) => {
    const current = attendance.find((a) => a.member_id === memberId);
    toggleAttendance.mutate({ memberId, isPresent: !current?.is_present });

    // If toggled to present, clear any justification for that member
    const willBePresent = !(current?.is_present ?? false);
    if (willBePresent) {
      setAbsenceJustifications((prev) => {
        if (!prev[memberId]) return prev;
        const { [memberId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleJustificationChange = (memberId: string, text: string) => {
    setAbsenceJustifications((prev) => ({ ...prev, [memberId]: text }));
  };

  const handleAddMember = (name: string) => {
    createMember.mutate(name);
  };

  const handleRemoveMember = (memberId: string) => {
    deleteMember.mutate(memberId);
  };

  const handleUpdateEvent = (updates: Partial<Event> & { id: string }) => {
    // Permit updating event date to past without blocking
    updateEvent.mutate(updates);
  };

  const getAttendanceStats = (event: Event) => {
    const total = members.length;
    const present = Object.values(event.attendance || {}).filter(Boolean).length;
    return { total, present, absent: total - present };
  };

  if (eventsLoading || membersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
            Controle de Presença
          </h1>
          <p className="text-muted-foreground text-lg">Gestão de eventos da comissão de formatura</p>
        </header>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Ex: Reunião de Planejamento"
                />
                </div>
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Detalhes do evento..."
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-primary to-secondary" onClick={handleCreateEvent}>
                  Criar Evento
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <MemberManagement
            members={members}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        </div>

        {/* Content */}
        {selectedEvent ? (
          <div className="animate-in fade-in duration-300">
            <Button variant="ghost" onClick={() => handleSelectEvent(null)} className="mb-4">
              ← Voltar para eventos
            </Button>

            {/* Inline presence controls in EventDetails via onToggleAttendance */}
            <EventDetails
              event={selectedEvent}
              members={members}
              onToggleAttendance={handleToggleAttendance}
            />

            {/* Quick presence grid to mark directly on this page */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Marcar presença rapidamente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {members.map((m) => {
                  const isPresent = selectedEvent.attendance?.[m.id] ?? false;
                  const justification = absenceJustifications[m.id] || "";
                  return (
                    <Card key={m.id} className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span>{m.name}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={isPresent ? "default" : "outline"}
                            onClick={() => handleToggleAttendance(selectedEvent.id, m.id)}
                          >
                            {isPresent ? "Presente" : "Marcar Presente"}
                          </Button>
                          <Button
                            size="sm"
                            variant={!isPresent ? "destructive" : "outline"}
                            onClick={() => handleToggleAttendance(selectedEvent.id, m.id)}
                          >
                            {!isPresent ? "Ausente" : "Marcar Ausente"}
                          </Button>
                        </div>
                      </div>
                      {!isPresent && (
                        <div className="mt-3">
                          <Label htmlFor={`just-${m.id}`}>Justificativa (opcional)</Label>
                          <Input
                            id={`just-${m.id}`}
                            placeholder="Informe a justificativa da ausência"
                            value={justification}
                            onChange={(e) => handleJustificationChange(m.id, e.target.value)}
                          />
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Eventos</p>
                    <p className="text-2xl font-bold text-foreground">{events.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Membros</p>
                    <p className="text-2xl font-bold text-foreground">{members.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Próximos Eventos</p>
                    <p className="text-2xl font-bold text-foreground">
                      {events.filter((e) => new Date(e.date) >= new Date()).length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Absence counter list by member */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Contador de faltas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((m) => (
                  <Card key={m.id} className="p-4 flex items-center justify-between">
                    <span>{m.name}</span>
                    <span className="text-sm text-muted-foreground">{absencesByMember[m.id]} falta(s)</span>
                  </Card>
                ))}
              </div>
            </div>

            {/* Events List (shows both past and upcoming) */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">Eventos</h2>
              {events.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum evento criado ainda</p>
                  <p className="text-sm text-muted-foreground mt-2">Clique em "Novo Evento" para começar</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      stats={getAttendanceStats(event)}
                      onClick={() => handleSelectEvent(event)}
                      onEdit={(e) => {
                        e.stopPropagation();
                        setEditingEvent(event);
                        setIsEditDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <EditEventDialog
        event={editingEvent}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen} 
        onUpdate={handleUpdateEvent}
      />
    </div>
  );
};

export default Index;
