import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Event } from "@/hooks/useEvents";
import { toast } from "sonner";
import { eventSchema } from "@/lib/validations";

interface EditEventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<Event> & { id: string }) => void;
}

export const EditEventDialog = ({ event, open, onOpenChange, onUpdate }: EditEventDialogProps) => {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    date: event?.date || "",
    description: event?.description || "",
  });

  const handleUpdate = () => {
    if (!event) return;
    
    // Validate input
    const validation = eventSchema.safeParse({
      title: formData.title,
      date: formData.date,
      description: formData.description || null,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(", ");
      toast.error(errors);
      return;
    }

    onUpdate({
      id: event.id,
      title: validation.data.title,
      date: validation.data.date,
      description: validation.data.description || null,
    });
    
    onOpenChange(false);
  };

  // Update form when event changes
  if (event && (formData.title !== event.title || formData.date !== event.date)) {
    setFormData({
      title: event.title,
      date: event.date,
      description: event.description || "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="edit-title">Título *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Reunião de Planejamento"
            />
          </div>
          <div>
            <Label htmlFor="edit-date">Data *</Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Descrição</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes do evento..."
            />
          </div>
          <Button onClick={handleUpdate} className="w-full bg-gradient-to-r from-primary to-secondary">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
