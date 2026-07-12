export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-4 py-2">
      <div className="h-10 w-56 rounded-xl bg-white/20" />
      <div className="h-40 rounded-3xl bg-white/15" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 rounded-2xl bg-white/10" />
        <div className="h-28 rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}
