/* Własny generator kodów QR (ISO/IEC 18004): tryb bajtowy UTF-8, poziom M albo Q, wersje 1–10,
   wybór maski według punktów karnych. QR.matrix(tekst) zwraca macierz, QR.svg(tekst) rysunek SVG.
   Zweryfikowany dekoderem jsQR na wszystkich wersjach. */
// @ts-nocheck
export const QR=(()=>{
 // [kody korekcyjne na blok, [liczba bloków, kody danych w bloku], ...] dla wersji 1–10
 const T={
  M:[null,[10,[1,16]],[16,[1,28]],[26,[1,44]],[18,[2,32]],[24,[2,43]],[16,[4,27]],[18,[4,31]],[22,[2,38],[2,39]],[22,[3,36],[2,37]],[26,[4,43],[1,44]]],
  Q:[null,[13,[1,13]],[22,[1,22]],[18,[2,17]],[26,[2,24]],[18,[2,15],[2,16]],[24,[4,19]],[18,[2,14],[4,15]],[22,[4,18],[2,19]],[20,[4,16],[4,17]],[24,[6,19],[2,20]]]
 };
 const ECL_BITS={L:1,M:0,Q:3,H:2};
 const ALIGN=[null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];

 // arytmetyka w GF(256), wielomian x^8+x^4+x^3+x^2+1
 const EXP=new Array(512),LOG=new Array(256);
 {let x=1;for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11D}for(let i=255;i<512;i++)EXP[i]=EXP[i-255]}
 const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;
 function generator(n){let g=[1];for(let i=0;i<n;i++){const r=new Array(g.length+1).fill(0);g.forEach((c,j)=>{r[j]^=c;r[j+1]^=mul(c,EXP[i])});g=r}return g}
 function rsRemainder(data,n){const g=generator(n),r=data.concat(new Array(n).fill(0));for(let i=0;i<data.length;i++){const f=r[i];if(f)for(let j=0;j<g.length;j++)r[i+j]^=mul(g[j],f)}return r.slice(data.length)}

 function utf8(s){return Array.from(new TextEncoder().encode(s))}
 function capacity(v,ecl){const t=T[ecl][v];return t.slice(1).reduce((s,[n,k])=>s+n*k,0)}

 function encodeData(bytes,v,ecl){
  const cap=capacity(v,ecl),bits=[];
  const put=(val,len)=>{for(let i=len-1;i>=0;i--)bits.push((val>>>i)&1)};
  put(4,4);put(bytes.length,v<10?8:16);bytes.forEach(b=>put(b,8));
  put(0,Math.min(4,cap*8-bits.length));
  while(bits.length%8)bits.push(0);
  const out=[];for(let i=0;i<bits.length;i+=8)out.push(parseInt(bits.slice(i,i+8).join(''),2));
  for(let p=0;out.length<cap;p^=1)out.push(p?0x11:0xEC);
  // podział na bloki, korekcja błędów i przeplot
  const t=T[ecl][v],ecn=t[0],blocks=[];let k=0;
  t.slice(1).forEach(([n,len])=>{for(let i=0;i<n;i++){const d=out.slice(k,k+len);k+=len;blocks.push({d,e:rsRemainder(d,ecn)})}});
  const res=[],maxD=Math.max(...blocks.map(b=>b.d.length));
  for(let i=0;i<maxD;i++)blocks.forEach(b=>{if(i<b.d.length)res.push(b.d[i])});
  for(let i=0;i<ecn;i++)blocks.forEach(b=>res.push(b.e[i]));
  return res;
 }

 function build(codewords,v,ecl,mask){
  const N=17+4*v,M=[],F=[];
  for(let y=0;y<N;y++){M.push(new Array(N).fill(false));F.push(new Array(N).fill(false))}
  const set=(x,y,d)=>{if(x>=0&&y>=0&&x<N&&y<N){M[y][x]=d;F[y][x]=true}};
  const finder=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy));set(cx+dx,cy+dy,d!==2&&d!==4)}};
  finder(3,3);finder(N-4,3);finder(3,N-4);
  for(let i=0;i<N;i++){if(!F[6][i])set(i,6,i%2===0);if(!F[i][6])set(6,i,i%2===0)}
  const al=ALIGN[v];
  al.forEach((ay,i)=>al.forEach((ax,j)=>{if((i===0&&j===0)||(i===0&&j===al.length-1)||(i===al.length-1&&j===0))return;
   for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(ax+dx,ay+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}));
  const fmt=bits=>{
   for(let i=0;i<=5;i++)set(8,i,(bits>>i)&1);
   set(8,7,(bits>>6)&1);set(8,8,(bits>>7)&1);set(7,8,(bits>>8)&1);
   for(let i=9;i<15;i++)set(14-i,8,(bits>>i)&1);
   for(let i=0;i<8;i++)set(N-1-i,8,(bits>>i)&1);
   for(let i=8;i<15;i++)set(8,N-15+i,(bits>>i)&1);
   set(8,N-8,true);
  };
  const fmtBits=m=>{const d=(ECL_BITS[ecl]<<3)|m;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);return ((d<<10)|r)^0x5412};
  fmt(fmtBits(0));
  if(v>=7){let r=v;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(v<<12)|r;
   for(let i=0;i<18;i++){const d=(b>>i)&1,a=N-11+i%3,c=Math.floor(i/3);set(a,c,d);set(c,a,d)}}
  // dane zygzakiem od prawego dolnego rogu
  let bi=0;const total=codewords.length*8;
  for(let right=N-1;right>=1;right-=2){
   if(right===6)right=5;
   for(let vert=0;vert<N;vert++)for(let j=0;j<2;j++){
    const x=right-j,up=((right+1)&2)===0,y=up?N-1-vert:vert;
    if(!F[y][x]){M[y][x]=bi<total?((codewords[bi>>>3]>>>(7-(bi&7)))&1)===1:false;bi++}
   }
  }
  const MASKS=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,
   (x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
  const apply=m=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!F[y][x]&&MASKS[m](x,y))M[y][x]=!M[y][x]};
  if(mask==null){
   let best=0,bestP=Infinity;
   for(let m=0;m<8;m++){apply(m);fmt(fmtBits(m));const p=penalty(M);if(p<bestP){bestP=p;best=m}apply(m)}
   mask=best;
  }
  apply(mask);fmt(fmtBits(mask));
  return M;
 }

 function penalty(M){
  const N=M.length;let p=0,dark=0;
  const line=get=>{let run=1,prev=get(0);for(let i=1;i<N;i++){const c=get(i);if(c===prev){run++;if(run===5)p+=3;else if(run>5)p++}else{run=1;prev=c}}
   for(let i=0;i+10<N;i++){const s=[...Array(11)].map((_,k)=>get(i+k)?1:0).join('');if(s==='10111010000'||s==='00001011101')p+=40}};
  for(let y=0;y<N;y++){line(i=>M[y][i]);line(i=>M[i][y])}
  for(let y=0;y<N-1;y++)for(let x=0;x<N-1;x++){const c=M[y][x];if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1])p+=3}
  M.forEach(r=>r.forEach(c=>{if(c)dark++}));
  p+=Math.floor(Math.abs(dark*20-N*N*10)/(N*N))*10;
  return p;
 }

 function matrix(text,ecl='M'){
  const bytes=utf8(text);
  for(let v=1;v<=10;v++){
   const need=4+(v<10?8:16)+bytes.length*8;
   if(need<=capacity(v,ecl)*8)return build(encodeData(bytes,v,ecl),v,ecl);
  }
  throw new Error('Za długi tekst dla kodu QR');
 }

 // rysunek: zaokrąglone moduły, wyróżnione narożniki, opcjonalnie godło w środku (wymaga poziomu Q)
 function svg(text,o={}){
  const ecl=o.logo?'Q':(o.ecl||'M'),M=matrix(text,ecl),N=M.length,q=o.quiet==null?2:o.quiet,S=N+2*q;
  const inFinder=(x,y)=>(x<7&&y<7)||(x>=N-7&&y<7)||(x<7&&y>=N-7);
  const c=(N-1)/2,lr=o.logo?Math.ceil(N*0.12):0;
  const inLogo=(x,y)=>lr&&Math.abs(x-c)<=lr&&Math.abs(y-c)<=lr;
  let d='';
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const on=xx=>xx<N&&M[y][xx]&&!inFinder(xx,y)&&!inLogo(xx,y);if(!on(x)||(x>0&&on(x-1)))continue;let w=1;while(on(x+w))w++;d+=`M${x+q} ${y+q}h${w}v1h-${w}z`}
  const fin=(x,y)=>`<rect x="${x+q+.5}" y="${y+q+.5}" width="6" height="6" rx="1.6" fill="none" stroke="${o.color||'#111'}" stroke-width="1"/><rect x="${x+q+2}" y="${y+q+2}" width="3" height="3" rx=".8"/>`;
  const logo=lr?`<rect x="${c-lr+q+.1}" y="${c-lr+q+.1}" width="${2*lr+.8}" height="${2*lr+.8}" rx="1.4" fill="${o.bg||'#fff'}"/>`:'';
  const xml=`<svg viewBox="0 0 ${S} ${S}" fill="${o.color||'#111'}">${o.bg?`<rect width="${S}" height="${S}" rx="2" fill="${o.bg}"/>`:''}<path d="${d}"/>${fin(0,0)}${fin(N-7,0)}${fin(0,N-7)}${logo}</svg>`;
  return {xml,logo:lr?{x:(c-lr+q+.7)/S,w:(2*lr-.4)/S}:null};
 }
 return {matrix,svg};
})();
