import { useState, useEffect, useMemo, useCallback } from "react";

// Vercel'de bu değişkeni ayarlayacağız — Railway URL'i buraya gelecek
const API = import.meta.env.VITE_API_URL || "https://web-production-fc41d.up.railway.app/api";

const C = {
  bg:"#100e1a", surface:"#17132a", card:"#1e1930", border:"#2e2748",
  purple1:"#7c6fcd", purple2:"#a594f9", purple3:"#c4b5fd",
  teal:"#5eead4", rose:"#fb7185", amber:"#fbbf24", sky:"#7dd3fc",
  text:"#ede9fe", textMid:"#a599d1", textSub:"#6b5f9e",
};

const LEAGUES = [
  { id:"all",        name:"Tüm Ligler", flag:"🌍", accent:C.purple2 },
  { id:"serie_a",    name:"Serie A",    flag:"🇮🇹", accent:"#6ee7b7" },
  { id:"la_liga",    name:"LaLiga",     flag:"🇪🇸", accent:"#fb7185" },
  { id:"bundesliga", name:"Bundesliga", flag:"🇩🇪", accent:"#fbbf24" },
];

const STATUS = {
  injured:   { label:"Sakat",   icon:"🤕", color:C.rose,  bg:"#2d1120" },
  suspended: { label:"Cezalı",  icon:"🟥", color:C.amber, bg:"#2a1f08" },
  doubtful:  { label:"Şüpheli", icon:"⚠️", color:C.sky,   bg:"#0d1e2e" },
};

const getAccent = id => LEAGUES.find(l => l.id === id)?.accent || C.purple2;
const daysLeft  = d  => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;

function Orb({ style }) {
  return <div style={{ position:"absolute", borderRadius:"50%", filter:"blur(80px)", opacity:0.18, pointerEvents:"none", ...style }} />;
}

function StatPill({ label, value, icon, color, loading }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 22px", display:"flex", alignItems:"center", gap:14, flex:1, minWidth:0, transition:"box-shadow 0.3s,border-color 0.3s" }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 0 28px -8px ${color}55`; e.currentTarget.style.borderColor=color+"66"; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow=""; e.currentTarget.style.borderColor=C.border; }}>
      <div style={{ width:44,height:44,borderRadius:12,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:26,fontWeight:800,color:C.text,lineHeight:1 }}>{loading ? <span style={{opacity:0.3}}>—</span> : value}</div>
        <div style={{ fontSize:10,color:C.textSub,marginTop:3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em" }}>{label}</div>
      </div>
      <div style={{ marginLeft:"auto",width:4,height:32,borderRadius:4,background:`linear-gradient(to bottom,${color},${color}44)` }} />
    </div>
  );
}

function LeagueTab({ league, active, onClick }) {
  const on = active === league.id;
  return (
    <button onClick={onClick} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,border:"none",background:on?`linear-gradient(135deg,${league.accent}28,${league.accent}10)`:"transparent",color:on?league.accent:C.textSub,fontWeight:on?700:500,fontSize:13,cursor:"pointer",outline:on?`1.5px solid ${league.accent}55`:"1.5px solid transparent",transition:"all 0.2s",fontFamily:"inherit",whiteSpace:"nowrap" }}>
      <span style={{fontSize:16}}>{league.flag}</span>{league.name}
    </button>
  );
}

function Chip({ label, active, onClick, color }) {
  const c = color || C.purple2;
  return (
    <button onClick={onClick} style={{ padding:"7px 14px",borderRadius:8,border:"none",background:active?c+"22":C.surface,color:active?c:C.textSub,fontWeight:active?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit",outline:active?`1.5px solid ${c}55`:`1.5px solid ${C.border}`,transition:"all 0.18s",whiteSpace:"nowrap" }}>{label}</button>
  );
}

function PlayerCard({ player }) {
  const s = STATUS[player.status];
  const days = daysLeft(player.ret);
  const accent = getAccent(player.league);
  const league = LEAGUES.find(l => l.id === player.league);
  return (
    <div style={{ background:C.card,borderRadius:16,padding:"18px 20px",border:`1px solid ${C.border}`,position:"relative",overflow:"hidden",transition:"transform 0.2s,box-shadow 0.2s,border-color 0.2s" }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 12px 40px -12px ${accent}44`; e.currentTarget.style.borderColor=accent+"55"; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; e.currentTarget.style.borderColor=C.border; }}>
      <div style={{ position:"absolute",left:0,top:12,bottom:12,width:3,borderRadius:"0 3px 3px 0",background:`linear-gradient(to bottom,${accent},${accent}44)` }} />
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,paddingLeft:8 }}>
        <div>
          <div style={{ fontWeight:800,fontSize:15,color:C.text,letterSpacing:"-0.01em" }}>{player.name}</div>
          <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:4 }}>
            {league && <span style={{ fontSize:10,fontWeight:700,color:league.accent,background:league.accent+"18",borderRadius:6,padding:"2px 7px" }}>{league.flag} {league.name}</span>}
            <span style={{ fontSize:12,color:C.textMid }}>{player.team}</span>
          </div>
        </div>
        <span style={{ background:s.bg,color:s.color,borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4,border:`1px solid ${s.color}33` }}>{s.icon} {s.label}</span>
      </div>
      <div style={{ display:"flex",gap:10,paddingLeft:8 }}>
        {[["SEBEP", player.desc||"Bilinmiyor", C.textMid], ["DÖNÜŞ", days===null?"—":days<=0?"Bu hafta":`${days} gün`, days===null?C.textSub:days<=3?C.rose:days<=7?C.amber:C.teal]].map(([lbl,val,col])=>(
          <div key={lbl} style={{ flex:1,background:C.surface,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:9,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3 }}>{lbl}</div>
            <div style={{ fontSize:13,fontWeight:600,color:col }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ background:C.card,borderRadius:16,padding:"18px 20px",border:`1px solid ${C.border}` }}>
      <div style={{ height:14,background:C.border,borderRadius:6,width:"60%",marginBottom:10,animation:"pulse 1.5s infinite" }} />
      <div style={{ height:10,background:C.border,borderRadius:6,width:"40%",marginBottom:16,animation:"pulse 1.5s infinite" }} />
      <div style={{ display:"flex",gap:10 }}>
        <div style={{ flex:1,height:48,background:C.border,borderRadius:10,animation:"pulse 1.5s infinite" }} />
        <div style={{ flex:1,height:48,background:C.border,borderRadius:10,animation:"pulse 1.5s infinite" }} />
      </div>
    </div>
  );
}

export default function App() {
  const [players, setPlayers]           = useState([]);
  const [teams,   setTeams]             = useState([]);
  const [league,  setLeague]            = useState("all");
  const [team,    setTeam]              = useState("Tüm Takımlar");
  const [status,  setStatus]            = useState("all");
  const [search,  setSearch]            = useState("");
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastUpdate, setLastUpdate]     = useState("—");
  const [toast,   setToast]             = useState(null);
  const [mounted, setMounted]           = useState(false);

  useEffect(()=>{ setTimeout(()=>setMounted(true), 50); }, []);
  useEffect(()=>{ setTeam("Tüm Takımlar"); }, [league]);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),5000); };

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (league !== "all")          p.set("league", league);
      if (team !== "Tüm Takımlar")   p.set("team", team);
      if (status !== "all")          p.set("status", status);
      if (search)                    p.set("q", search);
      const res  = await fetch(`${API}/players?${p}`);
      const data = await res.json();
      setPlayers(data.players || []);
      if (data.last_updated) setLastUpdate(data.last_updated);
    } catch {
      showToast("❌ API'ye bağlanılamadı", "error");
    } finally { setLoading(false); }
  }, [league, team, status, search]);

  const loadTeams = useCallback(async () => {
    try {
      const q   = league !== "all" ? `?league=${league}` : "";
      const res  = await fetch(`${API}/teams${q}`);
      const data = await res.json();
      setTeams(["Tüm Takımlar", ...(data.teams||[])]);
    } catch {}
  }, [league]);

  useEffect(()=>{ setLoading(true); load(); },    [load]);
  useEffect(()=>{ loadTeams(); },                 [loadTeams]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res  = await fetch(`${API}/refresh`, {method:"POST"});
      const data = await res.json();
      if (data.status === "success") { showToast(`✅ ${data.updated} oyuncu güncellendi`); setLastUpdate(data.last_updated); load(); }
      else showToast(`⚠️ ${data.message||"Hata"}`, "warn");
    } catch { showToast("❌ Bağlantı hatası","error"); }
    setRefreshing(false);
  };

  const counts = useMemo(()=>({
    injured:   players.filter(p=>p.status==="injured").length,
    suspended: players.filter(p=>p.status==="suspended").length,
    doubtful:  players.filter(p=>p.status==="doubtful").length,
  }), [players]);

  const tc = toast?.type==="error"?C.rose:toast?.type==="warn"?C.amber:C.teal;

  return (
    <div style={{ minHeight:"100vh",background:C.bg,fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",color:C.text,position:"relative",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        input::placeholder{color:${C.textSub};}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:${C.surface};}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes toastIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
        @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
      `}</style>

      <Orb style={{width:480,height:480,background:C.purple1,top:-140,left:-100}}/>
      <Orb style={{width:360,height:360,background:"#5eead4",bottom:100,right:-80}}/>
      <Orb style={{width:240,height:240,background:"#fb7185",top:"40%",right:"30%"}}/>

      {toast && (
        <div style={{ position:"fixed",bottom:28,right:28,zIndex:999,background:"#1a1530",border:`1px solid ${tc}44`,borderRadius:14,padding:"14px 22px",fontSize:13,fontWeight:600,color:tc,boxShadow:`0 16px 48px -8px ${C.purple1}44`,animation:"toastIn 0.35s ease" }}>{toast.msg}</div>
      )}

      {/* HEADER */}
      <header style={{ position:"sticky",top:0,zIndex:100,background:C.surface+"ee",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"0 32px" }}>
        <div style={{ maxWidth:1280,margin:"0 auto",height:66,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${C.purple1},${C.purple2},${C.teal})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:`0 4px 18px ${C.purple1}55` }}>⚡</div>
            <div>
              <div style={{ fontWeight:900,fontSize:15,letterSpacing:"-0.03em",background:`linear-gradient(90deg,${C.purple3},${C.teal},${C.purple3})`,backgroundSize:"200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 4s linear infinite" }}>BATINGUN MASTER TOOL</div>
              <div style={{ fontSize:9,color:C.textSub,letterSpacing:"0.12em",fontWeight:500,marginTop:1 }}>INJURY & SUSPENSION MONITOR</div>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:16 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:9,color:C.textSub,letterSpacing:"0.06em",textTransform:"uppercase" }}>Son Güncelleme</div>
              <div style={{ fontSize:12,color:C.textMid,fontWeight:600,marginTop:1 }}>{lastUpdate}</div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:refreshing?C.amber:C.teal,boxShadow:`0 0 8px ${refreshing?C.amber:C.teal}` }} />
              <span style={{ fontSize:11,color:C.textSub }}>{refreshing?"Yükleniyor":"Canlı"}</span>
            </div>
            <button onClick={refresh} disabled={refreshing} style={{ background:refreshing?C.surface:`linear-gradient(135deg,${C.purple1},${C.purple2})`,color:refreshing?C.textSub:"#fff",border:`1px solid ${refreshing?C.border:"transparent"}`,borderRadius:11,padding:"8px 18px",fontWeight:700,fontSize:12,cursor:refreshing?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,boxShadow:refreshing?"none":`0 4px 16px ${C.purple1}44` }}>
              <span style={{ display:"inline-block",animation:refreshing?"spin 0.8s linear infinite":"none",fontSize:14 }}>🔄</span>
              {refreshing?"Güncelleniyor…":"Yenile"}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1280,margin:"0 auto",padding:"28px 32px" }}>
        {/* STATS */}
        <div style={{ display:"flex",gap:14,marginBottom:28,opacity:mounted?1:0,transform:mounted?"none":"translateY(16px)",transition:"opacity 0.5s,transform 0.5s" }}>
          <StatPill label="Sakat Oyuncu"  value={counts.injured}   icon="🤕" color={C.rose}  loading={loading}/>
          <StatPill label="Cezalı Oyuncu" value={counts.suspended} icon="🟥" color={C.amber} loading={loading}/>
          <StatPill label="Şüpheli Durum" value={counts.doubtful}  icon="⚠️" color={C.sky}   loading={loading}/>
          <div style={{ flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"18px 22px",display:"flex",alignItems:"center",gap:10 }}>
            <div style={{fontSize:24}}>⏰</div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.textMid}}>Otomatik Cron</div>
              <code style={{fontSize:11,color:C.purple3,background:C.surface,padding:"2px 8px",borderRadius:5,display:"inline-block",marginTop:3,border:`1px solid ${C.border}`}}>Pazartesi 22:00</code>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div style={{ background:C.card,borderRadius:18,border:`1px solid ${C.border}`,padding:"20px 24px",marginBottom:24,opacity:mounted?1:0,transform:mounted?"none":"translateY(16px)",transition:"opacity 0.5s 0.1s,transform 0.5s 0.1s" }}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,flexWrap:"wrap"}}>
            <span style={{fontSize:10,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700,marginRight:4}}>LİG</span>
            {LEAGUES.map(l=><LeagueTab key={l.id} league={l} active={league} onClick={()=>setLeague(l.id)}/>)}
          </div>
          <div style={{height:1,background:C.border,marginBottom:16}}/>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{position:"relative",flex:1,minWidth:200}}>
              <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:0.5}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Oyuncu veya takım ara…"
                style={{width:"100%",padding:"9px 12px 9px 38px",background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}
                onFocus={e=>e.target.style.borderColor=C.purple2}
                onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
            {league !== "all" && teams.length > 1 && (
              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:10,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700}}>TAKIM</span>
                {teams.map(t=><Chip key={t} label={t==="Tüm Takımlar"?"Tümü":t} active={team===t} onClick={()=>setTeam(t)} color={getAccent(league)}/>)}
              </div>
            )}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:10,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700}}>DURUM</span>
              <Chip label="Tümü" active={status==="all"} onClick={()=>setStatus("all")} color={C.purple2}/>
              {Object.entries(STATUS).map(([k,v])=><Chip key={k} label={`${v.icon} ${v.label}`} active={status===k} onClick={()=>setStatus(k)} color={v.color}/>)}
            </div>
          </div>
        </div>

        <div style={{fontSize:12,color:C.textSub,marginBottom:16,fontWeight:500}}>
          <span style={{color:C.purple3,fontWeight:700}}>{players.length}</span> oyuncu gösteriliyor
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:14}}>
            {Array(6).fill(0).map((_,i)=><Skeleton key={i}/>)}
          </div>
        ) : players.length === 0 ? (
          <div style={{textAlign:"center",padding:"80px 0",color:C.textSub}}>
            <div style={{fontSize:52,marginBottom:12}}>🔍</div>
            <div style={{fontWeight:700,fontSize:16,color:C.textMid}}>Sonuç bulunamadı</div>
            <div style={{fontSize:13,marginTop:6}}>Filtrelerinizi değiştirmeyi deneyin</div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:14}}>
            {players.map((p,i)=>(
              <div key={p.id} style={{animation:`fadeUp 0.4s ease ${Math.min(i*0.03,0.5)}s both`}}>
                <PlayerCard player={p}/>
              </div>
            ))}
          </div>
        )}

        <div style={{marginTop:36,textAlign:"center",color:C.textSub,fontSize:11,letterSpacing:"0.06em"}}>
          BATINGUN MASTER TOOL © 2026 · S Sport Plus
        </div>
      </main>
    </div>
  );
}
