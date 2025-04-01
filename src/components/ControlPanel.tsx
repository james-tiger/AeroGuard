import React, { useState, useEffect } from "react";
import { 
  PlayIcon, 
  PauseIcon, 
  TargetIcon,
  BrainIcon, 
  RocketIcon, 
  ShieldIcon, 
  ArrowUpIcon, 
  RefreshCwIcon, 
  ArrowDownIcon, 
  ArrowLeftIcon, 
  CrosshairIcon, 
  ArrowRightIcon, 
  MoveVerticalIcon, 
  MoveHorizontalIcon,
} from "lucide-react";

export const ControlPanel = ({
  isRunning,
  onToggleSimulation,
  speed,
  onSpeedChange,
  dangerRadius,
  onDangerRadiusChange,
  onGenerateDebris,
  onMoveAircraft,
  isAIEnabled,
  onToggleAI,
  aiMode,
  onAIModeChange,
  debris,
  targetDebris,
  onTargetDebris,
  aiStatus
}) => {
  const [aiPrediction, setAIPrediction] = useState(null);

  useEffect(() => {
    if (isAIEnabled) {
      const calculateRisk = () => {
        const riskLevel = debris.length > 0 
          ? Math.min(100, (debris.length * dangerRadius) / 1000)
          : 0;
        setAIPrediction({
          collisionRisk: riskLevel,
          recommendedSpeed: Math.max(0.5, 5 - (riskLevel / 20)),
          suggestedMode: riskLevel > 50 ? "avoid" : "follow"
        });
      };
      calculateRisk();
      const interval = setInterval(calculateRisk, 5000);
      return () => clearInterval(interval);
    }
  }, [isAIEnabled, debris, dangerRadius]);

  return (
    <div className="bg-gray-900/95 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-gray-800/30 max-w-md w-full mx-auto transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,255,0.3)]">
      {/* Scrollable Container */}
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-gray-900/50 scrollbar-thumb-rounded-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-900/95 backdrop-blur-3xl z-10 py-4">
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient">
            Command Core
          </h2>
          <div className="flex gap-3">
            <RocketIcon size={26} className="text-cyan-400 animate-pulse" />
            <BrainIcon size={26} className="text-purple-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-8">
          {/* Simulation Controls */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onToggleSimulation}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 shadow-lg ${
                isRunning 
                  ? "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 shadow-rose-500/50" 
                  : "bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 shadow-cyan-500/50"
              }`}
            >
              {isRunning ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
              <span className="font-semibold text-lg">{isRunning ? "Pause" : "Start"}</span>
            </button>
            <button
              onClick={onGenerateDebris}
              className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/50"
            >
              <RefreshCwIcon size={22} /> 
              <span className="font-semibold text-lg">Generate Debris</span>
            </button>
          </div>

          {/* Speed and Danger Zone Controls */}
          <div className="space-y-6 bg-gray-800/20 p-6 rounded-xl shadow-inner shadow-cyan-500/30 backdrop-blur-md">
            <div className="group">
              <label className="block mb-2 text-gray-100 text-lg font-semibold">Speed: {speed.toFixed(1)}x</label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={speed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-900/70 rounded-full cursor-pointer appearance-none transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                style={{ accentColor: '#00FFFF' }}
              />
            </div>
            <div className="group">
              <label className="block mb-2 text-gray-100 text-lg font-semibold">Danger Zone: {dangerRadius}m</label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={dangerRadius}
                onChange={(e) => onDangerRadiusChange(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-900/70 rounded-full cursor-pointer appearance-none transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]"
                style={{ accentColor: '#FF4444' }}
              />
            </div>
          </div>

          {/* Navigation Hub */}
          <div className="bg-gray-800/20 p-6 rounded-xl shadow-inner shadow-blue-500/30 backdrop-blur-md relative">
            <h3 className="font-semibold text-gray-100 text-lg mb-6 flex items-center gap-2">
              <RocketIcon size={22} className="text-cyan-400 animate-pulse" /> Navigation Hub
            </h3>
            <div className="relative flex justify-center items-center">
              <div className="w-64 h-64 relative">
                {/* Neon Glow Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 animate-[spin_10s_linear_infinite] shadow-[0_0_30px_rgba(0,255,255,0.4)]" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 animate-[spin_10s_linear_infinite_reverse] shadow-[0_0_20px_rgba(0,0,255,0.3)]" />
                <div className="absolute inset-6 bg-gray-900/90 rounded-full border border-gray-800/70 backdrop-blur-sm" />

                {/* Directional Controls with Neon Effects */}
                <button 
                  onClick={() => onMoveAircraft("forward")}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 p-4 bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-full transition-all duration-300 hover:scale-110 group shadow-lg shadow-cyan-500/30 border border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                >
                  <ArrowUpIcon size={28} className="text-cyan-400 group-hover:text-white animate-pulse" />
                </button>
                <button 
                  onClick={() => onMoveAircraft("backward")}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 p-4 bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-full transition-all duration-300 hover:scale-110 group shadow-lg shadow-cyan-500/30 border border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                >
                  <ArrowDownIcon size={28} className="text-cyan-400 group-hover:text-white animate-pulse" />
                </button>
                <button 
                  onClick={() => onMoveAircraft("left")}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 p-4 bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-full transition-all duration-300 hover:scale-110 group shadow-lg shadow-cyan-500/30 border border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                >
                  <ArrowLeftIcon size={28} className="text-cyan-400 group-hover:text-white animate-pulse" />
                </button>
                <button 
                  onClick={() => onMoveAircraft("right")}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 p-4 bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-full transition-all duration-300 hover:scale-110 group shadow-lg shadow-cyan-500/30 border border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                >
                  <ArrowRightIcon size={28} className="text-cyan-400 group-hover:text-white animate-pulse" />
                </button>
                <button 
                  onClick={() => onMoveAircraft("up")}
                  className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-full transition-all duration-300 hover:scale-110 group shadow-lg shadow-cyan-500/30 border border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                >
                  <MoveVerticalIcon size={28} className="text-cyan-400 group-hover:text-white animate-pulse" />
                </button>
                <button 
                  onClick={() => onMoveAircraft("down")}
                  className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 p-4 bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-full transition-all duration-300 hover:scale-110 group shadow-lg shadow-cyan-500/30 border border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                >
                  <MoveHorizontalIcon size={28} className="text-cyan-400 group-hover:text-white animate-pulse" />
                </button>
                <button 
                  onClick={() => onMoveAircraft("brake")}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-5 bg-rose-600 hover:bg-rose-700 rounded-full transition-all duration-300 hover:scale-110 shadow-xl shadow-rose-500/60 border border-rose-500/30 hover:shadow-[0_0_20px_rgba(255,0,0,0.7)]"
                >
                  <span className="text-white font-semibold text-lg">STOP</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI System */}
          <div className="bg-gray-800/20 p-6 rounded-xl shadow-inner shadow-purple-500/30 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-100 text-lg flex items-center gap-2">
                <BrainIcon size={22} className="text-purple-400 animate-pulse" /> AI Nexus
              </h3>
              <button
                onClick={onToggleAI}
                className={`px-5 py-2 rounded-full transition-all duration-300 shadow-lg ${
                  isAIEnabled 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-700 shadow-purple-500/50 hover:shadow-[0_0_15px_rgba(128,0,128,0.6)]" 
                    : "bg-gray-700 shadow-gray-500/30 hover:bg-gray-600"
                }`}
              >
                <span className="font-semibold">{isAIEnabled ? "Active" : "Inactive"}</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onAIModeChange("avoid")}
                  className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                    aiMode === "avoid" 
                      ? "bg-gradient-to-r from-cyan-600 to-teal-600 shadow-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <ShieldIcon size={18} /> <span className="font-medium">Avoid</span>
                </button>
                <button
                  onClick={() => onAIModeChange("follow")}
                  className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                    aiMode === "follow" 
                      ? "bg-gradient-to-r from-cyan-600 to-teal-600 shadow-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]" 
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <CrosshairIcon size={18} /> <span className="font-medium">Follow</span>
                </button>
              </div>

              {aiPrediction && (
                <div className="bg-gray-900/70 p-4 rounded-lg shadow-lg shadow-cyan-500/40 backdrop-blur-sm">
                  <div className="text-gray-100 text-lg font-semibold mb-3">AI Diagnostics</div>
                  <div className="text-sm space-y-2">
                    <p>Collision Risk: <span className="text-rose-400 font-medium">{aiPrediction.collisionRisk}%</span></p>
                    <p>Optimal Speed: <span className="text-cyan-400 font-medium">{aiPrediction.recommendedSpeed}x</span></p>
                    <p>Suggested Mode: <span className="text-purple-400 font-medium">{aiPrediction.suggestedMode}</span></p>
                  </div>
                </div>
              )}

              {aiMode === "follow" && (
                <div className="space-y-3">
                  <label className="block text-gray-100 text-lg font-semibold">Target Acquisition</label>
                  <div className="grid grid-cols-4 gap-3">
                    {debris.slice(0, 8).map((d) => (
                      <button
                        key={d.id}
                        onClick={() => onTargetDebris(d.id)}
                        className={`p-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-all duration-300 shadow-md ${
                          targetDebris === d.id 
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]" 
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        <TargetIcon size={16} /> {d.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AuroGuard System */}
          <div className="bg-gray-800/20 p-6 rounded-xl shadow-inner shadow-blue-500/30 backdrop-blur-md">
            <h3 className="font-semibold text-gray-100 text-lg mb-4 flex items-center gap-2">
              <RocketIcon size={22} className="text-blue-400 animate-pulse" /> AuroGuard System
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-100 text-base font-semibold mb-2">Aircraft Position Data</h4>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-300">
                  <div>
                    <p>X-Axis</p>
                    <p className="text-cyan-400 font-medium">0.00</p>
                  </div>
                  <div>
                    <p>Y-Axis</p>
                    <p className="text-cyan-400 font-medium">0.00</p>
                  </div>
                  <div>
                    <p>Z-Axis</p>
                    <p className="text-cyan-400 font-medium">-3200.00</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-gray-100 text-base font-semibold mb-2">System Status</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Tracking operational • Last update: 04:03:33 AM</p>
                  <p className="text-gray-400">GUARD v1.0.3 • Processing: 10 objects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animation Keyframes */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }

        /* Custom Scrollbar Styles */
        .scrollbar-thin {
          scrollbar-width: thin;
        }

        .scrollbar-thumb-cyan-500\\/50::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 9999px;
        }

        .scrollbar-track-gray-900\\/50::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
        }

        .scrollbar-thumb-rounded-full::-webkit-scrollbar-thumb {
          border-radius: 9999px;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
      `}</style>
    </div>
  );
};