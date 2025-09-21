
const TELEGRAM = "https://t.me/merxio_manager";

async function loadProducts(){
  const res = await fetch('data/products.json', {cache:'no-store'});
  return await res.json();
}

const euro = n => new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n);

function makeCard(p){
  const el=document.createElement('article');
  el.className='card reveal';
  const img=(p.images&&p.images[0])?p.images[0]:'images/hero.jpg';
  el.innerHTML=`
    <img src="${img}" alt="${p.title}">
    <div class="body">
      <div class="title">${p.title}</div>
      <div class="meta">${(p.materials||[]).join(' / ')}</div>
      <div class="row">
        <span>${euro(p.price)}</span>
        <a class="cta" href="product.html?id=${encodeURIComponent(p.id)}">View</a>
      </div>
    </div>`;
  return el;
}

function applyReveals(){
  const io=new IntersectionObserver((en)=>{
    en.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}

async function renderCatalog(){
  const wrap=document.getElementById('catalog-grid'); if(!wrap) return;
  const items=await loadProducts();
  const shapeSel=document.getElementById('f-shape');
  const sizeSel=document.getElementById('f-size');

  function pass(p){
    let ok=true;
    if(shapeSel && shapeSel.value && p.shape!==shapeSel.value) ok=false;
    if(sizeSel && sizeSel.value && p.size!==sizeSel.value) ok=false;
    return ok;
  }
  function draw(){
    wrap.innerHTML='';
    items.filter(pass).forEach(p=>wrap.appendChild(makeCard(p)));
    applyReveals();
  }
  shapeSel && shapeSel.addEventListener('change', draw);
  sizeSel && sizeSel.addEventListener('change', draw);
  draw();
}

async function renderFeatured(){
  const wrap=document.getElementById('featured-grid'); if(!wrap) return;
  const items=await loadProducts();
  wrap.innerHTML='';
  items.filter(p=>p.featured).slice(0,6).forEach(p=>wrap.appendChild(makeCard(p)));
  applyReveals();
}

async function renderProduct(){
  const params=new URLSearchParams(location.search);
  const id=params.get('id'); if(!id) return;
  const items=await loadProducts();
  const p=items.find(x=>x.id===id); if(!p) return;

  document.querySelector('[data-p-title]').textContent=p.title;
  document.querySelector('[data-p-meta]').textContent=`${(p.materials||[]).join(' / ')} · Handmade`;

  const g=document.getElementById('gallery'); g.innerHTML='';
  (p.images||[]).forEach(src=>{
    const a=document.createElement('a'); a.href='#'; a.onclick=(e)=>{e.preventDefault(); openLightbox(src)};
    const i=document.createElement('img'); i.src=src; i.alt=p.title;
    a.appendChild(i); g.appendChild(a);
  });

  const priceEl=document.querySelector('[data-p-price]');
  const sizeSel=document.getElementById('p-size');
  const base=p.price;
  const map={'Ø120':1,'120×170':1.2,'140×200':1.4,'160×230':1.6};
  function upd(){ const k=map[sizeSel.value]||1; priceEl.textContent=euro(Math.round(base*k)); }
  sizeSel.value=p.size || '120×170'; upd(); sizeSel.addEventListener('change', upd);

  document.querySelectorAll('[data-telegram]').forEach(a=> a.href=TELEGRAM);
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('[data-telegram]').forEach(a=> a.href=TELEGRAM);
  renderFeatured(); renderCatalog(); renderProduct(); applyReveals();
});
