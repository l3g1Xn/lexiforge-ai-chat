# LexiForge

On-device reading helper and letter trainer. Not a diagnosis. Not a treatment.

LexiForge cleans messy text, talks in short lines, and runs look-alike drills. It does **not** call a cloud model. Cleaning, chat, and drills use a bundled on-device pack:

| Pack | Size |
| --- | --- |
| Lexicon | ~20,000 words |
| Misspelling map | ~25,000 entries |
| Instruction card | voice, safety, reply recipes |
| Sign / word meanings | common signs and short definitions |

## What it does

- **Help me read this** — paste a sign or message. Get a clean version, a spoken read-aloud, and a one-line meaning.
- **Talk / write with me** — short chat on the device. A few words may be marked at your Temperature. Tap to see the clean spelling.
- **2-minute drill** — look-alike and letter-order cards.
- **Temperature 0–10** — Clean / Easy / Train / Hard / Drill. Stored on the device.

## Copy you can share

> This is a practice tool and a reading helper. It does not diagnose or treat dyslexia. You control how hard it is. Use Clean mode whenever you need the real words.

## Android and iOS store installers

This repository does **not** contain a signed Play Store APK or App Store IPA.

Those binaries need:

- Android: Android Studio, the Android SDK, and a keystore on a local machine
- iOS: a Mac, Xcode, and an Apple Developer account

This builder runs on Linux without those SDKs, so it cannot produce signed installers. The working product here is the on-device app source (lexicon, misspellings, instruction pack, screens).
