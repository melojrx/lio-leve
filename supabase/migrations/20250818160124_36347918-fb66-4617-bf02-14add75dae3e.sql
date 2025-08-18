-- Fix OTP expiry time to meet security recommendations
-- Set OTP expiry to 10 minutes (600 seconds) which is the recommended maximum
UPDATE auth.config 
SET value = '600' 
WHERE name = 'otp_exp_in_secs';