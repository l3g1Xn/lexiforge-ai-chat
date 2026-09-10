/**
 * On-device instruction pack for Lexi (the local helper).
 * This file is the "model card": voice, safety, and reply recipes.
 * It is bundled with the app so chat works with no network.
 */
export const LEXI_INSTRUCTION = `
You are Lexi, a calm reading and writing helper inside LexiForge.

VOICE
- Short sentences.
- One idea per line.
- Plain words.
- Never lecture about dyslexia.
- Never say the user is wrong for how they spell.
- Celebrate spotting a swap: "Yes — form / from. Nice catch."

SAFETY
- This is a practice tool and a reading helper.
- It does not diagnose or treat dyslexia.
- Never make medical claims.
- Keep names, numbers, URLs, and emails exactly.
- Never scramble one-word answers the user must copy.

CLEANING
- Fix look-alikes: b/d, p/q, n/u, m/w.
- Fix adjacent letter swaps: form/from.
- Fix short transpositions: the/teh.
- Fix function flips only when the sentence sense needs it: was/saw, on/no.
- If unsure, keep the original word.

REPLY SHAPE
- 2 to 4 short sentences.
- Under 70 words.
- If the user text is messy, first show a clean version of what they meant.
- Then help: a practice line, a meaning, or a next step.
- No markdown. No emoji.

INTENTS
- greet: say hello. Offer read, write, or practice.
- read: clean the pasted text. Give one meaning line.
- write: help spell or write a short line they can copy.
- practice: give two short practice sentences.
- word: give a one-line meaning for a asked word.
- hard: suggest a lower temperature. Do not raise it.
- thanks: short and warm.
- chat: stay helpful and short. Offer a practice line.

TEMPERATURE
- 0 Clean. Zero noise.
- 1-3 Easy. Few look-alikes.
- 4-6 Train. Short transpositions.
- 7-8 Hard. More pairs. Still readable.
- 9-10 Drill cards only. Do not noise long messages.
`.trim();

export const SIGN_MEANINGS: Record<string, string> = {
  "emergency exit": "This is a way out if there is danger.",
  "fire exit": "This is a way out if there is a fire.",
  "push": "Press the door to open it.",
  "pull": "Draw the door toward you.",
  "stop": "Do not go. Wait.",
  "caution": "Be careful here.",
  "warning": "There is a risk. Slow down and look.",
  "closed": "This is not open now.",
  "open": "You may go in.",
  "occupied": "Someone is using this room.",
  "vacant": "This room is free.",
  "restroom": "This is a toilet.",
  "bathroom": "This is a toilet.",
  "out of order": "This is broken. Do not use it.",
  "do not enter": "You must not go in.",
  "keep out": "You must not go in.",
  "authorized personnel only": "Only staff may go in.",
  "wet floor": "The floor is wet. Walk slowly.",
  "no parking": "Do not leave a car here.",
  "exit": "This is the way out.",
  "enter": "This is the way in.",
  "stairs": "Use the steps.",
  "elevator": "This box moves between floors.",
  "lift": "This box moves between floors.",
};

export const WORD_MEANINGS: Record<string, string> = {
  the: "A small word used before a name of something.",
  a: "A small word used before one thing.",
  and: "Joins two things together.",
  to: "Shows direction or purpose.",
  of: "Shows that something belongs or is part of a thing.",
  in: "Inside a place.",
  on: "Resting on top of something.",
  no: "Means not yes. A refusal.",
  yes: "Means you agree.",
  was: "Happened in the past.",
  saw: "Looked at something with your eyes.",
  form: "A paper you fill in.",
  from: "Shows where something starts.",
  dog: "An animal that people keep as a pet.",
  bed: "A place you sleep.",
  pan: "A dish you cook in.",
  big: "Large in size.",
  cup: "A small thing you drink from.",
  cow: "A farm animal that gives milk.",
  nine: "The number after eight.",
  please: "A polite word when you ask.",
  thank: "A word you use when someone helps you.",
  help: "To make a job easier for someone.",
  read: "To look at words and know what they say.",
  write: "To put words on paper or a screen.",
  word: "A unit of language with meaning.",
  sentence: "A group of words that makes a full thought.",
  letter: "One mark in the alphabet, like b or d.",
  sign: "A board with words that tells you something.",
  message: "Words sent from one person to another.",
  name: "What a person or place is called.",
  number: "A symbol that counts, like 3 or 42.",
  school: "A place where people learn.",
  work: "A job or task you do.",
  home: "The place where you live.",
  stop: "Do not go. Wait.",
  go: "Move from here to there.",
  wait: "Stay here for a short time.",
  left: "The side opposite right.",
  right: "The side opposite left.",
  open: "Not shut. You may go in.",
  close: "To shut something.",
  exit: "The way out.",
  enter: "The way in.",
  danger: "Something that can hurt you.",
  safe: "Not in danger.",
  slow: "Not fast. Take your time.",
  fast: "Moving quickly.",
  today: "This day.",
  tomorrow: "The day after today.",
  friend: "A person you like and trust.",
  people: "More than one person.",
  because: "Gives a reason.",
  there: "In that place.",
  their: "Belongs to them.",
  they: "Those people.",
  you: "The person I am talking to.",
  i: "The person who is speaking.",
  we: "You and I together.",
  need: "Must have.",
  want: "Would like to have.",
  can: "Is able to.",
  cannot: "Is not able to.",
};
