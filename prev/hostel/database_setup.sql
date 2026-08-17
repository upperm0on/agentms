-- PostgreSQL Database Setup for StayPal Production
-- Run this script as postgres superuser

-- Create database
CREATE DATABASE staypal;

-- Create user
CREATE USER staypaluser WITH PASSWORD 'supersecurepassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE staypal TO staypaluser;

-- Connect to the database and grant schema privileges
\c staypal;
GRANT ALL ON SCHEMA public TO staypaluser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO staypaluser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO staypaluser;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO staypaluser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO staypaluser;


