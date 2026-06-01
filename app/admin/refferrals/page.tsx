import { createClient } from "@/lib/supabaseServer";

export default async function AdminReferrals() {
  const supabase = createClient();

  const { data } = await supabase
    .from("referrals")
    .select("code, reward, created_at")
    .order("created_at", { ascending: false });

  const totalReward = (data ?? []).reduce((s, r) => s + Number(r.reward), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Referrals</h1>
        <p className="text-sm text-white/30 mt-0.5">All referral codes and rewards</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-white/30 uppercase tracking-wider">Total Referrals</p>
          <p className="text-3xl font-bold text-violet-300 mt-1">{(data ?? []).length}</p>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-white/30 uppercase tracking-wider">Total Rewards Given</p>
          <p className="text-3xl font-bold text-emerald-300 mt-1">₹{totalReward.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <span className="text-sm font-medium text-white/60">All Referral Codes</span>
        </div>
        <div className="divide-y divide-white/5">
          {(data ?? []).map((r, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-white/3 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
                  {r.code}
                </span>
                <span className="text-xs text-white/20">
                  {new Date(r.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <span className="text-sm font-semibold text-emerald-400">₹{r.reward}</span>
            </div>
          ))}
          {(data ?? []).length === 0 && (
            <p className="text-sm text-white/20 text-center py-8">No referrals yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
