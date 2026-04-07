-- DEV-30 migration: Z-API → Evolution API v2
-- Renames WhatsApp credential columns to match Evolution API v2 naming.
-- Evolution API uses a single apikey + instance name (not instance_id + token + client_token).

alter table public.channel_connections
  rename column zapi_instance_id to evolution_instance_name;

alter table public.channel_connections
  rename column zapi_token to evolution_api_key;

alter table public.channel_connections
  rename column zapi_phone to evolution_phone;

alter table public.channel_connections
  drop column if exists zapi_client_token;

comment on column public.channel_connections.evolution_instance_name
  is 'Evolution API v2: instance name (path param for all endpoints)';
comment on column public.channel_connections.evolution_api_key
  is 'Evolution API v2: apikey header value for authentication';
comment on column public.channel_connections.evolution_phone
  is 'WhatsApp business phone number linked to this Evolution instance';
