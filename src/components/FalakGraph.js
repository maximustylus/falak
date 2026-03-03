"use client";

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';

// ForceGraph2D relies on window, so we must dynamically import it with ssr: false
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function FalakGraph({ data, onNodeClick, selectedNode, targetNodeId }) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isMounted, setIsMounted] = useState(false);
  const fgRef = useRef(); // This is the camera "brain"

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsMounted(true), 0);
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // --- FLY-TO CAMERA LOGIC ---
  useEffect(() => {
    if (targetNodeId && fgRef.current) {
      // Safely convert both to strings to ensure an exact match
      const node = data.nodes.find(n => String(n.id) === String(targetNodeId));
      if (node) {
        // Glide to node over 1.2 seconds, zoom to level 6.5
        fgRef.current.centerAt(node.x, node.y, 1200);
        fgRef.current.zoom(6.5, 1200);
      }
    }
  }, [targetNodeId, data.nodes]);

  // Compute highlighted nodes and links based on selectedNode
  const { highlightedNodes, highlightedLinks } = useMemo(() => {
    const nodes = new Set();
    const links = new Set();

    if (selectedNode) {
      nodes.add(selectedNode.id);

      // Find all mirror links connected to the selected node
      data.links.forEach(link => {
        if (link.type === 'mirror') {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;

          if (sourceId === selectedNode.id) {
            links.add(link);
            nodes.add(targetId);
          } else if (targetId === selectedNode.id) {
            links.add(link);
            nodes.add(sourceId);
          }
        }
      });
    }

    return { highlightedNodes: nodes, highlightedLinks: links };
  }, [selectedNode, data.links]);

  // Premium Space Palette
  const getNodeColor = (isHighlighted, isDimmed) => {
    if (isDimmed) return 'rgba(100, 116, 139, 0.15)'; // Deep faded slate
    if (isHighlighted) return 'rgba(0, 229, 255, 1)'; // Neon Cyan for focus
    return 'rgba(255, 255, 255, 0.9)'; // Bright starlight white for default
  };

  const drawNode = useCallback((node, ctx, globalScale) => {
    // Use the theme from your JSON data instead of the missing 'name' attribute
    const label = node.theme ? `V.${node.id}: ${node.theme}` : `Verse ${node.id}`;
    const fontSize = 12 / globalScale;

    const isHighlighted = highlightedNodes.has(node.id);
    const isDimmed = selectedNode && !isHighlighted;

    const baseRadius = 5;
    const radius = isHighlighted ? baseRadius * 1.5 : baseRadius;

    // --- Draw "Star Halo" Glow Effect ---
    if (isHighlighted) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius * 2.5, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.2)'; // Soft Cyan outer glow
      ctx.fill();
    }

    // --- Draw Core Circle ---
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = getNodeColor(isHighlighted, isDimmed);
    ctx.fill();

    // --- Draw Label ---
    if (!isDimmed) {
      ctx.font = `${isHighlighted ? 'bold ' : ''}${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add a slight drop shadow to the text so it reads clearly over links
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = isHighlighted ? '#00E5FF' : 'white';
      ctx.fillText(label, node.x, node.y + (radius + 6));
      ctx.shadowBlur = 0; // reset shadow for next draw
    }
  }, [selectedNode, highlightedNodes]);

  const drawLink = useCallback((link, ctx, globalScale) => {
    const isHighlighted = highlightedLinks.has(link);
    const isDimmed = selectedNode && !isHighlighted;

    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);

    if (isHighlighted) {
      // Intensely glow selected links
      ctx.strokeStyle = '#00E5FF'; // Cyan
      ctx.lineWidth = 3 / globalScale;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00E5FF';
    } else if (link.type === 'mirror') {
      ctx.strokeStyle = isDimmed ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.shadowBlur = isDimmed ? 0 : 3;
      ctx.shadowColor = 'white';
    } else {
      ctx.strokeStyle = isDimmed ? 'rgba(156, 163, 175, 0.05)' : 'rgba(156, 163, 175, 0.2)';
      ctx.lineWidth = 1 / globalScale;
      ctx.shadowBlur = 0;
    }

    ctx.stroke();
    ctx.shadowBlur = 0; // Reset
  }, [selectedNode, highlightedLinks]);

  if (!isMounted) return null;

  return (
    // Removed solid background to let globals.css space background show through
    <div className="w-full h-full relative">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeCanvasObject={drawNode}
        linkCanvasObject={drawLink}
        enableNodeDrag={true}
        enableZoomPanInteraction={true}
        backgroundColor="rgba(0,0,0,0)" // Fully transparent!
        onNodeClick={onNodeClick}
        cooldownTicks={100} // Helps the initial physics simulation settle faster
      />
    </div>
  );
}
