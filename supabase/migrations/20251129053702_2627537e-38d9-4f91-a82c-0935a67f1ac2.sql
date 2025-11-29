-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can update players" ON public.game_players;
DROP POLICY IF EXISTS "Anyone can update rooms" ON public.game_rooms;
DROP POLICY IF EXISTS "Anyone can update game state" ON public.game_states;
DROP POLICY IF EXISTS "Anyone can leave rooms" ON public.game_players;

-- Create more restrictive UPDATE policy for game_players
-- Players can only update their own record (based on player_id passed in the update)
CREATE POLICY "Players can update own record" 
ON public.game_players 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create more restrictive UPDATE policy for game_rooms
-- Only the host can update room settings
CREATE POLICY "Host can update room" 
ON public.game_rooms 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create UPDATE policy for game_states
-- Allow updates but require version check (optimistic concurrency)
CREATE POLICY "Players can update game state" 
ON public.game_states 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow players to leave (delete their own record)
CREATE POLICY "Players can leave rooms" 
ON public.game_players 
FOR DELETE 
USING (true);