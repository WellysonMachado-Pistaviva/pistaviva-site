// ===== NAVIGATION =====
let currentPage='home';
function navigateTo(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById(page);
  if(el){el.classList.add('active');window.scrollTo(0,0)}
  currentPage=page;
  document.querySelectorAll('.tab').forEach(t=>{
    t.classList.toggle('active',t.dataset.page===page);
  });
  if(document.getElementById('side-drawer').classList.contains('open'))toggleDrawer();
}
function toggleDrawer(){
  document.getElementById('side-drawer').classList.toggle('open');
  document.getElementById('drawer-overlay').classList.toggle('hidden');
}
function showToast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.remove('hidden');
  t.style.animation = 'toastIn .35s cubic-bezier(.4,0,.2,1)';
  setTimeout(()=>t.classList.add('hidden'),3000);
}

// ===== VALIDATION ENGINE =====
function showError(fieldId, msg){
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById('error-' + fieldId);
  if(field) field.classList.add('error');
  if(errorSpan) {
    errorSpan.textContent = msg;
    errorSpan.classList.remove('hidden');
  }
}
function clearErrors(){
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.error-message').forEach(el => el.classList.add('hidden'));
}
function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(cpf.charAt(i)) * (10 - i);
  let r = 11 - (s % 11);
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(cpf.charAt(9))) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(cpf.charAt(i)) * (11 - i);
  r = 11 - (s % 11);
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(cpf.charAt(10))) return false;
  return true;
}

// ===== AUTH (CPF + CÓDIGO) =====
function getUser(){try{return JSON.parse(localStorage.getItem('pv_user'))}catch{return null}}
function getAllUsers(){try{return JSON.parse(localStorage.getItem('pv_users')||'[]')}catch{return[]}}
function saveUser(u){localStorage.setItem('pv_user',JSON.stringify(u))}
function openAuthModal(){document.getElementById('auth-modal').classList.remove('hidden')}
function closeAuthModal(){document.getElementById('auth-modal').classList.add('hidden')}
function showRegister(e){e&&e.preventDefault();document.getElementById('auth-login').classList.add('hidden');document.getElementById('auth-register').classList.remove('hidden')}
function showLogin(e){e&&e.preventDefault();document.getElementById('auth-register').classList.add('hidden');document.getElementById('auth-login').classList.remove('hidden')}
function maskCPF(el){
  let v=el.value.replace(/\D/g,'');
  if(v.length>11)v=v.slice(0,11);
  v=v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  el.value=v;
}
function generateCode(){return Math.random().toString(36).substring(2,8).toUpperCase()}
function doRegister(){
  clearErrors();
  const n=document.getElementById('reg-name').value.trim(),
        cpf=document.getElementById('reg-cpf').value.trim(),
        c=document.getElementById('reg-city').value.trim(),
        m=document.getElementById('reg-moto').value.trim();
  
  let hasError = false;
  if(!n) { showError('reg-name', 'Nome é obrigatório'); hasError = true; }
  if(!cpf) { showError('reg-cpf', 'CPF é obrigatório'); hasError = true; }
  else if(!validateCPF(cpf)) { showError('reg-cpf', 'CPF inválido'); hasError = true; }
  
  if(hasError) { showToast('Corrija os erros no formulário'); return; }

  const code=generateCode();
  const user={name:n,cpf:cpf,city:c,moto:m,code:code,created:new Date().toISOString()};
  const users=getAllUsers();users.push(user);localStorage.setItem('pv_users',JSON.stringify(users));
  saveUser(user);closeAuthModal();updateAuthUI();
  showToast('Conta criada! 🏍️');
  setTimeout(()=>alert('GUARDE SEU CÓDIGO DE ACESSO:\n\n'+code+'\n\nVocê vai usar ele para entrar novamente.'),500);
}
function doLogin(){
  clearErrors();
  const cpf=document.getElementById('login-cpf').value.trim(),
        code=document.getElementById('login-code').value.trim();
  
  if(!cpf){ showError('login-cpf', 'CPF é obrigatório'); return; }
  if(!code){ showError('login-code', 'Código é obrigatório'); return; }

  if(cpf.replace(/\D/g,'')==='00000000000'&&code==='ADMIN'){
    saveUser({name:'Administrador',isAdmin:true,city:'Admin',moto:'Admin'});
    closeAuthModal();updateAuthUI();showToast('Bem-vindo, Chefe! 👑');return;
  }
  const users=getAllUsers();
  const found=users.find(u=>u.cpf===cpf&&u.code===code);
  if(found){saveUser(found);closeAuthModal();updateAuthUI();showToast('Bem-vindo de volta, '+found.name+'! 🏍');return}
  
  showError('login-code', 'CPF ou código incorreto');
  showToast('Dados de acesso inválidos');
}
function doLogout(){localStorage.removeItem('pv_user');updateAuthUI();showToast('Até logo!');toggleDrawer()}
function updateAuthUI(){
  const u=getUser();
  const du=document.getElementById('drawer-user'),dn=document.getElementById('drawer-username'),
        dc=document.getElementById('drawer-usercity'),ab=document.getElementById('drawer-auth-btn'),
        lb=document.getElementById('drawer-logout-btn'),pl=document.getElementById('passport-locked'),
        pc=document.getElementById('passport-content'),adminLnk=document.getElementById('drawer-admin-link');
  if(u){
    du.classList.remove('hidden');dn.textContent=u.name;dc.textContent=u.city||u.moto||'';
    ab.classList.add('hidden');lb.classList.remove('hidden');
    if(pl)pl.classList.add('hidden');if(pc)pc.classList.remove('hidden');
    if(u.isAdmin&&adminLnk)adminLnk.classList.remove('hidden');
    renderPassport();
  }else{
    du.classList.add('hidden');ab.classList.remove('hidden');lb.classList.add('hidden');
    if(pl)pl.classList.remove('hidden');if(pc)pc.classList.add('hidden');
    if(adminLnk)adminLnk.classList.add('hidden');
  }
}

// ===== RASTREAMENTO DE ROTA (GPS) =====
let routeTracking=false,routePoints=[],routeWatchId=null,routeStartTime=0;
let savedRoutes=JSON.parse(localStorage.getItem('pv_routes')||'[]');
function startRoute(){
  if(!navigator.geolocation){showToast('GPS não disponível');return}
  const btn=document.getElementById('route-start');
  if(routeTracking){stopRoute();return}
  routeTracking=true;routePoints=[];routeStartTime=Date.now();
  btn.textContent='⏹ PARAR GRAVAÇÃO';btn.style.background='var(--danger)';
  document.getElementById('route-status').textContent='🔴 Gravando rota...';
  document.getElementById('route-status').style.color='var(--danger)';
  routeWatchId=navigator.geolocation.watchPosition(pos=>{
    routePoints.push({lat:pos.coords.latitude,lng:pos.coords.longitude,time:Date.now()});
    const km=calcRouteDistance();
    document.getElementById('route-km').textContent=km.toFixed(1)+' km';
    document.getElementById('route-points').textContent=routePoints.length+' pontos';
  },()=>{},{enableHighAccuracy:true,maximumAge:3000});
}
function stopRoute(){
  routeTracking=false;
  if(routeWatchId)navigator.geolocation.clearWatch(routeWatchId);
  const btn=document.getElementById('route-start');
  btn.textContent='▶ GRAVAR ROTA';btn.style.background='';
  document.getElementById('route-status').textContent='';
  if(routePoints.length<2){showToast('Rota muito curta');return}
  const u=getUser();const dur=Math.round((Date.now()-routeStartTime)/60000);
  const route={id:Date.now(),user:u?u.name:'Anônimo',city:u?u.city:'',
    points:routePoints,km:calcRouteDistance().toFixed(1),duration:dur,date:new Date().toLocaleDateString('pt-BR')};
  savedRoutes.unshift(route);localStorage.setItem('pv_routes',JSON.stringify(savedRoutes));
  renderRoutes();showToast('Rota salva! 🗺️ '+route.km+' km');
}
function calcRouteDistance(){
  let d=0;for(let i=1;i<routePoints.length;i++){
    const R=6371,dLat=(routePoints[i].lat-routePoints[i-1].lat)*Math.PI/180,
    dLon=(routePoints[i].lng-routePoints[i-1].lng)*Math.PI/180,
    a=Math.sin(dLat/2)**2+Math.cos(routePoints[i-1].lat*Math.PI/180)*Math.cos(routePoints[i].lat*Math.PI/180)*Math.sin(dLon/2)**2;
    d+=R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }return d;
}
function renderRoutes(){
  const el=document.getElementById('routes-list');if(!el)return;
  el.innerHTML=savedRoutes.length?savedRoutes.slice(0,10).map(r=>`
    <div class="route-item reveal">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <strong>${r.user}</strong><span class="badge">${r.km} km</span>
      </div>
      <div style="font-size:12px;color:var(--muted)">${r.city?r.city+' · ':''}📅 ${r.date} · ⏱ ${r.duration} min · ${r.points.length} pts GPS</div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn-outline" style="padding:6px 10px;font-size:11px" onclick="exportRouteImage(${r.id}, 'story')">📸 Story</button>
        <button class="btn-outline" style="padding:6px 10px;font-size:11px" onclick="exportRouteImage(${r.id}, 'feed')">📸 Feed</button>
      </div>
    </div>`).join(''):'<p style="text-align:center;color:var(--muted);padding:30px">Nenhuma rota gravada ainda.</p>';
  revealElements();
}
function exportRouteImage(routeId, format){
  const r=savedRoutes.find(x=>x.id===routeId);if(!r)return;
  const w=format==='story'?1080:1080;
  const h=format==='story'?1920:1440;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');
  
  // Background
  ctx.fillStyle='#0a0a0f';ctx.fillRect(0,0,w,h);
  
  // Grid/Map pattern
  ctx.strokeStyle='rgba(249,115,22,0.05)';ctx.lineWidth=2;
  for(let i=0;i<w;i+=100){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke();}
  for(let i=0;i<h;i+=100){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(w,i);ctx.stroke();}
  
  // Decorative line (simulating GPS path)
  ctx.beginPath();ctx.moveTo(200,h/2);ctx.bezierCurveTo(400,h/2-200, 600,h/2+200, 800,h/2);
  ctx.strokeStyle='#f97316';ctx.lineWidth=8;ctx.lineCap='round';
  ctx.shadowColor='rgba(249,115,22,0.5)';ctx.shadowBlur=20;ctx.stroke();ctx.shadowBlur=0;
  
  // PistaViva Logo
  ctx.fillStyle='#ffffff';ctx.font='900 80px Outfit';ctx.textAlign='center';
  ctx.fillText('PISTA', w/2-100, h/2-300);
  ctx.fillStyle='#f97316';ctx.fillText('VIVA', w/2+140, h/2-300);
  
  // Route Data
  ctx.fillStyle='#ffffff';ctx.font='700 100px Outfit';ctx.fillText(r.km+' km', w/2, h/2-100);
  ctx.fillStyle='#888888';ctx.font='400 40px Inter';ctx.fillText('Distância percorrida', w/2, h/2-30);
  
  ctx.fillStyle='#ffffff';ctx.font='700 80px Outfit';ctx.fillText(r.duration+' min', w/2, h/2+150);
  ctx.fillStyle='#888888';ctx.font='400 40px Inter';ctx.fillText('Tempo de viagem', w/2, h/2+210);
  
  // User & Date
  ctx.fillStyle='#f97316';ctx.font='600 50px Inter';ctx.fillText('@'+r.user, w/2, h-200);
  ctx.fillStyle='#888888';ctx.font='400 35px Inter';ctx.fillText(r.date, w/2, h-140);
  
  // Download
  const link=document.createElement('a');
  link.download=`pistaviva_rota_${r.id}_${format}.png`;
  link.href=canvas.toDataURL('image/png');
  link.click();
  showToast('Imagem salva! 📸 Compartilhe no Instagram.');
}

// ===== DESTINOS (FEED DA COMUNIDADE) =====
let communityFeed=JSON.parse(localStorage.getItem('pv_gallery')||'[]');
// Migration step for old data
communityFeed.forEach(p=>{if(!p.comments)p.comments=[]});

function renderCommunityFeed(filter='todos', btn=null){
  if(btn){
    document.querySelectorAll('#feed-filters .filter-chip').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }
  const grid=document.getElementById('feed-grid');
  if(!grid)return;
  
  let html = '';
  
  if(filter !== 'roteiros') {
    const filteredPhotos = filter==='todos' 
      ? communityFeed.map((p, i) => ({...p, origIndex: i})) 
      : communityFeed.map((p, i) => ({...p, origIndex: i})).filter(p=>p.cat===filter);
      
    html += filteredPhotos.map((p)=>`
      <div class="dest-card reveal" style="height:auto;cursor:default;">
        <img src="${p.src}" alt="Foto de ${p.name}" loading="lazy" style="height:auto;max-height:400px;object-fit:cover;border-radius:14px 14px 0 0">
        <div style="padding:16px;background:var(--bg2);border-radius:0 0 14px 14px">
          <h3 style="font-size:18px;margin-bottom:4px">${p.name} <span style="font-size:12px;color:var(--muted);font-weight:normal">em ${p.city} - ${p.uf}</span></h3>
          <p style="color:var(--text);font-size:14px;margin-bottom:12px">${p.comment||''}</p>
          <span class="badge" style="margin-bottom:12px;display:inline-block">${p.cat==='montanha'?'🏔 Montanhas':p.cat==='historica'?'🏛 Histórica':p.cat==='gastronomica'?'🍝 Gastronômica':p.cat==='bateevolta'?'🏍 Bate e Volta':'🛤️ Outro'}</span>
          
          <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:12px">
            <h4 style="font-size:12px;color:var(--muted);margin-bottom:8px">COMENTÁRIOS (${p.comments?p.comments.length:0})</h4>
            ${p.comments&&p.comments.length?p.comments.map(c=>`
              <div style="font-size:13px;margin-bottom:6px"><strong>${c.user}:</strong> <span style="color:var(--muted)">${c.text}</span></div>
            `).join(''):'<p style="font-size:12px;color:var(--muted);margin-bottom:12px">Nenhum comentário ainda. Seja o primeiro a comentar!</p>'}
            
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
              <textarea id="comment-input-${p.origIndex}" placeholder="Adicione um comentário..." style="width:100%;min-height:60px;padding:10px;font-size:13px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--font)"></textarea>
              <button class="btn-primary" style="padding:10px;font-size:12px" onclick="addCommentToPost(${p.origIndex})">ENVIAR COMENTÁRIO</button>
            </div>
          </div>
        </div>
      </div>`).join('');
  }
  
  if(filter === 'todos' || filter === 'roteiros') {
    const publicTrips = savedTrips.map((t, i) => ({...t, origIndex: i})).filter(t => t.privacy === 'public');
    html += publicTrips.map((t)=>`
      <div class="calc-card reveal" style="padding:16px;border-color:var(--accent);margin-top:16px">
        <h3 style="font-size:18px;margin-bottom:4px">${t.user} <span style="font-size:12px;color:var(--muted);font-weight:normal">compartilhou um roteiro</span></h3>
        <h4 style="font-size:16px;margin-bottom:8px;color:var(--accent)">🗺️ ${t.name}</h4>
        <p style="font-size:13px;color:var(--text);margin-bottom:12px">De <strong>${t.orig.split('-')[0]}</strong> para <strong>${t.dest.split('-')[0]}</strong></p>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:16px;background:var(--bg3);padding:10px;border-radius:8px">
          <span>📏 ${t.distKm.toFixed(0)} km</span>
          <span>⏱ ${t.duration}</span>
          <span style="color:var(--accent);font-weight:bold">💰 R$ ${t.cost.toFixed(2).replace('.',',')}</span>
        </div>
        
        <div style="border-top:1px solid var(--border);padding-top:12px">
          <h4 style="font-size:12px;color:var(--muted);margin-bottom:8px">COMENTÁRIOS (${t.comments?t.comments.length:0})</h4>
          ${t.comments&&t.comments.length?t.comments.map(c=>`
            <div style="font-size:13px;margin-bottom:6px"><strong>${c.user}:</strong> <span style="color:var(--muted)">${c.text}</span></div>
          `).join(''):'<p style="font-size:12px;color:var(--muted);margin-bottom:12px">Nenhum comentário ainda. Seja o primeiro a comentar!</p>'}
          
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            <textarea id="trip-comment-${t.origIndex}" placeholder="Comentar neste roteiro..." style="width:100%;min-height:60px;padding:10px;font-size:13px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--font)"></textarea>
            <button class="btn-primary" style="padding:10px;font-size:12px" onclick="addCommentToTrip(${t.origIndex}, 'feed')">ENVIAR COMENTÁRIO</button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  grid.innerHTML = html || '<p style="text-align:center;color:var(--muted);padding:40px">Nenhuma publicação encontrada.</p>';
  revealElements();
}

function renderMinhasPublicacoes(){
  const grid=document.getElementById('my-posts-grid');
  const tripsGrid=document.getElementById('my-trips-grid');
  if(!grid)return;
  const u=getUser();
  if(!u){
    grid.innerHTML='<p style="text-align:center;color:var(--muted);padding:40px">Faça login para ver suas publicações.</p>';
    if(tripsGrid) tripsGrid.innerHTML='';
    return;
  }
  
  if(tripsGrid){
    const myTrips = savedTrips.map((t,i)=>({...t, origIndex:i})).filter(t=>t.user===u.name);
    tripsGrid.innerHTML=myTrips.length?myTrips.map(t=>`
      <div class="calc-card reveal" style="padding:16px;border-color:var(--accent)">
        <h4 style="font-size:16px;margin-bottom:8px">🗺️ ${t.name} <span style="font-size:11px;color:var(--muted);font-weight:normal">(${t.privacy==='public'?'Público':'Privado'})</span></h4>
        <p style="font-size:13px;color:var(--text);margin-bottom:12px">De <strong>${t.orig.split('-')[0]}</strong> para <strong>${t.dest.split('-')[0]}</strong></p>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:12px;background:var(--bg3);padding:10px;border-radius:8px">
          <span>📏 ${t.distKm.toFixed(0)} km</span>
          <span>⏱ ${t.duration}</span>
          <span style="color:var(--accent);font-weight:bold">💰 R$ ${t.cost.toFixed(2).replace('.',',')}</span>
        </div>
        
        <div style="border-top:1px solid var(--border);padding-top:12px">
          <h4 style="font-size:12px;color:var(--muted);margin-bottom:8px">COMENTÁRIOS (${t.comments?t.comments.length:0})</h4>
          ${t.comments&&t.comments.length?t.comments.map(c=>`
            <div style="font-size:13px;margin-bottom:6px"><strong>${c.user}:</strong> <span style="color:var(--muted)">${c.text}</span></div>
          `).join(''):'<p style="font-size:12px;color:var(--muted);margin-bottom:12px">Nenhum comentário ainda.</p>'}
          
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            <textarea id="trip-comment-my-${t.origIndex}" placeholder="Comentar no seu roteiro..." style="width:100%;min-height:60px;padding:10px;font-size:13px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--font)"></textarea>
            <button class="btn-primary" style="padding:10px;font-size:12px" onclick="addCommentToTrip(${t.origIndex}, 'my')">ENVIAR COMENTÁRIO</button>
          </div>
        </div>
      </div>
    `).join(''):'<p style="font-size:13px;color:var(--muted)">Você ainda não salvou roteiros.</p>';
  }

  const myPosts = communityFeed.filter(p=>p.name===u.name);
  grid.innerHTML=myPosts.length?myPosts.map(p=>`
    <div class="dest-card reveal" style="height:auto;cursor:default;">
      <img src="${p.src}" loading="lazy" style="height:auto;max-height:300px;object-fit:cover;border-radius:14px 14px 0 0">
      <div style="padding:16px;background:var(--bg2);border-radius:0 0 14px 14px">
        <h3 style="font-size:16px;margin-bottom:4px">${p.city} - ${p.uf}</h3>
        <p style="color:var(--text);font-size:14px;margin-bottom:12px">${p.comment||''}</p>
        <span class="badge" style="margin-bottom:12px;display:inline-block">${p.cat==='montanha'?'🏔 Montanhas':p.cat==='historica'?'🏛 Histórica':p.cat==='gastronomica'?'🍝 Gastronômica':p.cat==='bateevolta'?'🏍 Bate e Volta':'🛤️ Outro'}</span>
        <p style="font-size:12px;color:var(--muted)">${p.comments?p.comments.length:0} comentários</p>
      </div>
    </div>`).join(''):'<p style="text-align:center;color:var(--muted);padding:40px">Você ainda não publicou nada.</p>';
  revealElements();
}

function addCommentToPost(i){
  const u=getUser();
  if(!u){openAuthModal();showToast('Faça login para comentar!');return}
  const input=document.getElementById(`comment-input-${i}`);
  const text=input.value.trim();
  if(!text)return;
  if(!communityFeed[i].comments)communityFeed[i].comments=[];
  communityFeed[i].comments.push({user:u.name,text:text,date:new Date().toISOString()});
  localStorage.setItem('pv_gallery',JSON.stringify(communityFeed));
  
  const activeFilterBtn = document.querySelector('#feed-filters .filter-chip.active');
  renderCommunityFeed(activeFilterBtn ? (activeFilterBtn.textContent.includes('Roteiro') ? 'roteiros' : (activeFilterBtn.textContent.includes('Montanha') ? 'montanha' : (activeFilterBtn.textContent.includes('Histórica') ? 'historica' : (activeFilterBtn.textContent.includes('Gastronômica') ? 'gastronomica' : (activeFilterBtn.textContent.includes('Bate') ? 'bateevolta' : 'todos'))))) : 'todos');
}

function addCommentToTrip(i, prefix='feed'){
  const u=getUser();
  if(!u){openAuthModal();showToast('Faça login para comentar!');return}
  const input=document.getElementById(`trip-comment-${prefix==='my'?'my-':''}${i}`);
  const text=input.value.trim();
  if(!text)return;
  if(!savedTrips[i].comments) savedTrips[i].comments=[];
  savedTrips[i].comments.push({user:u.name,text:text,date:new Date().toISOString()});
  localStorage.setItem('pv_trips',JSON.stringify(savedTrips));
  
  const activeFilterBtn = document.querySelector('#feed-filters .filter-chip.active');
  const activeFilter = activeFilterBtn && activeFilterBtn.textContent.includes('Roteiro') ? 'roteiros' : 'todos';
  renderCommunityFeed(activeFilter);
  renderMinhasPublicacoes();
}

// ===== PLANEJADOR DE VIAGEM =====
let geocodeTimeout;
function debounceGeocode(input, type) {
  clearTimeout(geocodeTimeout);
  const val = input.value.trim();
  const resUl = document.getElementById(`plan-${type}-results`);
  if(val.length < 3) { resUl.classList.add('hidden'); return; }
  geocodeTimeout = setTimeout(() => {
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&language=pt&count=5`)
      .then(r=>r.json())
      .then(d=>{
        if(!d.results||!d.results.length){ resUl.classList.add('hidden'); return; }
        resUl.innerHTML = d.results.map(loc => `
          <li onclick="selectLocation('${type}', '${loc.name.replace(/'/g,"\\'")}', '${(loc.admin1||'').replace(/'/g,"\\'")}', ${loc.latitude}, ${loc.longitude})">
            ${loc.name} <small>${loc.admin1||loc.country}</small>
          </li>
        `).join('');
        resUl.classList.remove('hidden');
      });
  }, 500);
}

function selectLocation(type, name, state, lat, lng) {
  document.getElementById(`plan-${type}`).value = `${name} - ${state}`;
  document.getElementById(`plan-${type}-lat`).value = lat;
  document.getElementById(`plan-${type}-lng`).value = lng;
  document.getElementById(`plan-${type}-results`).classList.add('hidden');
}

let wpCount=0;
function addWaypoint(){
  wpCount++;
  const id = `wp-${wpCount}`;
  const div = document.createElement('div');
  div.className = 'waypoint-item';
  div.id = id;
  div.innerHTML = `
    <div style="position:relative;flex:1">
      <input type="text" id="plan-${id}" placeholder="Parada (Ex: Pouso Alegre)" autocomplete="off" oninput="debounceGeocode(this, '${id}')">
      <input type="hidden" id="plan-${id}-lat"><input type="hidden" id="plan-${id}-lng">
      <ul id="plan-${id}-results" class="autocomplete-list hidden"></ul>
    </div>
    <button class="waypoint-remove" onclick="document.getElementById('${id}').remove()">×</button>
  `;
  document.getElementById('waypoints-container').appendChild(div);
}

async function generateTripPlan() {
  const origLat = document.getElementById('plan-orig-lat').value;
  const origLng = document.getElementById('plan-orig-lng').value;
  const destLat = document.getElementById('plan-dest-lat').value;
  const destLng = document.getElementById('plan-dest-lng').value;
  const avg = parseFloat(document.getElementById('plan-avg').value);
  const price = parseFloat(document.getElementById('plan-price').value);
  const isRoundtrip = document.getElementById('plan-roundtrip').checked;
  
  if(!origLat || !destLat) { showToast('Selecione a origem e o destino da lista'); return; }
  if(!avg || !price) { showToast('Preencha o consumo e o preço do combustível'); return; }
  
  const btn = document.getElementById('btn-generate-trip');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="loading-spinner"></span> CALCULANDO...'; 
  btn.disabled = true;
  
  try {
    let coords = `${origLng},${origLat};`;
    const waypoints = document.querySelectorAll('.waypoint-item');
    waypoints.forEach(wp => {
      const wplat = wp.querySelector('input[id$="-lat"]').value;
      const wplng = wp.querySelector('input[id$="-lng"]').value;
      if(wplat && wplng) coords += `${wplng},${wplat};`;
    });
    coords += `${destLng},${destLat}`;
    
    // OSRM
    const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`);
    if(!osrmRes.ok) throw new Error('Falha no servidor de rotas');
    const osrmData = await osrmRes.json();
    if(osrmData.code !== 'Ok') throw new Error('Rota não encontrada. Verifique os pontos.');
    
    let distKm = osrmData.routes[0].distance / 1000;
    let durationSec = osrmData.routes[0].duration;
    
    if(isRoundtrip){ distKm *= 2; durationSec *= 2; }
    
    const h = Math.floor(durationSec / 3600);
    const m = Math.floor((durationSec % 3600) / 60);
    
    // Weather
    let weatherData = { current_weather: { temperature: '--', weathercode: 0 } };
    try {
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${destLat}&longitude=${destLng}&current_weather=true`);
      if(weatherRes.ok) weatherData = await weatherRes.json();
    } catch(e) { console.warn('Weather API failed'); }

    const temp = weatherData.current_weather.temperature;
    const wcode = weatherData.current_weather.weathercode;
    let icon = '☁️';
    if(wcode <= 3) icon = '☀️';
    else if(wcode <= 69) icon = '🌧';
    else icon = '⛈';
    
    // Costs
    const liters = distKm / avg;
    const cost = liters * price;
    
    // Update UI
    document.getElementById('res-weather-icon').textContent = icon;
    document.getElementById('res-temp').textContent = `${temp}${typeof temp === 'number' ? '°C' : ''}`;
    document.getElementById('res-duration').textContent = `${h}h ${m}m`;
    document.getElementById('res-total-dist').textContent = `${distKm.toFixed(1)} km`;
    document.getElementById('res-total-liters').textContent = `${liters.toFixed(1)} L`;
    document.getElementById('res-total-cost').textContent = `R$ ${cost.toFixed(2).replace('.',',')}`;
    
    window.currentTrip = {
      orig: document.getElementById('plan-orig').value,
      dest: document.getElementById('plan-dest').value,
      distKm: distKm, duration: `${h}h ${m}m`, cost: cost
    };
    
    const resultCard = document.getElementById('planner-result');
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch(e) {
    showToast(e.message || 'Erro ao traçar rota. Tente novamente.');
  } finally {
    btn.innerHTML = originalText; 
    btn.disabled = false;
  }
}

let savedTrips = JSON.parse(localStorage.getItem('pv_trips')||'[]');
function saveTripPlan(){
  const name = document.getElementById('plan-save-name').value.trim();
  if(!name){ showToast('Dê um nome para o roteiro'); return; }
  const u = getUser();
  if(!u){ openAuthModal(); showToast('Faça login para salvar roteiros!'); return; }
  
  const privacy = document.getElementById('plan-save-privacy').value;
  const trip = { ...window.currentTrip, name, privacy, user: u.name, date: new Date().toISOString() };
  savedTrips.unshift(trip);
  localStorage.setItem('pv_trips', JSON.stringify(savedTrips));
  
  showToast('Roteiro salvo com sucesso! 🗺️');
  renderMinhasPublicacoes();
}

function resetPlanner(){
  document.getElementById('plan-orig').value=''; document.getElementById('plan-orig-lat').value=''; document.getElementById('plan-orig-lng').value='';
  document.getElementById('plan-dest').value=''; document.getElementById('plan-dest-lat').value=''; document.getElementById('plan-dest-lng').value='';
  document.getElementById('waypoints-container').innerHTML='';
  document.getElementById('plan-save-name').value='';
  document.getElementById('planner-result').classList.add('hidden');
}


// ===== EVENTOS =====
let commEvents=JSON.parse(localStorage.getItem('pv_events')||'[]');
function submitEvent(){
  const n=document.getElementById('evt-name').value.trim(),d=document.getElementById('evt-date').value,
        l=document.getElementById('evt-local').value.trim(),desc=document.getElementById('evt-desc').value.trim();
  if(!n||!d||!l){showToast('Preencha nome, data e local');return}
  commEvents.unshift({id:Date.now(),name:n,date:d,local:l,desc:desc,going:0});
  localStorage.setItem('pv_events',JSON.stringify(commEvents));
  document.getElementById('evt-name').value='';document.getElementById('evt-date').value='';
  document.getElementById('evt-local').value='';document.getElementById('evt-desc').value='';
  renderEvents();showToast('Evento publicado! 📅');
}
function renderEvents(){
  const el=document.getElementById('eventos-list');if(!el)return;
  el.innerHTML=commEvents.length?commEvents.map((e,i)=>`
    <div class="exp-card reveal" style="border-left-color:#8b5cf6">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px">
        <h3>${e.name}</h3>
      </div>
      <div class="exp-info"><span>📅 ${new Date(e.date).toLocaleDateString('pt-BR')}</span><span>📍 ${e.local}</span></div>
      <p style="color:var(--muted);font-size:13px;margin-bottom:14px">${e.desc}</p>
      <button class="btn-outline" onclick="joinEvent(${i})" style="padding:10px;font-size:12px;border-color:#8b5cf6;color:#8b5cf6">🙋‍♂️ EU VOU (${e.going})</button>
    </div>`).join(''):'<p style="text-align:center;color:var(--muted);padding:20px">Nenhum evento próximo.</p>';
  revealElements();
}
function joinEvent(i){
  const u=getUser();if(!u){openAuthModal();showToast('Faça login para participar!');return}
  if(!commEvents[i].goingUsers) commEvents[i].goingUsers = [];
  if(commEvents[i].goingUsers.includes(u.name)){
    showToast('Você já está confirmado neste evento!');return;
  }
  commEvents[i].goingUsers.push(u.name);
  commEvents[i].going++;
  localStorage.setItem('pv_events',JSON.stringify(commEvents));
  renderEvents();showToast('Presença confirmada! 🏍️');
}

// ===== PARCEIROS =====
function renderParceiros(){
  const grid=document.getElementById('parceiros-grid');
  grid.innerHTML=PARTNERS.map(p=>`
    <div class="par-card reveal">
      <div class="par-icon">${p.icon}</div>
      <div class="par-info"><h4>${p.name}</h4><p>${p.type} · ${p.city}</p><p style="margin-top:4px;color:var(--text);font-size:13px">${p.desc}</p></div>
    </div>`).join('');
  revealElements();
}

function previewPhoto(input, imgId = 'gal-preview'){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{const img=document.getElementById(imgId);img.src=e.target.result;img.classList.remove('hidden')};
  reader.readAsDataURL(file);
}
function submitPhotoHome(prefix){
  const u=getUser();
  if(!u){
    // Salvar rascunho e forçar login
    localStorage.setItem('pv_draft_photo',document.getElementById(prefix+'preview').src);
    localStorage.setItem('pv_draft_uf',document.getElementById(prefix+'uf').value);
    localStorage.setItem('pv_draft_city',document.getElementById(prefix+'city').value);
    localStorage.setItem('pv_draft_cat',document.getElementById(prefix+'cat').value);
    localStorage.setItem('pv_draft_comment',document.getElementById(prefix+'comment').value);
    localStorage.setItem('pv_draft_prefix', prefix);
    openAuthModal();showToast('Faça login ou cadastre-se para enviar!');return;
  }
  submitPhoto(prefix);
}
function submitPhoto(prefix){
  clearErrors();
  if(!prefix) prefix = localStorage.getItem('pv_draft_prefix') || 'gal-';
  const u=getUser();
  const n=u?u.name:document.getElementById(prefix+'name').value.trim();
  const uf=document.getElementById(prefix+'uf')?document.getElementById(prefix+'uf').value:localStorage.getItem('pv_draft_uf')||'';
  const c=document.getElementById(prefix+'city')?document.getElementById(prefix+'city').value.trim():localStorage.getItem('pv_draft_city')||'';
  const cat=document.getElementById(prefix+'cat')?document.getElementById(prefix+'cat').value:localStorage.getItem('pv_draft_cat')||'outro';
  const cm=document.getElementById(prefix+'comment')?document.getElementById(prefix+'comment').value.trim():localStorage.getItem('pv_draft_comment')||'';
  const img=document.getElementById(prefix+'preview');
  let src=img?img.getAttribute('src'):null;
  if(!src) src=localStorage.getItem('pv_draft_photo');
  
  let hasError = false;
  if(!uf){ showToast('Selecione o Estado'); hasError = true; }
  if(!c){ showToast('Digite a Cidade'); hasError = true; }
  if(!src||src===''||src===window.location.href){ showToast('Escolha uma foto'); hasError = true; }
  if(!cm){ showError(prefix+'comment', 'Conte um pouco sobre o lugar'); hasError = true; }
  
  if(hasError) return;
  
  communityFeed.unshift({name:n,uf:uf,city:c,cat:cat,comment:cm,src:src,date:new Date().toISOString(),comments:[]});
  localStorage.setItem('pv_gallery',JSON.stringify(communityFeed));
  
  // Limpar formulário e rascunhos
  if(document.getElementById(prefix+'city'))document.getElementById(prefix+'city').value='';
  if(document.getElementById(prefix+'uf'))document.getElementById(prefix+'uf').value='';
  if(document.getElementById(prefix+'cat'))document.getElementById(prefix+'cat').value='';
  if(document.getElementById(prefix+'comment'))document.getElementById(prefix+'comment').value='';
  if(img){img.classList.add('hidden');img.src='';}
  if(document.getElementById(prefix+'file'))document.getElementById(prefix+'file').value='';
  localStorage.removeItem('pv_draft_photo');localStorage.removeItem('pv_draft_uf');localStorage.removeItem('pv_draft_city');localStorage.removeItem('pv_draft_cat');localStorage.removeItem('pv_draft_comment');localStorage.removeItem('pv_draft_prefix');
  renderCommunityFeed();renderMinhasPublicacoes();showToast('Post publicado com sucesso! 📸');
  navigateTo('destinos');
  window.scrollTo({top:0, behavior:'smooth'});
}


// ===== PASSAPORTE =====
let customStamps=JSON.parse(localStorage.getItem('pv_custom_stamps')||'[]');
function getStamps(){try{return JSON.parse(localStorage.getItem('pv_stamps')||'[]')}catch{return[]}}
function getTotalUserKm(){
  const u=getUser();if(!u)return 0;
  return savedRoutes.filter(r=>r.user===u.name).reduce((acc,r)=>acc+parseFloat(r.km),0);
}
function renderPassport(){
  const stamps=getStamps();const grid=document.getElementById('passport-grid');
  if(!grid)return;
  const totalKm=getTotalUserKm();
  const milestones=[{id:'m100',name:'100 km Mapeados',km:100},{id:'m200',name:'200 km Mapeados',km:200},{id:'m300',name:'300 km Mapeados',km:300}];
  
  let html='';
  // Destinos fixos
  DESTINATIONS.forEach(d=>{
    const s=stamps.find(x=>x.id===d.id);
    html+=`<div class="seal-card ${s?'unlocked':''}">
      <div class="seal-icon">${s?'🏅':'🔒'}</div>
      <h4>${d.name}</h4>
      <p class="seal-status">${s?'✅ '+new Date(s.date).toLocaleDateString('pt-BR'):'Bloqueado'}</p>
    </div>`;
  });
  // Selos customizados (Admin)
  customStamps.forEach(c=>{
    const s=stamps.find(x=>x.id===c.id);
    html+=`<div class="seal-card ${s?'unlocked':''}">
      ${c.img?`<img src="${c.img}" style="width:40px;height:40px;border-radius:50%;margin-bottom:8px;${!s?'filter:grayscale(1);opacity:0.3':''}">`:`<div class="seal-icon">${s?'🏅':'🔒'}</div>`}
      <h4>${c.name}</h4>
      <p class="seal-status">${s?'✅ '+new Date(s.date).toLocaleDateString('pt-BR'):'GPS Oculto'}</p>
    </div>`;
  });
  // Milestones
  milestones.forEach(m=>{
    const s=totalKm>=m.km;
    html+=`<div class="seal-card ${s?'unlocked':''}">
      <div class="seal-icon" style="color:var(--accent)">${s?'🏆':'🏁'}</div>
      <h4>${m.name}</h4>
      <p class="seal-status">${s?'✅ Conquistado':totalKm.toFixed(0)+' / '+m.km+' km'}</p>
    </div>`;
  });
  grid.innerHTML=html;
  const count=stamps.length+(milestones.filter(m=>totalKm>=m.km).length);
  const totalStamps=DESTINATIONS.length+customStamps.length+milestones.length;
  if(document.getElementById('passport-count'))document.getElementById('passport-count').textContent=`${count} / ${totalStamps} selos`;
  if(document.getElementById('passport-bar'))document.getElementById('passport-bar').style.width=(count/totalStamps*100)+'%';
}
function doCheckin(){
  const btn=document.getElementById('btn-checkin'),st=document.getElementById('checkin-status');
  btn.disabled=true;btn.textContent='📡 Buscando GPS...';st.textContent='';
  if(!navigator.geolocation){st.textContent='GPS não disponível.';btn.disabled=false;btn.textContent='📍 CHECK-IN GPS';return}
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat=pos.coords.latitude,lng=pos.coords.longitude;
    let closest=null,minDist=Infinity;
    
    // Check Destinos & Custom Stamps
    const allTargets=[...DESTINATIONS, ...customStamps];
    allTargets.forEach(d=>{
      const dist=Math.sqrt(Math.pow(lat-d.lat,2)+Math.pow(lng-d.lng,2))*111;
      if(dist<minDist){minDist=dist;closest=d}
    });
    
    if(minDist<=30){ // 30km tolerance for demo
      const stamps=getStamps();
      if(!stamps.find(s=>s.id===closest.id)){
        stamps.push({id:closest.id,date:new Date().toISOString()});
        localStorage.setItem('pv_stamps',JSON.stringify(stamps));
        st.textContent='🏅 Selo conquistado: '+closest.name+'!';st.style.color='var(--success)';
        showToast('🏅 '+closest.name+' conquistado!');renderPassport();
      }else{st.textContent='Você já tem o selo '+closest.name+'!';st.style.color='var(--accent)'}
    }else{st.textContent=`Mais próximo: ${closest.name} (~${Math.round(minDist)}km). Vá até lá!`;st.style.color='var(--muted)'}
    btn.disabled=false;btn.textContent='📍 CHECK-IN GPS';
  },err=>{
    st.textContent='Erro GPS. Tente novamente.';st.style.color='var(--danger)';btn.disabled=false;btn.textContent='📍 CHECK-IN GPS';
  },{enableHighAccuracy:true,timeout:15000});
}

// ===== PISTA AO VIVO =====
let liveReports=JSON.parse(localStorage.getItem('pv_live')||'null')||LIVE_INITIAL;
let selectedLiveStatus='';
function renderLive(){
  const sel=document.getElementById('live-dest');
  if(sel.options.length<=1)DESTINATIONS.forEach(d=>{const o=document.createElement('option');o.value=d.name;o.textContent=d.name;sel.appendChild(o)});
  const feed=document.getElementById('live-feed');
  feed.innerHTML=liveReports.map(r=>`
    <div class="live-card ${r.status} reveal">
      <h4>${r.dest}</h4>
      <p>${r.text}</p>
      <div class="live-time">${r.time||'agora'}</div>
    </div>`).join('');
  revealElements();
}
function selectLiveStatus(btn){
  document.querySelectorAll('.status-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');selectedLiveStatus=btn.dataset.status;
}
function submitLiveReport(){
  const dest=document.getElementById('live-dest').value,text=document.getElementById('live-comment').value.trim();
  if(!dest||!selectedLiveStatus||!text){showToast('Preencha todos os campos');return}
  liveReports.unshift({dest,status:selectedLiveStatus,text,time:'agora'});
  localStorage.setItem('pv_live',JSON.stringify(liveReports));
  document.getElementById('live-dest').value='';document.getElementById('live-comment').value='';
  document.querySelectorAll('.status-btn').forEach(b=>b.classList.remove('selected'));selectedLiveStatus='';
  renderLive();showToast('Relato enviado! 📡');
}

// ===== SCROLL REVEAL =====
function revealElements(){
  const obs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}})},{threshold:0.1});
  document.querySelectorAll('.reveal:not(.visible)').forEach(el=>obs.observe(el));
}

// ===== HERO COUNTER =====
function animateCounters(){
  document.querySelectorAll('.stat-num').forEach(el=>{
    const target=parseInt(el.dataset.count);let current=0;
    const step=Math.ceil(target/40);
    const timer=setInterval(()=>{current+=step;if(current>=target){current=target;clearInterval(timer)}el.textContent=current},40);
  });
}

function setupFilters(){}
// ===== MAPA INTERATIVO (LEAFLET) =====
let pvMap=null,mapLayers={destinos:[],fotos:[],fotografos:[]};
let photographers=JSON.parse(localStorage.getItem('pv_photographers')||'[]');
function initMap(){
  if(pvMap)return;
  pvMap=L.map('map-container',{zoomControl:false}).setView([-19.9,-44.0],7);
  L.control.zoom({position:'bottomright'}).addTo(pvMap);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
    attribution:'©PISTAVIVA',maxZoom:18}).addTo(pvMap);
  // Destination markers
  const destIcon=L.divIcon({className:'map-pin dest-pin',html:'<div style="background:var(--accent);width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(249,115,22,.5)"></div>',iconSize:[14,14],iconAnchor:[7,7]});
  DESTINATIONS.forEach(d=>{
    const m=L.marker([d.lat,d.lng],{icon:destIcon}).bindPopup(`<div style="text-align:center"><strong>${d.name}</strong><br><small>${d.km}km · ${d.days} dias · ${d.level}</small><br><a href="#" onclick="navigateTo('destinos');showDestDetail('${d.id}');return false" style="color:#f97316">Ver detalhes</a></div>`);
    m._pvType='destinos';mapLayers.destinos.push(m);m.addTo(pvMap);
  });
  // Photographer markers
  const fotoIcon=L.divIcon({className:'map-pin foto-pin',html:'<div style="background:#8b5cf6;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(139,92,246,.5)"></div>',iconSize:[14,14],iconAnchor:[7,7]});
  photographers.forEach(p=>{
    if(p.lat&&p.lng){
      const m=L.marker([p.lat,p.lng],{icon:fotoIcon}).bindPopup(`<div style="text-align:center"><strong>📷 ${p.name}</strong><br><small>${p.local}</small><br><small>⏰ ${p.horario}</small><br><small>📱 ${p.contato}</small></div>`);
      m._pvType='fotografos';mapLayers.fotografos.push(m);m.addTo(pvMap);
    }
  });
  setTimeout(()=>pvMap.invalidateSize(),200);
}
function filterMap(type){
  document.querySelectorAll('#map-filters .filter-chip').forEach(c=>c.classList.remove('active'));
  document.querySelector(`#map-filters [data-filter="${type}"]`).classList.add('active');
  Object.keys(mapLayers).forEach(k=>{
    mapLayers[k].forEach(m=>{
      if(type==='all'||m._pvType===type)m.addTo(pvMap);
      else pvMap.removeLayer(m);
    });
  });
}
function registerPhotographer(){
  const name=document.getElementById('foto-name').value.trim(),
        local=document.getElementById('foto-local').value.trim(),
        horario=document.getElementById('foto-horario').value.trim(),
        contato=document.getElementById('foto-contato').value.trim();
  if(!name||!local){showToast('Preencha nome e local');return}
  if(!navigator.geolocation){showToast('GPS não disponível');return}
  showToast('📡 Buscando sua localização...');
  navigator.geolocation.getCurrentPosition(pos=>{
    const p={name,local,horario,contato,lat:pos.coords.latitude,lng:pos.coords.longitude,date:new Date().toISOString()};
    photographers.push(p);localStorage.setItem('pv_photographers',JSON.stringify(photographers));
    const fotoIcon=L.divIcon({className:'map-pin foto-pin',html:'<div style="background:#8b5cf6;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(139,92,246,.5)"></div>',iconSize:[14,14],iconAnchor:[7,7]});
    const m=L.marker([p.lat,p.lng],{icon:fotoIcon}).bindPopup(`<div style="text-align:center"><strong>📷 ${p.name}</strong><br><small>${p.local}</small><br><small>⏰ ${p.horario}</small><br><small>📱 ${p.contato}</small></div>`).addTo(pvMap);
    m._pvType='fotografos';mapLayers.fotografos.push(m);
    document.getElementById('foto-name').value='';document.getElementById('foto-local').value='';
    document.getElementById('foto-horario').value='';document.getElementById('foto-contato').value='';
    showToast('📷 Cadastro de fotógrafo salvo!');pvMap.setView([p.lat,p.lng],12);
  },()=>showToast('Erro ao obter GPS'),{enableHighAccuracy:true,timeout:15000});
}

// ===== ADMIN PANEL =====
function switchAdminTab(tabId, btn){
  document.querySelectorAll('#admin-tabs .filter-chip').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.admin-tab-content').forEach(c=>c.classList.add('hidden'));
  document.getElementById('admin-content-'+tabId).classList.remove('hidden');
}
function renderAdminPanel(){
  const u=getUser();if(!u||!u.isAdmin)return;
  
  // Config
  const s = JSON.parse(localStorage.getItem('pv_settings')||'{"logo1":"","logo2":"","heroImg":""}');
  document.getElementById('adm-cfg-logo1').value = s.logo1 || '';
  document.getElementById('adm-cfg-logo2').value = s.logo2 || '';
  document.getElementById('adm-cfg-hero').value = s.heroImg || '';

  // Usuários (CRM)
  const allUsers = JSON.parse(localStorage.getItem('pv_users')||'[]');
  document.getElementById('admin-list-users').innerHTML=allUsers.length?allUsers.map((usr,i)=>`
    <div class="admin-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px">
      <div style="flex:1"><strong style="font-size:14px">${usr.name}</strong><p style="font-size:12px;color:var(--muted)">CPF: ${usr.cpf}</p></div>
      <button onclick="deleteUser(${i})" style="background:var(--danger);color:#fff;border:none;padding:8px;border-radius:8px;cursor:pointer">🗑️ Banir</button>
    </div>`).join(''):'<p class="text-muted">Nenhum usuário.</p>';

  // Passaporte
  document.getElementById('admin-list-passaporte').innerHTML=customStamps.length?customStamps.map((c,i)=>`
    <div class="admin-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px">
      <div style="flex:1"><strong style="font-size:14px">${c.name}</strong><p style="font-size:12px;color:var(--muted)">Lat: ${c.lat} | Lng: ${c.lng}</p></div>
      <button onclick="deleteCustomSeal(${i})" style="background:var(--danger);color:#fff;border:none;padding:8px;border-radius:8px;cursor:pointer">🗑️</button>
    </div>`).join(''):'<p class="text-muted">Nenhum selo customizado.</p>';
  
  // Galeria -> Feed
  document.getElementById('admin-list-galeria').innerHTML=communityFeed.length?communityFeed.map((p,i)=>`
    <div class="admin-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px">
      <img src="${p.src}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">
      <div style="flex:1"><strong style="font-size:14px">${p.name}</strong><p style="font-size:12px;color:var(--muted)">${p.comment||'Sem legenda'}</p></div>
      <button onclick="deleteGalleryPhoto(${i})" style="background:var(--danger);color:#fff;border:none;padding:8px;border-radius:8px;cursor:pointer">🗑️</button>
    </div>`).join(''):'<p class="text-muted">Nenhuma foto.</p>';
  // Live
  document.getElementById('admin-list-live').innerHTML=liveReports.length?liveReports.map((r,i)=>`
    <div class="admin-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px">
      <div style="flex:1"><strong style="font-size:14px">${r.dest}</strong><p style="font-size:12px;color:var(--muted)">${r.text}</p></div>
      <button onclick="deleteLiveReport(${i})" style="background:var(--danger);color:#fff;border:none;padding:8px;border-radius:8px;cursor:pointer">🗑️</button>
    </div>`).join(''):'<p class="text-muted">Nenhum relato.</p>';
  // Rotas
  document.getElementById('admin-list-rotas').innerHTML=savedRoutes.length?savedRoutes.map((r,i)=>`
    <div class="admin-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px">
      <div style="flex:1"><strong style="font-size:14px">${r.user} (${r.km}km)</strong><p style="font-size:12px;color:var(--muted)">${r.points.length} pontos</p></div>
      <button onclick="deleteRoute(${i})" style="background:var(--danger);color:#fff;border:none;padding:8px;border-radius:8px;cursor:pointer">🗑️</button>
    </div>`).join(''):'<p class="text-muted">Nenhuma rota.</p>';
  // Fotógrafos
  document.getElementById('admin-list-fotografos').innerHTML=photographers.length?photographers.map((p,i)=>`
    <div class="admin-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px">
      <div style="flex:1"><strong style="font-size:14px">${p.name}</strong><p style="font-size:12px;color:var(--muted)">${p.local}</p></div>
      <button onclick="deletePhotographer(${i})" style="background:var(--danger);color:#fff;border:none;padding:8px;border-radius:8px;cursor:pointer">🗑️</button>
    </div>`).join(''):'<p class="text-muted">Nenhum fotógrafo.</p>';
}
function deleteGalleryPhoto(i){if(!confirm('Excluir post do feed?'))return;communityFeed.splice(i,1);localStorage.setItem('pv_gallery',JSON.stringify(communityFeed));renderCommunityFeed();renderAdminPanel();showToast('Excluído');}
function deleteLiveReport(i){if(!confirm('Excluir relato?'))return;liveReports.splice(i,1);localStorage.setItem('pv_live',JSON.stringify(liveReports));renderLive();renderAdminPanel();showToast('Excluído');}
function deleteRoute(i){if(!confirm('Excluir rota?'))return;savedRoutes.splice(i,1);localStorage.setItem('pv_routes',JSON.stringify(savedRoutes));renderRoutes();renderAdminPanel();showToast('Excluído');}
function deleteCustomSeal(i){if(!confirm('Excluir selo customizado?'))return;customStamps.splice(i,1);localStorage.setItem('pv_custom_stamps',JSON.stringify(customStamps));renderAdminPanel();renderPassport();showToast('Excluído');}
function deletePhotographer(i){if(!confirm('Excluir fotógrafo?'))return;photographers.splice(i,1);localStorage.setItem('pv_photographers',JSON.stringify(photographers));renderAdminPanel();showToast('Excluído');}
function deleteUser(i){if(!confirm('Deseja banir este usuário?'))return;const users=JSON.parse(localStorage.getItem('pv_users')||'[]');users.splice(i,1);localStorage.setItem('pv_users',JSON.stringify(users));renderAdminPanel();showToast('Usuário banido');}

function saveAdminSettings() {
  const l1 = document.getElementById('adm-cfg-logo1').value.trim();
  const l2 = document.getElementById('adm-cfg-logo2').value.trim();
  const hero = document.getElementById('adm-cfg-hero').value.trim();
  const s = { logo1: l1, logo2: l2, heroImg: hero };
  localStorage.setItem('pv_settings', JSON.stringify(s));
  applyAdminSettings();
  showToast('Configurações salvas!');
}

function applyAdminSettings() {
  const s = JSON.parse(localStorage.getItem('pv_settings')||'{"logo1":"PISTA","logo2":"VIVA","heroImg":""}');
  document.querySelectorAll('.auth-logo, .drawer-logo, .hero-logo').forEach(el => {
    el.innerHTML = `${s.logo1||'PISTA'}<span>${s.logo2||'VIVA'}</span>`;
  });
  if(s.heroImg) {
    const bg = document.querySelector('.hero-bg');
    if(bg) bg.style.backgroundImage = `url('${s.heroImg}')`;
  }
}

function createCustomSeal(){
  const n=document.getElementById('adm-seal-name').value.trim(),
        lat=document.getElementById('adm-seal-lat').value,
        lng=document.getElementById('adm-seal-lng').value,
        img=document.getElementById('adm-seal-img').value.trim();
  if(!n||!lat||!lng){showToast('Preencha nome e coordenadas');return}
  customStamps.push({id:'custom_'+Date.now(),name:n,lat:parseFloat(lat),lng:parseFloat(lng),img:img});
  localStorage.setItem('pv_custom_stamps',JSON.stringify(customStamps));
  document.getElementById('adm-seal-name').value='';document.getElementById('adm-seal-lat').value='';
  document.getElementById('adm-seal-lng').value='';document.getElementById('adm-seal-img').value='';
  renderAdminPanel();renderPassport();showToast('Selo criado com sucesso! 🛂');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded',()=>{
  applyAdminSettings();
  renderCommunityFeed();renderEvents();renderParceiros();renderLive();renderRoutes();renderMinhasPublicacoes();
  updateAuthUI();setupFilters();animateCounters();
});
// Lazy init map when section becomes visible
const origNav=navigateTo;
navigateTo=function(page){origNav(page);if(page==='mapa')setTimeout(initMap,100);if(page==='admin')renderAdminPanel();};
