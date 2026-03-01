"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import mulkData from '../../data/almulk.json';
import IqraSidebar from '../components/IqraSidebar';
import VerseSelector from '../components/VerseSelector';

const FalakGraph = dynamic(() => import('../components/FalakGraph'), { ssr: false });

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  const handleCloseSidebar = () => {
    setSelectedNode(null);
  };

  const handleVerseSelect = (node: any) => {
    setSelectedNode(node);
  };

  if (!isMounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gray-900 text-white relative overflow-hidden">

      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <FalakGraph data={mulkData} onNodeClick={handleNodeClick} selectedNode={selectedNode} />
      </div>

      {/* Overlay UI Layer */}
      <div className="z-10 w-full p-6 flex justify-between items-start pointer-events-none">

        {/* Title / Branding */}
        <div className="pointer-events-auto bg-black/40 backdrop-blur-md px-6 py-3 rounded-xl border border-gray-700">
          <h1 className="font-mono text-xl tracking-wide font-bold">Falak UI</h1>
          <p className="text-xs text-gray-400">Map of Surah Al-Mulk</p>
        </div>

        {/* Cinematic Verse Selector placed directly on the page overlay */}
        <div className="pointer-events-auto w-full max-w-md absolute left-1/2 transform -translate-x-1/2">
           <VerseSelector nodes={mulkData.nodes} selectedNode={selectedNode} onSelect={handleVerseSelect} />
        </div>

      </div>

      <IqraSidebar node={selectedNode} onClose={handleCloseSidebar} />
    </main>
  );
}
