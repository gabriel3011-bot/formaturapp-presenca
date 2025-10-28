import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Attendance {
  id: string;
  event_id: string;
  member_id: string;
  is_present: boolean;
  justification?: string;
}

export const useAttendance = (eventId: string) => {
  const queryClient = useQueryClient();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["attendance", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("event_id", eventId);

      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!eventId,
  });

  const toggleAttendance = useMutation({
    mutationFn: async ({
      memberId,
      isPresent,
      justification,
    }: {
      memberId: string;
      isPresent: boolean;
      justification?: string;
    }) => {
      const existing = attendance.find((a) => a.member_id === memberId);

      if (existing) {
        const { error } = await supabase
          .from("attendance")
          .update({ 
            is_present: isPresent,
            justification: justification || null
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendance").insert([
          {
            event_id: eventId,
            member_id: memberId,
            is_present: isPresent,
            justification: justification || null,
          },
        ]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", eventId] });
    },
  });

  return {
    attendance,
    isLoading,
    toggleAttendance,
  };
};
