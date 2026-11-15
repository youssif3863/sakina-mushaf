(()=>{
const N=window.NQ,$=N.$,root=$('tab-st');
let list=null,pi=0,ci=0;
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
async function ensure(){if(!list)list=await N.getJSON('data/stories.json')}
function listView(){
  root.innerHTML='<div class="note">قصص الأنبياء كما وردت في القرآن الكريم، مقسّمة إلى فصول قصيرة، مع التفسير الميسّر. لا نضيف رواياتٍ من خارج القرآن.</div><div class="grid">'+list.map((p,i)=>`<button class="s" data-p="${i}"><span class="no">${N.ar(i+1)}</span><span><div class="n" style="font-size:16px">${p.n}</div><div class="m">${N.ar(p.c.length)} ${p.c.length>2?'فصول':p.c.length===2?'فصلان':'فصل'}</div></span></button>`).join('')+'</div>';
}
function prophet(i,push=true){
  if(push)N.push(()=>listView());
  pi=i;const p=list[i];
  root.innerHTML=`<div class="stb"><button class="ib" data-back="1">→</button><b>${p.n}</b></div><div class="grid" style="grid-template-columns:1fr">`+p.c.map((c,j)=>`<button class="s" data-c="${j}"><span class="no">${N.ar(j+1)}</span><span><div class="n" style="font-size:17px">${c[0]}</div><div class="m">${N.IDX()[c[1]-1].name} · الآيات ${N.ar(c[2])}–${N.ar(c[3])}</div></span></button>`).join('')+'</div>';
}
async function chapter(j,push=true){
  if(push)N.push(()=>prophet(pi,false));
  ci=j;const p=list[pi],c=p.c[j],[t,s,a,b]=c;
  root.innerHTML=`<div class="stb"><button class="ib" data-back="1">→</button><b>${p.n}</b></div><div class="err">جارٍ التحميل…</div>`;
  let d;try{d=await N.surah(s)}catch{root.innerHTML+='<div class="err">تعذّر التحميل</div>';return}
  const m=N.IDX()[s-1];let v='',tf='';
  for(let i=a;i<=b;i++){v+=`<span>${d.a[i-1]}<span class="e"> ﴿${N.ar(i)}﴾</span></span> `;tf+=`<p><span class="e">﴿${N.ar(i)}﴾</span> ${esc(d.t[i-1])}</p>`}
  const pv=j>0,nx=j<p.c.length-1;
  root.innerHTML=`<div class="stb"><button class="ib" data-back="1">→</button><b>${p.n}</b></div>
  <div class="rhead" style="padding-top:6px"><div class="title" style="font-size:22px">${t}</div><div class="meta">سورة ${m.name} · الآيات ${N.ar(a)}–${N.ar(b)} · الفصل ${N.ar(j+1)} من ${N.ar(p.c.length)}</div></div>
  <div class="stx">${v}</div>
  <details class="tfd"><summary>التفسير الميسّر</summary>${tf}</details>
  <div class="row stn"><button data-sp="1" ${pv?'':'disabled'}>▶ السابق</button><button data-sn="1" ${nx?'':'disabled'}>التالي ◀</button></div>
  <div class="row stn"><button data-sopen="${s}:${a}">📖 افتح في المصحف</button><button data-sshare="1">📤 مشاركة</button></div>`;
  window.scrollTo(0,0);
}
root.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.back)return N.pop();
  if(b.dataset.p!==undefined)return prophet(+b.dataset.p);
  if(b.dataset.c!==undefined)return chapter(+b.dataset.c);
  if(b.dataset.sp)return chapter(ci-1,false);
  if(b.dataset.sn)return chapter(ci+1,false);
  if(b.dataset.sopen){const [s,a]=b.dataset.sopen.split(':');return N.open(+s,+a)}
  if(b.dataset.sshare){
    const c=list[pi].c[ci],d=await N.surah(c[1]),m=N.IDX()[c[1]-1];
    let x=list[pi].n+' — '+c[0]+'\n\n';for(let i=c[2];i<=c[3];i++)x+=d.a[i-1]+' ﴿'+N.ar(i)+'﴾ ';
    x+='\n\n— سورة '+m.name+'، الآيات '+N.ar(c[2])+'–'+N.ar(c[3])+'\n\n🤍 من بوت سكينة';
    const u='https://t.me/share/url?url='+encodeURIComponent('https://t.me/Sakina_YMnotes_bot')+'&text='+encodeURIComponent(x);
    return N.tg&&N.tg.openTelegramLink?N.tg.openTelegramLink(u):window.open(u,'_blank');
  }
});
N.mods.stories={async show(){await ensure();if(!root.dataset.ready){root.dataset.ready=1;listView()}}};
})();
