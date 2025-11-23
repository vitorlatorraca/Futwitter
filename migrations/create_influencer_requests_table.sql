-- Migration: Create influencer_requests table
-- This migration creates the influencer_requests table for managing influencer status requests

-- Create the influencer_requests table
CREATE TABLE IF NOT EXISTS influencer_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reviewed_by VARCHAR(36),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_influencer_requests_user_id ON influencer_requests(user_id);

-- Create index on status for filtering requests
CREATE INDEX IF NOT EXISTS idx_influencer_requests_status ON influencer_requests(status);

-- Add foreign key constraint to users table (if users table exists)
-- Uncomment if you want to enforce referential integrity
-- ALTER TABLE influencer_requests 
-- ADD CONSTRAINT fk_influencer_requests_user 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


