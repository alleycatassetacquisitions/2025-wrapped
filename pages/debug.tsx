import React, { useState, useEffect } from 'react';
import { getJSONData } from '@/lib/clientData';
import Layout from '@/components/Layout';

export default function Debug() {
  const [fileResults, setFileResults] = useState<{[key: string]: string}>({});
  const [apiResults, setApiResults] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);

  // List of data files to check
  const dataFiles = [
    'players.json',
    'matches.json',
    'best_players.json',
    'top_hunters.json',
    'top_bounties.json'
  ];

  // List of API endpoints to check
  const apiEndpoints = [
    '/api/players',
    '/api/players?id=1',
    '/api/matches',
    '/api/matches?playerId=1',
    '/api/stats?type=global',
    '/api/stats?playerId=1',
    '/api/factions'
  ];

  useEffect(() => {
    async function checkFiles() {
      const results: {[key: string]: string} = {};
      
      // Check data files
      for (const file of dataFiles) {
        try {
          setFileResults(prev => ({ ...prev, [file]: 'Checking...' }));
          
          const response = await fetch(`/data/${file}`);
          
          if (response.ok) {
            const data = await response.json();
            const count = data.data ? data.data.length : 
                         data.best_players ? data.best_players.length : 
                         data.top_hunters ? data.top_hunters.length :
                         data.top_bounties ? data.top_bounties.length : 0;
                         
            results[file] = `Success (${count} items)`;
          } else {
            results[file] = `Error: ${response.status} ${response.statusText}`;
          }
        } catch (error) {
          results[file] = `Exception: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
      
      setFileResults(results);
    }

    async function checkApiEndpoints() {
      const results: {[key: string]: string} = {};
      
      // Check API endpoints
      for (const endpoint of apiEndpoints) {
        try {
          setApiResults(prev => ({ ...prev, [endpoint]: 'Checking...' }));
          
          const response = await fetch(endpoint);
          
          if (response.ok) {
            const data = await response.json();
            
            // Determine the type of data and report accordingly
            if (Array.isArray(data)) {
              results[endpoint] = `Success (Array with ${data.length} items)`;
            } else if (typeof data === 'object' && data !== null) {
              const keys = Object.keys(data);
              results[endpoint] = `Success (Object with keys: ${keys.join(', ')})`;
            } else {
              results[endpoint] = `Success (${typeof data})`;
            }
          } else {
            results[endpoint] = `Error: ${response.status} ${response.statusText}`;
          }
        } catch (error) {
          results[endpoint] = `Exception: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
      
      setApiResults(results);
    }
    
    Promise.all([checkFiles(), checkApiEndpoints()]).then(() => {
      setIsLoading(false);
    });
    
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-display neon-text-yellow mb-6">Debug Tools</h1>
        
        {isLoading ? (
          <div className="text-neon-blue animate-pulse">Checking data sources...</div>
        ) : (
          <>
            {/* Data Files Section */}
            <div className="bg-cyber-dark p-4 rounded-md border border-neon-blue mb-8">
              <h2 className="text-xl mb-4 neon-text-blue">Data Files</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyber-darkblue">
                    <th className="py-2 px-4 text-left">Filename</th>
                    <th className="py-2 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(fileResults).map(([file, status]) => (
                    <tr key={file} className="border-b border-cyber-darkblue">
                      <td className="py-2 px-4">{file}</td>
                      <td className={`py-2 px-4 ${status.startsWith('Success') ? 'neon-text-green' : 'neon-text-pink'}`}>
                        {status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* API Endpoints Section */}
            <div className="bg-cyber-dark p-4 rounded-md border border-neon-blue mb-8">
              <h2 className="text-xl mb-4 neon-text-blue">API Endpoints</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyber-darkblue">
                    <th className="py-2 px-4 text-left">Endpoint</th>
                    <th className="py-2 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(apiResults).map(([endpoint, status]) => (
                    <tr key={endpoint} className="border-b border-cyber-darkblue">
                      <td className="py-2 px-4">{endpoint}</td>
                      <td className={`py-2 px-4 ${status.startsWith('Success') ? 'neon-text-green' : 'neon-text-pink'}`}>
                        {status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Environment Section */}
            <div className="bg-cyber-dark p-4 rounded-md border border-neon-blue">
              <h2 className="text-xl mb-4 neon-text-blue">Environment</h2>
              <div className="text-cyber-text">
                <p>NODE_ENV: {process.env.NODE_ENV}</p>
                <p>Next.js Version: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ? 'Production' : 'Development'}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
} 