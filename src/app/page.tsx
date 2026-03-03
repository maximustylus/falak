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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for custom dropdown

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    setTargetNodeId(String(node.id));
  };

  const handleCloseSidebar = () => {
    setSelectedNode(null);
    setTargetNodeId(null);
  };

  const handleSelectVerse = (id: string) => {
    setTargetNodeId(id);
    const node = mulkData.nodes.find(n => String(n.id) === id);
    if (node) setSelectedNode(node);
    setIsMenuOpen(false); // Close menu after selection
  };

  // Find current verse text for the button
  const currentVerse = mulkData.nodes.find(n => String(n.id) === targetNodeId);

  if (!isMounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between text-white relative">
      
      {/* TRUE GLASSMORPHISM VERSE SELECTOR */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="relative">
          {/* Main Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl px-6 py-4 flex justify-between items-center shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all hover:bg-white/20 hover:border-white/40"
          >
            <span className="font-medium tracking-wide">
              {currentVerse ? `Verse ${currentVerse.id}: ${currentVerse.theme}` : "Explore Surah Al-Mulk..."}
            </span>
            <span className={`transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          {/* Dropdown List */}
          {isMenuOpen && (
            <ul className="absolute top-full left-0 w-full mt-3 max-h-80 overflow-y-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 custom-scrollbar divide-y divide-white/10">
              {mulkData.nodes.map((v) => (
                <li 
                  key={v.id}
                  onClick={() => handleSelectVerse(String(v.id))}
                  className="px-6 py-4 hover:bg-white/20 cursor-pointer transition-colors text-white/90 hover:text-white"
                >
                  <span className="font-bold text-blue-400 mr-2">V.{v.id}</span> 
                  {v.theme}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="relative flex place-items-center w-full h-screen">
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
