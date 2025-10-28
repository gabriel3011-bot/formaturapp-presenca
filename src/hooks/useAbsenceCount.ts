import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAbsenceCount = (memberId: string) => {
  const { data: absenceCount = 0 } = useQuery({
    queryKey: ["absenceCount", memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("member_id", memberId)
        .eq("is_present", false);

      if (error) throw error;

      // Count only unjustified absences
      const unjustifiedAbsences = data.filter(
        (record) => !record.justification || record.justification.trim() === ""
      );

      return unjustifiedAbsences.length;
    },
    enabled: !!memberId,
  });

  return absenceCount;
};

export const getAbsenceStatus = (count: number) => {
  if (count >= 4) {
    return {
      status: "fora",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      label: "Fora",
    };
  }
  if (count === 3) {
    return {
      status: "atenção",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      label: "Atenção",
    };
  }
  return {
    status: "ok",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "OK",
  };
};
