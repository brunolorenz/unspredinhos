/* ═════ Uns Predinhos · Predinho do Dia — funções compartilhadas entre as páginas ═════ */

/* Contatos e links — troque aqui e muda no site inteiro */
const LINKS = {
  instagram: 'https://instagram.com/unspredinhos',
  loja: 'https://www.brunolorenz.com.br',
  whats: '5551993115340',
  galeria: 'https://brunolorenz.github.io/unspredinhos/galeria/',
  calendario: 'https://www.brunolorenz.com.br/product-page/calend%C3%A1rio-2026-predinho-do-dia',
  reproducao: 'https://www.brunolorenz.com.br/product-page/predinho-do-dia-reprodu%C3%A7%C3%A3o-individual',
  orcamento: 'https://brunolorenz.github.io/orcamento/',
};

const RC = {'Sul':'#3B82F6','Sudeste':'#FFD93B','Nordeste':'#FF7A59','Centro Oeste':'#34D399','Norte':'#A78BFA'};
const REG_NOME = {'Centro Oeste':'Centro-Oeste'};
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const MESES_T = MESES.map(m => m[0].toUpperCase() + m.slice(1));
const MESES_ABR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const SEMANA = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const UF_NOME = {AC:'Acre',AL:'Alagoas',AM:'Amazonas',AP:'Amapá',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MG:'Minas Gerais',MS:'Mato Grosso do Sul',MT:'Mato Grosso',PA:'Pará',PB:'Paraíba',PE:'Pernambuco',PI:'Piauí',PR:'Paraná',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RO:'Rondônia',RR:'Roraima',RS:'Rio Grande do Sul',SC:'Santa Catarina',SE:'Sergipe',SP:'São Paulo',TO:'Tocantins'};
const SR = {};
Object.entries({Sul:['RS','SC','PR'],Sudeste:['SP','RJ','MG','ES'],Nordeste:['BA','PE','CE','MA','RN','PB','AL','SE','PI'],'Centro Oeste':['MS','MT','GO','DF'],Norte:['PA','AM','AC','RO','RR','AP','TO']})
  .forEach(([r,ufs]) => ufs.forEach(u => SR[UF_NOME[u]] = r));

const pad = n => String(n).padStart(2,'0');
const fmt = n => Math.round(n).toLocaleString('pt-BR');

/* Lista principal, em ordem do calendário */
const P = PREDINHOS.map((p,i) => ({
  ...p, i, n:i+1,
  key:`${p.d}-${p.m}`,
  dia:`${pad(p.d)}/${pad(p.m)}`,
  impossivel: p.m===2 && p.d>28,   // 2026 não é bissexto: 29 e 31 de fevereiro só existem como rua
}));
const BY = {}; P.forEach(p => BY[p.key] = p);

function dataExtenso(p){ return `${p.d===1?'1º':p.d} de ${MESES[p.m-1]}`; }
function diaSemana(p){ return p.impossivel ? 'um dia que não existe no calendário' : SEMANA[new Date(2026,p.m-1,p.d).getDay()]; }
function diaHref(p){ return `dia.html#${p.d}-${p.m}`; }

function hav(a,b){
  const R=6371,t=Math.PI/180,dl=(b.lat-a.lat)*t,dn=(b.lng-a.lng)*t;
  const h=Math.sin(dl/2)**2+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(dn/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
P.forEach((p,i) => { p.salto = i ? hav(P[i-1],p) : 0; });

/* ── Imagens ──
   As aquarelas ficam no Google Drive. Enquanto a imagem carrega (ou se não carregar),
   aparece um predinho desenhado em código, na cor da região, para a página nunca ficar vazia. */
function imgURL(p,w=600){ return p.img ? `https://lh3.googleusercontent.com/d/${p.img}=w${w}` : ''; }

function rnd(seed){ let a = (seed * 2654435761) >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FACHADAS = ['#F6C8B8','#FBE3A1','#BFD8F5','#CDEBD9','#E3D5FB','#F7DCC6','#FFF1C9','#D7E9F7'];

function predinhoSVG(p){
  const r = rnd(p.d*97 + p.m*1013 + 11), c = RC[p.regiao] || '#ccc';
  const andares = 1 + Math.floor(r()*4), cols = 2 + Math.floor(r()*3);
  const W = 56 + cols*20, fh = 30, H = andares*fh + 34;
  const x0 = (200-W)/2, base = 222, top = base - H;
  const cor = FACHADAS[Math.floor(r()*FACHADAS.length)];
  const telhado = r() < .45;
  let s = `<svg viewBox="0 0 200 256" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
  s += `<rect width="200" height="256" fill="${c}" opacity=".22"/>`;
  s += `<circle cx="${40 + r()*120}" cy="${30 + r()*25}" r="16" fill="${c}" opacity=".45"/>`;
  s += `<rect x="0" y="${base}" width="200" height="${256-base}" fill="#EFE9D6"/>`;
  s += `<line x1="0" y1="${base}" x2="200" y2="${base}" stroke="#111" stroke-width="2.5"/>`;
  if(telhado) s += `<path d="M${x0-8} ${top} L100 ${top-30} L${x0+W+8} ${top} Z" fill="${c}" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += `<rect x="${x0}" y="${top}" width="${W}" height="${H}" fill="${cor}" stroke="#111" stroke-width="2.5"/>`;
  if(!telhado) s += `<rect x="${x0-5}" y="${top-12}" width="${W+10}" height="14" fill="#fff" stroke="#111" stroke-width="2.5"/>`;
  const jw = 13, gap = (W - cols*jw) / (cols+1);
  for(let a=0; a<andares; a++){
    for(let k=0; k<cols; k++){
      const x = x0 + gap + k*(jw+gap), y = top + 8 + a*fh;
      if(a===andares-1 && k===Math.floor((cols-1)/2)) continue;
      s += `<rect x="${x}" y="${y}" width="${jw}" height="17" rx="${r()<.3?6:1}" fill="#fff" stroke="#111" stroke-width="2"/>`;
    }
  }
  const dx = x0 + W/2 - 9;
  s += `<rect x="${dx}" y="${base-30}" width="18" height="30" fill="${c}" stroke="#111" stroke-width="2.5"/>`;
  s += `<text x="12" y="248" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="15" fill="#111">${p.dia}</text>`;
  return s + `</svg>`;
}

function pic(p, w=600, cls=''){
  const u = imgURL(p,w);
  return `<div class="pic ${cls}">${predinhoSVG(p)}${u ? `<img loading="lazy" decoding="async" src="${u}" alt="Aquarela do predinho de ${dataExtenso(p)}, ${p.rua}, ${p.cidade}/${p.uf}" onload="this.parentElement.classList.add('ok')" onerror="this.remove()">` : ''}</div>`;
}

/* ── Números do conjunto ── */
function stats(list){
  let km = 0, maior = {d:0};
  for(let i=1;i<list.length;i++){ const d = hav(list[i-1],list[i]); km += d; if(d>maior.d) maior = {d, de:list[i-1], para:list[i]}; }
  return {
    total:list.length, km, maior,
    estados:new Set(list.map(p=>p.uf)).size,
    cidades:new Set(list.map(p=>p.cidade+'/'+p.uf)).size,
    regioes:new Set(list.map(p=>p.regiao)).size,
  };
}
const TOTAL = stats(P);

/* Preenche qualquer elemento com data-n="chave" */
function preencherNumeros(root=document){
  const v = {
    total:P.length, cidades:TOTAL.cidades, estados:TOTAL.estados,
    km:fmt(TOTAL.km), milkm:Math.round(TOTAL.km/1000), voltas:(TOTAL.km/40075).toLocaleString('pt-BR',{maximumFractionDigits:1}),
  };
  root.querySelectorAll('[data-n]').forEach(el => { if(v[el.dataset.n]!==undefined) el.textContent = v[el.dataset.n]; });
}

/* ── Mapa do Brasil (arquivo local, para não depender de outro site) ── */
let _brasil;
function carregarBrasil(){
  if(!_brasil) _brasil = fetch('data/bra.topo.json').then(r=>r.json()).then(t => topojson.feature(t, t.objects[Object.keys(t.objects)[0]]).features);
  return _brasil;
}
function desenharBrasil(svg, features, {w=600,h=660,tinta=true}={}){
  const proj = d3.geoMercator().center([-54,-14]).scale(700).translate([w/2,h/2]);
  const gp = d3.geoPath().projection(proj);
  svg.attr('viewBox',`0 0 ${w} ${h}`);
  svg.append('g').attr('class','estados').selectAll('path').data(features).join('path')
    .attr('d',gp)
    .attr('fill',d => { const r = SR[d.properties.name||'']; return tinta && r ? RC[r]+'40' : '#EFE9D6'; })
    .attr('stroke','#111').attr('stroke-width',.8).attr('stroke-linejoin','round');
  return proj;
}

/* ── Tooltip simples ── */
const tip = document.createElement('div'); tip.className = 'tip'; document.addEventListener('DOMContentLoaded', () => document.body.appendChild(tip));
function mostrarTip(e,p){
  tip.innerHTML = `<strong>${dataExtenso(p)}</strong>${p.cidade} / ${p.uf}<br><span>${p.rua}</span>`;
  tip.style.display = 'block';
  const x = Math.min(e.clientX + 14, innerWidth - 240), y = Math.max(e.clientY - 70, 70);
  tip.style.left = x+'px'; tip.style.top = y+'px';
}
function esconderTip(){ tip.style.display = 'none'; }

/* ── Cabeçalho e rodapé iguais em todas as páginas ── */
const ARROW = `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
function montarMoldura(ativa){
  const nav = document.getElementById('nav');
  if(nav) nav.outerHTML = `
  <header class="nav">
    <a href="index.html" class="nav__mark">Predinho do Dia<span> · 2026</span></a>
    <nav class="nav__links" aria-label="Páginas do projeto">
      <a href="index.html" class="${ativa==='inicio'?'on':''}">História</a>
      <a href="atlas.html" class="${ativa==='atlas'?'on':''}">Atlas</a>
      <a href="numeros.html" class="${ativa==='numeros'?'on':''}">Números</a>
      <a href="artista.html" class="${ativa==='artista'?'on':''}">O artista</a>
    </nav>
    <a class="nav__cta" href="${LINKS.calendario}" target="_blank" rel="noopener">Calendário 2026</a>
  </header>`;
  const rod = document.getElementById('rodape');
  if(rod) rod.outerHTML = `
  <footer class="rodape wrap">
    <div class="desc">Um projeto de Bruno Lorenz: um desenho em aquarela por dia, ao longo de 2026, de casas e predinhos em ruas que levam o nome da data. Uma crônica afetiva da arquitetura popular brasileira.</div>
    <div class="rodape__links">
      <a class="btn--sm btn--sol" href="${LINKS.instagram}" target="_blank" rel="noopener">@unspredinhos</a>
      <a class="btn--sm btn--branco" href="${LINKS.loja}" target="_blank" rel="noopener">Loja</a>
      <a class="btn--sm" href="https://wa.me/${LINKS.whats}" target="_blank" rel="noopener">Fale comigo</a>
    </div>
    <div class="credit">Aquarelas e desenhos: Bruno Lorenz · @unspredinhos · 2026</div>
  </footer>`;
}
