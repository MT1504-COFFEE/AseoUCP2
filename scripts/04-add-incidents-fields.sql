-- Script de migración para agregar campos de evidencia a incidents
-- Los incidentes también necesitan poder almacenar fotos/videos

ALTER TABLE incidents
ADD COLUMN evidence_url VARCHAR(500) NULL COMMENT 'URL de la foto o video de evidencia',
ADD COLUMN evidence_type ENUM('image', 'video') NULL COMMENT 'Tipo de evidencia';

-- Agregar índice para búsquedas por tipo de evidencia
CREATE INDEX idx_incidents_evidence ON incidents(evidence_type);
