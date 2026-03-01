"use client";

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function FalakGraph({ data, onNodeClick, selectedNode }) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isMounted, setIsMounted] = useState(false);
  const fgRef = useRef();

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

  // Handle camera transition when selectedNode changes
  useEffect(() => {
    if (!fgRef.current || !isMounted) return;

    // We add a slight delay for initial load physics to settle before zooming
    const timer = setTimeout(() => {
      if (selectedNode) {
        // Find the node in the current graph data to get its x, y coords
        const graphData = fgRef.current.graphData();
        const targetNode = graphData.nodes.find(n => n.id === selectedNode.id);

        if (targetNode && targetNode.x !== undefined && targetNode.y !== undefined) {
          fgRef.current.centerAt(targetNode.x, targetNode.y, 1000);
          fgRef.current.zoom(8, 1000);
        }
      } else {
        // Reset view if selection cleared
        fgRef.current.zoomToFit(1000, 50);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedNode, isMounted]);

  // Compute highlighted nodes and links based on selectedNode
  const { highlightedNodes, highlightedLinks } = useMemo(() => {
    const nodes = new Set();
    const links = new Set();

    if (selectedNode) {
      nodes.add(selectedNode.id);

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

  const getNodeColor = (node, isHighlighted, isDimmed) => {
    let color;
    switch(node.group) {
      case 1: color = '59, 130, 246'; break;
      case 2: color = '239, 68, 68'; break;
      case 3: color = '251, 191, 36'; break;
      default: color = '156, 163, 175'; break;
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

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = getNodeColor(node, isHighlighted, isDimmed);
    ctx.fill();

    if (!isDimmed) {
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
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
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 3 / globalScale;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00E5FF';
    } else if (link.type === 'mirror') {
      ctx.strokeStyle = isDimmed ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2 / globalScale;
      ctx.shadowBlur = isDimmed ? 0 : 5;
      ctx.shadowColor = 'white';
    } else {
      ctx.strokeStyle = isDimmed ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.4)';
      ctx.lineWidth = 1 / globalScale;
      ctx.shadowBlur = 0;
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [selectedNode, highlightedLinks]);

  if (!isMounted) return null;

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeCanvasObject={drawNode}
        linkCanvasObject={drawLink}
        enableNodeDrag={true}
        enableZoomPanInteraction={true}
        backgroundColor="#111827"
        onNodeClick={onNodeClick}
      />
    </div>
  );
}
