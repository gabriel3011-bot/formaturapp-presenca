-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on members" ON public.members;
DROP POLICY IF EXISTS "Allow all operations on events" ON public.events;
DROP POLICY IF EXISTS "Allow all operations on attendance" ON public.attendance;

-- Members table: Only authenticated users can manage members
CREATE POLICY "Authenticated users can view members"
ON public.members
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create members"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete members"
ON public.members
FOR DELETE
TO authenticated
USING (true);

-- Events table: Only authenticated users can manage events
CREATE POLICY "Authenticated users can view events"
ON public.events
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
ON public.events
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
ON public.events
FOR DELETE
TO authenticated
USING (true);

-- Attendance table: Only authenticated users can manage attendance
CREATE POLICY "Authenticated users can view attendance"
ON public.attendance
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create attendance"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update attendance"
ON public.attendance
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance"
ON public.attendance
FOR DELETE
TO authenticated
USING (true);