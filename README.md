# 🎅 Secret Santa

One static page (`index.html`) for the Magnusson (600 kr) and Söderwall (700 kr) families. Swedish UI.
Everyone types their name, enters their personal Christmas word, taps the gift box and sees who they buy for. Hosted on GitHub Pages.

## Each year

1. Edit `participants/magnusson_participants.txt` and `participants/soderwall_participants.txt` (one name per line).
2. Run the draw:
   ```bash
   node draw.mjs          # or: node draw.mjs 2027
   ```
   One random cycle per family: nobody draws themself, everyone gives and receives exactly one gift per family. People in both families give two gifts and never to the same person twice. The encrypted result is baked into `index.html`.
3. Open `links.txt` (git-ignored). Send each person THEIR Christmas word, or their personal link, privately (SMS/DM). Never in a group chat.
4. Commit and push. Enable Pages: Settings → Pages → Deploy from branch → `main` / root.

Re-running the draw replaces everything and invalidates all words and links, so don't do it after they've been sent.

## Privacy

Each person's assignment is encrypted (AES-256-GCM, key derived with PBKDF2 from their Christmas word) inside `index.html`. Without the word it can't be read, not even via view-source. The page only lists names (not who gives to whom).

The word is one short Christmas word, so it stops casual peeking but is not strong security: someone determined could crack it offline. Fine for a family game. Whoever runs `draw.mjs` holds everyone's words, so the organiser can technically peek; don't. `links.txt` is git-ignored: never commit it.

## Music

`jul.m4a` (iPhone-friendly, with `jul.mp3` as backup) plays when the page opens (browsers may wait for a first tap or key). It's "Holiday Weasel" by Kevin MacLeod (incompetech.com), licensed CC BY 4.0, credited in the page footer. Both files are the same song.

`families/` holds old draws for reference and is not used by the page.
