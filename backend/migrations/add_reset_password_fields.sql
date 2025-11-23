ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(64) NULL DEFAULT NULL,
ADD COLUMN reset_token_expiry DATETIME NULL DEFAULT NULL,
ADD INDEX idx_reset_token (reset_token);
