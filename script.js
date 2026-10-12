(() => {
  const root=document.getElementById('lookin-premiere');
  if(!root)return;
  const galleryAssets={"monument": "./assets/lookin-hero-monument.jpg", "gloss": "./assets/lookin-hero-gloss.jpg", "film": "./assets/lookin-film-machine.jpg", "cgi": "./assets/lookin-cgi.jpg"};
  const heroImage=root.querySelector('.lp-hero-image');
  const heroAssets={monument:galleryAssets.monument,gloss:galleryAssets.gloss};
  const heroDescriptions={monument:'Фантастический монолит с алым световым разрезом над вулканической пустыней',gloss:'Гигантская хромированная конструкция над тёмным отражающим бассейном'};
  root.querySelectorAll('[data-hero]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.hero;
    heroImage.src=heroAssets[key];heroImage.alt=heroDescriptions[key];
    root.querySelectorAll('[data-hero]').forEach(peer=>peer.setAttribute('aria-pressed',String(peer===button)));
    try { localStorage.setItem('lookin-hero',key); } catch {}
  }));
  let savedHero='gloss';
  try { savedHero=localStorage.getItem('lookin-hero')||'gloss'; } catch {}
  if(savedHero&&heroAssets[savedHero]){heroImage.src=heroAssets[savedHero];heroImage.alt=heroDescriptions[savedHero];root.querySelectorAll('[data-hero]').forEach(peer=>peer.setAttribute('aria-pressed',String(peer.dataset.hero===savedHero)));}
  root.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{
    root.querySelectorAll('[data-category]').forEach(peer=>peer.setAttribute('aria-pressed',String(peer===button)));
    root.querySelectorAll('[data-work-category]').forEach(card=>{card.hidden=button.dataset.category!=='all'&&card.dataset.workCategory!==button.dataset.category;});
    root.querySelectorAll('.lp-inspector').forEach(panel=>panel.remove());
  }));
  root.querySelectorAll('.lp-image-open').forEach(button=>button.addEventListener('click',()=>{
    root.querySelectorAll('.lp-inspector').forEach(panel=>panel.remove());
    const card=button.closest('figure'),image=button.querySelector('img');
    const panel=document.createElement('div');panel.className='lp-inspector';
    const heading=document.createElement('div');heading.className='lp-inspector-heading';
    const label=document.createElement('span');label.className='lp-mono';label.textContent='Визуальный концепт / полный кадр';
    const close=document.createElement('button');close.type='button';close.className='cursor-interaction';close.textContent='Закрыть ×';
    close.addEventListener('click',()=>{panel.remove();button.focus({preventScroll:true});});
    heading.append(label,close);panel.append(heading,image.cloneNode(true));card.append(panel);close.focus({preventScroll:true});
  }));

  const canvases=Array.from(root.querySelectorAll('.lp-wordmark canvas'));
  const settings={ink:'#f2e9d8',accent:'#ee4029',density:0.80};
  const cache=new Map();
  const font='400 100px "Anton", "Impact", "Arial Black", sans-serif';
  function paint(canvas,word,stroke,gap,color){
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.resetTransform();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.font=font;ctx.textBaseline='alphabetic';
    const gs=Array.from(word).map(letter=>({letter,m:ctx.measureText(letter)}));
    const total=gs.reduce((sum,g)=>sum+g.m.actualBoundingBoxLeft+g.m.actualBoundingBoxRight+stroke,0);
    const ascent=Math.max(...gs.map(g=>g.m.actualBoundingBoxAscent)),descent=Math.max(...gs.map(g=>g.m.actualBoundingBoxDescent));
    const sx=(canvas.width-2-gap*(gs.length-1))/total,sy=(canvas.height-2)/(ascent+descent+stroke);let x=1;
    gs.forEach(({letter,m})=>{ctx.save();ctx.translate(x,1);ctx.scale(sx,sy);ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=stroke;ctx.lineJoin='miter';const ox=m.actualBoundingBoxLeft+stroke/2,oy=ascent+stroke/2;if(stroke>0)ctx.strokeText(letter,ox,oy);ctx.fillText(letter,ox,oy);ctx.restore();x+=(m.actualBoundingBoxLeft+m.actualBoundingBoxRight+stroke)*sx+gap;});
  }
  function correct(word,ratio){const key=word+ratio.toFixed(2);if(cache.has(key))return cache.get(key);const c=document.createElement('canvas');c.width=400;c.height=Math.max(60,Math.round(400/ratio));let lo=0,hi=20;for(let step=0;step<9;step++){const mid=(lo+hi)/2;paint(c,word,mid,0,'#000000');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let ink=0;for(let j=3;j<d.length;j+=4)ink+=d[j]/255;if(ink/(c.width*c.height)<settings.density)lo=mid;else hi=mid;}const value=(lo+hi)/2;cache.set(key,value);return value;}
  function draw(){root.style.setProperty('--lp-ivory',settings.ink);root.style.setProperty('--lp-red',settings.accent);canvases.forEach((c,i)=>{const r=c.parentElement.getBoundingClientRect();if(!r.width||!r.height)return;const d=window.devicePixelRatio||1;c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);paint(c,['LOOK','IN'][i],correct(['LOOK','IN'][i],r.width/r.height),3*d,settings.ink);});}
  draw();const ro=new ResizeObserver(draw);canvases.forEach(c=>ro.observe(c.parentElement));
  if(document.fonts){const refresh=()=>{cache.clear();draw();};document.fonts.load('400 100px "Anton"','LOOKIN').then(refresh).catch(()=>{});document.fonts.ready.then(refresh);}
  const start=root.querySelector('.lp-contact-title button'),form=root.querySelector('form');
  start.addEventListener('click',()=>{const expanded=start.getAttribute('aria-expanded')==='true';start.setAttribute('aria-expanded',String(!expanded));form.hidden=expanded;if(!expanded)form.querySelector('input').focus({preventScroll:true});});
  form.addEventListener('submit',event=>event.preventDefault());
  form.querySelector('.lp-prepare').addEventListener('click',()=>{if(!form.reportValidity())return;const data=new FormData(form);const value='LOOKIN — проект\n\nИмя / бренд: '+data.get('name')+'\nКонтакт: '+data.get('contact')+'\n\nИдея:\n'+data.get('idea');const draft=root.querySelector('.lp-draft');draft.hidden=false;const output=draft.querySelector('textarea');output.value=value;output.focus();output.select();root.querySelector('.lp-status').textContent='Бриф готов. Скопируйте выделенный текст. Данные никуда не отправлены.';});
})();
