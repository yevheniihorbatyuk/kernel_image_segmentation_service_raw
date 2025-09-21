
# app/db/init.sql
-- Initial database schema (optional)
-- This file is mounted in docker-compose.yml for initial setup

CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS segmentation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    algorithm_name VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL,
    result_image_path VARCHAR(500) NOT NULL,
    segments_count INTEGER NOT NULL,
    processing_time FLOAT NOT NULL,
    memory_usage FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);
CREATE INDEX IF NOT EXISTS idx_segmentation_results_image_id ON segmentation_results(image_id);
CREATE INDEX IF NOT EXISTS idx_segmentation_results_algorithm ON segmentation_results(algorithm_name);
CREATE INDEX IF NOT EXISTS idx_segmentation_results_created_at ON segmentation_results(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for images table
CREATE TRIGGER update_images_updated_at 
    BEFORE UPDATE ON images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
