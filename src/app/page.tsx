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
    setIsMenuOpen(false); // Auto-close menu if open
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
    // Removed all Next.js padding. The main element is now exactly the size of the screen.
    <main className="relative w-screen h-screen overflow-hidden text-white">
      
      {/* FLOATING HUD MENU */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full bg-black/40 backdrop-blur-xl border border-white/15 text-white rounded-2xl px-6 py-4 flex justify-between items-center shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] transition-all hover:bg-black/60 hover:border-cyan-500/50"
          >
            <span className="font-semibold tracking-wide text-sm md:text-base drop-shadow-md">
              {currentVerse ? `Verse ${currentVerse.id}: ${currentVerse.theme}` : "Explore Surah Al-Mulk..."}
            </span>
            <span className={`text-cyan-400 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          {isMenuOpen && (
            <ul className="absolute top-full left-0 w-full mt-2 max-h-[60vh] overflow-y-auto bg-black/70 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl z-50 custom-scrollbar divide-y divide-white/5">
              {mulkData.nodes.map((v) => (
                <li 
                  key={v.id}
                  onClick={() => handleSelectVerse(String(v.id))}
                  className="px-6 py-4 hover:bg-cyan-900/40 cursor-pointer transition-colors text-white/80 hover:text-cyan-300 text-sm md:text-base flex items-center"
                >
                  <span className="font-bold text-cyan-500 w-10">V.{v.id}</span> 
                  <span className="flex-1">{v.theme}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* FULLSCREEN GRAPH */}
      <div className="absolute inset-0 z-0">
          <FalakGraph 
            data={mulkData} 
            onNodeClick={handleNodeClick} 
            selectedNode={selectedNode} 
            targetNodeId={targetNodeId}
          />
      </div>

      {/* SIDEBAR (Ensure this has a high z-index in its own component) */}
      <IqraSidebar node={selectedNode} onClose={handleCloseSidebar} />
    </main>
  );
}
