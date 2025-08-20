# Stripe Setup Instructions for Family Member

## Overview
This document explains how to help set up Stripe payment processing for the Highdeium book platform. The setup allows users to buy books using Cash App, debit cards, and credit cards.

## What You'll Need
- A Stripe account (free to create)
- Basic information about the platform
- 10-15 minutes of setup time

## Step 1: Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Sign up with your email and create an account
3. Complete the basic business information
4. For business type, select "Individual" or "Sole Proprietorship"
5. Complete identity verification (requires ID)

## Step 2: Enable Cash App Pay
1. In your Stripe dashboard, go to Settings → Payment methods
2. Find "Cash App Pay" and enable it
3. This allows users to pay directly with Cash App without needing cards

## Step 3: Get Your API Keys
1. In Stripe dashboard, go to Developers → API keys
2. Copy these two keys:
   - **Publishable key** (starts with `pk_`) - This one is safe to share
   - **Secret key** (starts with `sk_`) - Keep this private

## Step 4: Add Keys to Replit
1. In the Replit project, go to Secrets (lock icon in sidebar)
2. Add these two secrets:
   - Name: `VITE_STRIPE_PUBLIC_KEY` Value: [paste publishable key]
   - Name: `STRIPE_SECRET_KEY` Value: [paste secret key]

## Step 5: Test It Works
1. The app will automatically detect the keys and enable payments
2. You can test with Stripe's test credit card: 4242 4242 4242 4242
3. Real payments will work immediately

## Important Notes
- **For the family member**: You'll be responsible for the Stripe account legally
- **For payments**: Money goes to the bank account you connect to Stripe
- **Fees**: Stripe charges 2.9% + 30¢ per transaction (industry standard)
- **Cash App**: No extra fees for Cash App Pay transactions
- **Safety**: The app never stores credit card info - Stripe handles all security

## Business Information Suggestions
- Business name: "Highdeium Books" or similar
- Business description: "Online book publishing and sales platform"
- Website: The Replit app URL
- Customer service: Your email

## Questions?
- Stripe support: https://support.stripe.com
- The app owner can help with technical questions
- Setup usually takes 5-10 minutes once account is verified