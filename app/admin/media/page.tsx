"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";

const MEDIA_SLOTS = [
  { key: "hero_bg",         label: "Hero Background",       description: "Main hero section background image",    page: "Home" },
  { key: "signin_bg",       label: "Sign In Background",    description: "Right-side image on login page",         page: "Auth" },
  { key: "signup_bg",       label: "Sign Up Background",    description: "Right-side image on signup page",        page: "Auth" },
  { key: "dashboard_banner",label: "Dashboard Banner",      description: "Top banner in the main dashboard",       page: "Dashboard" },
  { key: "image_tool_bg",   label: "Image Tool Background", description: "Background in the image generation page", page: "Tools" },
  { key: "video_tool_bg",   label: "Video Tool Background", description: "Background in the video generation page", page: "Tools" },
  { key: "community_cover", label: "Community Cover",       description: "Cover image in community gallery",       page: "Gallery" },
  { key: "og_image",        label: "OG / Share Image",      description: "Open Graph image for social sharing",    page: "Meta" },
];

export default function AdminMediaManager() {
  const supabase = createClient();
  const [images, setImages] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("app_settings").select("key, value");
      const map: Record<string, string> = {};
      (data ?? []).forEach((row) => { map[row.key] = row.value; });
      setImages(map);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(key: string) {
    if (!inputUrl.trim()) return;
    setSaving(true);
    await supabase
      .from("app_settings")
      .upsert({ key, value: inputUrl.trim() }, { onConflict: "key" });
    setImages((prev) => ({ ...prev, [key]: inputUrl.trim() }));
    setSaving(false);
    setSaved(key);
    setEditing(null);
    setInputUrl("");
    setTimeout(() => setSaved(null), 2000);
  }

  function handleEdit(key: string) {
    setEditing(key);
    setInputUrl(images[key] ?? "");
  }

  const grouped = MEDIA_SLOTS.reduce<Record<string, typeof MEDIA_SLOTS>>((acc, slot) => {
    if (!acc[slot.page]) acc[slot.page] = [];
    acc[slot.page].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Media Manager</h1>
        <p className="text-sm text-white/30 mt-0.5">Control all images shown across the app</p>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
        <span className="text-amber-400 text-lg">💡</span>
        <p className="text-sm text-amber-300/80">
          Paste any image URL to update it instantly across the app. Changes are live immediately — no redeployment needed.
          Use direct image links (ending in .jpg, .png, .webp etc.)
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/20">Loading...</div>
      ) : (
        Object.entries(grouped).map(([page, slots]) => (
          <div key={page} className="space-y-3">
            <p className="text-xs font-semibold text-white/25 uppercase tracking-widest">{page}</p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {slots.map((slot) => (
                <div
                  key={slot.key}
                  className="bg-[#111] border border-white/5 rounded-xl overflow-hidden flex gap-0"
                >
                  {/* Preview */}
                  <div className="w-28 h-24 flex-shrink-0 bg-white/3 relative overflow-hidden">
                    {images[slot.key] ? (
                      <img
                        src={images[slot.key]}
                        alt={slot.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23222'/%3E%3Ctext y='55' x='50' text-anchor='middle' fill='%23555' font-size='12'%3E404%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white/15 text-xs">No image</span>
                      </div>
                    )}
                    {saved === slot.key && (
                      <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                        <span className="text-emerald-300 text-xl">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Info + Edit */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <p className="text-sm font-semibold text-white/80">{slot.label}</p>
                      <p className="text-xs text-white/30 mt-0.5">{slot.description}</p>
                    </div>
                    {editing === slot.key ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="url"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 min-w-0 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
                          onKeyDown={(e) => e.key === "Enter" && handleSave(slot.key)}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(slot.key)}
                          disabled={saving}
                          className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {saving ? "…" : "Save"}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-xs text-white/30 hover:text-white/60 transition-colors px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        {images[slot.key] && (
                          <span className="text-xs text-white/20 truncate flex-1 font-mono">
                            {images[slot.key].slice(0, 40)}…
                          </span>
                        )}
                        <button
                          onClick={() => handleEdit(slot.key)}
                          className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/90 px-3 py-1.5 rounded-lg transition-colors ml-auto flex-shrink-0"
                        >
                          {images[slot.key] ? "Change" : "Set Image"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
