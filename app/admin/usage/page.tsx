import { createClient } from "@/lib/supabaseServer";

const TOOL_LABELS: Record<string, string> = {
  image_generation:      "🖼️ Image Generation",
  thumbnail_generation:  "🎨 Thumbnail",
  broll_generation:      "🎬 B-Roll Video",
  ai_cut_editor:         "✂️ AI Cut Editor",
  text_to_speech:        "🔊 Text to Speech",
  script_generation:     "📝 Script",
  usage:                 "⚡ General",
};

export default async function AdminUsage() {
  const supabase = createClient();

  const since7d  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString();
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [logs7d, logsToday, topUsers] = await Promise.all([
    supabase.from("credit_logs").select("amount, reason, created_at").gte("created_at", since7d).order("created_at", { ascending: false }),
    supabase.from("credit_logs").select("amount, reason").gte("created_at", todayStart),
    supabase.from("credit_logs").select("user_id, amount, reason").gte("created_at", since30d),
  ]);

  // Tool breakdown (7d)
  const toolMap7d: Record<string, number> = {};
  (logs7d.data ?? []).forEach((row) => {
    const k = row.reason ?? "other";
    toolMap7d[k] = (toolMap7d[k] ?? 0) + Math.abs(row.amount);
  });

  // Today's usage
  const toolMapToday: Record<string, number> = {};
  (logsToday.data ?? []).forEach((row) => {
    const k = row.reason ?? "other";
    toolMapToday[k] = (toolMapToday[k] ?? 0) + Math.abs(row.amount);
  });

  // Per-user usage (30d)
  const userMap: Record<string, number> = {};
  (topUsers.data ?? []).forEach((row) => {
    userMap[row.user_id] = (userMap[row.user_id] ?? 0) + Math.abs(row.amount);
  });
  const topUserEntries = Object.entries(userMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Daily buckets (last 7 days)
  const dailyMap: Record<string, number> = {};
  (logs7d.data ?? []).forEach((row) => {
    const day = row.created_at.slice(0, 10);
    dailyMap[day] = (dailyMap[day] ?? 0) + Math.abs(row.amount);
  });
  const dailyEntries = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b));
  const maxDaily = Math.max(...dailyEntries.map(([, v]) => v), 1);

  const totalToday = Object.values(toolMapToday).reduce((s, v) => s + v, 0);
  const total7d    = Object.values(toolMap7d).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Usage Analytics</h1>
        <p className="text-sm text-white/30 mt-0.5">Credits consumed per tool and per user</p>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-white/30 uppercase tracking-wider">Credits Used Today</p>
          <p className="text-3xl font-bold text-amber-300 mt-1">{totalToday}</p>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-white/30 uppercase tracking-wider">Credits Used (7 Days)</p>
          <p className="text-3xl font-bold text-violet-300 mt-1">{total7d}</p>
        </div>
      </div>

      {/* Daily bar chart (7d) */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Daily Usage — Last 7 Days</h2>
        {dailyEntries.length === 0 ? (
          <p className="text-sm text-white/20 text-center py-4">No data</p>
        ) : (
          <div className="flex items-end gap-2 h-24">
            {dailyEntries.map(([day, val]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-violet-500/70 rounded-sm transition-all"
                  style={{ height: `${Math.round((val / maxDaily) * 80)}px` }}
                />
                <span className="text-[10px] text-white/20">
                  {new Date(day).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Tool breakdown 7d */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">By Tool (7 Days)</h2>
          <div className="space-y-3">
            {Object.entries(toolMap7d).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
              <div key={reason} className="flex items-center justify-between">
                <span className="text-sm text-white/60">
                  {TOOL_LABELS[reason] ?? reason.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-semibold text-white/80">{count} credits</span>
              </div>
            ))}
            {Object.keys(toolMap7d).length === 0 && (
              <p className="text-sm text-white/20">No data</p>
            )}
          </div>
        </div>

        {/* Top users 30d */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Top Users by Credits (30 Days)</h2>
          <div className="space-y-3">
            {topUserEntries.map(([userId, total], i) => (
              <div key={userId} className="flex items-center gap-3">
                <span className="text-xs text-white/20 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${Math.round((total / (topUserEntries[0]?.[1] ?? 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-white/50 font-mono">{userId.slice(0, 8)}…</span>
                <span className="text-xs font-semibold text-white/70 w-16 text-right">{total} cr</span>
              </div>
            ))}
            {topUserEntries.length === 0 && (
              <p className="text-sm text-white/20">No data</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent log */}
      <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <span className="text-sm font-medium text-white/60">Recent Usage Events</span>
        </div>
        <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
          {(logs7d.data ?? []).slice(0, 50).map((u, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-white/3 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 font-mono">
                  {new Date(u.created_at).toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-white/60">
                  {TOOL_LABELS[u.reason ?? ""] ?? (u.reason ?? "unknown")}
                </span>
              </div>
              <span className={`text-sm font-semibold ${u.amount < 0 ? "text-red-400" : "text-emerald-400"}`}>
                {u.amount < 0 ? "" : "+"}{u.amount} credits
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
