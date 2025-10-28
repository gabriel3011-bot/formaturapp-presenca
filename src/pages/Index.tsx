import { useState } from "react";
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
  date: string;
  description: string | null;
  attendance: { [memberId: string]: boolean };
}

const Index = () => {
  const { events: dbEvents, isLoading: eventsLoading, createEvent, updateEvent } = useEvents();
  const { members, isLoading: membersLoading, createMember, deleteMember } = useMembers();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { attendance, toggleAttendance } = useAttendance(selectedEvent?.id || "");

  // Convert DB events to local format with attendance
  const events = dbEvents.map(event => ({
    ...event,
    attendance: attendance
      .filter(a => a.event_id === event.id)
      .reduce((acc, a) => ({ ...acc, [a.member_id]: a.is_present }), {} as { [key: string]: boolean })
  }));

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createEvent.mutate(newEvent);
    setNewEvent({ title: "", date: "", description: "" });
    setIsDialogOpen(false);
  };

  const handleToggleAttendance = (eventId: string, memberId: string) => {
    const currentAttendance = attendance.find(a => a.member_id === memberId);
    toggleAttendance.mutate({
      memberId,
      isPresent: !currentAttendance?.is_present,
    });
  };

  const handleAddMember = (name: string) => {
    createMember.mutate(name);
  };

  const handleRemoveMember = (memberId: string) => {
    deleteMember.mutate(memberId);
  };

  const handleUpdateEvent = (updates: Partial<Event> & { id: string }) => {
    updateEvent.mutate(updates);
  };

  const getAttendanceStats = (event: Event) => {
    const total = members.length;
    const present = Object.values(event.attendance).filter(Boolean).length;
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
          <p className="text-muted-foreground text-lg">
            Gestão de eventos da comissão de formatura
          </p>
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
                <Button onClick={handleCreateEvent} className="w-full bg-gradient-to-r from-primary to-secondary">
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
            <Button
              variant="ghost"
              onClick={() => setSelectedEvent(null)}
              className="mb-4"
            >
              ← Voltar para eventos
            </Button>
            <EventDetails
              event={selectedEvent}
              members={members}
              onToggleAttendance={handleToggleAttendance}
            />
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
                      {events.filter(e => new Date(e.date) >= new Date()).length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">Eventos</h2>
              {events.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum evento criado ainda</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Clique em "Novo Evento" para começar
                  </p>
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
