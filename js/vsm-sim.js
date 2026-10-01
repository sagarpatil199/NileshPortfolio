/* ===== Live VSM simulation: Preisach hysteresis model =====
   600 magnetic "hysterons" (grains), each with its own switching fields.
   Starting demagnetised, the sweep traces the virgin curve, then the full loop. */
(function(){
  const cv=document.getElementById('mh'), dv=document.getElementById('dom');
  if(!cv) return;
  const ctx=cv.getContext('2d'), dctx=dv.getContext('2d');
  const rH=document.getElementById('rH'), rM=document.getElementById('rM'), rB=document.getElementById('rB'), rS=document.getElementById('rS');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gauss=()=>{let u=0;while(!u)u=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*Math.random());};

  const N=600, hys=[];
  for(let i=0;i<N;i++){
    const hc=Math.max(.03,.26+.09*gauss()), hu=.05*gauss();
    hys.push({up:hc+hu, dn:-hc+hu, s:1});
  }
  const cols=18, rows=3;
  const spins=hys.slice(0,cols*rows).map(h=>({h, a:0, j:Math.random()*6.28}));
  function demag(){ hys.forEach(h=>h.s=Math.random()<.5?1:-1); spins.forEach(s=>s.a=s.h.s>0?0:Math.PI); }
  function applyH(H){
    let sum=0;
    for(const h of hys){ if(H>=h.up) h.s=1; else if(H<=h.dn) h.s=-1; sum+=h.s; }
    return .82*sum/N + .18*Math.tanh(H/.35); // irreversible + reversible rotation
  }

  const segs=[{f:0,t:1,d:2.4,n:'virgin'},{f:1,t:-1,d:4.2,n:'descending'},{f:-1,t:1,d:4.2,n:'ascending'},
              {f:1,t:-1,d:4.2,n:'descending'},{f:-1,t:1,d:4.2,n:'ascending'}];
  const HOLD=1.6, FADE=.9, TOTAL=segs.reduce((a,s)=>a+s.d,0)+HOLD+FADE;
  let pts=[], lastH=null, start=null, W=0, HH=0, DW=0, DH=0;

  function size(){
    const dpr=Math.min(2,window.devicePixelRatio||1);
    cv.width=1; dv.width=1; // release intrinsic width before measuring
    W=cv.clientWidth; HH=Math.round(W*.66); cv.style.height=HH+'px';
    cv.width=W*dpr; cv.height=HH*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    DW=dv.clientWidth; DH=Math.max(48,Math.round(DW/cols*rows*.62)); dv.style.height=DH+'px';
    dv.width=DW*dpr; dv.height=DH*dpr; dctx.setTransform(dpr,0,0,dpr,0,0);
  }
  // Theme colours, read once and refreshed when the colour scheme changes
  let C={};
  function readColors(){
    const cs=getComputedStyle(document.documentElement), v=n=>cs.getPropertyValue(n).trim();
    C={ink:v('--ink'),muted:v('--muted'),line:v('--line'),a:v('--accent'),b:v('--accent-2'),card:v('--card')};
  }

  function stateAt(t){
    let acc=0;
    for(const s of segs){ if(t<acc+s.d){ const p=(t-acc)/s.d; return {H:s.f+(s.t-s.f)*(.5-.5*Math.cos(Math.PI*p)), seg:s}; } acc+=s.d; }
    return {H:1, seg:null};
  }

  function draw(H,M,seg,alpha){
    const pl=40,pr=12,pt=12,pb=28, X=h=>pl+(h+1.15)/2.3*(W-pl-pr), Y=m=>pt+(1.15-m)/2.3*(HH-pt-pb);
    ctx.clearRect(0,0,W,HH);
    // grid
    ctx.strokeStyle=C.line; ctx.lineWidth=1;
    for(let g=-1;g<=1.001;g+=.25){ ctx.beginPath();ctx.moveTo(X(g),pt);ctx.lineTo(X(g),HH-pb);ctx.stroke(); ctx.beginPath();ctx.moveTo(pl,Y(g));ctx.lineTo(W-pr,Y(g));ctx.stroke(); }
    // axes
    ctx.strokeStyle=C.muted; ctx.globalAlpha=.8;
    ctx.beginPath();ctx.moveTo(pl,Y(0));ctx.lineTo(W-pr,Y(0));ctx.moveTo(X(0),pt);ctx.lineTo(X(0),HH-pb);ctx.stroke();
    ctx.globalAlpha=1; ctx.fillStyle=C.muted; ctx.font='10px "JetBrains Mono",monospace';
    ctx.textAlign='center'; [[-1,'−10'],[0,'0'],[1,'+10']].forEach(([v,l])=>ctx.fillText(l,X(v),HH-pb+14));
    ctx.fillText('H (kOe)',X(.62),HH-pb+14);
    ctx.textAlign='right'; [[1,'+48'],[-1,'−48']].forEach(([v,l])=>ctx.fillText(l,pl-6,Y(v)+3));
    ctx.save();ctx.translate(12,Y(.45));ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('M (emu/g)',0,0);ctx.restore();

    // measured points
    ctx.globalAlpha=alpha;
    ctx.lineWidth=1.4;
    for(let i=1;i<pts.length;i++){
      const p=pts[i],q=pts[i-1]; if(p.n!==q.n) continue;
      ctx.strokeStyle=p.n==='descending'?C.a:p.n==='ascending'?C.b:C.muted;
      ctx.globalAlpha=alpha*.45; ctx.beginPath();ctx.moveTo(X(q.H),Y(q.M));ctx.lineTo(X(p.H),Y(p.M));ctx.stroke();
    }
    ctx.globalAlpha=alpha;
    for(const p of pts){
      ctx.fillStyle=p.n==='descending'?C.a:p.n==='ascending'?C.b:C.muted;
      ctx.beginPath();ctx.arc(X(p.H),Y(p.Mn),1.9,0,6.283);ctx.fill();
    }
    // live probe
    if(alpha>.5){
      const x=X(H),y=Y(M);
      ctx.setLineDash([3,4]);ctx.strokeStyle=C.muted;ctx.globalAlpha=.6;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,Y(0));ctx.moveTo(x,y);ctx.lineTo(X(0),y);ctx.stroke();ctx.setLineDash([]);
      const col=seg&&seg.n==='descending'?C.a:seg&&seg.n==='ascending'?C.b:C.ink;
      const g=ctx.createRadialGradient(x,y,0,x,y,16);g.addColorStop(0,col);g.addColorStop(1,'transparent');
      ctx.globalAlpha=.35;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,16,0,6.283);ctx.fill();
      ctx.globalAlpha=1;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,4.5,0,6.283);ctx.fill();
      ctx.strokeStyle=C.card;ctx.lineWidth=1.5;ctx.stroke();
    }
    ctx.globalAlpha=1;

    // domains
    dctx.clearRect(0,0,DW,DH);
    const cw=DW/cols, ch=DH/rows, now=performance.now()/1000;
    spins.forEach((s,i)=>{
      const target=s.h.s>0?0:Math.PI; s.a+=(target-s.a)*(reduce?1:.14);
      const cx=(i%cols+.5)*cw, cy=(Math.floor(i/cols)+.5)*ch, ang=s.a+(reduce?0:Math.sin(now*3+s.j)*.12), L=Math.min(cw,ch)*.34;
      const up=Math.cos(s.a);
      dctx.strokeStyle=up>0?C.b:C.a; dctx.fillStyle=dctx.strokeStyle; dctx.globalAlpha=.55+.45*Math.abs(up); dctx.lineWidth=1.8;
      const dx=Math.cos(ang)*L, dy=Math.sin(ang)*L*.35;
      dctx.beginPath();dctx.moveTo(cx-dx,cy-dy);dctx.lineTo(cx+dx,cy+dy);dctx.stroke();
      const hx=cx+dx,hy=cy+dy,a2=Math.atan2(dy,dx);
      dctx.beginPath();dctx.moveTo(hx,hy);dctx.lineTo(hx-6*Math.cos(a2-.5),hy-6*Math.sin(a2-.5));dctx.lineTo(hx-6*Math.cos(a2+.5),hy-6*Math.sin(a2+.5));dctx.closePath();dctx.fill();
    });
    dctx.globalAlpha=1;

    rH.textContent=(H>=0?'+':'−')+Math.abs(H*10).toFixed(2);
    rM.textContent=(M>=0?'+':'−')+Math.abs(M*48).toFixed(2);
    rB.textContent=seg?(seg.t>seg.f?'↑':'↓'):'■';
    rS.textContent=seg?seg.n:'hold';
  }

  function record(H,M,seg){
    if(lastH===null||Math.abs(H-lastH)>.018){ pts.push({H,M,Mn:M+.012*gauss(),n:seg.n}); lastH=H; }
  }

  function frame(ts){
    if(start===null){ start=ts; demag(); pts=[]; lastH=null; }
    const t=(ts-start)/1000;
    if(t>TOTAL){ start=null; raf=requestAnimationFrame(frame); return; }
    const {H,seg}=stateAt(t);
    const M=applyH(H);
    if(seg) record(H,M,seg);
    const end=TOTAL-FADE, alpha=t>end?Math.max(0,1-(t-end)/FADE):1;
    draw(H,M,seg,alpha);
    raf=requestAnimationFrame(frame);
  }

  // Run only while the figure is on screen and the tab is visible;
  // shift the start time on resume so the sweep continues where it left off.
  let raf=0, pausedAt=null, onScreen=true;
  function play(){
    if(raf||reduce||document.hidden||!onScreen) return;
    if(pausedAt!==null&&start!==null) start+=performance.now()-pausedAt;
    pausedAt=null; raf=requestAnimationFrame(frame);
  }
  function pause(){
    if(!raf) return;
    cancelAnimationFrame(raf); raf=0; pausedAt=performance.now();
  }
  const drawStatic=()=>draw(1,applyH(1),null,1);

  readColors();
  size();
  // Resize only when the width actually changes (mobile address-bar
  // show/hide fires resize too), at most once per frame.
  let rq=0;
  window.addEventListener('resize',()=>{
    if(rq) return;
    rq=requestAnimationFrame(()=>{ rq=0; if(cv.clientWidth===W) return; size(); if(reduce) drawStatic(); });
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{ readColors(); if(reduce) drawStatic(); });

  if(reduce){
    demag(); let tt=0;
    while(tt<TOTAL-HOLD-FADE){ const s=stateAt(tt); const M=applyH(s.H); record(s.H,M,s.seg); tt+=.02; }
    drawStatic();
  } else {
    document.addEventListener('visibilitychange',()=>document.hidden?pause():play());
    if('IntersectionObserver' in window){
      new IntersectionObserver(([e])=>{ onScreen=e.isIntersecting; onScreen?play():pause(); }).observe(cv.closest('figure'));
    }
    play();
  }
})();
