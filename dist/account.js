'use strict';
const sessionKey = 'nahwuquest-session-v4';
let session = '', isTeacher = false, revision = 0, version = 0, worlds = [], saving = false;
let lessons = [], bank = [];
async function requestAccount(action, fields = {}) {
  const sentSession = session;
  const response = await fetch(window.NAHWU_ARENA_URL, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({service:'account', action, session, ...fields}),
    signal:AbortSignal.timeout(20000)
  });
  if (!response.headers.get('content-type')?.includes('application/json'))
    throw Error('API akun belum terhubung. Periksa konfigurasi deployment.');
  const result = await response.json();
  if (result.expired && session === sentSession) clearSession();
  if (!response.ok || result.error) throw Error(result.error || 'Server belum tersedia.');
  return result;
}
function setCatalog(data) {
  worlds = data.worlds; version = data.version;
  lessons = []; bank = [];
  for (const world of worlds) for (const q of world.quests) {
    lessons[q.id] = q.lesson; bank[q.id] = q.questions;
  }
}
function clearSession() {
  session = ''; user = null; isTeacher = false;
  localStorage.removeItem(sessionKey); sessionStorage.removeItem(sessionKey);
  if (dialog.open) dialog.close();
  render();
}
function accept(data) {
  session = data.session; user = data.profile; isTeacher = data.teacher;
  revision = data.revision; setCatalog(data); pos = 18; render();
}
async function save(change) {
  if (saving) { message('Sedang menyimpan. Coba lagi sebentar.', true); return false; }
  saving = true;
  try {
    const ownerSession=session;
    const fresh = JSON.parse(JSON.stringify(user));
    change(fresh);
    const result = await requestAccount('save', {profile:fresh, revision, version});
    if (session !== ownerSession) return false;
    revision = result.revision; user = fresh; return true;
  } catch (err) {
    message(err.message,true);
    if (dialog.open) {
      const note = $('saveError') || heading('p','');
      note.id = 'saveError'; note.textContent = err.message; panel.append(note);
    }
    return false;
  } finally { saving = false; }
}
function fieldInput(parent, label, value='', props={}) {
  const wrap = document.createElement('label'), input = document.createElement('input');
  wrap.append(heading('span',label),input); input.value=value;
  Object.assign(input,props); parent.append(wrap); return input;
}
function authHome(area, side, register=false) {
  area.replaceChildren(heading('h2',register?'Buat akun':'Masuk bermain'));
  side.replaceChildren(heading('h2',register?'Sudah punya akun?':'Baru di NahwuQuest?'),
    heading('p',register?'Masuk untuk melanjutkan petualanganmu.':'Simpan progres dan lanjutkan quest dari perangkat lain.'),
    btn(register?'Masuk':'Daftar akun',()=>authHome(area,side,!register)));
  const form=document.createElement('form'); form.className='accountForm'; area.append(form);
  const login=fieldInput(form,'Nama pengguna','',{required:true,maxLength:48,autocomplete:'username'});
  const pass=fieldInput(form,'Kata sandi','',{type:'password',required:true,minLength:register?8:1,maxLength:128,autocomplete:register?'new-password':'current-password'});
  let name, profiles=[], select;
  if(register) {
    name=fieldInput(form,'Nama karakter','',{required:true,maxLength:24,autocomplete:'nickname'});
    try {
      profiles=Object.keys(localStorage).filter(k=>k.startsWith('nahwuquest-player-v3:')).map(k=>JSON.parse(localStorage.getItem(k))).filter(p=>p?.name);
      if(!profiles.length) {
        const p=JSON.parse(localStorage.getItem('nahwuquest-atlas-v2')||localStorage.getItem('nahwuquest-v1')||'null');
        if(p)profiles.push({...p,name:p.name||'Petualang lama'});
      }
    } catch {}
    if(profiles.length){
      const label=heading('label','Progres awal'); select=document.createElement('select');
      select.add(new Option('Mulai dari awal',''));
      profiles.forEach((p,i)=>select.add(new Option('Impor profil lokal · '+p.name,i)));
      select.onchange=()=>{if(select.value!=='')name.value=profiles[select.value].name};
      label.append(select);form.append(label);
    }
  }
  const rememberLabel=document.createElement('label'),remember=document.createElement('input');
  remember.type='checkbox';rememberLabel.append(remember,' Tetap masuk di perangkat ini');form.append(rememberLabel);
  const submit=document.createElement('button');submit.className='gold';submit.textContent=register?'Daftar dan bermain':'Masuk';form.append(submit);
  form.onsubmit=async e=>{
    e.preventDefault();submit.disabled=true;
    try {
      const profile=register?{...(select && select.value!==''?profiles[select.value]:{}),name:name.value}:undefined;
      const data=await requestAccount(register?'register':'login',{login:login.value,password:pass.value,profile});
      sessionStorage.setItem(sessionKey,data.session);
      if(remember.checked)localStorage.setItem(sessionKey,data.session);else localStorage.removeItem(sessionKey);
      accept(data);message('Selamat datang, '+user.name+'.');
    } catch(err){message(err.message,true)} finally {submit.disabled=false}
  };
}
async function logout() {
  try {await requestAccount('logout');clearSession()} catch(err){message(err.message,true)}
}
async function boot() {
  try {
    session=sessionStorage.getItem(sessionKey)||localStorage.getItem(sessionKey)||'';
    if(session){main.textContent='Memuat progres…';accept(await requestAccount('resume'))}
    else render();
  } catch(err){render();message(err.message,true)}
}
