import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import {CalendarDays,Clock3,MapPin,Heart,Send,ArrowLeft} from "lucide-react";
import "./style.css";
function PublicInvite(){
 const [rsvp,setRsvp]=useState("Hadir"),[name,setName]=useState(""),[message,setMessage]=useState("");
 let d;
 try{const raw=new URLSearchParams(location.search).get("data");const normalized=raw.replace(/-/g,"+").replace(/_/g,"/");d=JSON.parse(decodeURIComponent(escape(atob(normalized))));}
 catch{return <main className="public-error"><h1>Undangan tidak ditemukan</h1><p>Link undangan mungkin tidak lengkap atau rusak.</p><a href="/">Kembali ke VowInvite Studio</a></main>}
 const date=new Date((d.date||"2027-01-01")+"T00:00:00");
 const days=Math.max(0,Math.ceil((date.getTime()-new Date().setHours(0,0,0,0))/86400000));
 const maps="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent((d.venue||"")+" "+(d.address||""));
 const whatsapp=()=>{if(!name.trim())return;const text="Halo "+d.bride+" & "+d.groom+", saya "+name+". Konfirmasi kehadiran: "+rsvp+". "+message;const phone=(d.phone||"").replace(/[^0-9]/g,"");window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(text),"_blank","noopener,noreferrer");};
 return <div className={"public-page theme-"+(d.theme||"ivory")}><div className="public-top"><span>VOWINVITE STUDIO</span><a href="/" aria-label="Back to studio"><ArrowLeft size={16}/> Studio</a></div><section className="public-cover"><div className="public-flower">✳</div><span className="public-kicker">THE WEDDING CELEBRATION OF</span><h1>{d.bride}<i>&</i>{d.groom}</h1><div className="public-divider"/><p>{d.story}</p><div className="public-date"><CalendarDays size={16}/>{date.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div><div className="public-time"><Clock3 size={15}/>{d.time}</div><div className="public-count"><b>{days}</b><span>HARI MENUJU HARI BAHAGIA</span></div></section><section className="public-details"><span className="public-kicker">SAVE THE DATE</span><h2>Join our celebration</h2><div className="public-location"><MapPin size={20}/><b>{d.venue}</b><p>{d.address}</p><a href={maps} target="_blank" rel="noreferrer">Buka petunjuk lokasi ↗</a></div><form className="public-rsvp" onSubmit={e=>{e.preventDefault();whatsapp()}}><h2>Konfirmasi Kehadiran</h2><p>Mohon kabari kami apakah kamu dapat hadir.</p><label>Nama<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Nama lengkap"/></label><label>Kehadiran<select value={rsvp} onChange={e=>setRsvp(e.target.value)}><option>Hadir</option><option>Tidak hadir</option><option>Masih ragu</option></select></label><label>Ucapan (opsional)<textarea rows="3" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Tuliskan doa dan ucapan..."/></label><button type="submit"><Send size={16}/> Kirim RSVP via WhatsApp</button></form><footer><Heart size={14}/> Dengan cinta, {d.bride} & {d.groom}</footer></section></div>
}
export default PublicInvite;
