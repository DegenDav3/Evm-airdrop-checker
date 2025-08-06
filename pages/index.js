import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [airdropData, setAirdropData] = useState(null);

  const handleCheckAirdrops = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/check-airdrops?address=${address}`);
      const data = await res.json();
      setAirdropData(data);
    } catch (err) {
      console.error("Error fetching airdrop data:", err);
      setAirdropData(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">EVM Airdrop Checker</h1>
      <input
        type="text"
        placeholder="Enter your EVM wallet address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md"
      />
      <button
        onClick={handleCheckAirdrops}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Checking..." : "Check Airdrops"}
      </button>
      {airdropData && (
        <div className="mt-6 max-w-md w-full">
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(airdropData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}