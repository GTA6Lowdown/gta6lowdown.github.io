# Daily article run: GTA 6 Lowdown website
Version v01, 26 Nov 2026. Change note: first version (Steph's decisions of 24 and 26 Nov).

Steph's decision (24 Nov): fully automatic. One new article a day, researched, fact-checked, written and published to gta6lowdown.github.io with no sign-off. Social posts are NOT part of this (Steph uses Postiz, 26 Nov). The quality bar is the same as the videos: thorough, checked, correct, well written, and linked to a relevant video and/or playlist.

## Setup (every run starts fresh)
1. Attach and clone two repos (shallow): `gta6lowdown/gta6lowdown.github.io` (push) and `ProjectPanic/Claude-Video-Editor` (push).
2. Read `channels/gta6-lowdown/STATE.md` in Claude-Video-Editor, then this file and `tools/articles/topics.md`.
3. Today's date decides everything time-sensitive. Search before stating anything about the present.

## Steps
1. **Pick the topic.** Take the first unused topic in `topics.md`, unless there is bigger GTA 6 news in the last 24 hours that no live article covers (check `guides.html` and `news.html`). Never repeat a live article; to cover the same subject again, update the old article instead and set `"updated"` in its META.
2. **Research (Gate A).** Primary sources first: Rockstar Newswire and support pages, Take-Two releases and SEC filings, store pages. Then major outlets (IGN, GameSpot, Kotaku, PC Gamer, GamesRadar, Eurogamer, VGC, Polygon, The Verge), then wikis for old games. Build a fact sheet in `tools/articles/records/<date>_<slug>_facts.md`: one row per fact, with the exact "source says" wording and URL.
3. **Write** the fragment `tools/articles/src/<NN>_<slug>.html` in the house template (copy the structure of an existing `src/` file: `<!--META {...} -->` with slug, title, desc, kicker, h1, meta and "date"; answer box; keys list; method note; `h2.q` question headings; optional myth box and table; CONFIRMED / NOT CONFIRMED stamps; related links; Sources list). 600 to 1,400 words. Plain, friendly English, short sentences, questions as headings so answers can be lifted by search and AI answers.
4. **Video.** Add the slug to `VIDEOS` in `build.py` with the most relevant channel video (real YouTube title, checked with YouTube oEmbed). The list of videos is on `videos.html`. If none fits, leave it out: the page gets the channel strip.
5. **Two independent checkers (Gate B).** Two general-purpose agents (Sonnet), each given only the fact sheet rows and URLs, each opening every source. Fix or cut every row either one fails.
6. **Article checker (Gate C).** One agent reads the finished fragment line by line against the sources.
7. **Changed lines (Gate D).** Log every change after Gates B and C. If over 10% of lines changed, or facts changed in more than three places, one more agent checks only the changed lines.
8. **Hard stop.** If any check fails and can't be fixed and re-checked, publish NOTHING. Add one task to Steph's To-Do (artifact `2ca5a35d-3461-4e60-b7df-c14776c65f72`, `db_write` to collection `tasks`, id `lowdown-<date>-<time>`, fields: title, channel "lowdown", due "", today false, done false, addedBy "daily article run", created ISO time, doneAt null) saying what failed. Then stop.
9. **Build and add to the site.** `python3 tools/articles/build.py src site`. Then:
   - `guides.html`: add an `acard` at the top of `.artgrid` (image from `img/`, chip, title, one line).
   - `index.html`: add the same card at the top of the Guides section's `.artgrid` and update the "All N guides" count. The home grid shows the newest first; keep the original four pillar guides in it.
   - G's Cache: append ONE new checked fact from today's article at the END of `FACTS` in `js/site.js`. Never edit or reorder old lines (it resets visitors' collections).
   - Latest video: if a newer channel video exists than the one on Home and Videos (check the channel's YouTube RSS feed), update both "latest" blocks and add its card on `videos.html`.
10. **Check before publishing.** Every page parses (Python HTMLParser), `node` parses `js/site.js`, internal links resolve, a headless Chrome screenshot of the new page looks right.
11. **Publish.** Commit to `main` ("Daily article: <title>") and push. Wait for GitHub Pages, then open the live page to confirm it loads.
12. **Record (Gate E).** Write `tools/articles/records/<date>_<slug>.md`: facts checked, sources opened, what each checker caught, changed lines, anything unresolved. Mark the topic done in `topics.md` (date + slug).
13. **Hand-off.** Update the website line in `channels/gta6-lowdown/STATE.md` (30 lines max) and the Lowdown line in STATUS.md in Claude-Video-Editor. Push.

## Standing rules (from the channel)
- Never say or imply Steph hasn't played GTA 6.
- No leak or 2022 hack material. No shipping, fan-pairing or fanfiction content.
- Quotes under 15 words, one per source, in quotation marks. Everything else in our own words.
- Unofficial fan site: never imitate Rockstar's branding or imply the site is official.
- No images of real people. Use images already in `img/` (Rockstar's official art, credited in the footer).
- Never install, download (beyond the two repos), delete or spend credits.
- If a rule isn't written here or in the repo, don't guess: hard-stop and add a To-Do task asking Steph.
