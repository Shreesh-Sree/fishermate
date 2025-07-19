# Environment Setup Guide

## 🔐 Environment Variables Configuration

This guide explains how to properly set up environment variables for the MatsyaN QuarkVerse application.

## 📋 Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your actual API keys (never commit this file!)

3. **Get API Keys** from the following services:

## 🔑 Required API Keys

### 1. Google AI Studio API Key
- **Variable**: `GOOGLE_GENAI_API_KEY`
- **Get it from**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Used for**: AI chat and content generation features

### 2. Google Maps API Key  
- **Variable**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Get it from**: [Google Cloud Console - Maps](https://console.cloud.google.com/google/maps-apis)
- **Used for**: Interactive maps and location features
- **APIs needed**: Maps JavaScript API, Places API

### 3. Firebase Configuration
- **Get from**: [Firebase Console](https://console.firebase.google.com/)
- **Required variables**:
  ```bash
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  ```
- **Used for**: User authentication and data storage

## 🚫 Security Best Practices

### ❌ Never Do This:
- Commit `.env.local` or any file with real API keys
- Share API keys in chat, email, or documentation
- Use production keys in development
- Hardcode API keys in source code

### ✅ Always Do This:
- Use `.env.local` for local development
- Keep API keys in environment variables
- Use different keys for different environments
- Rotate keys regularly
- Check `.gitignore` includes `.env.local`

## 🛠️ Troubleshooting

### Missing API Keys
If you see errors about missing API keys:

1. **Check file exists**: Ensure `.env.local` exists
2. **Check variable names**: Match exactly as shown in `.env.example`
3. **Restart server**: After adding keys, restart the development server
4. **Check console**: Look for specific error messages

### API Key Not Working
1. **Verify key format**: Copy entire key without spaces
2. **Check permissions**: Ensure APIs are enabled in respective consoles
3. **Check quotas**: Verify you haven't exceeded API limits
4. **Test keys**: Use API testing tools to verify keys work

## 📚 Environment Files

- **`.env.example`** - Template with placeholder values (committed to repo)
- **`.env.local`** - Your actual keys (never committed, gitignored)
- **`.env.production`** - Production keys (deploy separately)

## 🔄 Development Workflow

1. Clone repository
2. Copy `.env.example` to `.env.local`
3. Fill in your API keys
4. Run `npm run dev`
5. Test features requiring APIs

---

**Note**: If you accidentally commit API keys, immediately rotate them in the respective service consoles!
