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
    <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="border border-gray-800 bg-gray-900/50 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
        <h1 className="text-2xl md:text-3xl font-extrabold text-green-400 tracking-tight mb-2">
          BASE CABAL ALLOCATION CHECKER
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Masukkan daftar wallet Base untuk mengecek alokasi CABAL token secara langsung via RPC.
        </p>
        
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Daftar Wallet (1 Wallet per baris):
          </label>
          <textarea 
            className="w-full h-44 p-4 bg-gray-950 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-xs text-green-300 transition-all placeholder-gray-700"
            value={inputWallets}
            onChange={(e) => setInputWallets(e.target.value)}
            placeholder={"0x139700000000000000000000000000000000E46B\n0x0000000000000000000000000000000000000000"}
          />
        </div>

        <button 
          onClick={checkWallets}
          disabled={loading || !inputWallets}
          className="mt-4 w-full md:w-auto px-8 py-3 bg-green-500 hover:bg-green-400 text-gray-950 font-extrabold rounded-xl disabled:opacity-50 transition-all duration-200 cursor-pointer active:scale-95 shadow-lg shadow-green-500/10"
        >
          {loading ? 'MENGECEK RPC...' : 'PERIKSA KELAYAKAN'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-gray-900/80 border border-gray-800 rounded-2xl">
              <p className="text-xs text-gray-400 font-semibold uppercase">Total Wallet Eligible</p>
              <p className="text-3xl font-black text-green-400 mt-1">{summary.totalEligible} <span className="text-base font-medium text-gray-500">/ {results.length}</span></p>
            </div>
            <div className="p-5 bg-gray-900/80 border border-gray-800 rounded-2xl">
              <p className="text-xs text-gray-400 font-semibold uppercase">Total Alokasi CABAL</p>
              <p className="text-3xl font-black text-green-400 mt-1">{summary.totalTokens.toLocaleString()} <span className="text-sm font-bold text-green-600">CABAL</span></p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/30">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-4">Wallet</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tx Count</th>
                  <th className="p-4">Alokasi CABAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-900/40 transition-colors">
                    <td className="p-4 text-gray-300">{r.address}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${r.isEligible ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {r.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{r.txCount}</td>
                    <td className="p-4 font-bold text-green-400">{r.tokens.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
