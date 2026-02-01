# Narration Audio Feature Documentation

## Overview

The Poker Pardner app includes an optional voice narration feature that uses ElevenLabs text-to-speech API to speak the cowboy narrator's messages out loud. This enhances the learning experience by allowing users to hear advice without needing to read.

## Configuration

### Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io)
2. **API Key**: Get your API key from the [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys)
3. **Voice ID** (optional): Choose a voice from the [Voice Lab](https://elevenlabs.io/app/voice-lab)

### Environment Variables

Add these variables to your `.env` file:

```bash
# Required to enable voice narration
VITE_ELEVENLABS_API_KEY=your_api_key_here

# Optional: Defaults to "Adam" voice if not specified
VITE_ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

### Default Voice

If `VITE_ELEVENLABS_VOICE_ID` is not provided, the system uses the "Adam" voice (ID: `pNInz6obpgDQGcFmaJgB`).

## Features

### Smart Queueing
- Speech requests are queued to avoid overlapping narration
- New messages wait until current speech finishes
- Queue is cleared when narration is disabled or stopped

### Text Cleaning
Before sending text to the API, the service automatically:
- Removes markdown formatting (`**bold**`, `_italic_`, `` `code` ``)
- Strips emojis and special characters
- Normalizes whitespace
- Trims leading/trailing spaces

### Caching
- Synthesized audio is cached to reduce API calls
- Cache size limited to 50 entries
- Oldest entries automatically removed when limit exceeded
- Cache keys normalized for better hit rate
- URLs properly cleaned up to prevent memory leaks

### Volume Control
- Default volume: 80% (0.8)
- Can be adjusted programmatically if needed

## User Interface

### Voice Toggle Button
When the ElevenLabs API key is configured, a voice toggle button appears in the Cowboy Panel:
- **Green button**: Voice narration enabled
- **Gray button**: Voice narration disabled
- Icon shows speaker symbol (with/without mute indicator)

### Visibility
The toggle button only appears when:
1. `VITE_ELEVENLABS_API_KEY` is set in environment
2. User is in tutorial mode (not training mode)

## Troubleshooting

### Voice Toggle Not Appearing

**Problem**: The voice toggle button doesn't show up in the UI.

**Solutions**:
1. Check that `VITE_ELEVENLABS_API_KEY` is set in your `.env` file
2. Restart the development server after adding the API key
3. Verify you're in tutorial mode (not training mode)
4. Check browser console for any errors

### No Audio Plays

**Problem**: Button is visible but clicking it doesn't produce audio.

**Solutions**:
1. **Check API Key**: Verify your ElevenLabs API key is valid
2. **Check API Quota**: Ensure you haven't exceeded your ElevenLabs quota
3. **Browser Autoplay Policy**: Some browsers block audio until user interaction
   - Try clicking elsewhere on the page first
   - Check browser console for autoplay blocking messages
4. **Network Issues**: Check browser Network tab for failed API requests
5. **API Errors**: Look for error messages in browser console

### Common Error Messages

#### "ElevenLabs API key not configured"
- **Cause**: API key is missing or empty
- **Fix**: Set `VITE_ELEVENLABS_API_KEY` in `.env` and restart

#### "ElevenLabs API error: 401 Unauthorized"
- **Cause**: Invalid API key
- **Fix**: Double-check your API key from ElevenLabs dashboard

#### "ElevenLabs API error: 429 Too Many Requests"
- **Cause**: Exceeded rate limit or quota
- **Fix**:
  - Wait for rate limit to reset
  - Upgrade your ElevenLabs plan
  - Reduce narration frequency

#### "Error playing audio"
- **Cause**: Browser audio context or codec issues
- **Fix**:
  - Try a different browser
  - Check browser audio settings
  - Ensure speakers/headphones are connected

### Audio Cuts Off or Overlaps

**Problem**: Audio doesn't finish or multiple voices speak at once.

**Solutions**:
1. This shouldn't happen due to queueing, but if it does:
   - Disable and re-enable narration using the toggle
   - Refresh the page
   - Check console for errors in queue processing

### High API Usage

**Problem**: Using too many ElevenLabs API credits.

**Solutions**:
1. **Caching**: The system caches up to 50 synthesized messages
   - Similar messages reuse cached audio
   - No API call needed for cached content
2. **Disable When Not Needed**: Toggle narration off during practice
3. **Optimize Text**: Shorter narration messages use fewer characters

## Development

### Testing

Run the test suite:
```bash
npm test -- textToSpeech.test.ts
```

The test suite covers:
- Service initialization with/without API key
- Enable/disable functionality
- Text cleaning and normalization
- API error handling
- Caching behavior
- Queue management
- Memory cleanup

### Manual Testing Checklist

1. **Without API Key**:
   - [ ] Toggle button should NOT appear
   - [ ] No API calls should be made
   - [ ] No console errors

2. **With API Key**:
   - [ ] Toggle button appears in tutorial mode
   - [ ] Clicking toggle enables/disables audio
   - [ ] Narration speaks on new messages
   - [ ] Queue handles multiple messages
   - [ ] Cache reduces duplicate API calls

3. **Edge Cases**:
   - [ ] Empty text doesn't cause errors
   - [ ] Emoji-only text doesn't speak
   - [ ] Long text doesn't overflow
   - [ ] Network errors handled gracefully
   - [ ] Page refresh cleans up resources

## API Usage Optimization

### Best Practices

1. **Keep Narration Concise**: Shorter messages use fewer API characters
2. **Use Caching**: Similar messages reuse cached audio
3. **Toggle Appropriately**: Disable when not actively learning
4. **Monitor Quota**: Check ElevenLabs dashboard regularly

### Character Counting

ElevenLabs charges based on character count:
- Typical narration message: 50-200 characters
- Average hand: 3-5 narration events
- Typical game session: 500-2000 characters

### Free Tier Limits

ElevenLabs free tier (as of 2026):
- 10,000 characters/month
- ~20-50 hands of gameplay with full narration
- Consider upgrading for regular use

## Implementation Details

### Architecture

```
CowboyPanel.tsx
  └─> useEffect (listens to narratorEvent changes)
      └─> textToSpeechService.speak()
          ├─> Clean text (remove markdown/emojis)
          ├─> Check cache
          │   └─> Cache hit: Use cached URL
          │   └─> Cache miss: Call ElevenLabs API
          ├─> Create Audio element
          └─> Add to queue
              └─> Play when previous audio completes
```

### Key Files

- `src/utils/textToSpeech.ts`: Core service implementation
- `src/utils/textToSpeech.test.ts`: Test suite
- `src/components/CowboyPanel.tsx`: UI integration (lines 107-123, 406-425)

### Singleton Pattern

The service uses a singleton pattern:
```typescript
export const textToSpeechService = new TextToSpeechService();
```

This ensures:
- Single audio queue across the app
- Consistent cache across components
- Proper resource cleanup

## Security Considerations

### API Key Protection

- **Never commit** `.env` file to version control
- API key should remain on client-side only
- ElevenLabs API keys are client-safe (designed for browser use)
- Consider server-side proxy for production if concerned about quota abuse

### Content Filtering

The service already filters:
- Markdown (no injection risk)
- Emojis (prevents encoding issues)
- Special characters (reduces injection vectors)

## Future Enhancements

Potential improvements (not currently implemented):

1. **Voice Selection UI**: Let users choose narrator voice
2. **Speed Control**: Adjustable playback speed
3. **Volume Slider**: User-adjustable volume
4. **Offline Mode**: Pre-generate common phrases
5. **Server-Side Caching**: Share cache across users
6. **Alternative TTS**: Fallback to browser Web Speech API

## Support

### Getting Help

1. Check this documentation first
2. Review test suite for expected behavior
3. Check browser console for errors
4. Verify ElevenLabs dashboard for API issues
5. File issue on GitHub if bug found

### Reporting Issues

When reporting narration audio issues, include:
- Browser name and version
- Console error messages
- Network tab screenshots (API calls)
- Steps to reproduce
- Whether API key is configured
