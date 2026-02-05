-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  company_name TEXT,
  creci TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brands table
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  primary_color TEXT NOT NULL DEFAULT '#1E3A5F',
  secondary_color TEXT NOT NULL DEFAULT '#D4AF37',
  logo_url TEXT,
  slogan TEXT,
  typography_heading TEXT DEFAULT 'Montserrat',
  typography_body TEXT DEFAULT 'Open Sans',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  price DECIMAL(15,2),
  price_type TEXT DEFAULT 'sale' CHECK (price_type IN ('sale', 'rent')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm DECIMAL(10,2),
  description TEXT,
  features TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'rented', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property_media table
CREATE TABLE public.property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_name TEXT,
  file_size INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  format TEXT NOT NULL CHECK (format IN ('feed_square', 'feed_portrait', 'story', 'carousel', 'facebook_cover')),
  style TEXT DEFAULT 'express' CHECK (style IN ('express', 'magic', 'conversion')),
  category TEXT DEFAULT 'sale' CHECK (category IN ('sale', 'rent', 'launch', 'sold', 'testimonial', 'tip', 'institutional')),
  thumbnail_url TEXT,
  template_data JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create creatives table
CREATE TABLE public.creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  content_data JSONB DEFAULT '{}',
  caption TEXT,
  hashtags TEXT[],
  exported_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'scheduled', 'published')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Brands policies (system brands visible to all, user brands to owner)
CREATE POLICY "Anyone can view system brands"
  ON public.brands FOR SELECT
  USING (is_system = true);

CREATE POLICY "Authenticated users can view all brands"
  ON public.brands FOR SELECT
  TO authenticated
  USING (true);

-- Properties policies
CREATE POLICY "Users can view their own properties"
  ON public.properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = user_id);

-- Property media policies
CREATE POLICY "Users can view media of their properties"
  ON public.property_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_media.property_id 
    AND properties.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert media to their properties"
  ON public.property_media FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_media.property_id 
    AND properties.user_id = auth.uid()
  ));

CREATE POLICY "Users can update media of their properties"
  ON public.property_media FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_media.property_id 
    AND properties.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete media of their properties"
  ON public.property_media FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_media.property_id 
    AND properties.user_id = auth.uid()
  ));

-- Templates policies
CREATE POLICY "Anyone can view active system templates"
  ON public.templates FOR SELECT
  USING (is_system = true AND is_active = true);

CREATE POLICY "Authenticated users can view all active templates"
  ON public.templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Creatives policies
CREATE POLICY "Users can view their own creatives"
  ON public.creatives FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creatives"
  ON public.creatives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creatives"
  ON public.creatives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own creatives"
  ON public.creatives FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_creatives_updated_at
  BEFORE UPDATE ON public.creatives
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert system brands (Douglas Bonanzza and DB8)
INSERT INTO public.brands (name, slug, primary_color, secondary_color, slogan, typography_heading, typography_body, is_system)
VALUES 
  ('Douglas Bonanzza Imóveis', 'douglas-bonanzza', '#1E3A5F', '#D4AF37', 'Realizando sonhos imobiliários', 'Montserrat', 'Open Sans', true),
  ('DB8 Imobiliária', 'db8', '#18181B', '#FACC15', 'Seu imóvel, nossa missão', 'Inter', 'Inter', true);

-- Insert sample templates
INSERT INTO public.templates (name, description, format, style, category, is_system, is_active, template_data)
VALUES 
  ('Feed Moderno', 'Template moderno para feed do Instagram', 'feed_square', 'express', 'sale', true, true, '{"layout": "centered", "overlay": true}'),
  ('Story Impactante', 'Template vertical para stories', 'story', 'magic', 'sale', true, true, '{"layout": "fullscreen", "gradient": true}'),
  ('Carrossel Completo', 'Template multi-slide para carrossel', 'carousel', 'conversion', 'sale', true, true, '{"slides": 5, "transition": "fade"}'),
  ('Feed Luxo', 'Template elegante para imóveis de alto padrão', 'feed_square', 'magic', 'sale', true, true, '{"layout": "elegant", "gold_accents": true}'),
  ('Story Urgente', 'Template para promoções urgentes', 'story', 'conversion', 'launch', true, true, '{"countdown": true, "bold": true}'),
  ('Feed Vendido', 'Template de celebração de venda', 'feed_square', 'express', 'sold', true, true, '{"celebration": true, "confetti": false}')