import React, { useEffect, useRef } from "react";
export const RadarOverlay = ({
  aircraft,
  debris,
  alerts,
  targetDebris,
  predictedCollisions
}) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 0.05; // Scale factor for converting 3D coordinates to 2D
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    // Draw radar sweep
    const time = Date.now() * 0.001;
    const sweepAngle = time % 4 * Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, width * 0.4, -Math.PI / 2, sweepAngle - Math.PI / 2);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
    ctx.fill();
    // Draw radar circles
    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, width * 0.1 * i, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw predicted collision paths if available
    if (predictedCollisions && predictedCollisions.length > 0) {
      predictedCollisions.forEach(collision => {
        const debrisObj = debris.find(d => d.id === collision.debrisId);
        if (debrisObj && collision.collisionPoint) {
          // Draw path to collision point
          const startX = centerX + (debrisObj.x - aircraft.x) * scale;
          const startY = centerY + (debrisObj.z - aircraft.z) * scale;
          const endX = centerX + (collision.collisionPoint.x - aircraft.x) * scale;
          const endY = centerY + (collision.collisionPoint.z - aircraft.z) * scale;
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
          ctx.setLineDash([2, 2]);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw collision point
          ctx.beginPath();
          ctx.arc(endX, endY, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
          ctx.fill();
        }
      });
    }
    
    // Draw debris
    debris.forEach(d => {
      const isAlert = alerts.find(a => a.id === d.id);
      const isTarget = targetDebris === d.id;
      const x = centerX + (d.x - aircraft.x) * scale;
      const y = centerY + (d.z - aircraft.z) * scale;
      
      // Draw target highlight if this is the target debris
      if (isTarget) {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
        ctx.fill();
        
        // Draw targeting brackets
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x - 5, y - 10);
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x - 10, y - 5);
        
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x + 5, y - 10);
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x + 10, y - 5);
        
        ctx.moveTo(x - 10, y + 10);
        ctx.lineTo(x - 5, y + 10);
        ctx.moveTo(x - 10, y + 10);
        ctx.lineTo(x - 10, y + 5);
        
        ctx.moveTo(x + 10, y + 10);
        ctx.lineTo(x + 5, y + 10);
        ctx.moveTo(x + 10, y + 10);
        ctx.lineTo(x + 10, y + 5);
        
        ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw debris point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = isTarget ? "cyan" : 
                     isAlert ? isAlert.level === "danger" ? "red" : "yellow" : 
                     "rgba(255, 255, 255, 0.5)";
      ctx.fill();
    });
    // Draw aircraft (center)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.fill();
  }, [aircraft, debris, alerts]);
  return <canvas ref={canvasRef} width={300} height={300} className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-full" />;
};