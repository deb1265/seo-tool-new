import { useEffect, useRef } from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function ScoreGauge({ score, size = 120, strokeWidth = 10, className = '' }: ScoreGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get color based on score
  const getColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green for high scores
    if (score >= 50) return '#f59e0b'; // Yellow for medium scores
    return '#ef4444'; // Red for low scores
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Set canvas dimensions for HiDPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    
    // Constants
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - strokeWidth) / 2;
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(229, 231, 235, 0.5)';
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    
    // Draw score arc
    const scoreAngle = (score / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, scoreAngle - Math.PI / 2);
    ctx.strokeStyle = getColor(score);
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    
    // Display score text
    ctx.fillStyle = getColor(score);
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score}`, centerX, centerY);
    
    // Display "Score" text below
    ctx.fillStyle = 'rgba(107, 114, 128, 0.8)';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Score', centerX, centerY + 24);
  }, [score, size, strokeWidth]);
  
  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
}
