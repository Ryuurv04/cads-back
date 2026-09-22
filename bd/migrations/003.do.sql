-- Agregar redes sociales y campo de logo/imagen en MEDIUMTEXT para Base64 (hasta 16MB)
ALTER TABLE cards_profiles
  ADD COLUMN logo_url TEXT NULL AFTER color_secundario,
  ADD COLUMN instagram VARCHAR(150) NULL AFTER logo_url,
  ADD COLUMN linkedin VARCHAR(255) NULL AFTER instagram,
  ADD COLUMN tiktok VARCHAR(150) NULL AFTER linkedin,
  ADD COLUMN facebook VARCHAR(255) NULL AFTER tiktok,
  ADD COLUMN twitter VARCHAR(150) NULL AFTER facebook;