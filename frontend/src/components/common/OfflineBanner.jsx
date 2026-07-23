import { WifiSlash } from "@phosphor-icons/react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[999] flex items-center justify-center gap-2 bg-error text-white text-sm font-medium py-2 px-4">
      <WifiSlash size={16} weight="bold" />
      You're offline. Some features may not work until you're back online.
    </div>
  );
}