#!/bin/bash

echo "Setting up Referral System for DISCO..."

# Generate Prisma client with new schema
echo "Generating Prisma client..."
npx prisma generate

# Push the new schema to database
echo "Pushing schema to database..."
npx prisma db push

# Restart the server
echo "Referral system setup complete!"
echo "Please restart your server to apply all changes." 