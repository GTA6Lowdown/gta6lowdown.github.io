"""Checks whether GTA 6 Lowdown is live on YouTube and writes data/live.json.
Run by .github/workflows/live.yml every 10 minutes. No API key needed.
If YouTube can't be read, the file is left as it is."""
import json, re, sys, urllib.request, pathlib, datetime
CH = "UCrcIppvdeyvGuCPxX0UR1QQ"  # GTA 6 Lowdown
OUT = pathlib.Path("data/live.json")
HDR = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
       "Accept-Language": "en-US,en;q=0.9", "Cookie": "CONSENT=YES+cb; SOCS=CAI"}
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=HDR), timeout=30).read().decode("utf-8", "replace")
def title_of(vid):
    try:
        return json.loads(get(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"))["title"]
    except Exception:
        return ""
old = json.loads(OUT.read_text()) if OUT.exists() else {}
new = dict(old)
try:
    page = get(f"https://www.youtube.com/channel/{CH}/live")
    m = re.search(r'<link rel="canonical" href="https://www\.youtube\.com/watch\?v=([\w-]{11})"', page)
    if m and '"isLiveNow":true' in page:
        new.update(live=True, id=m.group(1))
    else:
        streams = get(f"https://www.youtube.com/channel/{CH}/streams")
        ids = re.findall(r'"videoId":"([\w-]{11})"', streams)
        new["live"] = False
        # first video on the Live tab that has finished (skip upcoming ones)
        for vid in dict.fromkeys(ids):
            if f'"videoId":"{vid}"' in streams and "upcomingEventData" not in streams.split(f'"videoId":"{vid}"', 1)[1][:3000]:
                new["id"] = vid
                break
    t = title_of(new.get("id", ""))
    if t:
        new["title"] = t
except Exception as e:
    print("could not read YouTube:", e)
    sys.exit(0)
changed = {k: new.get(k) for k in ("live", "id", "title")} != {k: old.get(k) for k in ("live", "id", "title")}
if changed:
    new["checked"] = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    OUT.write_text(json.dumps(new, ensure_ascii=False) + "\n")
print("changed" if changed else "no change", new)
