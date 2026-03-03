"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import mulkData from '../../data/almulk.json';
import IqraSidebar from '../components/IqraSidebar';

const FalakGraph = dynamic(() => import('../components/FalakGraph'), { ssr: false });

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    setTargetNodeId(node.id); 
  };

  const handleCloseSidebar = () => {
    setSelectedNode(null);
    setTargetNodeId(null);
  };

  const handleSelectVerse = (id: string) => {
    setTargetNodeId(id);
    const node = mulkData.nodes.find(n => String(n.id) === id);
    if (node) setSelectedNode(node);
  };

  if (!isMounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-[#0B0F1A] text-white relative overflow-hidden">
      {/* Premium Glassmorphism Verse Selector */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
        <div className="relative group">
          <select 
            value={targetNodeId || ""}
            onChange={(e) => handleSelectVerse(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] font-medium tracking-wide"
          >
            <option value="" className="bg-[#0B0F1A]">Explore Al-Mulk...</option>
            {mulkData.nodes.map((v) => (
                          <option key={v.id} value={v.id} className="bg-[#0B0F1A]">
                            Verse {v.id}: {v.theme}
                          </option>
                      ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover:text-white/80 transition-colors">
            ▼
          </div>
        </div>
      </div>

      <div className="relative w-full h-screen">
          <FalakGraph 
            data={mulkData} 
            onNodeClick={handleNodeClick} 
            selectedNode={selectedNode}
            targetNodeId={targetNodeId} 
          />
      </div>

      <IqraSidebar node={selectedNode} onClose={handleCloseSidebar} />
    </main>
  );
}
