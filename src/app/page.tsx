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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    setTargetNodeId(String(node.id));
    setIsMenuOpen(false); 
  };

  const handleCloseSidebar = () => {
    setSelectedNode(null);
    setTargetNodeId(null);
  };

  const handleSelectVerse = (id: string) => {
    setTargetNodeId(id);
    const node = mulkData.nodes.find(n => String(n.id) === id);
    if (node) setSelectedNode(node);
    setIsMenuOpen(false);
  };

  const currentVerse = mulkData.nodes.find(n => String(n.id) === targetNodeId);

  if (!isMounted) return null;

  return (
    // The master container: Locks the screen size and prevents all scrolling
    <main className="fixed inset-0 w-full h-full overflow-hidden text-white font-sans">
      
      {/* LAYER 0: The Deep Space Background (Guaranteed to render) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#151b2b] via-[#05070e] to-black z-0 pointer-events-none"></div>

      {/* LAYER 10: The Interactive Graph */}
      <div className="absolute inset-0 z-10">
          <FalakGraph 
            data={mulkData} 
            onNodeClick={handleNodeClick} 
            selectedNode={selectedNode} 
            targetNodeId={targetNodeId}
          />
      </div>

      {/* LAYER 20: The Floating HUD / UI Container */}
      {/* 'pointer-events-none' ensures you can still click the graph through the invisible parts of the container */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 pointer-events-none flex justify-center">
        
        {/* The Menu Box: 'pointer-events-auto' makes the button clickable again */}
        <div className="relative w-full max-w-md pointer-events-auto">
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full bg-[#0a0f1c]/70 backdrop-blur-md border border-cyan-500/30 text-white rounded-2xl px-6 py-4 flex justify-between items-center shadow-2xl transition-all hover:bg-[#0a0f1c]/90 hover:border-cyan-400"
          >
            <div className="flex flex-col items-start">
              <span className="text-xs text-cyan-500 uppercase tracking-widest font-bold mb-1">Surah Al-Mulk</span>
              <span className="font-medium text-lg">
                {currentVerse ? `V.${currentVerse.id}: ${currentVerse.theme}` : "Select a Verse to Explore"}
              </span>
            </div>
            <span className={`text-cyan-400 transition-transform duration-300 ml-4 ${isMenuOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          {/* The Dropdown List */}
          {isMenuOpen && (
            <ul className="absolute top-[110%] left-0 w-full max-h-[50vh] overflow-y-auto bg-[#05070e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
              {mulkData.nodes.map((v) => (
                <li 
                  key={v.id}
                  onClick={() => handleSelectVerse(String(v.id))}
                  className="px-6 py-4 hover:bg-cyan-900/30 cursor-pointer transition-colors text-gray-300 hover:text-white flex items-center gap-4"
                >
                  <span className="font-bold text-cyan-500 w-8 text-right">{v.id}</span> 
                  <span className="flex-1 text-sm md:text-base">{v.theme}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* LAYER 30: The Sidebar */}
      <div className="absolute inset-0 z-30 pointer-events-none">
         <div className="pointer-events-auto">
            <IqraSidebar node={selectedNode} onClose={handleCloseSidebar} />
         </div>
      </div>

    </main>
  );
}
