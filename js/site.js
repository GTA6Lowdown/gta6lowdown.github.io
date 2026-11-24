(function(){
  var $=function(s){return document.querySelector(s)};
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  function toast(t){var el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){el.hidden=true},2600)}

  // nav toggle
  var tg=$('.navtoggle'),nl=$('#navlist');
  tg.addEventListener('click',function(){var o=nl.classList.toggle('open');tg.setAttribute('aria-expanded',o)});
  nl.addEventListener('click',function(e){if(e.target.tagName==='A'){nl.classList.remove('open');tg.setAttribute('aria-expanded','false')}});

  // time since launch: midnight local, 19 Nov 2026
  var target=new Date(2026,10,19,0,0,0);
  function pad(n){return n<10?'0'+n:''+n}
  function tick(){
    var ms=new Date()-target;if(ms<0)ms=0;
    var s=Math.floor(ms/1000),dd=Math.floor(s/86400);
    $('#cd-d').textContent=dd;$('#cd-dl').textContent=dd===1?'day':'days';
    $('#cd-h').textContent=pad(Math.floor(s%86400/3600));
    $('#cd-m').textContent=pad(Math.floor(s%3600/60));$('#cd-s').textContent=pad(s%60);
    setTimeout(tick,1000);
  }
  if($('#cd'))tick();

  // video filters
  var fbtns=document.querySelectorAll('.filters button');
  fbtns.forEach(function(b){b.addEventListener('click',function(){
    fbtns.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    var f=b.dataset.f;
    document.querySelectorAll('#vgrid .vcard').forEach(function(c){c.hidden=!(f==='all'||c.dataset.cat===f)});
  })});

  // wanted stars: visit sections
  var STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,2 15,9 22,9.5 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9.5 9,9" fill="F" stroke="#fefefb" stroke-width="1.5"/></svg>';
  var seen={};try{seen=JSON.parse(store('lowdown-seen')||'{}')}catch(e){}
  var PAGES=['home','news','tips','guides','leonida','games','cheats','old-games','videos'];
  var page=document.body.getAttribute('data-page')||'home';
  function stars(){
    var got=Object.keys(seen).filter(function(k){return PAGES.indexOf(k)>=0}).length;
    var n=Math.min(5,Math.floor(got*5/PAGES.length));
    var h='';for(var i=0;i<5;i++)h+=STAR.replace('F',i<n?'#ef9706':'none');
    $('#stars').innerHTML=h;if($('#herostars'))$('#herostars').innerHTML=h;$('#stars').setAttribute('aria-label','Wanted level: '+n+' of 5 stars');
    if($('#starmsg'))$('#starmsg').textContent=n>=5?'Five stars. You\'ve seen everything.':'Stars so far: '+n+' of 5. Pages visited: '+got+' of '+PAGES.length;
    return n;
  }
  var last=stars();
  if(!seen[page]){seen[page]=1;store('lowdown-seen',JSON.stringify(seen));var nn=stars();if(nn>last){setTimeout(function(){toast(nn>=5?'5 stars! Most wanted.':'Wanted level up: '+nn+' stars')},600)}last=nn}

  // quiz
  var Q=[
    ['GTA 6 comes out on 19 November 2026.',true,'Confirmed by Rockstar: midnight local time on PS5 and Xbox Series X|S.'],
    ['GTA 6 is out on PC on launch day.',false,'No PC version has been announced. An early-2027 date is still a rumor.'],
    ['The game needs up to 212GB of space.',true,'From Rockstar\'s preload information.'],
    ['Lucia was released from prison on parole.',false,'Rockstar\'s profile says luck got her out, not parole.'],
    ['Justice wrote the GTA 6 score.',true,'Confirmed. The score album, Grand Theft Auto VI: Original Score, comes out on 11 December 2026.'],
    ['Daft Punk confirmed they turned GTA 6 down.',false,'That story comes from one X post, and it never actually says no.'],
    ['You can listen to the radio on foot.',true,'Rockstar says radio plays through headphones on Jason\'s or Lucia\'s phone.'],
    ['GTA 6 Online is confirmed for launch day.',false,'Rockstar hasn\'t said. Still a rumor.']
  ];
  var qi=0,score=0,order=[];
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
  function ask(){
    var qa=$('#qa');$('#qf').textContent='';
    if(qi>=order.length){$('#qq').textContent='You got '+score+' out of '+order.length+'.';$('#qf').textContent=score===order.length?'Perfect. You really do have the lowdown.':'Watch video #1 to brush up on what\'s real.';qa.innerHTML='<button class="btn orange" type="button" id="qstart">PLAY AGAIN</button>';$('#qstart').onclick=start;return}
    var q=Q[order[qi]];$('#qq').textContent='"'+q[0]+'"';
    qa.innerHTML='<button class="btn teal" type="button" data-a="1">CONFIRMED</button><button class="btn orange" type="button" data-a="0">RUMOR</button>';
    qa.querySelectorAll('button').forEach(function(b){b.onclick=function(){
      var right=(b.dataset.a==='1')===q[1];if(right)score++;
      $('#qf').textContent=(right?'Correct! ':'Nope. ')+q[2];
      $('#qs').textContent='Score: '+score+' / '+(qi+1);
      qa.innerHTML='<button class="btn paper" type="button" id="qnext">NEXT</button>';$('#qnext').onclick=function(){qi++;ask()};$('#qnext').focus();
    }});
  }
  function start(){order=shuffle(Q.map(function(_,i){return i}));qi=0;score=0;$('#qs').textContent='';ask()}
  if($('#qstart'))$('#qstart').onclick=start;

  // which lead quiz
  var LQ=[
    ['The job goes wrong. You...',['Talk your way out','Fight your way out']],
    ['Pick a ride for the getaway.',['Something fast and loud','Something nobody will notice']],
    ['Your perfect night in Vice City?',['A quiet drive along the coast','The busiest club in town']],
    ['What matters most?',['Family, always','Freedom, whatever it takes']]
  ];
  var LW=[[ 'J','L'],['L','J'],['J','L'],['L','J']];
  var li=0,tally={J:0,L:0};
  function lask(){
    var la=$('#la');
    if(li>=LQ.length){var r=tally.L>tally.J?'L':(tally.J>tally.L?'J':(Math.random()<.5?'J':'L'));
      $('#lq').textContent=r==='L'?"You're a Lucia.":"You're a Jason.";
      $('#lf').textContent=r==='L'?'Bold, loyal to your people, and nobody\'s fool.':'Cool head, quick hands, and always one step ahead.';
      la.innerHTML='<button class="btn orange" type="button" id="lstart">PLAY AGAIN</button>';$('#lstart').onclick=lstart;return}
    $('#lq').textContent=LQ[li][0];$('#lf').textContent='Question '+(li+1)+' of '+LQ.length;
    la.innerHTML=LQ[li][1].map(function(a,k){return '<button class="btn '+(k?'teal':'paper')+'" type="button" data-k="'+k+'">'+a+'</button>'}).join('');
    la.querySelectorAll('button').forEach(function(b){b.onclick=function(){tally[LW[li][+b.dataset.k]]++;li++;lask()}});
  }
  function lstart(){li=0;tally={J:0,L:0};lask()}
  if($('#lstart'))$('#lstart').onclick=lstart;

  // copy cheat numbers
  document.querySelectorAll('.copy').forEach(function(b){b.addEventListener('click',function(){
    var t=b.dataset.c;
    try{navigator.clipboard.writeText(t).then(function(){toast('Copied '+t)},function(){toast('Dial '+t)})}catch(e){toast('Dial '+t)}
  })});

  // fact mug
  var F=['GTA 6 is set in the state of Leonida, home to Vice City.','Preload for GTA 6 opened on 10 November 2026.','There\'s a free digital map of Leonida on launch day.','Six GTA 6 radio stations were confirmed before launch.','The Launch Trailer song is "Flower in a Hurricane" by Justice.','Grand Theft Auto VI: The Album has 34 original tracks.','In GTA 6, Rockstar says police track your outfit and your car.','GTA 6 has a Criminal Profile that remembers how you play.'];
  var fi=-1;if($('#mug'))$('#mug').addEventListener('click',function(){var n;do{n=Math.floor(Math.random()*F.length)}while(n===fi&&F.length>1);fi=n;$('#fact').textContent=F[n]});

  // lamp theme
  var lamp=$('#lamp');
  function setTheme(t){document.documentElement.setAttribute('data-theme',t);if(lamp){lamp.setAttribute('aria-pressed',t==='dark');lamp.textContent=t==='dark'?'Lamp on':'Lamp off'}store('lowdown-theme',t)}
  if(store('lowdown-theme')==='dark')setTheme('dark');
  if(lamp)lamp.addEventListener('click',function(){setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark')});

  // cheat code
  var buf='';document.addEventListener('keydown',function(e){
    if(e.target.closest&&e.target.closest('input,textarea'))return;
    if(!e.key||e.key.length!==1)return;
    buf=(buf+e.key.toUpperCase()).slice(-7);
    if(buf==='LOWDOWN'){PAGES.forEach(function(p){seen[p]=1});store('lowdown-seen',JSON.stringify(seen));last=stars();toast('CHEAT ACTIVATED: max wanted level');buf=''}
  });

  // fun stuff side column
  var rail=$('#funrail'),rtab=$('.railtab'),rclose=$('.railclose');
  function railSet(o){rail.classList.toggle('open',o);rtab.setAttribute('aria-expanded',o)}
  if(rail){rtab.addEventListener('click',function(){railSet(!rail.classList.contains('open'))});rclose.addEventListener('click',function(){railSet(false)})}

  // G's Cache: one hidden stash a day, somewhere on the site
  var GC_PAGES={home:'Home',news:'News',tips:'Tips',guides:'Guides',leonida:'Leonida','games':'Games',cheats:'Cheats','old-games':'Old games',videos:'Videos'};
  var GC_URL={home:'index.html',news:'news.html',tips:'tips.html',guides:'guides.html',leonida:'leonida.html',games:'games.html',cheats:'cheats.html','old-games':'old-games.html',videos:'videos.html'};
  var FACTS=[
    'GTA 6 was first revealed with Trailer 1 on 4 December 2023, set to Tom Petty\'s "Love Is a Long Road".',
    'Trailer 2 arrived on 6 May 2025, with The Pointer Sisters\' "Hot Together".',
    'The Launch Trailer song is "Flower in a Hurricane" by Justice, with Tame Impala, SZA and King Gizzard & The Lizard Wizard.',
    'GTA 6\'s "An Extended Look", about 26 minutes long, premiered on Netflix before it reached YouTube.',
    'Rockstar has named six regions of Leonida: Vice City, the Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia and Mount Kalaga.',
    'Rockstar North\'s Aaron Garbut told Game Informer the map is about twice the size of GTA V\'s.',
    'Flash FM is back in GTA 6. The station first appeared in GTA: Vice City in 2002.',
    'GTA 6 is the first game in the series with on-demand podcasts, and you can listen on foot through headphones.',
    'Grand Theft Auto VI: The Album has 34 original tracks, released with Atlantic Records.',
    'Justice wrote GTA 6\'s score. The score album comes out on 11 December 2026.',
    'The Chamber 106.6 is GTA 6\'s metal station. Press reports say its hosts are Slayer\'s Kerry King and Tom Araya.',
    'The Vintage Vice City Pack\'s weapon pattern is based on Tommy Vercetti\'s famous shirt.',
    'Physical copies of GTA 6 are a download code in a box. There\'s no disc.',
    'On 18 November 2026, the night before launch, the Miami Heat take on the Milwaukee Bucks as "Vice City".',
    'Rockstar and PlayStation are throwing a GTA 6 festival at Mana Wynwood in Miami on 21 November 2026.',
    'Rockstar says GTA 6 targets 30 frames per second, and the PS5 Pro adds ray-traced shadows.'
  ];
  function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  var d=new Date(),today=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  var y=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1),yesterday=y.getFullYear()+'-'+pad(y.getMonth()+1)+'-'+pad(y.getDate());
  var seed=hash('gscache'+today),keys=Object.keys(GC_PAGES),gcPage=keys[seed%keys.length];
  var gc={total:0,finds:0,streak:0,last:'',items:[]};try{var g=JSON.parse(store('lowdown-gcache')||'null');if(g)gc=g}catch(e){}
  function money(n){return '$'+n.toLocaleString('en-GB')}
  function gcRender(){
    var st=$('#gcStatus');if(!st)return;
    var found=gc.last===today;
    st.textContent=found?'Found today':'Out there somewhere';
    $('#gcTotal').textContent=gc.items.length+' of '+FACTS.length;
    $('#gcMeta').textContent=gc.finds+(gc.finds===1?' cache':' caches')+' found, '+gc.streak+'-day streak';
    $('#gcHint').textContent=found?'Collected. A new cache drops tomorrow.':'It\'s hidden somewhere on this site today, and it\'s invisible until your cursor finds it.';
    var ul=$('#gcItems');ul.innerHTML='';gc.items.slice(-5).reverse().forEach(function(it){var li=document.createElement('li');li.textContent=it;ul.appendChild(li)});
  }
  var gcWarm='',gcSpot=null,gcWarmText='';
  if(gc.last!==today&&page===gcPage){
    var spots=[].slice.call(document.querySelectorAll('main section h3, main section p:not(.credit):not(.kicker)')).filter(function(el){return el.offsetParent!==null&&!el.closest('.reels,a,button,.answers')});
    if(spots.length){
      gcSpot=spots[hash('spot'+today)%spots.length];
      var b=document.createElement('button');b.type='button';b.className='gcache';b.setAttribute('aria-label','G\'s Cache: a hidden stash. Click to collect it.');
      b.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="14" width="30" height="19" rx="5" fill="#176767"/><path d="M14 14v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#3e2113" stroke-width="3"/><rect x="5" y="20" width="30" height="3" fill="#e28202"/><circle cx="20" cy="21.5" r="2.5" fill="#fbe98c"/></svg>';
      gcSpot.appendChild(b);
      var sec=gcSpot.closest('section'),hh=sec&&sec.querySelector('h2');gcWarmText=hh?hh.textContent.trim().replace(/\s+/g,' '):'the middle of the page';
      b.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        if(gc.last===today)return;
        gc.streak=(gc.last===yesterday)?gc.streak+1:1;
        if(!Array.isArray(gc.items)||gc.items.some(function(x){return FACTS.indexOf(x)<0}))gc.items=[];
        var left=FACTS.filter(function(f){return gc.items.indexOf(f)<0});if(!left.length){gc.items=[];left=FACTS.slice()}
        var fact=left[hash('fact'+today)%left.length];
        gc.finds+=1;gc.last=today;gc.items.push(fact);
        store('lowdown-gcache',JSON.stringify(gc));b.remove();
        var m=$('#gcFound');m.querySelector('.amt').textContent=fact;
        m.querySelector('.gcitem').textContent='Fact '+gc.items.length+' of '+FACTS.length+' collected'+(gc.streak>1?'. '+gc.streak+'-day streak!':'.');
        m.hidden=false;m.querySelector('button').focus();gcRender();
      });
    }
  }
  if($('#gcFound'))$('#gcFound').querySelector('button').addEventListener('click',function(){$('#gcFound').hidden=true});
  gcRender();
})();
