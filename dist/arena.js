'use strict';
let arenaRun = 0, arenaTimer;
function stopArena() {
  arenaRun++;
  clearTimeout(arenaTimer);
}
function arenaView() {
  const run = arenaRun;
  const questNames = {"i'rab":"Sprint I‘rāb", jumlah:"Reli Susun Kalimat"};
  main.innerHTML = '<section class="arenaBanner"><div><span class="label">MULTIPLAYER · QUEST RANKED</span><h1>Arena Nahwu</h1><p>Selesaikan lima soal dengan benar. Pemain pertama yang finis memenangkan balapan.</p></div><div class="arenaRank" id="arenaRank">Memuat rank…</div></section><p id="arenaNotice" role="status"></p><div id="arenaBody"></div>';
  const area = $('arenaBody'), notice = $('arenaNotice');
  let token = user.arenaToken;
  if (!token) {
    token = Array.from(crypto.getRandomValues(new Uint8Array(32)), n=>n.toString(16).padStart(2,'0')).join('');
    if (!save(p=>{p.arenaToken ||= token})) return;
    token = user.arenaToken;
  }
  let current, last = '', busy = false, quest = "i'rab", inputCode = '';
  function card(title) {
    const box = document.createElement('section');
    box.className = 'box';
    box.append(heading('h2',title));
    return box;
  }
  async function update(action='state', fields={}) {
    if (run !== arenaRun) return;
    // Polling is serialized with actions. A click during a poll waits for it.
    if (busy) {
      if (action !== 'state') setTimeout(()=>update(action,fields),60);
      return;
    }
    clearTimeout(arenaTimer);
    busy = true;
    try {
      const response = await fetch(window.NAHWU_ARENA_URL,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action,token,name:user.name,code:current?.code,...fields}),signal:AbortSignal.timeout(8000)});
      if (!response.headers.get('content-type')?.includes('application/json')) throw Error('API arena belum terhubung. Periksa alamat backend pada konfigurasi deployment.');
      const data = await response.json();
      if (run !== arenaRun) return;
      if (!response.ok) throw Error(data.error || 'Server belum tersedia.');
      if (action !== 'state' || notice.dataset.connection) notice.textContent = '';
      delete notice.dataset.connection;
      current = data.room;
      if (user.arenaXP!==data.xp || user.arenaRP!==data.rp || user.arenaRank!==data.rank) {
        if (save(p=>Object.assign(p,{arenaXP:data.xp,arenaRP:data.rp,arenaRank:data.rank}))) {
          $('playerInfo').textContent=user.name+' · ✦ '+(user.done.length*50+data.xp)+' XP';
        }
      }
      $('arenaRank').textContent = data.rank+' · '+data.rp+' RP'+(data.next?' / '+data.next+' RP':'')+' · '+data.xp+' XP arena';
      draw(data);
    } catch (err) {
      if (run !== arenaRun) return;
      notice.textContent = err instanceof TypeError || err.name==='TimeoutError' ? 'Koneksi ke arena terputus. Mencoba kembali…' : err.message;
      if (action==='state') notice.dataset.connection='1';
    } finally {
      busy = false;
      if (run===arenaRun) arenaTimer=setTimeout(()=>update(),current?.phase==='race'?450:1600);
    }
  }
  function draw(data) {
    const r=data.room;
    const remaining=r?Math.max(0,Math.ceil(r.start+180-data.now)):0;
    const count=r?Math.max(0,Math.ceil(r.start-data.now)):0;
    const retry=r?Math.max(0,Math.ceil(r.retry-data.now)):0;
    const signature=JSON.stringify(r?[r,count,retry]:data.rooms);
    const clock=$('arenaClock');
    if(clock) clock.textContent='Sisa waktu '+remaining+' detik';
    if(last===signature) return;
    last=signature;
    area.replaceChildren();
    area.className='twocol';
    if(!r) {
      const create=card('Buat ruangan'), rooms=card('Gabung balapan');
      const select=document.createElement('select');
      select.setAttribute('aria-label','Quest multiplayer');
      for(const [id,title] of Object.entries(questNames)) select.add(new Option(title,id));
      select.value=quest;
      select.onchange=()=>{quest=select.value};
      create.append(heading('p','2–4 pemain · 3 menit · 5 soal'),select,btn('Buat ruangan',()=>update('create',{quest}),'gold'),
        heading('p','Juara mendapat 100 XP dan 30 RP. Finisher berikutnya mendapat 50 XP dan 12 RP. Kumpulkan RP untuk naik rank.'));
      const form=document.createElement('form'), input=document.createElement('input');
      input.placeholder='Kode ruangan';input.setAttribute('aria-label','Kode ruangan');input.maxLength=6;input.required=true;input.value=inputCode;
      input.oninput=()=>{inputCode=input.value};
      const join=document.createElement('button');join.textContent='Gabung';
      form.append(input,join);form.onsubmit=e=>{e.preventDefault();update('join',{code:input.value.trim().toUpperCase()})};
      rooms.append(form);
      for(const room of data.rooms) rooms.append(btn(questNames[room.quest]+' · '+room.code+' · '+room.count+'/4',()=>update('join',{code:room.code}),'roomLink'));
      if(!data.rooms.length) rooms.append(heading('p','Belum ada ruangan terbuka. Buat ruangan dan bagikan kodenya ke temanmu.'));
      area.append(create,rooms);
      return;
    }
    const me=r.members.find(p=>p.me), box=card(questNames[r.quest]), board=card(r.phase==='waiting'?'Pemain di lobi':'Klasemen balapan');
    area.append(box,board);
    box.append(heading('small','Ruangan '+r.code));
    if(r.phase==='waiting') {
      box.append(heading('p','Bagikan kode ruangan. Setelah semua pemain siap, tuan rumah bisa memulai balapan.'),btn(me.ready?'Batalkan siap':'Saya siap',()=>update('ready',{ready:!me.ready})));
      if(r.host) {
        const start=btn('Mulai balapan',()=>update('start'),'gold');
        start.disabled=r.members.length<2||!r.members.every(p=>p.ready);
        box.append(start);
      }
    } else if(count) box.append(heading('h3','Mulai dalam '+count+'…'));
    else if(me.place || r.phase==='result') {
      box.append(heading('h3',me.place===1?'Kamu juara!':me.place?'Finis di posisi '+me.place:'Waktu habis'),heading('p','Hadiahmu · +'+me.reward[0]+' XP · +'+me.reward[1]+' RP'));
      if(me.place) box.append(heading('p','Waktu finis '+me.elapsed.toFixed(2)+' detik'));
    } else if(r.question) {
      const time=heading('small','Sisa waktu '+remaining+' detik');time.id='arenaClock';
      box.append(heading('p','Soal '+(me.step+1)+' dari 5'),time,heading('h3',r.question.prompt));
      r.question.choices.forEach((choice,i)=>{
        const b=btn(choice,()=>update('answer',{step:me.step,choice:i}),'roomLink');b.disabled=retry>0;box.append(b);
      });
      if(retry) box.append(heading('p','Belum tepat. Coba lagi dalam '+retry+' detik.'));
    }
    const sorted=[...r.members].sort((a,b)=>(a.place||9)-(b.place||9)||b.step-a.step);
    for(const p of sorted) {
      const row=document.createElement('div');row.className='arenaRow';
      row.append(heading('strong',p.name+(p.me?' (kamu)':'')),heading('small',r.phase==='waiting'?(p.host?'Host · ':'')+(p.ready?'Siap':'Menunggu'):p.place?'#'+p.place+' · '+p.elapsed.toFixed(2)+' dtk':p.left?'Keluar':p.step+'/5'));
      board.append(row);
    }
    board.append(btn(r.phase==='waiting'?'Keluar ruangan':'Kembali ke lobi',()=>{
      if(r.phase!=='race'||me.place||window.confirm('Keluar sekarang akan mengakhiri balapanmu tanpa hadiah.')) update('leave');
    }));
  }
  update();
}
