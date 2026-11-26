import React, { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabaseClient.js";

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setSession(data?.session || null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setMessage("Akun berhasil dibuat. Periksa email untuk konfirmasi, lalu masuk kembali.");
      } else {
        setMessage("Berhasil masuk.");
      }
    } catch (err) {
      setError(err.message || "Autentikasi gagal.");
    } finally { setBusy(false); }
  };

  if (!isSupabaseConfigured) return <>{children}</>;
  if (loading) return <div className="auth-screen"><div className="auth-card">Memeriksa sesi akun...</div></div>;
  if (session) return <>{children}</>;

  return <div className="auth-screen">
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-mark">✿</div>
      <span className="overline">VOWINVITE STUDIO</span>
      <h1>{mode === "login" ? "Welcome back." : "Create your workspace."}</h1>
      <p>{mode === "login" ? "Masuk untuk mengelola undangan dan RSVP." : "Buat akun untuk menyimpan undangan di cloud."}</p>
      <label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com"/></label>
      <label>Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimal 8 karakter"/></label>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-message">{message}</div>}
      <button className="btn dark wide" disabled={busy}>{busy ? "Memproses..." : mode === "login" ? "Masuk" : "Buat akun"}</button>
      <button type="button" className="auth-switch" onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");setMessage("");}}>
        {mode === "login" ? "Belum punya akun? Buat akun" : "Sudah punya akun? Masuk"}
      </button>
      <small className="auth-note">Akun digunakan untuk menyimpan data undangan di project Supabase milikmu.</small>
    </form>
  </div>;
}
