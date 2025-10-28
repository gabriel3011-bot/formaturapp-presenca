import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Member {
  id: string;
  name: string;
  created_at?: string;
}

export const useMembers = () => {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Member[];
    },
  });

  const createMember = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("members")
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Membro adicionado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao adicionar membro");
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Membro removido com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover membro");
    },
  });

  return {
    members,
    isLoading,
    createMember,
    deleteMember,
  };
};
