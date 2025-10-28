-- Add justification field to attendance table
ALTER TABLE public.attendance 
ADD COLUMN justification TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.attendance.justification IS 'Justificativa para a falta (apenas quando is_present = false)';

-- Create index for better query performance when filtering by event and status
CREATE INDEX idx_attendance_event_status ON public.attendance(event_id, is_present);