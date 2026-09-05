'use client';

import { useState } from 'react';

export default function Home() {
  const [inputWallets, setInputWallets] = useState('');
  const [results, setResults] = useState<{address: string, txCount: number, tokens: number, isEligible: boolean, status: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalEligible: 0, totalTokens: 0 });

  const checkWallets = async () => {
    setLoading(true);
    setResults([]);
    
    // Memisahkan input berdasarkan baris baru dan membersihkan spasi
    const addressList = inputWallets.split('\n').map(w => w.trim()).filter(w => w !== '');
    const tempResults = [];
    let eligibleCount = 0;
    let tokensCount = 0;

    for (const address of addressList) {
      try {
        const res = await fetch('https://mainnet.base.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionCount',
            params: [address, 'latest'],
            id: 1,
          }),
        });
        const data = await res.json();
        
        if (data.result) {
          const txCount = parseInt(data.result, 16);
          const tokens = Math.min(txCount * 100, 97000);
          const isEligible = txCount > 0;
          
          if (isEligible) {
            eligibleCount++;
            tokensCount += tokens;
          }
          
          tempResults.push({ address, txCount, tokens, isEligible, status: 'OK' });
        } else {
          tempResults.push({ address, txCount: 0, tokens: 0, isEligible: false, status: 'Error' });
        }
      } catch (error) {
        tempResults.push({ address, txCount: 0, tokens: 0, isEligible: false, status: 'Failed' });
      }
    }
    
    setResults(tempResults);
    setSummary({ totalEligible: eligibleCount, totalTokens: tokensCount });
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-green-400">CABAL Allocation Checker</h1>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">Masukkan Daftar Wallet (1 Wallet per baris):</label>
          <textarea 
            className="w-full h-40 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
            value={inputWallets}
            onChange={(e) => setInputWallets(e.target.value)}
            placeholder="0x139700000000000000000000000000000000E46B&#10;0xABC123..."
          />
        </div>

        <button 
          onClick={checkWallets}
          disabled={loading || !inputWallets}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-gray-900 font-bold rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? 'Mengecek...' : 'Cek Kelayakan'}
        </button>

        {results.length > 0 && (
          <div className="space-y-6 mt-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
                <p className="text-gray-400 text-sm">Total Wallet Eligible</p>
                <p className="text-2xl font-bold text-green-400">{summary.totalEligible} / {results.length}</p>
              </div>
              <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
                <p className="text-gray-400 text-sm">Total Alokasi CABAL</p>
                <p className="text-2xl font-bold text-green-400">{summary.totalTokens.toLocaleString()}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-900 text-gray-400">
                  <tr>
                    <th className="p-3">Wallet</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Tx Count</th>
                    <th className="p-3">Alokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 bg-gray-950">
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td className="p-3 font-mono text-xs">{r.address}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${r.isEligible ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                          {r.isEligible ? 'ELIGIBLE' : 'TIDAK ELIGIBLE'}
                        </span>
                      </td>
                      <td className="p-3">{r.txCount}</td>
                      <td className="p-3 font-bold">{r.tokens.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
