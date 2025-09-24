-- Seed data for testing the cleaning management platform

-- Insert sample buildings
INSERT INTO buildings (name, code) VALUES 
('Edificio Principal', 'EP'),
('Edificio Norte', 'EN'),
('Edificio Sur', 'ES');

-- Insert sample floors
INSERT INTO floors (building_id, floor_number, name) VALUES 
(1, 1, 'Planta Baja'),
(1, 2, 'Primer Piso'),
(1, 3, 'Segundo Piso'),
(2, 1, 'Planta Baja'),
(2, 2, 'Primer Piso'),
(3, 1, 'Planta Baja');

-- Insert sample bathrooms
INSERT INTO bathrooms (floor_id, gender, name) VALUES 
(1, 'men', 'Baño Hombres PB - EP'),
(1, 'women', 'Baño Mujeres PB - EP'),
(2, 'men', 'Baño Hombres P1 - EP'),
(2, 'women', 'Baño Mujeres P1 - EP'),
(3, 'men', 'Baño Hombres P2 - EP'),
(3, 'women', 'Baño Mujeres P2 - EP'),
(4, 'men', 'Baño Hombres PB - EN'),
(4, 'women', 'Baño Mujeres PB - EN'),
(5, 'men', 'Baño Hombres P1 - EN'),
(5, 'women', 'Baño Mujeres P1 - EN'),
(6, 'men', 'Baño Hombres PB - ES'),
(6, 'women', 'Baño Mujeres PB - ES');

-- Insert sample users (passwords are hashed versions of 'password123')
INSERT INTO users (email, password_hash, full_name, role) VALUES 
('admin@institucion.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'Administrador Principal', 'admin'),
('supervisor@institucion.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'Supervisor de Limpieza', 'admin'),
('maria.garcia@institucion.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'María García', 'cleaning_staff'),
('juan.perez@institucion.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'Juan Pérez', 'cleaning_staff'),
('ana.lopez@institucion.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'Ana López', 'cleaning_staff');

-- Insert sample cleaning activities
INSERT INTO cleaning_activities (
    user_id, bathroom_id, cleaned_at,
    toilets_cleaned, sinks_cleaned, mirrors_cleaned, walls_cleaned, floors_cleaned, doors_cleaned,
    toilet_paper_restocked, paper_towels_restocked, soap_restocked,
    notes
) VALUES 
(3, 1, '2024-01-15 08:30:00', TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, 'Limpieza matutina completada'),
(4, 2, '2024-01-15 09:15:00', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, 'Todo en orden'),
(5, 3, '2024-01-15 10:00:00', TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, TRUE, 'Espejo necesita atención especial'),
(3, 4, '2024-01-15 14:30:00', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Limpieza vespertina'),
(4, 5, '2024-01-15 15:15:00', TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE, 'Suministros bajos');

-- Insert sample incidents
INSERT INTO incidents (user_id, bathroom_id, title, description, status, priority, reported_at) VALUES 
(3, 1, 'Grifo con fuga', 'El grifo del lavamanos central tiene una fuga constante que genera charco en el piso', 'reported', 'high', '2024-01-15 11:30:00'),
(4, 3, 'Espejo roto', 'El espejo principal tiene una grieta en la esquina superior derecha', 'in_progress', 'medium', '2024-01-15 13:45:00'),
(5, 2, 'Puerta no cierra bien', 'La puerta del baño no cierra correctamente, se queda entreabierta', 'reported', 'low', '2024-01-15 16:20:00'),
(3, 5, 'Inodoro obstruido', 'El segundo inodoro está obstruido y no funciona correctamente', 'reported', 'high', '2024-01-15 17:00:00');
