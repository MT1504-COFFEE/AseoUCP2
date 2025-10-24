-- Script de migración para agregar campos faltantes a cleaning_activities
-- Este script agrega los campos necesarios para el registro de limpieza con imágenes

-- Agregar campos para áreas limpiadas
ALTER TABLE cleaning_activities
ADD COLUMN toilets_cleaned BOOLEAN DEFAULT FALSE COMMENT 'Sanitarios limpiados',
ADD COLUMN sinks_cleaned BOOLEAN DEFAULT FALSE COMMENT 'Lavamanos limpiados',
ADD COLUMN mirrors_cleaned BOOLEAN DEFAULT FALSE COMMENT 'Espejos limpiados',
ADD COLUMN walls_cleaned BOOLEAN DEFAULT FALSE COMMENT 'Paredes limpiadas',
ADD COLUMN floors_cleaned BOOLEAN DEFAULT FALSE COMMENT 'Pisos limpiados',
ADD COLUMN doors_cleaned BOOLEAN DEFAULT FALSE COMMENT 'Puertas limpiadas';

-- Agregar campos para suministros reabastecidos
ALTER TABLE cleaning_activities
ADD COLUMN toilet_paper_restocked BOOLEAN DEFAULT FALSE COMMENT 'Papel higiénico reabastecido',
ADD COLUMN paper_towels_restocked BOOLEAN DEFAULT FALSE COMMENT 'Toallas de papel reabastecidas',
ADD COLUMN soap_restocked BOOLEAN DEFAULT FALSE COMMENT 'Jabón reabastecido';

-- Agregar campos para evidencia (fotos/videos)
ALTER TABLE cleaning_activities
ADD COLUMN evidence_url VARCHAR(500) NULL COMMENT 'URL de la foto o video de evidencia',
ADD COLUMN evidence_type ENUM('image', 'video') NULL COMMENT 'Tipo de evidencia';

-- Agregar índice para búsquedas por tipo de evidencia
CREATE INDEX idx_cleaning_activities_evidence ON cleaning_activities(evidence_type);
