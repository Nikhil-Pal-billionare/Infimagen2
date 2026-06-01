import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export default async function AdminSubmissionsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6 text-red-400">Unauthorized</div>;
  }

  const { data: submissions, error } = await supabase
    .from("talent_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-6 text-red-400">{error.message}</div>;
  }

  const submissionsWithUrls = await Promise.all(
    submissions.map(async (item) => {
      const { data } = await supabase.storage
        .from("user-submissions")
        .createSignedUrl(item.image_path, 60 * 60);
      return { ...item, signedUrl: data?.signedUrl ?? null };
    })
  );

  const winners   = submissionsWithUrls.filter((s) => s.is_winner);
  const pending   = submissionsWithUrls.filter((s) => !s.is_winner);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Submissions</h1>
        <p className="text-sm text-white/30 mt-0.5">Talent submissions from users</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-white/30 uppercase tracking-wider">Total Submissions</p>
          <p className="text-3xl font-bold text-white mt-1">{submissionsWithUrls.length}</p>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-white/30 uppercase tracking-wider">Winners Picked</p>
          <p className="text-3xl font-bold text-amber-300 mt-1">{winners.length}</p>
        </div>
      </div>

      {/* Winners */}
      {winners.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-amber-400/60 uppercase tracking-widest mb-3">🏆 Winners</p>
          <div className="grid md:grid-cols-3 gap-4">
            {winners.map((item) => (
              <SubmissionCard key={item.id} item={item} isWinner />
            ))}
          </div>
        </div>
      )}

      {/* Pending */}
      <div>
        <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">Pending Review</p>
        {pending.length === 0 ? (
          <p className="text-sm text-white/20 text-center py-8 bg-[#111] border border-white/5 rounded-xl">
            No pending submissions
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {pending.map((item) => (
              <SubmissionCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionCard({ item, isWinner }: { item: any; isWinner?: boolean }) {
  return (
    <div className={`rounded-xl border overflow-hidden flex flex-col ${
      isWinner
        ? "border-amber-500/30 bg-amber-500/5"
        : "border-white/5 bg-[#111]"
    }`}>
      <div className="relative aspect-square bg-black/20 overflow-hidden">
        {item.signedUrl ? (
          <img
            src={item.signedUrl}
            alt="Submission"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-white/20">
            Image unavailable
          </div>
        )}
        {isWinner && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🏆 Winner
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        {item.caption && (
          <p className="text-xs text-white/60 line-clamp-2">{item.caption}</p>
        )}
        <p className="text-xs text-white/20">
          {new Date(item.created_at).toLocaleString("en-IN")}
        </p>

        {!isWinner && (
          <div className="flex gap-2 mt-auto pt-1">
            <form action={markWinner}>
              <input type="hidden" name="id" value={item.id} />
              <button className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs py-1.5 px-3 rounded-lg transition-colors">
                🏆 Winner
              </button>
            </form>
            <form action={deleteSubmission}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="path" value={item.image_path} />
              <button className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs py-1.5 px-3 rounded-lg transition-colors">
                Delete
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

async function markWinner(formData: FormData) {
  "use server";
  const supabase = createClient();
  const id = formData.get("id") as string;
  await supabase.from("talent_submissions").update({ is_winner: true }).eq("id", id);
  revalidatePath("/admin/submissions");
}

async function deleteSubmission(formData: FormData) {
  "use server";
  const supabase = createClient();
  const id   = formData.get("id")   as string;
  const path = formData.get("path") as string;
  await supabase.storage.from("user-submissions").remove([path]);
  await supabase.from("talent_submissions").delete().eq("id", id);
  revalidatePath("/admin/submissions");
}
