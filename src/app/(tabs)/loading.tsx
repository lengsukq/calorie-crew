export default function TabsLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="y2k-spinner h-8 w-8" />
        <p className="text-sm text-slate-400">加载中...</p>
      </div>
    </div>
  );
}
