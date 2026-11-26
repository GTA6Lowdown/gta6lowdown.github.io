"""Wrap article fragments in the GTA 6 Lowdown article template.
Usage: python3 build.py src site   (reads src/*.html, writes ../../articles/<slug>.html)
       python3 build.py src v01    (writes out/website_article_<slug>_v01.html for checking)
Each fragment starts with an HTML comment holding JSON meta:
<!--META {"slug":..., "title":..., "h1":..., "desc":..., "kicker":..., "meta":...} -->
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).parent
import sys
SRC = sys.argv[1] if len(sys.argv)>1 else "src"
VER = sys.argv[2] if len(sys.argv)>2 else "v01"
SITE = "https://gta6lowdown.github.io"
DATE = "2026-11-22"

CSS = (ROOT / "style.css").read_text()

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | GTA 6 Lowdown</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{site}/articles/{slug}.html">
<meta name="theme-color" content="#3e2113">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;600;700&family=Caveat:wght@600&family=Permanent+Marker&display=swap">
<script type="application/ld+json">
{schema}
</script>
<style>
{css}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="wrap nav">
    <a class="brand" href="../index.html"><img src="../img/logo.png" alt="" onerror="this.remove()"><span>GTA 6 <b>LOWDOWN</b></span></a>
    <button class="navtoggle" type="button" aria-expanded="false" aria-controls="navlist">MENU</button>
    <ul id="navlist">
      <li><a href="../index.html">Home</a></li>
      <li><a href="../news.html">News</a></li>
      <li><a href="../tips.html">Tips</a></li>
      <li><a href="../guides.html" aria-current="page">Guides</a></li>
      <li><a href="../leonida.html">Leonida</a></li>
      <li><a href="../games.html">Games</a></li>
      <li><a href="../cheats.html">Cheats</a></li>
      <li><a href="../old-games.html">Old games</a></li>
      <li><a href="../videos.html">Videos</a></li>
    </ul>
  </div>
</header>
<main id="main">
<section class="hero">
  <div class="wrap">
    <p class="kicker">{kicker}</p>
    <h1>{h1}</h1>
    <p class="meta"><span>GUIDE</span>By GTA 6 Lowdown &middot; {meta}</p>
  </div>
</section>
<div class="wrap"><div class="read">
{body}
</div></div>
</main>
<footer>
  <div class="wrap">
    <img src="../img/logo.png" alt="GTA 6 Lowdown" style="width:56px">
    <p><b style="color:#fefefb">GTA 6 Lowdown</b>. Get the lowdown.</p>
    <p>Unofficial fan site. Not affiliated with, endorsed by or connected to Rockstar Games or Take-Two Interactive. Rockstar Games, Grand Theft Auto, GTA and their logos are trademarks of Take-Two Interactive Software. Written in our own words, with sources linked.</p>
  </div>
</footer>
<script>
(function(){{
  var tg=document.querySelector('.navtoggle'),nl=document.getElementById('navlist');
  if(!tg||!nl)return;
  tg.addEventListener('click',function(){{var o=nl.classList.toggle('open');tg.setAttribute('aria-expanded',o)}});
  nl.addEventListener('click',function(e){{if(e.target.tagName==='A'){{nl.classList.remove('open');tg.setAttribute('aria-expanded','false')}}}});
}})();
</script>
</body>
</html>
"""


HABITS=("28PWSG1GZi4","Why Old GTA 5 Tactics Are Useless Against GTA 6 Cops","Police, Heat, guns and the Criminal Profile.")
CONF=("b5Z45qWy9F4","What Is ACTUALLY Confirmed for GTA 6? (Release Date & More)","Confirmed vs rumour, sorted.")
VIDEOS={
 "gta-6-police-heat-wanted":HABITS,"gta-6-vs-gta-5":HABITS,"gta-6-beginner-tips":HABITS,"gta-6-missing-features":HABITS,"gta-6-online":CONF,"gta-6-pc":CONF,
 "gta-vice-city-before-gta-6":("TmYNJhDSpDM","No GTA 6 Yet? Let's Visit Vice City | Mission 1: In the Beginning (Playthrough #1)","Episode 1: Tommy lands in Vice City and the deal goes wrong."),
 "gta-timeline-story-order":("7PDU2oVunqg","Trevor Almost DIDN'T EXIST! The Real Backstory of GTA 5 Michael, Franklin, Trevor","GTA 5's three leads, as one story."),
}
from html import escape as html_escape
def video_block(slug):
    v=VIDEOS.get(slug)
    if not v:
        return ('<a class="vstrip" href="https://www.youtube.com/@GTA6Lowdown">'
                '<span class="vstrip-tag">&#9654; ON YOUTUBE</span>'
                '<span>More GTA 6 explained in our videos. <b>Watch GTA 6 Lowdown</b></span></a>')
    vid,t,line=v
    return f"""<figure class="vcard" data-id="{vid}">
  <a class="vthumb" href="https://youtu.be/{vid}" aria-label="Play video: {html_escape(t)}">
    <img src="https://i.ytimg.com/vi/{vid}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">
    <span class="vplay" aria-hidden="true">&#9654;</span>
  </a>
  <figcaption><span class="vtag">WATCH THE VIDEO</span><b>{html_escape(t)}</b><span>{line}</span>
    <a class="vbtn" href="https://youtu.be/{vid}">Watch on YouTube</a></figcaption>
</figure>"""
VSCRIPT="""<script>
document.querySelectorAll('.vcard .vthumb').forEach(function(a){a.addEventListener('click',function(e){
 e.preventDefault();var id=a.parentNode.getAttribute('data-id');var f=document.createElement('iframe');
 f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';f.title=a.getAttribute('aria-label');
 f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;a.replaceWith(f);});});
</script>"""

def build():
    out = ROOT / "out"
    out.mkdir(exist_ok=True)
    for f in sorted((ROOT / SRC).glob("*.html")):
        text = f.read_text()
        m = re.match(r"\s*<!--META\s*(\{.*?\})\s*-->", text, re.S)
        meta = json.loads(m.group(1))
        body = text[m.end():].strip()
        schema = json.dumps({
            "@context": "https://schema.org", "@type": "Article",
            "headline": meta["h1"], "description": meta["desc"],
            "datePublished": meta.get("date",DATE), "dateModified": meta.get("updated",meta.get("date",DATE)),
            "author": {"@type": "Organization", "name": "GTA 6 Lowdown"},
            "publisher": {"@type": "Organization", "name": "GTA 6 Lowdown",
                          "logo": {"@type": "ImageObject", "url": SITE + "/img/logo.png"}},
            "mainEntityOfPage": f"{SITE}/articles/{meta['slug']}.html"}, ensure_ascii=False)
        i=body.find("</ul>", body.find('<ul class="keys">'))+5
        body=body[:i]+"\n\n"+video_block(meta["slug"])+body[i:]
        if "<!--VIDEO2-->" in body:
            VIDEOS["_v2"]=("8O5kddk_BcY","No GTA 6 Yet? Let's Visit Vice City | Missions 2-3: An Old Friend + The Party (Playthrough #2)","Episode 2: Ken Rosenberg, a new suit and Cortez's yacht party.")
            body=body.replace("<!--VIDEO2-->",video_block("_v2"))
        if meta["slug"] in VIDEOS: body+= "\n"+VSCRIPT
        html = PAGE.format(site=SITE, schema=schema, css=CSS, body=body, **{k: meta[k] for k in ("slug","title","desc","kicker","h1","meta")})
        if VER == "site":
            (ROOT.parent.parent / "articles" / f"{meta['slug']}.html").write_text(html)
        else:
            (out / f"website_article_{meta['slug']}_{VER}.html").write_text(html)
        words = len(re.sub(r"<[^>]+>", " ", body).split())
        print(f"{meta['slug']}: {words} words")

if __name__ == "__main__":
    build()
