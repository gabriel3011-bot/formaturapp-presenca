import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: string;
  is_present: boolean;
  justification?: string | null;
}

export const useAllAttendance = () => {
  const { data: allAttendance = [], isLoading } = useQuery({
    queryKey: ["attendance", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*");

      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });

  return {
    allAttendance,
    isLoading,
  };
};
