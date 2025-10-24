-- Tabla opcional para rastrear todos los archivos subidos
-- Útil para gestión de almacenamiento y auditoría

CREATE TABLE IF NOT EXISTS uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL COMMENT 'Nombre original del archivo',
    stored_filename VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo en el servidor',
    file_path VARCHAR(500) NOT NULL COMMENT 'Ruta completa del archivo',
    file_size INT NOT NULL COMMENT 'Tamaño del archivo en bytes',
    mime_type VARCHAR(100) NOT NULL COMMENT 'Tipo MIME del archivo',
    file_type ENUM('image', 'video') NOT NULL COMMENT 'Tipo de archivo',
    uploaded_by INT NOT NULL COMMENT 'ID del usuario que subió el archivo',
    related_to ENUM('cleaning_activity', 'incident') NULL COMMENT 'Tipo de registro relacionado',
    related_id INT NULL COMMENT 'ID del registro relacionado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_uploads_user (uploaded_by),
    INDEX idx_uploads_type (file_type),
    INDEX idx_uploads_related (related_to, related_id)
) COMMENT='Registro de todos los archivos subidos al sistema';
