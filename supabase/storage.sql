-- ============================================================
-- JJAUTO92 - Configuration Supabase Storage
-- Buckets pour les fichiers et documents
-- ============================================================

-- Bucket: photos de véhicules (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicles',
  'vehicles',
  true,  -- Public: les photos de véhicules sont accessibles sans auth
  5242880,  -- 5 MB max par fichier
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: documents clients (privé - RGPD)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,  -- Privé: accès restreint via RLS
  10485760,  -- 10 MB max par fichier
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: états des lieux (privé)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-reports',
  'inspection-reports',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- POLITIQUES STORAGE
-- ============================================================

-- Vehicles: lecture publique
CREATE POLICY "vehicles_photos_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vehicles');

-- Vehicles: upload admin uniquement
CREATE POLICY "vehicles_photos_admin_write" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicles'
    AND (auth.jwt() ->> 'role') = 'admin'
  );

CREATE POLICY "vehicles_photos_admin_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vehicles'
    AND (auth.jwt() ->> 'role') = 'admin'
  );

-- Documents: client accède uniquement à son dossier
-- Convention de path: documents/{customer_id}/{type}/{filename}
CREATE POLICY "documents_own_read" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (
      (auth.jwt() ->> 'role') = 'admin'
      OR (
        auth.uid() IS NOT NULL
        AND name LIKE (
          'documents/' ||
          (SELECT id::text FROM customers WHERE auth_user_id = auth.uid() LIMIT 1)
          || '/%'
        )
      )
    )
  );

CREATE POLICY "documents_own_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (
      (auth.jwt() ->> 'role') = 'admin'
      OR (
        auth.uid() IS NOT NULL
        AND name LIKE (
          'documents/' ||
          (SELECT id::text FROM customers WHERE auth_user_id = auth.uid() LIMIT 1)
          || '/%'
        )
      )
    )
  );

-- Admin: accès complet aux documents
CREATE POLICY "documents_admin_all" ON storage.objects
  FOR ALL
  USING (
    bucket_id IN ('documents', 'inspection-reports')
    AND (auth.jwt() ->> 'role') = 'admin'
  );

-- États des lieux: admin seulement
CREATE POLICY "inspection_reports_admin_all" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'inspection-reports'
    AND (auth.jwt() ->> 'role') = 'admin'
  );
