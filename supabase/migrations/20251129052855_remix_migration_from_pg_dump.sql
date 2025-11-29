CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: game_players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_players (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_id uuid NOT NULL,
    player_id text NOT NULL,
    player_name text NOT NULL,
    seat_index integer NOT NULL,
    is_connected boolean DEFAULT true NOT NULL,
    total_score integer DEFAULT 0 NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: game_rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_rooms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    host_id text NOT NULL,
    status text DEFAULT 'lobby'::text NOT NULL,
    max_players integer DEFAULT 4 NOT NULL,
    target_score integer DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT game_rooms_status_check CHECK ((status = ANY (ARRAY['lobby'::text, 'playing'::text, 'finished'::text])))
);


--
-- Name: game_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_id uuid NOT NULL,
    state jsonb NOT NULL,
    version integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: game_players game_players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_players
    ADD CONSTRAINT game_players_pkey PRIMARY KEY (id);


--
-- Name: game_players game_players_room_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_players
    ADD CONSTRAINT game_players_room_id_player_id_key UNIQUE (room_id, player_id);


--
-- Name: game_players game_players_room_id_seat_index_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_players
    ADD CONSTRAINT game_players_room_id_seat_index_key UNIQUE (room_id, seat_index);


--
-- Name: game_rooms game_rooms_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_rooms
    ADD CONSTRAINT game_rooms_code_key UNIQUE (code);


--
-- Name: game_rooms game_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_rooms
    ADD CONSTRAINT game_rooms_pkey PRIMARY KEY (id);


--
-- Name: game_states game_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_states
    ADD CONSTRAINT game_states_pkey PRIMARY KEY (id);


--
-- Name: game_states game_states_room_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_states
    ADD CONSTRAINT game_states_room_id_key UNIQUE (room_id);


--
-- Name: game_rooms update_game_rooms_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_game_rooms_updated_at BEFORE UPDATE ON public.game_rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: game_states update_game_states_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_game_states_updated_at BEFORE UPDATE ON public.game_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: game_players game_players_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_players
    ADD CONSTRAINT game_players_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.game_rooms(id) ON DELETE CASCADE;


--
-- Name: game_states game_states_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_states
    ADD CONSTRAINT game_states_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.game_rooms(id) ON DELETE CASCADE;


--
-- Name: game_states Anyone can create game state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create game state" ON public.game_states FOR INSERT WITH CHECK (true);


--
-- Name: game_rooms Anyone can create rooms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);


--
-- Name: game_players Anyone can join rooms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can join rooms" ON public.game_players FOR INSERT WITH CHECK (true);


--
-- Name: game_players Anyone can leave rooms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can leave rooms" ON public.game_players FOR DELETE USING (true);


--
-- Name: game_states Anyone can update game state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update game state" ON public.game_states FOR UPDATE USING (true);


--
-- Name: game_players Anyone can update players; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update players" ON public.game_players FOR UPDATE USING (true);


--
-- Name: game_rooms Anyone can update rooms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update rooms" ON public.game_rooms FOR UPDATE USING (true);


--
-- Name: game_states Anyone can view game state; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view game state" ON public.game_states FOR SELECT USING (true);


--
-- Name: game_players Anyone can view players; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view players" ON public.game_players FOR SELECT USING (true);


--
-- Name: game_rooms Anyone can view rooms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view rooms" ON public.game_rooms FOR SELECT USING (true);


--
-- Name: game_players; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

--
-- Name: game_rooms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

--
-- Name: game_states; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


