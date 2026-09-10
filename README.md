# LexiForge

On-device reading helper and letter trainer. Not a diagnosis. Not a treatment.

LexiForge cleans messy text, talks in short lines, and runs look-alike drills. Cleaning, chat, and drills use a bundled on-device pack (~20,000-word lexicon, ~25,000 misspellings, instruction card). No cloud model.

## Download (Android)

Sideload APK from **[Releases](https://github.com/l3g1Xn/lexiforge-ai-chat/releases)**.

Package `app.lexiforge.alpha`. Signed for sideload (not Play Store). If Play Protect says uncommon: More details → Install anyway.

iOS IPA is not included. That needs a Mac, Xcode, and an Apple Developer account.

## What it does

- **Help me read this** — paste a sign or message. Get a clean version, a spoken read-aloud, and a one-line meaning.
- **Talk / write with me** — short chat on the device. A few words may be marked at your Temperature. Tap to see the clean spelling.
- **2-minute drill** — look-alike and letter-order cards.
- **Temperature 0–10** — Clean / Easy / Train / Hard / Drill. Stored on the device.

## Copy you can share

> This is a practice tool and a reading helper. It does not diagnose or treat dyslexia. You control how hard it is. Use Clean mode whenever you need the real words.

## Build the APK

GitHub Actions (this repo) builds and publishes the APK:

- Push a `v*` tag, or
- Actions → **Publish Android APK** → Run workflow

Local (needs Android SDK):

```bash
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
cd android && gradle assembleRelease
```
