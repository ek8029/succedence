export default function Loading() {
  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>
      <div className="relative z-10 text-center">
        <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-xl text-white font-medium">Loading...</div>
      </div>
    </div>
  );
}
