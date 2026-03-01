"use client";

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState, useMemo } from 'react';

// ForceGraph2D relies on window, so we must dynamically import it with ssr: false
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function FalakGraph({ data, onNodeClick, selectedNode }) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isMounted, setIsMounted] = useState(false);

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

  // Compute highlighted nodes and links based on selectedNode
  const { highlightedNodes, highlightedLinks } = useMemo(() => {
    const nodes = new Set();
    const links = new Set();

    if (selectedNode) {
      nodes.add(selectedNode.id);

      // Find all mirror links connected to the selected node
      data.links.forEach(link => {
        if (link.type === 'mirror') {
          // Force graph links can be objects or just ids before initialization
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

  const getNodeColor = (node, isHighlighted, isDimmed) => {
    let color;
    switch(node.group) {
      case 1: color = '59, 130, 246'; break; // Blue
      case 2: color = '239, 68, 68'; break; // Red
      case 3: color = '251, 191, 36'; break; // Gold
      default: color = '156, 163, 175'; break; // Gray
    }

    if (isDimmed) return `rgba(${color}, 0.2)`;
    return `rgba(${color}, 1)`;
  };

  const drawNode = useCallback((node, ctx, globalScale) => {
    const label = node.name || `Node ${node.id}`;
    const fontSize = 12 / globalScale;

    const isHighlighted = highlightedNodes.has(node.id);
    const isDimmed = selectedNode && !isHighlighted;

    const baseRadius = 5;
    const radius = isHighlighted ? baseRadius * 1.5 : baseRadius;

    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = getNodeColor(node, isHighlighted, isDimmed);
    ctx.fill();

    // Draw label
    if (!isDimmed) {
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white'; // Assuming dark background
      ctx.fillText(label, node.x, node.y + (radius + 4));
    }
  }, [selectedNode, highlightedNodes]);

  const drawLink = useCallback((link, ctx, globalScale) => {
    const isHighlighted = highlightedLinks.has(link);
    const isDimmed = selectedNode && !isHighlighted;

    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);

    if (isHighlighted) {
      // Glow brightly for selected mirror links
      ctx.strokeStyle = '#00E5FF'; // Cyan
      ctx.lineWidth = 3 / globalScale;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00E5FF';
    } else if (link.type === 'mirror') {
      ctx.strokeStyle = isDimmed ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2 / globalScale;
      ctx.shadowBlur = isDimmed ? 0 : 5;
      ctx.shadowColor = 'white';
    } else {
      ctx.strokeStyle = isDimmed ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.4)'; // Gray
      ctx.lineWidth = 1 / globalScale;
      ctx.shadowBlur = 0;
    }

    ctx.stroke();
    ctx.shadowBlur = 0; // Reset
  }, [selectedNode, highlightedLinks]);

  if (!isMounted) return null;

  return (
    <div className="w-full h-full bg-gray-900">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeCanvasObject={drawNode}
        linkCanvasObject={drawLink}
        enableNodeDrag={true}
        enableZoomPanInteraction={true}
        backgroundColor="#111827" // matches Tailwind gray-900
        onNodeClick={onNodeClick}
      />
    </div>
  );
}
