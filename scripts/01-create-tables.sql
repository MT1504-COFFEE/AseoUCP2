-- Create database schema for cleaning management platform
-- This script creates all necessary tables for the cleaning platform

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('cleaning_staff', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Buildings/blocks table
CREATE TABLE IF NOT EXISTS buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Floors table
CREATE TABLE IF NOT EXISTS floors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    floor_number INT NOT NULL,
    name VARCHAR(255),
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_floor_per_building (building_id, floor_number),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bathrooms table
CREATE TABLE IF NOT EXISTS bathrooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    floor_id INT NOT NULL,
    gender ENUM('men', 'women') NOT NULL,
    name VARCHAR(255),
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cleaning activities table
CREATE TABLE IF NOT EXISTS cleaning_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bathroom_id INT NOT NULL,
    cleaned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Areas cleaned (checkboxes)
    toilets_cleaned BOOLEAN DEFAULT FALSE,
    sinks_cleaned BOOLEAN DEFAULT FALSE,
    mirrors_cleaned BOOLEAN DEFAULT FALSE,
    walls_cleaned BOOLEAN DEFAULT FALSE,
    floors_cleaned BOOLEAN DEFAULT FALSE,
    doors_cleaned BOOLEAN DEFAULT FALSE,
    
    -- Supplies restocked (checkboxes)
    toilet_paper_restocked BOOLEAN DEFAULT FALSE,
    paper_towels_restocked BOOLEAN DEFAULT FALSE,
    soap_restocked BOOLEAN DEFAULT FALSE,
    
    -- Evidence
    evidence_url VARCHAR(500),
    evidence_type ENUM('image', 'video'),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bathroom_id) REFERENCES bathrooms(id) ON DELETE CASCADE
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bathroom_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence_url VARCHAR(500),
    evidence_type ENUM('image', 'video'),
    status ENUM('reported', 'in_progress', 'resolved') DEFAULT 'reported',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bathroom_id) REFERENCES bathrooms(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_cleaning_activities_user_id ON cleaning_activities(user_id);
CREATE INDEX idx_cleaning_activities_bathroom_id ON cleaning_activities(bathroom_id);
CREATE INDEX idx_cleaning_activities_cleaned_at ON cleaning_activities(cleaned_at);
CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_bathroom_id ON incidents(bathroom_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_reported_at ON incidents(reported_at);
