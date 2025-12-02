# Audio Format Guide for WhatsApp

## 🎵 The Mobile Compatibility Issue

**Problem:** MP3 and other audio formats may show in WhatsApp Web but **won't play on mobile devices**.

**Solution:** WhatsApp mobile requires **OGG Opus format** (`audio/ogg; codecs=opus`) for voice notes.

## ✅ Automatic Conversion (Recommended)

The `send-media.js` script now **automatically converts** audio files to OGG Opus format for mobile compatibility!

### Usage

```bash
# Automatically converts MP3 to OGG Opus
node send-media.js audio.mp3 "Test Channel" audio

# Works with any audio format (WAV, M4A, etc.)
node send-media.js audio.wav "Test Channel" audio
node send-media.js audio.m4a "Test Channel" audio
```

### Requirements

- **ffmpeg** must be installed for automatic conversion
- Check if installed: `ffmpeg -version`
- Install if needed: `sudo apt install ffmpeg`

### What Happens

1. Script detects non-OGG audio file
2. Checks if ffmpeg is available
3. Converts to OGG Opus format (optimized for WhatsApp)
4. Sends the converted file
5. Cleans up temporary files

### Benefits

- ✅ **Mobile compatible** - plays on all devices
- ✅ **Smaller file size** - OGG Opus is more efficient
- ✅ **Better quality** - optimized codec settings
- ✅ **Automatic** - no manual conversion needed

## 📊 Comparison

### Before (MP3)
- File size: 716 KB
- MIME type: `audio/mpeg`
- Mobile playback: ❌ Not working
- Web playback: ✅ Working

### After (OGG Opus)
- File size: 396 KB (45% smaller!)
- MIME type: `audio/ogg; codecs=opus`
- Mobile playback: ✅ Working
- Web playback: ✅ Working

## 🔧 Manual Conversion (Optional)

If you want to convert files manually:

```bash
# Convert MP3 to OGG Opus
ffmpeg -i audio.mp3 -c:a libopus -b:a 64k -vbr on -compression_level 10 -frame_duration 60 -application voip audio.ogg

# Then send the OGG file
node send-media.js audio.ogg "Test Channel" audio
```

### Codec Settings Explained

- `-c:a libopus` - Use Opus codec
- `-b:a 64k` - Bitrate 64kbps (good for voice)
- `-vbr on` - Variable bitrate for better quality
- `-compression_level 10` - Maximum compression
- `-frame_duration 60` - 60ms frames (WhatsApp optimized)
- `-application voip` - Optimize for voice

## 📱 Supported Formats

### ✅ Mobile Compatible (Recommended)
- **OGG Opus** (`.ogg`, `.opus`) - Best choice
  - MIME: `audio/ogg; codecs=opus`
  - Auto-detected and sent as-is

### ⚠️ May Not Work on Mobile
- **MP3** (`.mp3`) - Auto-converted to OGG
  - MIME: `audio/mpeg`
- **WAV** (`.wav`) - Auto-converted to OGG
  - MIME: `audio/wav`
- **M4A** (`.m4a`) - Auto-converted to OGG
  - MIME: `audio/mp4`

## 🚀 Quick Test

Test if your audio plays on mobile:

```bash
# Send with auto-conversion
node send-media.js audio.mp3 "Test Channel" audio

# Check your mobile WhatsApp
# The voice note should now play!
```

## 🔍 Troubleshooting

### Audio doesn't play on mobile

**Check 1: Was it converted?**
```bash
# Look for this in the output:
# "Converting audio to OGG Opus format for mobile compatibility..."
# "✅ Conversion successful!"
```

**Check 2: Is ffmpeg installed?**
```bash
ffmpeg -version
# If not found, install it:
sudo apt install ffmpeg
```

**Check 3: Check the MIME type**
```bash
# Should show: "MIME type: audio/ogg; codecs=opus"
```

### Conversion fails

If you see: `⚠️ Conversion failed, sending original file...`

1. Check ffmpeg installation: `sudo apt install ffmpeg`
2. Check file permissions
3. Check available disk space in `/tmp`
4. Try converting manually to debug

### File size too large

OGG Opus is already very efficient, but you can:

1. Reduce bitrate: Edit `send-media.js` and change `-b:a 64k` to `-b:a 32k`
2. Use mono audio: Add `-ac 1` to ffmpeg command
3. Trim the audio before sending

## 📚 References

- [WhatsApp Business API - Voice Messages](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#voice-messages)
- [Opus Codec](https://opus-codec.org/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

## 💡 Pro Tips

1. **Always use OGG Opus** for voice notes
2. **Let the script auto-convert** - it's optimized for WhatsApp
3. **Keep ffmpeg installed** for best experience
4. **Test on mobile** before sending to important channels
5. **Original files are preserved** - conversion uses temp files

## ✅ Current Status

Your setup is now configured for mobile-compatible audio:
- ✅ ffmpeg installed
- ✅ Auto-conversion enabled
- ✅ OGG Opus format supported
- ✅ Tested and working on mobile
