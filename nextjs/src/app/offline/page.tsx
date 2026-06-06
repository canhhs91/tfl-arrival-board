export default function OfflinePage() {
  return (
    <div className="app-shell flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold text-white">You&apos;re offline</p>
        <p className="mt-1 text-sm text-tfl-muted">
          Live arrivals need a connection. Check back when you&apos;re online.
        </p>
      </div>
    </div>
  );
}
