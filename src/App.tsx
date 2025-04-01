import * as THREE from "three";
import React, { useEffect, useState } from "react";
import { InfoPanel } from "./components/InfoPanel";
import { AlertSystem } from "./components/AlertSystem";
import { ControlPanel } from "./components/ControlPanel";
import { RadarOverlay } from "./components/RadarOverlay";
import { AircraftSimulation } from "./components/AircraftSimulation";
export function App() {
  const [aircraft, setAircraft] = useState({
    x: 0,
    y: 0,
    z: 0,
    velocity: {
      x: 0,
      y: 0,
      z: 0
    }
  });
  const [debris, setDebris] = useState([]);
  const [dangerRadius, setDangerRadius] = useState(500);
  const [warningRadius, setWarningRadius] = useState(1000);
  const [alerts, setAlerts] = useState([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [predictedCollisions, setPredictedCollisions] = useState([]);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [aiMode, setAIMode] = useState("avoid");
  const [targetDebris, setTargetDebris] = useState(null);
  const [aiStatus, setAiStatus] = useState("");
  useEffect(() => {
    generateDebris(10);
  }, []);
  useEffect(() => {
    if (!isSimulationRunning) return;
    const interval = setInterval(() => {
      setDebris(prevDebris => prevDebris.map(d => ({
        ...d,
        x: d.x + d.velocity.x * simulationSpeed,
        y: d.y + d.velocity.y * simulationSpeed,
        z: d.z + d.velocity.z * simulationSpeed,
        velocity: {
          x: d.velocity.x + (Math.random() * 0.2 - 0.1),
          y: d.velocity.y + (Math.random() * 0.2 - 0.1),
          z: d.velocity.z + (Math.random() * 0.2 - 0.1)
        }
      })));
      setAircraft(prev => ({
        ...prev,
        x: prev.x + prev.velocity.x * simulationSpeed,
        y: prev.y + prev.velocity.y * simulationSpeed,
        z: prev.z + prev.velocity.z * simulationSpeed
      }));
      checkAlerts();
      predictCollisions();
    }, 1000 / simulationSpeed);
    return () => clearInterval(interval);
  }, [isSimulationRunning, simulationSpeed, aircraft, debris, dangerRadius, warningRadius]);
  useEffect(() => {
    if (!isAIEnabled || !isSimulationRunning) return;
    const interval = setInterval(() => {
      if (aiMode === "avoid") {
        handleAIAvoidance();
      } else if (aiMode === "follow" && targetDebris) {
        handleAIFollow();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isAIEnabled, aiMode, targetDebris, aircraft, debris, isSimulationRunning]);
  const generateDebris = count => {
    const newDebris = [];
    for (let i = 0; i < count; i++) {
      newDebris.push({
        id: i,
        x: (Math.random() - 0.5) * 10000,
        y: (Math.random() - 0.5) * 10000,
        z: (Math.random() - 0.5) * 10000,
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 10
        }
      });
    }
    setDebris(newDebris);
  };
  const calculateDistance = (a, b) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
  };
  const predictCollisions = () => {
    const predictions = debris.map(d => {
      const relativeVelocity = {
        x: d.velocity.x - aircraft.velocity.x,
        y: d.velocity.y - aircraft.velocity.y,
        z: d.velocity.z - aircraft.velocity.z
      };
      const timeToCollision = calculateTimeToCollision(aircraft, d, relativeVelocity);
      return {
        debrisId: d.id,
        timeToCollision,
        collisionPoint: timeToCollision > 0 ? {
          x: d.x + d.velocity.x * timeToCollision,
          y: d.y + d.velocity.y * timeToCollision,
          z: d.z + d.velocity.z * timeToCollision
        } : null
      };
    }).filter(p => p.timeToCollision > 0 && p.timeToCollision < 10);
    setPredictedCollisions(predictions);
  };
  const calculateTimeToCollision = (aircraft, debris, relativeVelocity) => {
    const dx = debris.x - aircraft.x;
    const dy = debris.y - aircraft.y;
    const dz = debris.z - aircraft.z;
    const a = Math.pow(relativeVelocity.x, 2) + Math.pow(relativeVelocity.y, 2) + Math.pow(relativeVelocity.z, 2);
    const b = 2 * (dx * relativeVelocity.x + dy * relativeVelocity.y + dz * relativeVelocity.z);
    const c = Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2);
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return -1;
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    return Math.min(t1, t2);
  };
  const checkAlerts = () => {
    const newAlerts = [];
    debris.forEach(d => {
      const distance = calculateDistance(aircraft, d);
      if (distance < dangerRadius) {
        newAlerts.push({
          id: d.id,
          level: "danger",
          distance: distance,
          position: {
            x: d.x,
            y: d.y,
            z: d.z
          },
          velocity: d.velocity,
          timestamp: new Date()
        });
      } else if (distance < warningRadius) {
        newAlerts.push({
          id: d.id,
          level: "warning",
          distance: distance,
          position: {
            x: d.x,
            y: d.y,
            z: d.z
          },
          velocity: d.velocity,
          timestamp: new Date()
        });
      }
    });
    setAlerts(newAlerts);
  };
  const moveAircraft = direction => {
    const speed = 100;
    setAircraft(prev => {
      switch (direction) {
        case "up":
          return {
            ...prev,
            velocity: {
              ...prev.velocity,
              y: prev.velocity.y + speed
            }
          };
        case "down":
          return {
            ...prev,
            velocity: {
              ...prev.velocity,
              y: prev.velocity.y - speed
            }
          };
        case "left":
          return {
            ...prev,
            velocity: {
              ...prev.velocity,
              x: prev.velocity.x - speed
            }
          };
        case "right":
          return {
            ...prev,
            velocity: {
              ...prev.velocity,
              x: prev.velocity.x + speed
            }
          };
        case "forward":
          return {
            ...prev,
            velocity: {
              ...prev.velocity,
              z: prev.velocity.z - speed
            }
          };
        case "backward":
          return {
            ...prev,
            velocity: {
              ...prev.velocity,
              z: prev.velocity.z + speed
            }
          };
        case "brake":
          return {
            ...prev,
            velocity: {
              x: 0,
              y: 0,
              z: 0
            }
          };
        default:
          return prev;
      }
    });
  };
  const handleAIAvoidance = () => {
    // Get all debris within warning radius
    const nearbyDebris = debris
      .map(d => ({
        ...d,
        distance: calculateDistance(aircraft, d)
      }))
      .filter(d => d.distance < warningRadius * 1.5)
      .sort((a, b) => a.distance - b.distance);
    
    if (nearbyDebris.length > 0) {
      // Calculate avoidance vector based on all nearby debris
      let avoidanceVector = { x: 0, y: 0, z: 0 };
      let threatLevel = 0;
      
      nearbyDebris.forEach(debris => {
        // Calculate direction vector from debris to aircraft
        const dx = aircraft.x - debris.x;
        const dy = aircraft.y - debris.y;
        const dz = aircraft.z - debris.z;
        
        // Calculate magnitude (inverse of distance squared for stronger effect when closer)
        const distanceFactor = Math.pow(warningRadius / debris.distance, 2);
        
        // Add weighted vector to avoidance direction
        avoidanceVector.x += dx * distanceFactor;
        avoidanceVector.y += dy * distanceFactor;
        avoidanceVector.z += dz * distanceFactor;
        
        // Increase threat level based on proximity
        threatLevel += distanceFactor;
      });
      
      // Normalize the avoidance vector
      const magnitude = Math.sqrt(
        avoidanceVector.x * avoidanceVector.x + 
        avoidanceVector.y * avoidanceVector.y + 
        avoidanceVector.z * avoidanceVector.z
      );
      
      if (magnitude > 0) {
        avoidanceVector.x = avoidanceVector.x / magnitude * 100;
        avoidanceVector.y = avoidanceVector.y / magnitude * 100;
        avoidanceVector.z = avoidanceVector.z / magnitude * 100;
      }
      
      // Set AI status based on threat level
      if (threatLevel > 5) {
        setAiStatus("CRITICAL: Executing emergency avoidance maneuver");
      } else if (threatLevel > 2) {
        setAiStatus("WARNING: Avoiding multiple collision threats");
      } else {
        setAiStatus("Avoiding collision threat");
      }
      
      // Apply avoidance vector to aircraft velocity
      setAircraft(prev => ({
        ...prev,
        velocity: {
          x: avoidanceVector.x,
          y: avoidanceVector.y,
          z: avoidanceVector.z
        }
      }));
    } else {
      setAiStatus("Scanning for threats");
    }
  };
  const handleAIFollow = () => {
    if (!targetDebris) return;
    const target = debris.find(d => d.id === targetDebris);
    if (!target) {
      setTargetDebris(null);
      return;
    }
    
    // Calculate vector to target
    const dx = target.x - aircraft.x;
    const dy = target.y - aircraft.y;
    const dz = target.z - aircraft.z;
    const distance = calculateDistance(aircraft, target);
    
    // Calculate normalized direction vector
    const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Adaptive speed based on distance
    let speed;
    let statusPrefix;
    
    if (distance < 200) {
      // Very close - slow down
      speed = 50;
      statusPrefix = "Maintaining position near";
    } else if (distance < 500) {
      // Close - moderate speed
      speed = 75;
      statusPrefix = "Closely following";
    } else if (distance < 2000) {
      // Medium distance - full speed
      speed = 100;
      statusPrefix = "Following";
    } else {
      // Far away - maximum speed
      speed = 150;
      statusPrefix = "Pursuing";
    }
    
    // Set velocity proportional to distance in each axis
    const velocityX = magnitude > 0 ? (dx / magnitude) * speed : 0;
    const velocityY = magnitude > 0 ? (dy / magnitude) * speed : 0;
    const velocityZ = magnitude > 0 ? (dz / magnitude) * speed : 0;
    
    // Add slight prediction of target's movement
    const predictedVelocityX = velocityX + (target.velocity.x * 0.5);
    const predictedVelocityY = velocityY + (target.velocity.y * 0.5);
    const predictedVelocityZ = velocityZ + (target.velocity.z * 0.5);
    
    setAiStatus(`${statusPrefix} target #${targetDebris} - Distance: ${distance.toFixed(2)}m`);
    
    setAircraft(prev => ({
      ...prev,
      velocity: {
        x: predictedVelocityX,
        y: predictedVelocityY,
        z: predictedVelocityZ
      }
    }));
  };
  return <div className="flex flex-col w-full h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white">
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-700/50 shadow-lg">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
        AuroGuard System
        </h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <AircraftSimulation aircraft={aircraft} debris={debris} dangerRadius={dangerRadius} warningRadius={warningRadius} alerts={alerts} predictedCollisions={predictedCollisions} isAIEnabled={isAIEnabled} aiStatus={aiStatus} targetDebris={targetDebris} />
          <AlertSystem alerts={alerts} predictedCollisions={predictedCollisions} aiStatus={aiStatus} isAIEnabled={isAIEnabled} />
          <RadarOverlay aircraft={aircraft} debris={debris} alerts={alerts} targetDebris={targetDebris} />
        </div>
        <div className="w-96 bg-gray-800/50 backdrop-blur-sm p-6 border-l border-gray-700/50 flex flex-col gap-6">
          <ControlPanel isRunning={isSimulationRunning} onToggleSimulation={() => setIsSimulationRunning(!isSimulationRunning)} speed={simulationSpeed} onSpeedChange={setSimulationSpeed} dangerRadius={dangerRadius} onDangerRadiusChange={setDangerRadius} warningRadius={warningRadius} onWarningRadiusChange={setWarningRadius} onGenerateDebris={() => generateDebris(10)} onMoveAircraft={moveAircraft} aircraft={aircraft} isAIEnabled={isAIEnabled} onToggleAI={() => setIsAIEnabled(!isAIEnabled)} aiMode={aiMode} onAIModeChange={setAIMode} debris={debris} targetDebris={targetDebris} onTargetDebris={setTargetDebris} aiStatus={aiStatus} />
          <div className="flex-1 overflow-auto">
            <InfoPanel aircraft={aircraft} debris={debris} calculateDistance={calculateDistance} predictedCollisions={predictedCollisions} isAIEnabled={isAIEnabled} aiStatus={aiStatus} />
          </div>
        </div>
      </div>
    </div>;
}