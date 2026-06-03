--
-- PostgreSQL database dump
--

\restrict Jt0RbopDFUhkmdCAYD1Nzq4pEfTJpRNAo5bf1wuGkfApxyG4aq1s6q85xq4eIpQ

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 16.10 (Debian 16.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: master_setup_input_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.master_setup_input_type AS ENUM (
    'text',
    'number',
    'option',
    'date',
    'time'
);


ALTER TYPE public.master_setup_input_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: application; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application (
    id bigint NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.application OWNER TO postgres;

--
-- Name: application_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_id_seq OWNER TO postgres;

--
-- Name: application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_id_seq OWNED BY public.application.id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    id bigint NOT NULL,
    icon_id bigint NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.category ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: category_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_item (
    id bigint NOT NULL,
    category_id bigint NOT NULL,
    icon_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    item_quantity boolean DEFAULT false NOT NULL,
    hyperlink character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    is_removed boolean DEFAULT false NOT NULL,
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    update_date timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.category_item OWNER TO postgres;

--
-- Name: category_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.category_item ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.category_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.country (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(3) NOT NULL,
    demonym character varying(50)
);


ALTER TABLE public.country OWNER TO postgres;

--
-- Name: country_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.country_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.country_id_seq OWNER TO postgres;

--
-- Name: country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.country_id_seq OWNED BY public.country.id;


--
-- Name: department; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.department (
    id bigint NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.department OWNER TO postgres;

--
-- Name: department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.department_id_seq OWNER TO postgres;

--
-- Name: department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.department_id_seq OWNED BY public.department.id;


--
-- Name: hotel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel (
    id bigint NOT NULL,
    organization_id bigint NOT NULL,
    country_id bigint NOT NULL,
    language_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    phone character varying(20),
    address text,
    email character varying(150),
    website character varying(255),
    logo text,
    primary_color character varying(7),
    secondary_color character varying(7),
    is_active boolean DEFAULT true NOT NULL,
    is_removed boolean DEFAULT false NOT NULL,
    create_date timestamp without time zone DEFAULT now() NOT NULL,
    update_date timestamp without time zone DEFAULT now() NOT NULL,
    timezone_id bigint
);


ALTER TABLE public.hotel OWNER TO postgres;

--
-- Name: hotel_department; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_department (
    id bigint NOT NULL,
    hotel_id bigint NOT NULL,
    department_id bigint NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_removed boolean DEFAULT false NOT NULL,
    create_date timestamp without time zone DEFAULT now() NOT NULL,
    update_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.hotel_department OWNER TO postgres;

--
-- Name: hotel_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_department_id_seq OWNER TO postgres;

--
-- Name: hotel_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_department_id_seq OWNED BY public.hotel_department.id;


--
-- Name: hotel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_id_seq OWNER TO postgres;

--
-- Name: hotel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_id_seq OWNED BY public.hotel.id;


--
-- Name: hotel_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_setup (
    id bigint NOT NULL,
    hotel_id bigint NOT NULL,
    setup_id bigint NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.hotel_setup OWNER TO postgres;

--
-- Name: hotel_setup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_setup_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_setup_id_seq OWNER TO postgres;

--
-- Name: hotel_setup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_setup_id_seq OWNED BY public.hotel_setup.id;


--
-- Name: hotel_sync; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_sync (
    id bigint NOT NULL,
    hotel_id bigint NOT NULL,
    application_id bigint NOT NULL,
    sync_id uuid DEFAULT gen_random_uuid() NOT NULL,
    use_asymetric boolean DEFAULT false NOT NULL,
    private_key text,
    secret_key text
);


ALTER TABLE public.hotel_sync OWNER TO postgres;

--
-- Name: hotel_sync_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hotel_sync_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_sync_id_seq OWNER TO postgres;

--
-- Name: hotel_sync_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hotel_sync_id_seq OWNED BY public.hotel_sync.id;


--
-- Name: icon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.icon (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(500) NOT NULL
);


ALTER TABLE public.icon OWNER TO postgres;

--
-- Name: icon_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.icon ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.icon_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: language; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.language (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    code character(5) NOT NULL
);


ALTER TABLE public.language OWNER TO postgres;

--
-- Name: language_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.language_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.language_id_seq OWNER TO postgres;

--
-- Name: language_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.language_id_seq OWNED BY public.language.id;


--
-- Name: master_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_setup (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    setup_code character varying(50) NOT NULL,
    input_type public.master_setup_input_type NOT NULL,
    option_value character varying(255)
);


ALTER TABLE public.master_setup OWNER TO postgres;

--
-- Name: master_setup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_setup_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_setup_id_seq OWNER TO postgres;

--
-- Name: master_setup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_setup_id_seq OWNED BY public.master_setup.id;


--
-- Name: message_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message_category (
    id bigint NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.message_category OWNER TO postgres;

--
-- Name: message_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.message_category ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.message_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization (
    id bigint NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.organization OWNER TO postgres;

--
-- Name: organization_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organization_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organization_id_seq OWNER TO postgres;

--
-- Name: organization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organization_id_seq OWNED BY public.organization.id;


--
-- Name: request_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_mapping (
    id bigint NOT NULL,
    hotel_id bigint NOT NULL,
    item_id bigint NOT NULL,
    department_id bigint NOT NULL,
    sla_id bigint NOT NULL,
    remark text
);


ALTER TABLE public.request_mapping OWNER TO postgres;

--
-- Name: request_mapping_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.request_mapping ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.request_mapping_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: room_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_services (
    id bigint NOT NULL,
    hotel_id bigint NOT NULL,
    icon_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    hyperlink character varying(500),
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.room_services OWNER TO postgres;

--
-- Name: room_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.room_services ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.room_services_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sla; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sla (
    id bigint NOT NULL,
    hotel_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    response_time integer NOT NULL,
    resolution_time integer NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    update_date timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sla OWNER TO postgres;

--
-- Name: sla_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.sla ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sla_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: template_message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_message (
    id bigint NOT NULL,
    hotel_id bigint NOT NULL,
    message_id bigint NOT NULL,
    title character varying(100) NOT NULL,
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    update_date timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.template_message OWNER TO postgres;

--
-- Name: template_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.template_message ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.template_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: timezone; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timezone (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    utc_offset character varying(6) NOT NULL
);


ALTER TABLE public.timezone OWNER TO postgres;

--
-- Name: timezone_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.timezone_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.timezone_id_seq OWNER TO postgres;

--
-- Name: timezone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.timezone_id_seq OWNED BY public.timezone.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id bigint NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    picture text,
    super_admin boolean DEFAULT false NOT NULL,
    token_verify character varying(255),
    is_verified boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_removed boolean DEFAULT false NOT NULL,
    last_login timestamp without time zone,
    create_date timestamp without time zone DEFAULT now() NOT NULL,
    update_date timestamp without time zone DEFAULT now() NOT NULL,
    is_loggedin boolean
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: user_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile (
    id bigint NOT NULL,
    hotel_id bigint NOT NULL,
    department_id bigint NOT NULL,
    user_id bigint NOT NULL,
    "position" character varying(100),
    is_admin boolean DEFAULT false NOT NULL,
    is_leader boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_removed boolean DEFAULT false NOT NULL,
    create_date timestamp without time zone DEFAULT now() NOT NULL,
    update_date timestamp without time zone DEFAULT now() NOT NULL,
    create_ticket boolean DEFAULT false NOT NULL
);


ALTER TABLE public.user_profile OWNER TO postgres;

--
-- Name: user_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profile_id_seq OWNER TO postgres;

--
-- Name: user_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_profile_id_seq OWNED BY public.user_profile.id;


--
-- Name: application id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application ALTER COLUMN id SET DEFAULT nextval('public.application_id_seq'::regclass);


--
-- Name: country id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country ALTER COLUMN id SET DEFAULT nextval('public.country_id_seq'::regclass);


--
-- Name: department id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department ALTER COLUMN id SET DEFAULT nextval('public.department_id_seq'::regclass);


--
-- Name: hotel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel ALTER COLUMN id SET DEFAULT nextval('public.hotel_id_seq'::regclass);


--
-- Name: hotel_department id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_department ALTER COLUMN id SET DEFAULT nextval('public.hotel_department_id_seq'::regclass);


--
-- Name: hotel_setup id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_setup ALTER COLUMN id SET DEFAULT nextval('public.hotel_setup_id_seq'::regclass);


--
-- Name: hotel_sync id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_sync ALTER COLUMN id SET DEFAULT nextval('public.hotel_sync_id_seq'::regclass);


--
-- Name: language id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.language ALTER COLUMN id SET DEFAULT nextval('public.language_id_seq'::regclass);


--
-- Name: master_setup id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_setup ALTER COLUMN id SET DEFAULT nextval('public.master_setup_id_seq'::regclass);


--
-- Name: organization id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization ALTER COLUMN id SET DEFAULT nextval('public.organization_id_seq'::regclass);


--
-- Name: timezone id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timezone ALTER COLUMN id SET DEFAULT nextval('public.timezone_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile ALTER COLUMN id SET DEFAULT nextval('public.user_profile_id_seq'::regclass);


--
-- Data for Name: application; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application (id, name) FROM stdin;
1	Sentec PMS
2	Sentec EMS
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (id, icon_id, name) FROM stdin;
1	1	Housekeeping
2	1	Maintenance
3	1	Concierge
\.


--
-- Data for Name: category_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category_item (id, category_id, icon_id, name, item_quantity, hyperlink, is_active, is_removed, create_date, update_date) FROM stdin;
1	1	1	string	t	string	t	f	2026-05-25 08:00:50.322026+00	2026-05-25 08:00:50.322026+00
\.


--
-- Data for Name: country; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.country (id, name, code, demonym) FROM stdin;
1	Indonesia	ID	Indonesian
2	France test	FR	French
\.


--
-- Data for Name: department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.department (id, name) FROM stdin;
1	IT
2	Human Resources
\.


--
-- Data for Name: hotel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hotel (id, organization_id, country_id, language_id, name, phone, address, email, website, logo, primary_color, secondary_color, is_active, is_removed, create_date, update_date, timezone_id) FROM stdin;
1	1	1	1	Aston Simatupang	\N	TB Simatupang	astonsimatupang@gmail.com	astonsimatupang.com	\N	\N	\N	t	f	2026-05-14 12:46:52.649134	2026-05-14 12:46:52.649134	1
2	1	1	1	Aston Puncak	6278888888	Ciloto	aston@puncak.com	astonpuncak.com	\N	\N	\N	t	f	2026-05-19 10:40:54.727082	2026-05-19 10:40:54.727082	1
\.


--
-- Data for Name: hotel_department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hotel_department (id, hotel_id, department_id, is_active, is_removed, create_date, update_date) FROM stdin;
1	1	1	t	f	2026-05-14 12:47:11.339757	2026-05-14 12:47:11.339757
2	1	2	t	f	2026-05-19 09:49:56.14075	2026-05-19 16:50:00.209
\.


--
-- Data for Name: hotel_setup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hotel_setup (id, hotel_id, setup_id, value) FROM stdin;
1	1	1	TEST PASSWORD EDIT
13	2	1	PW HOTEL 2
\.


--
-- Data for Name: hotel_sync; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hotel_sync (id, hotel_id, application_id, sync_id, use_asymetric, private_key, secret_key) FROM stdin;
1	1	2	ee78bb99-dee0-4af2-b644-edb9785d88ba	t	ABCDEF	\N
2	1	1	06e833b8-d02d-4c7a-b943-8c88f0e2acd7	f	\N	770b053d-7736-4db8-8a42-30098bc227f2
\.


--
-- Data for Name: icon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.icon (id, name, icon) FROM stdin;
1	test-icon-edit	test edit
\.


--
-- Data for Name: language; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.language (id, name, code) FROM stdin;
1	Indonesian	ID   
\.


--
-- Data for Name: master_setup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.master_setup (id, name, setup_code, input_type, option_value) FROM stdin;
1	Wifi	WIFI_PASSWORD	text	\N
\.


--
-- Data for Name: message_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.message_category (id, name) FROM stdin;
1	Welcome Message
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization (id, name) FROM stdin;
1	Archipelago
2	Aryaduta
\.


--
-- Data for Name: request_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_mapping (id, hotel_id, item_id, department_id, sla_id, remark) FROM stdin;
1	1	1	1	1	string
\.


--
-- Data for Name: room_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_services (id, hotel_id, icon_id, name, description, hyperlink, is_active) FROM stdin;
1	1	1	string	string	string	t
\.


--
-- Data for Name: sla; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sla (id, hotel_id, name, response_time, resolution_time, is_default, create_date, update_date) FROM stdin;
1	1	SLA 1	60	60	f	2026-05-25 07:59:46.020481+00	2026-05-25 07:59:46.020481+00
2	1	SLA 2	60	60	t	2026-05-25 09:00:14.800978+00	2026-05-25 09:00:14.800978+00
\.


--
-- Data for Name: template_message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.template_message (id, hotel_id, message_id, title, create_date, update_date) FROM stdin;
1	1	1	Welcome test!	2026-05-28 10:16:50.136184+00	2026-05-28 10:17:13.593+00
\.


--
-- Data for Name: timezone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timezone (id, name, utc_offset) FROM stdin;
1	Jakarta	+07:00
2	Bali test edit	+08:00
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, first_name, last_name, email, picture, super_admin, token_verify, is_verified, is_active, is_removed, last_login, create_date, update_date, is_loggedin) FROM stdin;
2	Fikri	Akmal	fikri.a@sentineltech.com	google.com	f	\N	t	t	f	2026-05-26 16:05:29.019	2026-05-19 10:31:52.996019	2026-05-26 16:05:28.972	t
4	DEV	Postman	devbnpbpostman@gmail.com	\N	f		t	t	f	2026-05-20 15:12:30.508	2026-05-20 08:05:04.382816	2026-05-20 15:25:34.696	f
1	Fikri	Akmal	fikriakmal453@gmail.com	\N	t	\N	t	t	f	2026-06-02 09:08:06.762	2026-05-14 12:40:04.056693	2026-06-02 09:08:06.706	t
\.


--
-- Data for Name: user_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profile (id, hotel_id, department_id, user_id, "position", is_admin, is_leader, is_active, is_removed, create_date, update_date, create_ticket) FROM stdin;
3	2	1	2	CEO	f	f	t	f	2026-05-19 10:41:17.152813	2026-05-20 15:00:18.504	f
6	1	1	4	Staff	f	f	t	f	2026-05-20 08:05:04.382816	2026-05-20 08:05:04.382816	f
2	1	1	2	\N	f	f	t	f	2026-05-19 10:33:19.158253	2026-05-20 15:00:18.504	f
5	2	1	1	CFO	t	t	t	f	2026-05-20 08:02:09.585761	2026-05-20 08:02:09.585761	f
1	1	1	1	CTO	t	f	t	f	2026-05-14 12:47:53.342837	2026-05-14 12:47:53.342837	f
\.


--
-- Name: application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_id_seq', 2, true);


--
-- Name: category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.category_id_seq', 3, true);


--
-- Name: category_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.category_item_id_seq', 1, true);


--
-- Name: country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.country_id_seq', 2, true);


--
-- Name: department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.department_id_seq', 2, true);


--
-- Name: hotel_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_department_id_seq', 4, true);


--
-- Name: hotel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_id_seq', 2, true);


--
-- Name: hotel_setup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_setup_id_seq', 13, true);


--
-- Name: hotel_sync_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hotel_sync_id_seq', 2, true);


--
-- Name: icon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.icon_id_seq', 1, true);


--
-- Name: language_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.language_id_seq', 1, true);


--
-- Name: master_setup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.master_setup_id_seq', 2, true);


--
-- Name: message_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.message_category_id_seq', 1, true);


--
-- Name: organization_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organization_id_seq', 2, true);


--
-- Name: request_mapping_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_mapping_id_seq', 1, true);


--
-- Name: room_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.room_services_id_seq', 1, true);


--
-- Name: sla_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sla_id_seq', 2, true);


--
-- Name: template_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_message_id_seq', 1, true);


--
-- Name: timezone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.timezone_id_seq', 2, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 4, true);


--
-- Name: user_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_profile_id_seq', 6, true);


--
-- Name: application application_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_pkey PRIMARY KEY (id);


--
-- Name: category_item category_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_item
    ADD CONSTRAINT category_item_pkey PRIMARY KEY (id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: country country_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_code_key UNIQUE (code);


--
-- Name: country country_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_pkey PRIMARY KEY (id);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: hotel_department hotel_department_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_department
    ADD CONSTRAINT hotel_department_pkey PRIMARY KEY (id);


--
-- Name: hotel_department hotel_department_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_department
    ADD CONSTRAINT hotel_department_unique UNIQUE (hotel_id, department_id);


--
-- Name: hotel hotel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT hotel_pkey PRIMARY KEY (id);


--
-- Name: hotel_setup hotel_setup_hotel_id_setup_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_setup
    ADD CONSTRAINT hotel_setup_hotel_id_setup_id_key UNIQUE (hotel_id, setup_id);


--
-- Name: hotel_setup hotel_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_setup
    ADD CONSTRAINT hotel_setup_pkey PRIMARY KEY (id);


--
-- Name: hotel_sync hotel_sync_hotel_id_application_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_sync
    ADD CONSTRAINT hotel_sync_hotel_id_application_id_key UNIQUE (hotel_id, application_id);


--
-- Name: hotel_sync hotel_sync_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_sync
    ADD CONSTRAINT hotel_sync_pkey PRIMARY KEY (id);


--
-- Name: icon icon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.icon
    ADD CONSTRAINT icon_pkey PRIMARY KEY (id);


--
-- Name: language language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.language
    ADD CONSTRAINT language_code_key UNIQUE (code);


--
-- Name: language language_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.language
    ADD CONSTRAINT language_pkey PRIMARY KEY (id);


--
-- Name: master_setup master_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_setup
    ADD CONSTRAINT master_setup_pkey PRIMARY KEY (id);


--
-- Name: master_setup master_setup_setup_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_setup
    ADD CONSTRAINT master_setup_setup_code_key UNIQUE (setup_code);


--
-- Name: message_category message_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_category
    ADD CONSTRAINT message_category_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: request_mapping request_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_mapping
    ADD CONSTRAINT request_mapping_pkey PRIMARY KEY (id);


--
-- Name: room_services room_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_services
    ADD CONSTRAINT room_services_pkey PRIMARY KEY (id);


--
-- Name: sla sla_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sla
    ADD CONSTRAINT sla_pkey PRIMARY KEY (id);


--
-- Name: template_message template_message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_message
    ADD CONSTRAINT template_message_pkey PRIMARY KEY (id);


--
-- Name: timezone timezone_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timezone
    ADD CONSTRAINT timezone_name_key UNIQUE (name);


--
-- Name: timezone timezone_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timezone
    ADD CONSTRAINT timezone_pkey PRIMARY KEY (id);


--
-- Name: template_message unique_hotel_message; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_message
    ADD CONSTRAINT unique_hotel_message UNIQUE (hotel_id, message_id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- Name: user user_token_verify_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_token_verify_key UNIQUE (token_verify);


--
-- Name: category category_icon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_icon_id_fkey FOREIGN KEY (icon_id) REFERENCES public.icon(id);


--
-- Name: category_item category_item_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_item
    ADD CONSTRAINT category_item_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id);


--
-- Name: category_item category_item_icon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_item
    ADD CONSTRAINT category_item_icon_id_fkey FOREIGN KEY (icon_id) REFERENCES public.icon(id);


--
-- Name: hotel hotel_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT hotel_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.country(id);


--
-- Name: hotel_department hotel_department_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_department
    ADD CONSTRAINT hotel_department_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(id);


--
-- Name: hotel_department hotel_department_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_department
    ADD CONSTRAINT hotel_department_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotel(id);


--
-- Name: hotel hotel_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT hotel_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.language(id);


--
-- Name: hotel hotel_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT hotel_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: hotel_setup hotel_setup_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_setup
    ADD CONSTRAINT hotel_setup_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotel(id);


--
-- Name: hotel_setup hotel_setup_setup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_setup
    ADD CONSTRAINT hotel_setup_setup_id_fkey FOREIGN KEY (setup_id) REFERENCES public.master_setup(id);


--
-- Name: hotel_sync hotel_sync_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_sync
    ADD CONSTRAINT hotel_sync_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(id);


--
-- Name: hotel_sync hotel_sync_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_sync
    ADD CONSTRAINT hotel_sync_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotel(id);


--
-- Name: hotel hotel_timezone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT hotel_timezone_id_fkey FOREIGN KEY (timezone_id) REFERENCES public.timezone(id);


--
-- Name: request_mapping request_mapping_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_mapping
    ADD CONSTRAINT request_mapping_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.category_item(id);


--
-- Name: request_mapping request_mapping_sla_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_mapping
    ADD CONSTRAINT request_mapping_sla_id_fkey FOREIGN KEY (sla_id) REFERENCES public.sla(id);


--
-- Name: room_services room_services_icon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_services
    ADD CONSTRAINT room_services_icon_id_fkey FOREIGN KEY (icon_id) REFERENCES public.icon(id);


--
-- Name: template_message template_message_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_message
    ADD CONSTRAINT template_message_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.message_category(id);


--
-- Name: user_profile user_profile_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.hotel_department(id);


--
-- Name: user_profile user_profile_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotel(id);


--
-- Name: user_profile user_profile_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Jt0RbopDFUhkmdCAYD1Nzq4pEfTJpRNAo5bf1wuGkfApxyG4aq1s6q85xq4eIpQ

