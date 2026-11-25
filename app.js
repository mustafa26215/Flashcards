const $=s=>document.querySelector(s),KEY='lexi.v2',app=$('#app');
const POS=['Noun','Verb','Adjective','Adverb','Pronoun','Preposition','Conjunction','Interjection','Article','Determiner','Auxiliary Verb','Modal Verb','Numeral','Particle','Infinitive Marker','Gerund','Participle'],LV=['Beginner','Intermediate','Advanced'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const cleanWords=a=>Array.isArray(a)?a.filter(x=>x&&typeof x.w==='string'&&x.w.trim()&&typeof x.def==='string'&&POS.includes(x.pos)&&LV.includes(x.lvl)).map(x=>({id:typeof x.id==='string'&&x.id?x.id:uid(),w:x.w.trim(),pos:x.pos,lvl:x.lvl,def:x.def,ar:typeof x.ar==='string'?x.ar:'',ex:typeof x.ex==='string'?x.ex:'',fav:!!x.fav,st:['learning','known'].includes(x.st)?x.st:'new',rv:+x.rv||0,nd:+x.nd||0})):[];
const dedupe=a=>{const n=new Set,i=new Set;return a.filter(x=>{const k=x.w.toLowerCase();if(n.has(k))return false;n.add(k);if(i.has(x.id))x.id=uid();i.add(x.id);return true})};
const cleanDays=d=>{const r={};if(d&&typeof d==='object'&&!Array.isArray(d))for(const k in d)if(/^\d{4}-\d{2}-\d{2}$/.test(k)&&Number.isInteger(d[k])&&d[k]>=0)r[k]=d[k];return r};
const Q=[['It does not matter how slowly you go as long as you do not stop.','Confucius'],['The limits of my language mean the limits of my world.','Ludwig Wittgenstein'],['A journey of a thousand miles begins with a single step.','Lao Tzu'],['Success is the sum of small efforts, repeated day in and day out.','Robert Collier'],['Little by little, one travels far.','J.R.R. Tolkien'],['Well begun is half done.','Aristotle'],['Fall seven times, stand up eight.','Japanese proverb'],['You cannot cross the sea merely by standing and staring at the water.','Rabindranath Tagore'],['Learning never exhausts the mind.','Leonardo da Vinci']];
let S=load();
function load(){let o={};try{o=JSON.parse(localStorage.getItem(KEY))||JSON.parse(localStorage.getItem('lexi.v1'))||{}}catch(e){}
 const s={words:[],goal:10,days:{},theme:'',accent:'en-US',sessions:0,shuffle:false,lastExport:''};
 if(o&&typeof o==='object'){s.words=dedupe(cleanWords(o.words));s.shuffle=o.shuffle===true;if(typeof o.lastExport==='string')s.lastExport=o.lastExport;
 if([5,10,15,20].includes(o.goal))s.goal=o.goal;if(o.days&&typeof o.days==='object')s.days=o.days;if(['dark','light'].includes(o.theme))s.theme=o.theme;if(o.accent==='en-GB')s.accent='en-GB';if(Number.isInteger(o.sessions))s.sessions=o.sessions}return s}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Could not save. Browser storage may be full or blocked.')}};
const key=d=>d.toLocaleDateString('en-CA'),today=()=>key(new Date()),cnt=k=>+S.days[k]||0;
function streak(){let d=new Date(),n=0;if(!cnt(key(d)))d.setDate(d.getDate()-1);while(cnt(key(d))){n++;d.setDate(d.getDate()-1)}return n}
function toast(t){const e=$('#toast');e.textContent=t;e.className='s';clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',2200)}
const known=()=>S.words.filter(x=>x.st==='known').length,learning=()=>S.words.filter(x=>x.st==='learning').length;
function act(){const t=today();S.days[t]=cnt(t)+1}
function mark(id,st){const x=S.words.find(w=>w.id===id);if(!x)return;x.st=st;act();save()}
function theme(t){const dark=t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';document.querySelector('meta[name=theme-color]').content=dark?'#0e1514':'#0f766e'}
$('#theme').onclick=()=>{S.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';theme(S.theme);save()};
$('#accent').value=S.accent;$('#accent').onchange=e=>{S.accent=e.target.value;save()};theme(S.theme);
let voices=[];const lv=()=>voices=speechSynthesis.getVoices();if('speechSynthesis' in window){lv();speechSynthesis.onvoiceschanged=lv}
function speak(w,btn){if(!('speechSynthesis' in window))return toast('Speech is not supported in this browser.');speechSynthesis.cancel();document.querySelectorAll('.sp.on').forEach(b=>b.classList.remove('on'));
 const u=new SpeechSynthesisUtterance(w);u.lang=S.accent;const c=voices.filter(v=>v.lang.replace('_','-')===S.accent);
 const v=c.find(v=>/natural|premium|enhanced|google|samantha|daniel|serena/i.test(v.name))||c[0]||voices.find(v=>v.lang.startsWith('en'));if(v)u.voice=v;else if(!voices.length)toast('No English voice found on this device.');
 u.onstart=()=>btn&&btn.classList.add('on');u.onend=u.onerror=()=>btn&&btn.classList.remove('on');speechSynthesis.speak(u)}
document.addEventListener('click',e=>{const b=e.target.closest('.sp');if(b){e.stopPropagation();speak(b.dataset.w,b)}},true);
const spk=w=>`<button class="ic sp" data-w="${esc(w)}" aria-label="Pronounce ${esc(w)}">🔊</button>`,lc=l=>'l'+(LV.indexOf(l)+1);
const addBtn=t=>`<button class="btn" data-add>${t}</button>`;
const SEL=new Set();let IMP=null,lastQ=-1;let L={deck:[],i:0,f:false,m:'learn'},F={c:'all',pos:'',q:''};
const V={
home(){let i;do i=Math.floor(Math.random()*Q.length);while(i===lastQ);lastQ=i;
 app.innerHTML=`<div class="card empty" style="margin-top:40px"><h1>Welcome back!</h1><p class="mu" style="max-width:480px;margin:18px auto 24px"><em>“${esc(Q[i][0])}”</em><br>— ${esc(Q[i][1])}</p><a class="btn" href="#learn">Start Learning</a></div>`},
learn(){sess('learn')},
practice(){sess('practice')},
words(){app.innerHTML=`<div class="head"><div><h1>Words</h1><p class="mu" id="cnt"></p></div>${addBtn('Add a word')}</div><div id="formbox"></div>
 <div class="row"><div class="chips" id="chips"></div></div><div class="row"><select id="pos" style="max-width:240px" aria-label="Part of speech"><option value="">All parts of speech</option>${POS.map(x=>`<option>${x}</option>`).join('')}</select><input type="search" id="q" placeholder="Search words" style="max-width:260px" aria-label="Search words"></div><div id="bulk"></div><div id="list"></div>`;
 $('#pos').value=F.pos;$('#q').value=F.q;$('#pos').onchange=e=>{F.pos=e.target.value;list()};$('#q').oninput=e=>{F.q=e.target.value;list()};list()},
settings(){app.innerHTML=`<h1>Settings</h1><p class="mu">Your data lives in this browser. Nothing is sent anywhere.</p>
 <div class="card" style="margin:18px 0"><h2>Export vocabulary</h2><p class="mu">Download your words, review progress, and daily activity as a JSON backup file. Last export: ${S.lastExport?esc(new Date(S.lastExport).toLocaleString()):'never'}.</p><button class="btn" id="ex">Export JSON</button></div>
 <div class="card"><h2>Import vocabulary</h2><p class="mu">Restore a backup file. You choose to merge it with your words or replace them.</p><input type="file" id="fi" accept=".json,application/json" hidden><button class="btn alt" id="ch">Choose file</button><div id="imp" style="margin-top:14px"></div></div>`;
 const msg=(t,bad)=>{$('#imp').innerHTML=`<p role="status" style="font-weight:600;color:${bad?'var(--rd)':'var(--ac)'}">${esc(t)}</p>`;toast(t)};
 $('#ex').onclick=()=>{try{const d={app:'lexi',version:2,exportedAt:new Date().toISOString(),words:S.words,days:S.days,sessions:S.sessions,goal:S.goal};
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download=`lexi-backup-${today()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1e4);
  S.lastExport=d.exportedAt;save();V.settings();toast('Backup downloaded')}catch(e){toast('Export failed. Please try again.')}};
 $('#ch').onclick=()=>$('#fi').click();
 $('#fi').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onerror=()=>msg('Could not read that file.',1);
  r.onload=()=>{let o;try{o=JSON.parse(r.result)}catch(x){return msg('That file is not valid JSON.',1)}
   const raw=Array.isArray(o)?o:o&&o.words;if(!Array.isArray(raw))return msg('This does not look like a Flashcards backup: no words found.',1);
   const w=dedupe(cleanWords(raw));if(!w.length)return msg('No valid words found in this file.',1);
   IMP={w,days:cleanDays(o.days),sessions:Number.isInteger(o.sessions)&&o.sessions>=0?o.sessions:0,goal:o.goal};
   $('#imp').innerHTML=`<p><strong>${w.length}</strong> words ready to import${raw.length>w.length?` (${raw.length-w.length} skipped as invalid or duplicate)`:''}. How should they be imported?</p><div class="row"><button class="btn" id="mg">Merge</button><button class="btn alt dg" id="rp">Replace</button></div><p class="mu">Merge adds new words and keeps yours. Replace overwrites your words and progress.</p>`;
   $('#mg').onclick=()=>{const have=new Set(S.words.map(x=>x.w.toLowerCase())),ids=new Set(S.words.map(x=>x.id));let n=0;
    IMP.w.forEach(x=>{if(have.has(x.w.toLowerCase()))return;if(ids.has(x.id))x.id=uid();ids.add(x.id);S.words.push(x);n++});
    for(const k in IMP.days)if(!(k in S.days))S.days[k]=IMP.days[k];save();L.deck=[];msg(`Merged: ${n} new ${n===1?'word':'words'} added, ${IMP.w.length-n} already existed.`)};
   $('#rp').onclick=()=>{if(!confirm(`Replace your current ${S.words.length} words and progress with this backup of ${IMP.w.length} words? This cannot be undone.`))return;
    S.words=IMP.w;S.days=IMP.days;S.sessions=IMP.sessions;if([5,10,15,20].includes(IMP.goal))S.goal=IMP.goal;save();L.deck=[];SEL.clear();msg(`Replaced: ${IMP.w.length} words restored.`)}};
  r.readAsText(f);e.target.value=''}},
progress(){const n=streak(),t=new Date(),m=new Date(t);m.setDate(t.getDate()-(t.getDay()+6)%7);
 const wk=['M','T','W','T','F','S','S'].map((l,i)=>{const d=new Date(m);d.setDate(m.getDate()+i);const k=key(d),y=cnt(k)>0;return`<div><span class="dot${y?' y':''}${k===today()?' t':''}" aria-label="${d.toLocaleDateString('en',{weekday:'long'})}: ${y?'completed':'no activity'}">${y?'✓':''}</span>${l}</div>`}).join('');
 app.innerHTML=`<h1>Progress</h1><div class="grid" style="grid-template-columns:repeat(2,1fr)"><div class="card"><div class="num">${known()}</div>Words learned</div><div class="card"><div class="num">${learning()}</div>Still learning</div></div>
 <div class="card"><div class="sk"><span class="fl" aria-hidden="true">🔥</span><div><div class="num">${n}</div><div class="mu">day streak</div></div></div><div class="wk">${wk}</div></div>
 <div class="row"><button class="btn alt dg" id="reset">Reset progress</button></div><p class="mu">Resetting clears study progress, not your words. Everything is saved in this browser only.</p>`;
 $('#reset').onclick=()=>{if(confirm('Reset study progress? Your words stay.')){S.days={};S.sessions=0;S.words.forEach(x=>x.st='new');save();L.deck=[];V.progress()}}}
};
function build(m){let a=(m==='practice'?S.words.filter(x=>x.st==='learning'):S.words.filter(x=>x.st!=='known')).map(x=>x.id);if(m!=='practice'&&!a.length)a=S.words.map(x=>x.id);
 if(S.shuffle&&m==='practice')for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function sess(m){L.m=m;
 if(m==='practice'&&!learning())return app.innerHTML=`<h1>Practice Still Learning</h1><div class="card empty"><div class="em">🌱</div><h2>No words to practice yet</h2><p class="mu">Words you mark as “Still learning” will show up here for focused practice.</p><a class="btn" href="#learn">Go to regular learning</a></div>`;
 if(!S.words.length)return app.innerHTML=`<h1>Learn</h1><div class="card empty"><div class="em">🗂️</div><h2>No words to practice</h2><p class="mu">Add a few words first, then come back to flip through them.</p><a class="btn" href="#words">Add a word</a></div>`;
 if(!L.deck.length){L.deck=build(m);L.tot=L.deck.length;L.dn=new Set();L.i=0;L.f=false;S.sessions++;save()}draw()}
function cheer(P){const n=L.tot,c=['var(--ac)','var(--am)','var(--gr)','var(--b3t)'],cf=[...Array(28)].map((_,i)=>`<i class="cf" style="left:${(i*37)%100}%;background:${c[i%4]};animation-delay:${(i%7)*.12}s"></i>`).join('');L.deck=[];
 app.innerHTML=`<div class="card empty cheer" role="status">${cf}<div class="em pop">🎉</div><h1>Great job!</h1><p style="font-size:18px">You've completed this session!</p><p class="mu">${n} ${n===1?'word':'words'} ${P?'practiced':'reviewed'}.</p><a class="btn" href="#home">Back to Home</a></div>`}
function draw(){const x=S.words.find(w=>w.id===L.deck[L.i]),P=L.m==='practice';if(!x){L.deck=[];return sess(L.m)}const n=L.deck.length;
 app.innerHTML=`<div class="head"><div><h1>${P?'Practice Still Learning':'Learn'}</h1><p class="mu">Card ${L.i+1} of ${n}</p></div>${P?'<a class="btn alt sm" href="#learn">Back to regular learning</a>':`<a class="btn alt sm" href="#practice">Practice Still Learning (${learning()})</a>`}</div>
 <div class="scene" id="sc" tabindex="0" role="button" aria-label="Flip card"><div class="flip ${L.f?'f':''}"><div class="face"><div class="row" style="justify-content:center"><span class="w">${esc(x.w)}</span>${spk(x.w)}</div><span class="tag">${x.pos}</span><p class="mu">Tap to flip</p></div>
 <div class="face b"><p style="margin:0">${esc(x.def)}</p>${x.ar?`<p class="ar" dir="auto" style="margin:0">${esc(x.ar)}</p>`:''}${x.ex?`<p class="mu" style="margin:0"><em>“${esc(x.ex)}”</em></p>`:''}<div><span class="tag">${x.pos}</span> <span class="tag ${lc(x.lvl)}">${x.lvl}</span></div></div></div></div>
 <div class="row"><button class="btn alt" id="pv">Previous</button><button class="btn alt" id="nx">Next</button>${P?`<button class="btn ${S.shuffle?'':'alt'}" id="sh" aria-pressed="${S.shuffle}">Shuffle: ${S.shuffle?'On':'Off'}</button>`:''}</div>
 <div class="row">${P?'<button class="btn" id="rm">Remembered</button><button class="btn am" id="np">Still Learning</button>':'<button class="btn" id="kn">Learned</button><button class="btn am" id="sl">Still learning</button>'}</div>`;
 const go=d=>{L.i=(L.i+d+n)%n;L.f=false;draw()},fl=()=>{L.f=!L.f;$('.flip').classList.toggle('f',L.f)};
 $('#sc').onclick=fl;$('#sc').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fl()}};$('#pv').onclick=()=>go(-1);$('#nx').onclick=()=>go(1);
 if(P){$('#sh').onclick=()=>{S.shuffle=!S.shuffle;save();L.deck=build('practice');L.tot=L.deck.length;L.i=0;L.f=false;draw();toast(S.shuffle?'Shuffle on':'Shuffle off')};
  $('#rm').onclick=()=>{x.rv++;mark(x.id,'known');L.deck.splice(L.i,1);if(!L.deck.length)return cheer(true);if(L.i>=L.deck.length)L.i=0;L.f=false;toast('Moved to learned');draw()};
  $('#np').onclick=()=>{act();save();toast('Keep practicing');go(1)}}
 else{const fin=()=>{L.dn.add(x.id);L.dn.size>=n?cheer(false):go(1)};
  $('#kn').onclick=()=>{mark(x.id,'known');toast('Marked as learned');fin()};
  $('#sl').onclick=()=>{mark(x.id,'learning');toast('Added to still learning');fin()}}}

function form(id){const x=S.words.find(w=>w.id===id)||{};$('#formbox').innerHTML=`<div class="card" style="margin:16px 0"><h2>${id?'Edit word':'Add a new word'}</h2><div class="fg">
 <label>Word<input id="fw" value="${esc(x.w)}" maxlength="60" autocomplete="off"></label>
 <label>Part of speech<select id="fp">${POS.map(p=>`<option ${p===x.pos?'selected':''}>${p}</option>`).join('')}</select></label>
 <label>Level<select id="fl">${LV.map(p=>`<option ${p===x.lvl?'selected':''}>${p}</option>`).join('')}</select></label>
 <label>Arabic meaning (optional)<input id="fa" dir="auto" value="${esc(x.ar)}" maxlength="120"></label>
 <label class="full">Definition<input id="fd" value="${esc(x.def)}" maxlength="300"></label>
 <label class="full">Example sentence (optional)<input id="fe" value="${esc(x.ex)}" maxlength="300"></label></div>
 <div class="row"><button class="btn" id="fs">${id?'Save changes':'Add word'}</button><button class="btn alt" id="fc">Cancel</button></div></div>`;
 $('#fc').onclick=()=>$('#formbox').innerHTML='';$('#fw').focus();$('#formbox').scrollIntoView({block:'nearest',behavior:'smooth'});
 $('#fs').onclick=()=>{const w=$('#fw').value.trim(),d=$('#fd').value.trim();if(!w||!d)return toast('Enter a word and its definition.');
  if(S.words.some(y=>y.id!==id&&y.w.toLowerCase()===w.toLowerCase()))return toast('That word is already in your collection.');
  const r={w,pos:$('#fp').value,lvl:$('#fl').value,def:d,ar:$('#fa').value.trim(),ex:$('#fe').value.trim()};
  if(id)Object.assign(x,r);else S.words.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),fav:false,st:'new',...r});
  save();L.deck=[];$('#formbox').innerHTML='';list();toast(id?'Changes saved':'Word added')}}
function list(){const A=S.words,C=[['all','All levels'],['fav','Favorites'],...LV.map(l=>[l,l])];
 $('#chips').innerHTML=C.map(([k,t])=>`<button class="chip ${F.c===k?'on':''}" data-c="${k}" aria-pressed="${F.c===k}">${t}</button>`).join('');
 const q=F.q.toLowerCase().trim(),r=A.filter(x=>(F.c==='all'||(F.c==='fav'?x.fav:x.lvl===F.c))&&(!F.pos||x.pos===F.pos)&&(!q||x.w.toLowerCase().includes(q)));
 $('#cnt').textContent=A.length?`${A.length} ${A.length===1?'word':'words'}${r.length!==A.length?` · ${r.length} shown`:''}`:'Your personal collection';
 SEL.forEach(i=>{if(!A.some(w=>w.id===i))SEL.delete(i)});const k=SEL.size;
 $('#bulk').innerHTML=A.length?`<div class="row"><span class="mu"><strong>${k}</strong> selected</span><button class="btn alt sm" data-bulk="all">Select all</button><button class="btn alt sm" data-bulk="none" ${k?'':'disabled'}>Deselect all</button><button class="btn alt sm dg" data-bulk="del" ${k?'':'disabled'}>Delete selected${k?` (${k})`:''}</button></div>`:'';
 $('#list').innerHTML=!A.length?`<div class="card empty"><div class="em">📖</div><h2>No words yet</h2><p class="mu">Start building your personal vocabulary collection by adding your first word.</p>${addBtn('Add your first word')}</div>`:
 r.length?`<div class="cards">${r.map(x=>`<article class="card wc"><div class="row" style="margin:0;justify-content:space-between;flex-wrap:nowrap"><label class="chk"><input type="checkbox" data-s="${x.id}" ${SEL.has(x.id)?'checked':''} aria-label="Select ${esc(x.w)}"></label><h3 style="flex:1">${esc(x.w)}</h3>${spk(x.w)}</div><div><span class="tag">${x.pos}</span> <span class="tag ${lc(x.lvl)}">${x.lvl}</span></div>
 <p>${esc(x.def)}</p>${x.ar?`<p class="ar" dir="auto">${esc(x.ar)}</p>`:''}${x.ex?`<p class="mu"><em>“${esc(x.ex)}”</em></p>`:''}
 <div class="acts"><button class="ic fav ${x.fav?'on':''}" data-f="${x.id}" aria-label="${x.fav?'Remove from':'Add to'} favorites" aria-pressed="${!!x.fav}">★</button><button class="btn alt sm" data-e="${x.id}">Edit</button><button class="btn alt sm dg" data-d="${x.id}">Delete</button></div></article>`).join('')}</div>`:'<div class="card empty"><h2>No matching words</h2><p class="mu">Try a different filter or search.</p></div>'}
document.addEventListener('click',e=>{const t=e.target.closest('[data-add],[data-c],[data-f],[data-e],[data-d],[data-bulk]');if(!t)return;const D=t.dataset;
 if('add' in D){if(location.hash!=='#words'){location.hash='words'}form()}
 else if(D.bulk){if(D.bulk==='all')S.words.forEach(w=>SEL.add(w.id));else if(D.bulk==='none')SEL.clear();
  else{const n=SEL.size;if(n&&confirm(n===S.words.length?`Delete your entire vocabulary (${n} words)? This cannot be undone.`:`Delete ${n} selected ${n===1?'word':'words'}? This cannot be undone.`)){S.words=S.words.filter(w=>!SEL.has(w.id));SEL.clear();save();L.deck=[];toast('Words deleted')}}list()}
 else if(D.c){F.c=D.c;list()}
 else if(D.f){const x=S.words.find(w=>w.id===D.f);x.fav=!x.fav;save();list()}
 else if(D.e)form(D.e);
 else if(D.d){const x=S.words.find(w=>w.id===D.d);if(confirm(`Delete “${x.w}”?`)){S.words=S.words.filter(w=>w!==x);save();L.deck=[];list();toast('Word deleted')}}});
function route(){const v=V[location.hash.slice(1)]?location.hash.slice(1):'home';L.deck=[];const nv=v==='practice'?'learn':v;
 document.querySelectorAll('nav a').forEach(a=>{a.classList.toggle('on',a.dataset.v===nv);a.ariaCurrent=a.dataset.v===nv?'page':null});V[v]();window.scrollTo(0,0)}
addEventListener('hashchange',route);route();
document.addEventListener('change',e=>{const c=e.target.closest('[data-s]');if(!c)return;c.checked?SEL.add(c.dataset.s):SEL.delete(c.dataset.s);list()});
document.addEventListener('keydown',e=>{if(!['#learn','#practice'].includes(location.hash)||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='ArrowRight')$('#nx')?.click();if(e.key==='ArrowLeft')$('#pv')?.click()});
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
