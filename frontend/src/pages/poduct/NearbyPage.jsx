import NearbySellersMap from "@/components/map/NearBySellerMap";

/**
 * NearbyPage — /nearby
 * Wasn't in the original pages/ list (only the NearbySellersMap component
 * was), but the route table calls for /nearby, so this is a thin wrapper.
 */
export default function NearbyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
      <h1 className="text-lg font-bold text-text">Shops near you</h1>
      <NearbySellersMap />
    </div>
  );
}



