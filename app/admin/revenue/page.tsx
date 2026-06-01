import { createClient } from "@/lib/supabaseServer";

export default async function AdminRevenue() {
  const supabase = createClient();

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [{ data: allSubs }, { data: recent }] = await Promise.all([
    supabase.from("subscriptions").select("plan, amount, created_at, status"),
    supabase.from("subscriptions").select("plan, amount, created_at").gte("created_at", since30d).order("created_at", { ascending: false }),
  ]);

  const revenueByPlan: Record<string, { count: number; total: number }> = {};
  (allSubs ?? []).forEach((row) => {
    if (!revenueByPlan[row.plan]) revenueByPlan[row.plan] = { count: 0, total: 0 };
    revenueByPlan[row.plan].count++;
    revenueByPlan[row.plan].total += Number(row.amount);
  });

  const totalRevenue = Object.values(revenueByPlan).reduce((s, v) => s + v.total, 0);
  const totalSubs    = Object.values(revenueByPlan).reduce((s, v) => s + v.count, 0);

  const todaySubs = (allSubs ?? []).filter((s) => s.created_at >= todayStart);
  const todayRevenue = todaySubs.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Revenue</h1>
        <p className="text-sm text-white/30 mt-0.5">Subscription revenue breakdown</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-xs text-white/30 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-bold text-emerald-300 mt-1">₹{totalRevenue.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-white/30 uppercase tracking-wider">Today's Revenue</p>
          <p className="text-3xl font-bold text-white mt-1">₹{todayRevenue.toLocaleString("en-IN")}</p>
          <p className="text-xs text-white/20 mt-1">{todaySubs.length} new subs</p>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-white/30 uppercase tracking-wider">Total Subscriptions</p>
          <p className="text-3xl font-bold text-white mt-1">{totalSubs}</p>
        </div>
      </div>

      {/* Plan breakdown */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Revenue by Plan</h2>
        <div className="space-y-3">
          {Object.entries(revenueByPlan)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([plan, { count, total }]) => (
              <div key={plan} className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-sm text-white/70 capitalize w-24">{plan}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${totalRevenue > 0 ? Math.round((total / totalRevenue) * 100) : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-white/30 w-16 text-right">{count} users</span>
                <span className="text-sm font-semibold text-emerald-300 w-24 text-right">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          {Object.keys(revenueByPlan).length === 0 && (
            <p className="text-sm text-white/20 text-center py-4">No subscription data yet</p>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <span className="text-sm font-medium text-white/60">Recent Transactions (30 days)</span>
        </div>
        <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
          {(recent ?? []).map((t, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-white/3 transition-colors">
              <div>
                <span className="text-sm text-white/70 capitalize">{t.plan}</span>
                <span className="text-xs text-white/20 ml-3">
                  {new Date(t.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <span className="text-sm font-semibold text-emerald-400">₹{Number(t.amount).toLocaleString("en-IN")}</span>
            </div>
          ))}
          {(recent ?? []).length === 0 && (
            <p className="text-sm text-white/20 text-center py-4">No transactions</p>
          )}
        </div>
      </div>
    </div>
  );
}
