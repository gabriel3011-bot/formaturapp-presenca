import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useEvents = () => {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  const createEvent = useMutation({
    mutationFn: async (newEvent: Omit<Event, "id">) => {
      const { data, error } = await supabase
        .from("events")
        .insert([newEvent])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar evento");
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
      const { data, error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar evento");
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento removido com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover evento");
    },
  });

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
