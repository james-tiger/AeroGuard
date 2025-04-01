import React, { useEffect, useState } from "react";
import { AlertTriangleIcon, AlertOctagonIcon } from "lucide-react";
import { RocketIcon } from "lucide-react";
export const AlertSystem = ({
  alerts,
  predictedCollisions,
  isAIEnabled,
  aiStatus
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertSound, setAlertSound] = useState(false);
  useEffect(() => {
    if (alerts.length > 0) {
      setShowAlert(true);
      setAlertSound(true);
      const timeout = setTimeout(() => {
        setAlertSound(false);
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      setShowAlert(false);
      setAlertSound(false);
    }
  }, [alerts]);
  if (!showAlert && predictedCollisions.length === 0) return null;
  const dangerAlerts = alerts.filter(a => a.level === "danger");
  const warningAlerts = alerts.filter(a => a.level === "warning");
  return <div className="absolute top-6 right-6 left-6 space-y-4 max-w-3xl mx-auto">
      {isAIEnabled && <div className="bg-purple-900/90 backdrop-blur border border-purple-700/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <RocketIcon className="text-purple-300 mr-4" size={28} />
            <div>
              <h3 className="text-xl font-bold text-purple-100">
                AI System Active
              </h3>
              <p className="text-purple-200">{aiStatus}</p>
            </div>
          </div>
        </div>}
      {dangerAlerts.length > 0 && <div className="bg-red-900/90 backdrop-blur border border-red-700/50 rounded-xl p-4 shadow-lg animate-pulse">
          <div className="flex items-center">
            <AlertOctagonIcon className="text-red-300 mr-4" size={28} />
            <div>
              <h3 className="text-xl font-bold text-red-100">
                DANGER - IMMEDIATE ACTION REQUIRED
              </h3>
              <p className="text-red-200">
                {dangerAlerts.length} critical hazard
                {dangerAlerts.length !== 1 ? "s" : ""} detected
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-2 max-h-40 overflow-auto">
            {dangerAlerts.map(alert => <div key={alert.id} className="text-sm text-red-200 flex justify-between bg-red-950/50 p-2 rounded-lg">
                <span>Object #{alert.id}</span>
                <span>{alert.distance.toFixed(2)}m</span>
              </div>)}
          </div>
        </div>}
      {warningAlerts.length > 0 && <div className="bg-yellow-900 bg-opacity-90 border border-yellow-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <AlertTriangleIcon className="text-yellow-300 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-bold text-yellow-100">
                WARNING - Hazards Detected
              </h3>
              <p className="text-yellow-200">
                {warningAlerts.length} object
                {warningAlerts.length !== 1 ? "s" : ""} within warning radius
              </p>
            </div>
          </div>
          <div className="mt-2 space-y-1 max-h-40 overflow-auto">
            {warningAlerts.map(alert => <div key={alert.id} className="text-sm text-yellow-200 flex justify-between">
                <span>Object #{alert.id}</span>
                <span>{alert.distance.toFixed(2)}m</span>
              </div>)}
          </div>
        </div>}
      {predictedCollisions.length > 0 && <div className="bg-blue-900 bg-opacity-90 border border-blue-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <AlertTriangleIcon className="text-blue-300 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-bold text-blue-100">
                Collision Prediction
              </h3>
              <p className="text-blue-200">
                {predictedCollisions.length} potential collision
                {predictedCollisions.length !== 1 ? "s" : ""} detected
              </p>
            </div>
          </div>
          <div className="mt-2 space-y-1 max-h-40 overflow-auto">
            {predictedCollisions.map(prediction => <div key={prediction.debrisId} className="text-sm text-blue-200 flex justify-between">
                <span>Object #{prediction.debrisId}</span>
                <span>
                  Time to impact: {prediction.timeToCollision.toFixed(1)}s
                </span>
              </div>)}
          </div>
        </div>}
      {alertSound && <div className="sr-only">Alert sound playing</div>}
    </div>;
};