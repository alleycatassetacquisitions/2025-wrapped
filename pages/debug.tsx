import React, { useState, useEffect } from 'react';
import { getJSONData } from '@/lib/clientData';
import Layout from '@/components/Layout';

export default function Debug() {
  const [results, setResults] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);

  // List of data files to check
  const dataFiles = [
    'players.json',
    'matches.json',
    'best_players.json',
    'top_hunters.json',
    'top_bounties.json'
  ];

  useEffect(() => {
    async function checkFiles() {
      const fileResults: {[key: string]: string} = {};
      
      for (const file of dataFiles) {
        try {
          setResults(prev => ({ ...prev, [file]: 'Checking...' }));
          
          const response = await fetch(`/data/${file}`);
          
          if (response.ok) {
            const data = await response.json();
            const count = data.data ? data.data.length : 
                         data.best_players ? data.best_players.length : 
                         data.top_hunters ? data.top_hunters.length :
                         data.top_bounties ? data.top_bounties.length : 0;
                         
            fileResults[file] = `Success (${count} items)`;
          } else {
            fileResults[file] = `Error: ${response.status} ${response.statusText}`;
          }
        } catch (error) {
          fileResults[file] = `Exception: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
      
      setResults(fileResults);
      setIsLoading(false);
    }
    
    checkFiles();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-display neon-text-yellow mb-6">Data Files Debug</h1>
        
        {isLoading ? (
          <div className="text-neon-blue animate-pulse">Checking data files...</div>
        ) : (
          <div className="bg-cyber-dark p-4 rounded-md border border-neon-blue">
            <h2 className="text-xl mb-4 neon-text-blue">File Status</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyber-darkblue">
                  <th className="py-2 px-4 text-left">Filename</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([file, status]) => (
                  <tr key={file} className="border-b border-cyber-darkblue">
                    <td className="py-2 px-4">{file}</td>
                    <td className={`py-2 px-4 ${status.startsWith('Success') ? 'neon-text-green' : 'neon-text-pink'}`}>
                      {status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-6">
              <h2 className="text-xl mb-4 neon-text-blue">Environment</h2>
              <div className="text-cyber-text">
                <p>NODE_ENV: {process.env.NODE_ENV}</p>
                <p>Next.js Version: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ? 'Production' : 'Development'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 