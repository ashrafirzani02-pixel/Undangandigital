import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

function requireClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY di Vercel.");
  }
  return supabase;
}

export async function getSession() {
  const client = requireClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signUp(email, password) {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({ email: email.trim(), password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = requireClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function listInvitations() {
  const client = requireClient();
  const { data, error } = await client.from("invitations")
    .select("id,slug,title,content,is_published,created_at,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveInvitation({ id, slug, title, content, isPublished = false }) {
  const client = requireClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Silakan login terlebih dahulu.");
  const row = {
    owner_id: auth.user.id,
    slug,
    title,
    content,
    is_published: isPublished,
    updated_at: new Date().toISOString()
  };
  const query = id
    ? client.from("invitations").update(row).eq("id", id)
    : client.from("invitations").insert(row);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

export async function getPublishedInvitation(slug) {
  const client = requireClient();
  const { data, error } = await client.from("invitations")
    .select("id,slug,title,content,is_published")
    .eq("slug", slug).eq("is_published", true).single();
  if (error) throw error;
  return data;
}

export async function submitRsvp({ invitationId, guestName, attendance, message = "" }) {
  const client = requireClient();
  const { data, error } = await client.from("invitation_rsvps").insert({
    invitation_id: invitationId,
    guest_name: guestName.trim(),
    attendance,
    message
  }).select("id,guest_name,attendance,message,created_at").single();
  if (error) throw error;
  return data;
}

export async function listRsvps(invitationId) {
  const client = requireClient();
  const { data, error } = await client.from("invitation_rsvps")
    .select("id,guest_name,attendance,message,created_at")
    .eq("invitation_id", invitationId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadInvitationMedia(file, invitationId) {
  const client = requireClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Silakan login terlebih dahulu.");
  const isImage = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");
  if (!isImage && !isAudio) throw new Error("Format file tidak didukung.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Ukuran file maksimal 15 MB.");
  const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-90);
  const path = `${auth.user.id}/${invitationId}/${crypto.randomUUID()}-${safeName}`;
  const { data, error } = await client.storage.from("invitation-media").upload(path, file, {
    upsert: false,
    contentType: file.type,
    cacheControl: "3600"
  });
  if (error) throw error;
  const { data: publicData } = client.storage.from("invitation-media").getPublicUrl(data.path);
  return { path: data.path, publicUrl: publicData.publicUrl, kind: isImage ? "photo" : "audio" };
}
