"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import mulkData from '../../data/almulk.json';
import IqraSidebar from '../components/IqraSidebar';

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

  if (!isMounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-900 text-white relative">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Falak UI: Map of Surah Al-Mulk
        </p>
      </div>

      <div className="relative flex place-items-center w-full h-[80vh] border border-gray-700 rounded-lg overflow-hidden mt-8">
          <FalakGraph data={mulkData} onNodeClick={handleNodeClick} selectedNode={selectedNode} />
      </div>

      <IqraSidebar node={selectedNode} onClose={handleCloseSidebar} />
    </main>
  );
}
