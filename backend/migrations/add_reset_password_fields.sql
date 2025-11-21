-- Add reset_token and reset_token_expiry columns to users table
-- Run this SQL script to enable forgot password functionality

ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(64) NULL DEFAULT NULL,
ADD COLUMN reset_token_expiry DATETIME NULL DEFAULT NULL,
ADD INDEX idx_reset_token (reset_token);

-- Optional: Add email column if it doesn't exist
-- ALTER TABLE users ADD COLUMN email VARCHAR(100) NULL DEFAULT NULL AFTER full_name;
