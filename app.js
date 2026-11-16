/* 화면 전환: 페이지 이동 시 페이드 아웃 → 새 페이지 페이드 인 */
(function(){
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
window.goTo=function(url){if(RM){location.href=url;return}document.documentElement.classList.add('leaving');setTimeout(function(){location.href=url},280)};
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank')return;
  var u=new URL(a.getAttribute('href'),location.href);if(u.origin!==location.origin&&location.protocol!=='file:')return;
  if(u.pathname===location.pathname)return;
  e.preventDefault();goTo(u.href);
});
window.addEventListener('pageshow',function(e){if(e.persisted)document.documentElement.classList.remove('leaving')});
})();
var T=window.I18N||{prev:'이전 페이지',next:'다음 페이지',last:'마지막 페이지',here:'지금 읽는 곳',readin:'{} 이야기에서 읽기 →',soon:'이 이야기는 아직 준비 중입니다.',sp:[]};
(function(){
var b=document.body,N=+b.dataset.pages,pgs=[].slice.call(document.querySelectorAll('.pg'));
var cur=1,ticks=[].slice.call(document.querySelectorAll('.tk'));
var prev=document.getElementById('prev'),next=document.getElementById('next');

function pad(n){return (n<10?'0':'')+n}
function nav(k){return pgs[k]&&pgs[k].dataset.nav||''}
var book=document.getElementById('book'),first=true;
function show(i,push){
  i=Math.max(1,Math.min(N,i));
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(first||i===cur||RM){first=false;render(i,push);return}
  book.classList.add('pg-out');
  setTimeout(function(){render(i,push);requestAnimationFrame(function(){book.classList.remove('pg-out')})},200);
}
function render(i,push){
  cur=i;
  pgs.forEach(function(p,k){p.classList.toggle('on',k===i-1)});
  ticks.forEach(function(t,k){t.classList.toggle('on',k===i-1);t.setAttribute('aria-current',k===i-1?'page':'false')});
  document.getElementById('pgc').textContent=pad(i);
  document.getElementById('pgt').textContent=pgs[i-1].dataset.title;
  var st=+pgs[i-1].dataset.stop;
  document.querySelectorAll('.route .node').forEach(function(n){var k=+n.dataset.k;n.classList.toggle('cur',k===st);n.classList.toggle('done',k<st);if(k===st)n.setAttribute('aria-current','step');else n.removeAttribute('aria-current')});
  document.querySelectorAll('.route .seg').forEach(function(s){s.classList.toggle('done',+s.dataset.k<st)});
  // 이전/다음 라벨
  var pl=document.getElementById('prevL'),nl=document.getElementById('nextL');
  if(i===1){ if(b.dataset.prevStory){prev.disabled=false;pl.textContent=b.dataset.prevLabel}else{prev.disabled=true;pl.textContent=T.prev} }
  else{prev.disabled=false;pl.textContent=nav(i-2)||T.prev}
  if(i===N){ if(b.dataset.nextStory){next.disabled=false;nl.textContent=b.dataset.nextLabel}else{next.disabled=true;nl.textContent=T.last} }
  else{next.disabled=false;nl.textContent=nav(i)||T.next}
  var h='#p'+i; if(location.hash!==h){history[push?'pushState':'replaceState'](null,'',h)}
  window.scrollTo(0,0);requestAnimationFrame(function(){window.scrollTo(0,0)});
}
function go(d){
  if(d<0&&cur===1){if(b.dataset.prevStory)goTo(b.dataset.prevStory);return}
  if(d>0&&cur===N){if(b.dataset.nextStory)goTo(b.dataset.nextStory);return}
  show(cur+d,true);
}
prev.onclick=function(){go(-1)};next.onclick=function(){go(1)};
ticks.forEach(function(t){t.onclick=function(){show(+t.dataset.i,true)}});
function fromHash(){var m=location.hash.match(/^#p(\d+)$/);show(m?+m[1]:1,false)}
window.addEventListener('popstate',fromHash);window.addEventListener('hashchange',fromHash);fromHash();
document.addEventListener('keydown',function(e){
  if(document.getElementById('menu').classList.contains('show')){if(e.key==='Escape')closeMenu();return}
  if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1);
});
// 스와이프
var sx=null,sy=null;
document.getElementById('book').addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
document.getElementById('book').addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)go(dx<0?1:-1);sx=null},{passive:true});
// 메뉴
// 언어 전환: 같은 이야기·같은 페이지로
document.querySelectorAll('.langs a.lg').forEach(function(a){a.addEventListener('click',function(){a.href=a.href.split('#')[0]+'#p'+cur})});
var menu=document.getElementById('menu'),burger=document.getElementById('burger');
function openMenu(){menu.classList.add('show');menu.setAttribute('aria-hidden','false');burger.setAttribute('aria-expanded','true');document.getElementById('close').focus()}
function closeMenu(){menu.classList.remove('show');menu.setAttribute('aria-hidden','true');burger.setAttribute('aria-expanded','false');burger.focus()}
burger.onclick=openMenu;document.getElementById('close').onclick=closeMenu;
menu.addEventListener('click',function(e){if(e.target===menu)closeMenu();if(e.target.closest('a'))setTimeout(closeMenu,0)});
})();

/* ---------- 동선 지도 ---------- */
(function(){
var POS=[40,104,168,232,296,360].map(function(x){return {x:x,y:30,lx:0,ly:32,anchor:"middle"}}).slice(0,T.sp.length);
var NUM=['','01','02','03','',''];
var NUMLB=['','01','02','03','04–16',''];
var SP=POS.map(function(p,k){var t=T.sp[k]||{};var m=(t.h||'').match(/story-(\d+)/);return {x:p.x,y:p.y,lx:p.lx,ly:p.ly,anchor:p.anchor,nolb:p.nolb,n:t.n||'',f:t.f||'',d:t.d||'',h:t.h||'',st:m?'STORY '+m[1]:''}});
var svg=document.querySelector('.smap'),ov=document.getElementById('mapov'),btn=document.getElementById('mapbtn');
if(!svg)return;
var NS='http://www.w3.org/2000/svg',sel=0;
function lbl(n,x){var w=n.split(' ');if(w.length<2)return n;var h=Math.ceil(w.length/2);return '<tspan x="'+x+'">'+w.slice(0,h).join(' ')+'</tspan><tspan x="'+x+'" dy="13">'+w.slice(h).join(' ')+'</tspan>'}
var mv1=document.getElementById('mv1'),mv2=document.getElementById('mv2');
function view(n){if(!mv1||!mv2)return;mv1.hidden=(n!==1);mv2.hidden=(n!==2);if(n===2&&window.__fitWs)requestAnimationFrame(window.__fitWs);var mi=document.querySelector('.map-in');if(mi)mi.scrollTop=0;if(n===2){var b=document.getElementById('mvback');if(b)b.focus()}}
var mb=document.getElementById('mvback');if(mb)mb.onclick=function(){view(1)};
function curStop(){var p=document.querySelector('.pg.on');return p?+p.dataset.stop:-1}
function curWs(){var p=document.querySelector('.pg.on');return p?+p.dataset.mapspot:-1}
function curZone(){var p=document.querySelector('.pg.on');return p&&+p.dataset.stop===4}
SP.forEach(function(s,k){
  var g=document.createElementNS(NS,'g');g.setAttribute('class','spot');g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',(NUM[k]?NUM[k]+' ':'')+s.n);g.dataset.k=k;
  g.innerHTML='<circle class="pulse" cx="'+s.x+'" cy="'+s.y+'" r="0"/><circle class="o" cx="'+s.x+'" cy="'+s.y+'" r="10"/><text class="n" x="'+s.x+'" y="'+(s.y+3)+'" text-anchor="middle">'+NUM[k]+'</text>'+(s.nolb?'':'<text x="'+(s.x+s.lx)+'" y="'+(s.y+(s.ly||4))+'" text-anchor="'+s.anchor+'">'+lbl(s.n,s.x)+'</text>');
  g.addEventListener('click',function(){if(k===4){pick(k);view(2)}else pick(k)});g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(k);if(k===4)view(2)}});
  svg.appendChild(g);
});
/* 1차 동선: 콘텐츠 폭에 맞춰 1:1 배치 */
function layout(){
  var W=Math.round(svg.getBoundingClientRect().width);if(!W)return;
  var pad=12,n=SP.length,step=(W-pad*2)/(n-1),H=96;
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  var xs=SP.map(function(s,k){return pad+step*k});
  svg.querySelectorAll('.spot').forEach(function(g,k){var x=xs[k];
    g.querySelectorAll('circle').forEach(function(c){c.setAttribute('cx',x)});
    var t=g.querySelectorAll('text');t[0].setAttribute('x',x);
    if(t[1]){var lx=k===0?x-pad:(k===n-1?x+pad:x),an=k===0?'start':(k===n-1?'end':'middle');t[1].setAttribute('x',lx);t[1].setAttribute('text-anchor',an);t[1].querySelectorAll('tspan').forEach(function(ts){ts.setAttribute('x',lx)})}});
  var tl=[].map.call(svg.querySelectorAll('.spot'),function(g){return g.querySelectorAll('text')[1]}).filter(Boolean);
  tl.forEach(function(t){t.setAttribute('y',62)});
  var ov=false;for(var i=1;i<tl.length;i++){var a=tl[i-1].getBBox(),b=tl[i].getBBox();if(b.x<a.x+a.width+4){ov=true;break}}
  svg.setAttribute('viewBox',ov?'0 -26 '+W+' 122':'0 0 '+W+' '+H);
  if(ov)tl.forEach(function(t,k){if(k%2){t.setAttribute('y',t.querySelectorAll('tspan').length?-6:12)}});
  var w=svg.querySelectorAll('.walk');if(w[0])w[0].setAttribute('d','M'+xs[0]+' 30 H'+xs[1]);if(w[1])w[1].setAttribute('d','M'+xs[1]+' 30 H'+xs[Math.min(4,n-1)]);if(w[2])w[2].setAttribute('d',n>5?'M'+xs[4]+' 30 H'+xs[5]:'');
}
window.addEventListener('resize',layout);
var list=document.getElementById('spotList');
list.innerHTML=SP.map(function(s,k){return '<li data-k="'+k+'"><button><span class="ln">'+(NUM[k]||'')+'</span><span>'+s.n+'</span><span class="ls">'+(s.st||'—')+'</span></button></li>'}).join('');
list.querySelectorAll('button').forEach(function(b,k){b.onclick=function(){pick(k)}});
function pick(k){
  sel=k;var s=SP[k],c=curStop();
  svg.querySelectorAll('.spot').forEach(function(g){g.classList.toggle('sel',+g.dataset.k===k)});
  document.getElementById('spotInfo').innerHTML='<div class="si-h"><b>'+(NUMLB[k]?NUMLB[k]+' ':'')+(s.f||s.n)+'</b></div><p>'+s.d+'</p>'+(s.h?'<a href="'+s.h+'">'+T.readin.replace('{}',s.st)+'</a>':'<span class="ls" style="font-size:12px;color:rgba(255,255,255,.45)">'+T.soon+'</span>');
}
function mark(){
  var c=curStop();var cw=curWs();document.querySelectorAll('.rt2 a[data-n]').forEach(function(a){a.classList.toggle('cur',+a.dataset.n===cw)});
  svg.querySelectorAll('.spot').forEach(function(g){var on=+g.dataset.k===c;g.classList.toggle('cur',on);g.querySelector('.pulse').setAttribute('r',on?16:0)});
  list.querySelectorAll('li').forEach(function(li){li.classList.toggle('cur',+li.dataset.k===c);if(+li.dataset.k===c)li.querySelector('.ls').textContent=T.here;else li.querySelector('.ls').textContent=SP[+li.dataset.k].st||'—'});
  if(c>=0&&c<SP.length)pick(c);else{sel=-1;svg.querySelectorAll('.spot').forEach(function(g){g.classList.remove('sel')});document.getElementById('spotInfo').innerHTML='';}
}
function open(){view(1);mark();ov.classList.add('show');layout();if(curStop()===4){pick(4);view(2)}ov.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');document.getElementById('mapclose').focus()}
function close(){ov.classList.remove('show');ov.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');btn.focus()}
btn.onclick=open;document.getElementById('mapclose').onclick=close;
ov.addEventListener('click',function(e){if(e.target===ov)close();if(e.target.closest('a'))setTimeout(close,0)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('show'))close()});
})();

/* 12공방 동선: 콘텐츠 폭에 맞춰 1:1 배치 */
(function(){
function place(svg,W,pad,edge){
  var cols=4,step=(W-pad*2)/(cols-1),pts=[];
  svg.querySelectorAll('a[data-c]').forEach(function(a){
    var c=+a.dataset.c,x=pad+step*c,cir=a.querySelector('circle'),y=+cir.getAttribute('cy');
    cir.setAttribute('cx',x);var t=a.querySelectorAll('text');t[0].setAttribute('x',x);
    var an='middle',lx=x;if(edge){if(c===0){an='start';lx=x-13}else if(c===cols-1){an='end';lx=x+13}}
    t[1].setAttribute('x',lx);t[1].setAttribute('text-anchor',an);pts.push(x+' '+y);
  });
  var p=svg.querySelector('.pth');if(p&&pts.length)p.setAttribute('d','M'+pts.join(' L'));
}
function overlaps(svg){
  var rows={};svg.querySelectorAll('a[data-c]').forEach(function(a){var t=a.querySelectorAll('text')[1],bb=t.getBBox(),y=Math.round(bb.y);(rows[y]=rows[y]||[]).push(bb)});
  return Object.keys(rows).some(function(k){var r=rows[k].sort(function(a,b){return a.x-b.x});for(var i=1;i<r.length;i++){if(r[i].x<r[i-1].x+r[i-1].width+6)return true}return false});
}
function fit(svg){
  var W=Math.round(svg.getBoundingClientRect().width);if(!W)return;
  var vb=svg.getAttribute('viewBox').split(' '),H=+vb[3];
  svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.classList.remove('tight');svg.querySelectorAll('a[data-c]').forEach(function(a){var t=a.querySelectorAll('text'),cy=+a.querySelector('circle').getAttribute('cy');t[1].setAttribute('y',cy+30)});
  place(svg,W,13,true);if(!overlaps(svg))return;
  var wmax=0;svg.querySelectorAll('a[data-c] text.nm').forEach(function(t){wmax=Math.max(wmax,t.getBBox().width)});
  var pad=Math.max(13,wmax/2+1);place(svg,W,pad,false);if(!overlaps(svg))return;
  svg.classList.add('tight');wmax=0;svg.querySelectorAll('a[data-c] text.nm').forEach(function(t){wmax=Math.max(wmax,t.getBBox().width)});
  place(svg,W,Math.max(13,wmax/2+1),false);if(!overlaps(svg))return;
  svg.querySelectorAll('a[data-c]').forEach(function(a){if(+a.dataset.c%2){var t=a.querySelectorAll('text'),cy=+a.querySelector('circle').getAttribute('cy');t[1].setAttribute('y',cy-19)}});
}
function all(){document.querySelectorAll('.dg-wr svg').forEach(fit)}
window.__fitWs=all;
window.addEventListener('resize',all);
document.addEventListener('click',function(){requestAnimationFrame(all)});
window.addEventListener('hashchange',function(){requestAnimationFrame(all)});
requestAnimationFrame(all);
})();

/* 라이트/다크 전환 */
(function(){
var bt=document.getElementById('themeBtn');if(!bt)return;
var root=document.documentElement;
function sync(){var l=root.getAttribute('data-theme')==='light';bt.setAttribute('aria-pressed',l?'true':'false')}
bt.addEventListener('click',function(){
  var l=root.getAttribute('data-theme')!=='light';
  if(l)root.setAttribute('data-theme','light');else root.removeAttribute('data-theme');
  try{localStorage.setItem('tjy-theme',l?'light':'dark')}catch(e){}
  window.name='tjy-theme='+(l?'light':'dark');
  sync();
});
sync();
})();

/* 챕터 시작 장면: 누르면 건너뛴다 */
(function(){
var c=document.getElementById('ci'),root=document.documentElement;
if(!c||!root.classList.contains('ci-on'))return;
var done=false;
function end(){if(done)return;done=true;c.classList.add('out');setTimeout(function(){root.classList.remove('ci-on')},420)}
c.addEventListener('click',end);setTimeout(end,3000);
var y=c.querySelector('.ci-year');
if(y){var a=+y.dataset.from,z=+y.dataset.to,t0=Date.now(),iv=setInterval(function(){var p=Math.max(0,Math.min(1,(Date.now()-t0-200)/1000));y.textContent=Math.round(a+(z-a)*(1-Math.pow(1-p,3)));if(p>=1||done)clearInterval(iv)},40)}
})();
