import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, Users, CheckCircle2 } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { MemberManagement } from "@/components/MemberManagement";
import { EditEventDialog } from "@/components/EditEventDialog";
import { DateSelector } from "@/components/DateSelector";
import { AttendanceMarker } from "@/components/AttendanceMarker";
import { useEvents } from "@/hooks/useEvents";
import { useMembers } from "@/hooks/useMembers";
import { useAttendance } from "@/hooks/useAttendance";
import { toast } from "sonner";
import { eventSchema, memberSchema } from "@/lib/validations";

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

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { events: dbEvents, isLoading: eventsLoading, createEvent, updateEvent, deleteEvent } = useEvents();
  const { members, isLoading: membersLoading, createMember, deleteMember } = useMembers();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Authentication check
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Find or create event for selected date
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  
  const eventForSelectedDate = useMemo(() => {
    return dbEvents.find(e => e.date === selectedDateStr);
  }, [dbEvents, selectedDateStr]);

  // Load attendance for the event on the selected date
  const { attendance, toggleAttendance } = useAttendance(eventForSelectedDate?.id || "");

  // Merge DB events with attendance for live view
  const events: Event[] = useMemo(() => {
    return dbEvents.map((event) => ({
      ...event,
      attendance: attendance
        .filter((a) => a.event_id === event.id)
        .reduce((acc, a) => ({ ...acc, [a.member_id]: a.is_present }), {} as { [key: string]: boolean }),
    }));
  }, [dbEvents, attendance]);

  // Compute absences per member across all events
  const absencesByMember = useMemo(() => {
    const counter: Record<string, number> = {};
    for (const m of members) counter[m.id] = 0;
    for (const ev of events) {
      for (const m of members) {
        const present = ev.attendance?.[m.id];
        if (present === false || present === undefined) counter[m.id] += 1;
      }
    }
    return counter;
  }, [events, members]);

  const handleCreateEvent = () => {
    // Validate input
    const validation = eventSchema.safeParse({
      title: newEvent.title,
      date: newEvent.date,
      description: newEvent.description || null,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(", ");
      toast.error(errors);
      return;
    }

    createEvent.mutate({
      title: validation.data.title,
      date: validation.data.date,
      description: validation.data.description || null,
    });
    setNewEvent({ title: "", date: "", description: "" });
    setIsDialogOpen(false);
  };

  // Toggle presence with optional justification
  const handleToggleAttendance = (memberId: string, isPresent: boolean, justification?: string) => {
    if (!eventForSelectedDate) {
      toast.error("Nenhum evento encontrado para esta data. Crie um evento primeiro.");
      return;
    }
    toggleAttendance.mutate({ memberId, isPresent, justification });
  };

  const handleAddMember = (name: string) => {
    // Validate member name
    const validation = memberSchema.safeParse({ name });
    
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(", ");
      toast.error(errors);
      return;
    }

    createMember.mutate(validation.data.name);
  };

  const handleRemoveMember = (memberId: string) => {
    deleteMember.mutate(memberId);
  };

  const handleUpdateEvent = (updates: Partial<Event> & { id: string }) => {
    updateEvent.mutate(updates);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent.mutate(eventId);
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
    }
  };

  const getAttendanceStats = (event: Event) => {
    const total = members.length;
    const present = Object.values(event.attendance || {}).filter(Boolean).length;
    return { total, present, absent: total - present };
  };

  if (authLoading || eventsLoading || membersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={handleSignOut} size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
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
            attendances={attendance}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Date Selector and Attendance Marker */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Gerenciar Frequência por Data</h2>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <DateSelector 
                    selectedDate={selectedDate} 
                    onDateChange={setSelectedDate}
                  />
                  {eventForSelectedDate && (
                    <div className="text-sm text-muted-foreground">
                      Evento: <span className="font-semibold text-foreground">{eventForSelectedDate.title}</span>
                    </div>
                  )}
                  {!eventForSelectedDate && (
                    <div className="text-sm text-muted-foreground">
                      Nenhum evento nesta data. Crie um evento para marcar presença.
                    </div>
                  )}
                </div>
              </div>

              {eventForSelectedDate && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Marcar Presença</h3>
                  <div className="space-y-2">
                    {members.map((member) => {
                      const attendanceRecord = attendance.find(a => a.member_id === member.id);
                      const isPresent = attendanceRecord?.is_present ?? null;
                      const justification = attendanceRecord?.justification;

                      return (
                        <Card key={member.id} className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="font-medium">{member.name}</span>
                            <AttendanceMarker
                              memberId={member.id}
                              memberName={member.name}
                              isPresent={isPresent}
                              justification={justification}
                              onToggle={(isPresent, justification) => 
                                handleToggleAttendance(member.id, isPresent, justification)
                              }
                            />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* View Event List */}
          {selectedEvent ? (
            <div className="animate-in fade-in duration-300">
              <Button variant="ghost" onClick={() => setSelectedEvent(null)} className="mb-4">
                ← Voltar para lista de eventos
              </Button>
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">{selectedEvent.title}</h2>
                <p className="text-muted-foreground mb-2">Data: {format(new Date(selectedEvent.date), "dd/MM/yyyy")}</p>
                {selectedEvent.description && (
                  <p className="text-sm text-muted-foreground mb-4">{selectedEvent.description}</p>
                )}
                <div className="space-y-2">
                  <h3 className="font-semibold">Presenças:</h3>
                  {members.map(member => {
                    const isPresent = selectedEvent.attendance?.[member.id];
                    return (
                      <div key={member.id} className="flex items-center gap-2">
                        <span>{member.name}:</span>
                        <span className={isPresent ? "text-green-600" : "text-red-600"}>
                          {isPresent ? "Presente" : "Ausente"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
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
                        onClick={() => setSelectedEvent(event)}
                        onEdit={(e) => {
                          e.stopPropagation();
                          setEditingEvent(event);
                          setIsEditDialogOpen(true);
                        }}
                        onDelete={handleDeleteEvent}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
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
