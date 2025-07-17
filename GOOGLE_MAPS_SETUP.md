# Google Maps Setup Guide for FisherMate.AI

## Complete Setup Instructions

### 1. Google Cloud Console Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Note your Project ID

2. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Enable the following APIs:
     - **Maps JavaScript API** (for map display)
     - **Places API** (for nearby fishing spots)
     - **Geocoding API** (for location services)

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

4. **Secure Your API Key (Recommended)**
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `yourdomain.com/*`, `localhost:3000/*`)
   - Under "API restrictions", select "Restrict key"
   - Choose only the APIs you enabled above

### 2. Environment Configuration

Add your API key to `.env.local`:

```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Features Included

✅ **Interactive Google Maps with dark/light mode**
✅ **Real-time user location tracking**
✅ **Nearby fishing spots discovery**
✅ **Marina and harbor locations**
✅ **Bait shops and fishing stores**
✅ **Coast guard and safety stations**
✅ **Seafood restaurants**
✅ **Custom fishing-themed markers**
✅ **Click-to-navigate directions**
✅ **Distance calculations**
✅ **Rating and photo integration**
✅ **Responsive design**
✅ **Error handling and retry logic**

### 4. Demo API Key

For immediate testing, a demo API key is included:
- **Limited to localhost and development use only**
- **Replace with your own key for production**
- **May have usage restrictions**

### 5. Fallback System

The map component includes:
- **Automatic retry logic** (up to 3 attempts)
- **Detailed error messages** with setup instructions
- **Graceful degradation** if APIs fail
- **Loading states** with progress indicators

### 6. Cost Optimization Tips

1. **Set usage quotas** in Google Cloud Console
2. **Use map restrictions** to prevent unauthorized use
3. **Monitor usage** in the Google Cloud Console
4. **Consider caching** frequently requested data

### 7. Production Deployment

Before deploying to production:

1. **Replace the demo API key** with your own
2. **Add your production domain** to API restrictions
3. **Set up billing alerts** in Google Cloud
4. **Test all functionality** with your API key
5. **Monitor API usage** and costs

### 8. Troubleshooting

**Map not loading?**
- Check if API key is correctly set in `.env.local`
- Verify all required APIs are enabled
- Check browser console for specific error messages

**No fishing spots appearing?**
- Ensure Places API is enabled
- Check if location permissions are granted
- Try a different location (coastal areas work best)

**Quota exceeded errors?**
- Check your Google Cloud billing account
- Review and adjust API quotas
- Consider optimizing API calls

### 9. Advanced Customization

The GoogleMapCard component supports:
- **Custom map styles** for branding
- **Additional POI types** via Places API
- **Custom marker icons** and info windows
- **Integration with other Google services**

For support or customization needs, refer to the component source code in `src/components/GoogleMapCard.tsx`.
