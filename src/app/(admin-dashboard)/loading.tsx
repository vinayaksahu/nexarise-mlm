export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}
