-- Enable realtime for game_states table to ensure updates propagate
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_states;

-- Also ensure game_rooms and game_players are included
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;