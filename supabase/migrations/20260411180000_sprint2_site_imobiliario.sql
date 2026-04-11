-- Migration: Sprint 2 - Site Imobiliário
-- Criação das tabelas e políticas de segurança (RLS)

-- 1. Tabela: corretor_sites
CREATE TABLE IF NOT EXISTS public.corretor_sites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    creci TEXT,
    foto_url TEXT,
    bio TEXT,
    especialidades TEXT[] DEFAULT '{}',
    anos_experiencia INTEGER DEFAULT 0,
    telefone TEXT,
    whatsapp TEXT,
    email_contato TEXT,
    instagram TEXT,
    facebook TEXT,
    linkedin TEXT,
    youtube TEXT,
    slug TEXT UNIQUE,
    dominio_customizado TEXT UNIQUE,
    dominio_verificado BOOLEAN DEFAULT false,
    dominio_verificado_at TIMESTAMP WITH TIME ZONE,
    cname_token TEXT,
    tema TEXT DEFAULT 'brisa',
    cor_primaria TEXT DEFAULT '#0284C7',
    cor_secundaria TEXT DEFAULT '#F59E0B',
    logo_url TEXT,
    banner_hero_url TEXT,
    banner_hero_titulo TEXT,
    banner_hero_subtitulo TEXT,
    meta_titulo TEXT,
    meta_descricao TEXT,
    google_analytics_id TEXT,
    publicado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela: site_imoveis
CREATE TABLE IF NOT EXISTS public.site_imoveis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.corretor_sites(id) ON DELETE CASCADE,
    titulo TEXT,
    descricao TEXT,
    tipo TEXT,
    finalidade TEXT,
    status TEXT,
    endereco TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    preco NUMERIC,
    preco_condominio NUMERIC,
    area_total NUMERIC,
    area_construida NUMERIC,
    quartos INTEGER DEFAULT 0,
    suites INTEGER DEFAULT 0,
    banheiros INTEGER DEFAULT 0,
    vagas INTEGER DEFAULT 0,
    andar INTEGER,
    fotos TEXT[] DEFAULT '{}',
    foto_capa TEXT,
    video_url TEXT,
    tour_virtual_url TEXT,
    features TEXT[] DEFAULT '{}',
    publicar_zap BOOLEAN DEFAULT false,
    publicar_olx BOOLEAN DEFAULT false,
    publicar_vivareal BOOLEAN DEFAULT false,
    codigo_externo TEXT,
    slug TEXT,
    destaque BOOLEAN DEFAULT false,
    ordem_exibicao INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela: site_depoimentos
CREATE TABLE IF NOT EXISTS public.site_depoimentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.corretor_sites(id) ON DELETE CASCADE,
    nome_cliente TEXT NOT NULL,
    foto_url TEXT,
    texto TEXT NOT NULL,
    avaliacao INTEGER DEFAULT 5,
    tipo_negocio TEXT,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela: site_leads
CREATE TABLE IF NOT EXISTS public.site_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES public.corretor_sites(id) ON DELETE CASCADE,
    corretor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    imovel_id UUID REFERENCES public.site_imoveis(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT NOT NULL,
    mensagem TEXT,
    interesse TEXT,
    origem TEXT DEFAULT 'site',
    processado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela: dominio_verificacoes
CREATE TABLE IF NOT EXISTS public.dominio_verificacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES public.corretor_sites(id) ON DELETE CASCADE,
    dominio TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    check_errors TEXT,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices Recomendados
CREATE INDEX IF NOT EXISTS idx_corretor_sites_user_id ON public.corretor_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_corretor_sites_slug ON public.corretor_sites(slug);
CREATE INDEX IF NOT EXISTS idx_site_imoveis_site_id ON public.site_imoveis(site_id);
CREATE INDEX IF NOT EXISTS idx_site_leads_corretor_id ON public.site_leads(corretor_user_id);

--------------------------------------------------------------------------------
-- Habilitando Row Level Security (RLS)
--------------------------------------------------------------------------------
ALTER TABLE public.corretor_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_depoimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dominio_verificacoes ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- Políticas (Policies)
--------------------------------------------------------------------------------

-- corretor_sites
CREATE POLICY "Public pode ver sites publicados" ON public.corretor_sites
    FOR SELECT USING (publicado = true OR auth.uid() = user_id);

CREATE POLICY "Dono pode inserir seu site" ON public.corretor_sites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dono pode atualizar seu site" ON public.corretor_sites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Dono pode deletar seu site" ON public.corretor_sites
    FOR DELETE USING (auth.uid() = user_id);

-- site_imoveis
CREATE POLICY "Public pode ver imóveis associados a seu site" ON public.site_imoveis
    FOR SELECT USING (true); -- Controle mais rigoroso via site publicado pode ser feito via JOIN na app

CREATE POLICY "Dono pode gerenciar seus imóveis" ON public.site_imoveis
    FOR ALL USING (auth.uid() = user_id);

-- site_depoimentos
CREATE POLICY "Public pode ver depoimentos ativos" ON public.site_depoimentos
    FOR SELECT USING (ativo = true OR auth.uid() = user_id);

CREATE POLICY "Dono pode gerenciar seus depoimentos" ON public.site_depoimentos
    FOR ALL USING (auth.uid() = user_id);

-- site_leads
CREATE POLICY "Visitantes anonimos podem criar leads no site" ON public.site_leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Corretor pode ver/gerenciar seus próprios leads" ON public.site_leads
    FOR SELECT USING (auth.uid() = corretor_user_id);

CREATE POLICY "Corretor pode atualizar seus leads" ON public.site_leads
    FOR UPDATE USING (auth.uid() = corretor_user_id);

CREATE POLICY "Corretor pode deletar seus leads" ON public.site_leads
    FOR DELETE USING (auth.uid() = corretor_user_id);

-- dominio_verificacoes
CREATE POLICY "Dono pode ver/gerenciar dominios" ON public.dominio_verificacoes
    FOR ALL USING (site_id IN (SELECT id FROM public.corretor_sites WHERE user_id = auth.uid()));

--------------------------------------------------------------------------------
-- Setup Storage (bucket "site-fotos" and "site-assets" if not exists)
--------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-fotos', 'site-fotos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage buckets (simplificadas para o usuário)
CREATE POLICY "Users can upload suas fotos de site" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'site-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can edit suas fotos de site" ON storage.objects
    FOR UPDATE USING (bucket_id = 'site-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view site fotos" ON storage.objects
    FOR SELECT USING (bucket_id = 'site-fotos');

CREATE POLICY "Users can upload assets do site" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view site assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'site-assets');
