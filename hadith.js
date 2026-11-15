(()=>{
const N=window.NQ,$=N.$,root=$('tab-h');
let META=null,sel='nawawi',res=[],shown=0,q='',busy=false;
const BOOKS={};  // k -> {h:[...], nz:[...]}
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const nz=s=>s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
async function book(k){
  if(BOOKS[k])return BOOKS[k];
  const h=await N.getJSON('hd/'+k+'.json');
  return BOOKS[k]={h,nz:h.map(x=>nz(x[1]))};
}
function shell(){
  root.innerHTML=`<div class="note">بحث في الأحاديث النبوية من كتب مفتوحة. الأحكام تُنقل كما وردت وتُنسب لأصحابها، ولا نُصدر حكمًا من عندنا.</div>
  <div class="chips">${META.books.map(b=>`<button class="chip${sel===b.k?' on':''}" data-bk="${b.k}">${b.n}</button>`).join('')}<button class="chip${sel==='all'?' on':''}" data-bk="all">كل الكتب</button></div>
  <div class="srow"><input id="hq" type="search" placeholder="اكتب جزءًا من الحديث، أو رقم الحديث…" autocomplete="off" value="${esc(q)}"><button id="hgo" class="ib" style="min-width:64px">بحث</button></div>
  <div id="hn" class="note" style="display:none"></div><div id="hr"></div>
  <div class="credit">النصوص والأحكام من مشروع <a href="https://github.com/fawazahmed0/hadith-api" target="_blank" rel="noopener">hadith-api</a> (مجال عام) المأخوذ عن sunnah.com، وتُنقل الأحكام كما وردت.<br>الترقيم هو ترقيم المصدر وقد يختلف عن طبعتك. للتثبت راجع كتب أهل العلم.</div>`;
  $('hq').addEventListener('keydown',e=>{if(e.key==='Enter')go()});
  if(q)render();
}
function gradeHtml(bk,it){
  if(it[2]&&it[2].length)return '<div class="gr"><b>الحكم:</b> '+it[2].map(g=>`${META.sc[g[0]]}: ${META.gr[g[1]]}`).join(' · ')+'</div>';
  if(bk==='bukhari'||bk==='muslim')return '<div class="gr">من كتاب التزم مؤلّفه إيراد الصحيح. لم يُدرج المصدر حكمًا لكل حديث.</div>';
  return '<div class="gr">لم يُدرج المصدر درجةً لهذا الحديث.</div>';
}
function card(r,i){
  const [bk,it]=r,name=META.books.find(b=>b.k===bk).n,long=it[1].length>700;
  return `<div class="hc"><div class="hh">${name} · رقم الحديث ${N.ar(it[0])}</div><div class="ht${long?' clamp':''}" id="t${i}">${esc(it[1])}</div>${long?`<button class="more" data-ex="${i}">عرض الحديث كاملًا</button>`:''}${gradeHtml(bk,it)}<div class="row"><button data-cp="${i}">📋 نسخ</button><button data-sh="${i}">📤 مشاركة</button></div></div>`;
}
function render(){
  $('hr').innerHTML=res.length?res.slice(0,shown).map(card).join('')+(shown<res.length?`<div class="row"><button class="pri" id="hm">المزيد (${N.ar(res.length-shown)} متبقٍّ)</button></div>`:'')+`<div class="note">${N.ar(res.length)} نتيجة</div>`:'<div class="err">لا توجد نتائج. جرّب كلماتٍ أقلّ أو مختلفة.</div>';
}
function text(r){const [bk,it]=r,name=META.books.find(b=>b.k===bk).n;let g='';if(it[2]&&it[2].length)g='\nالحكم: '+it[2].map(x=>META.sc[x[0]]+': '+META.gr[x[1]]).join(' · ');return it[1]+'\n\n— '+name+'، رقم '+it[0]+g+'\n\n🤍 من بوت سكينة'}
async function go(){
  if(busy)return;q=$('hq').value.trim();if(!q){res=[];render();return}
  busy=true;const note=$('hn');note.style.display='block';note.textContent='جارٍ التحميل والبحث…';
  try{
    const keys=sel==='all'?META.books.map(b=>b.k):[sel];
    const words=nz(q).split(/\s+/).filter(Boolean),num=/^\d+$/.test(q)?q:null,out=[];
    for(const k of keys){
      const B=await book(k);
      if(num){const i=B.h.findIndex(x=>String(x[0])===num);if(i>=0)out.push([k,B.h[i],0])}
      else for(let i=0;i<B.h.length;i++){const t=B.nz[i];let ok=true;for(const w of words){if(!t.includes(w)){ok=false;break}}if(ok)out.push([k,B.h[i],t.includes(words.join(' '))?0:1,t.length])}
    }
    out.sort((a,b)=>(a[2]-b[2])||((a[3]||0)-(b[3]||0)));
    res=out.map(x=>[x[0],x[1]]);shown=Math.min(5,res.length);render();
  }catch{$('hr').innerHTML='<div class="err">تعذّر التحميل. تحقق من الاتصال وحاول مجددًا.</div>'}
  note.style.display='none';busy=false;
}
root.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.bk){sel=b.dataset.bk;root.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c.dataset.bk===sel));if(sel==='all')alert_big();return}
  if(b.id==='hgo')return go();
  if(b.id==='hm'){shown=Math.min(res.length,shown+5);return render()}
  if(b.dataset.ex){const t=$('t'+b.dataset.ex);t.classList.remove('clamp');b.remove();return}
  if(b.dataset.cp){try{await navigator.clipboard.writeText(text(res[+b.dataset.cp]));N.toast('تم النسخ ✅')}catch{N.toast('تعذّر النسخ')}return}
  if(b.dataset.sh){const u='https://t.me/share/url?url='+encodeURIComponent('https://t.me/Sakina_YMnotes_bot')+'&text='+encodeURIComponent(text(res[+b.dataset.sh]));return N.tg&&N.tg.openTelegramLink?N.tg.openTelegramLink(u):window.open(u,'_blank')}
});
function alert_big(){N.toast('البحث في كل الكتب يحمّل نحو ١٠ ميجا')}
N.mods.hadith={async show(){
  if(!META)META=await N.getJSON('hd/meta.json');
  if(!root.dataset.ready){root.dataset.ready=1;shell()}
}};
})();
