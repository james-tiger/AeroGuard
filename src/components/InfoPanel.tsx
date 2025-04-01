import React, { useState, useEffect } from "react";
import { InfoIcon, BarChart3Icon, MapPinIcon, AlertTriangleIcon, Settings, Menu, XCircle, Bell, Shield, Filter, Moon, Download, Zap, ChevronRight, Sun, Eye, EyeOff, Check, X } from "lucide-react";

interface Position {
  x: number;
  y: number;
  z: number;
}

interface DebrisObject extends Position {
  id: string | number;
}

interface InfoPanelProps {
  aircraft: Position;
  debris: DebrisObject[];
  calculateDistance: (a: Position, b: Position) => number;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  aircraft,
  debris,
  calculateDistance
}) => {
  const [selectedTab, setSelectedTab] = useState<'position' | 'debris'>('position');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(-1);
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const [showOnlyClose, setShowOnlyClose] = useState(false);
  const [showCriticalAlerts, setShowCriticalAlerts] = useState(true);
  const [alertDistance, setAlertDistance] = useState(1000);
  const [systemStatus, setSystemStatus] = useState({
    load: 78,
    lastUpdate: new Date(),
    status: 'operational'
  });

  // New state for notifications
  const [notifications, setNotifications] = useState<{id: string, message: string, time: Date}[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Filter debris based on settings
  const filteredDebris = debris.filter(d => {
    const distance = calculateDistance(aircraft, d);
    if (showOnlyClose) {
      return distance < alertDistance;
    }
    return true;
  });

  const closeObjects = debris.filter(d => calculateDistance(aircraft, d) < alertDistance).length;
  const criticalObjects = debris.filter(d => calculateDistance(aircraft, d) < 500).length;

  // Auto-close menu on small screens when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (menuOpen && !target.closest('.menu-container') && !target.closest('.menu-toggle')) {
        setMenuOpen(false);
      }
      if (showNotificationPanel && !target.closest('.notification-panel') && !target.closest('.notification-toggle')) {
        setShowNotificationPanel(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, showNotificationPanel]);

  // Update system load randomly
  useEffect(() => {
    const updateSystemLoad = () => {
      setSystemStatus(prev => ({
        ...prev,
        load: Math.floor(70 + Math.random() * 25),
        lastUpdate: new Date()
      }));
    };

    const interval = setInterval(updateSystemLoad, 5000);
    return () => clearInterval(interval);
  }, []);

  // Function to simulate scanning for new debris
  const handleScan = () => {
    const notification = {
      id: `scan-${Date.now()}`,
      message: "Scan complete. No new debris detected.",
      time: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
    // Simulate system load increase
    setSystemStatus(prev => ({
      ...prev,
      load: Math.min(99, prev.load + 15),
    }));
    // Restore load after 3 seconds
    setTimeout(() => {
      setSystemStatus(prev => ({
        ...prev,
        load: Math.max(50, prev.load - 15),
      }));
    }, 3000);
  };

  // Function to simulate sending an alert
  const handleAlert = () => {
    const notification = {
      id: `alert-${Date.now()}`,
      message: "Alert issued for all debris within critical range.",
      time: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
  };

  // Function to simulate identifying debris
  const handleIdentify = () => {
    const notification = {
      id: `identify-${Date.now()}`,
      message: "Identification scan initiated for closest objects.",
      time: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
  };

  // Function to simulate tracking
  const handleTrack = () => {
    const notification = {
      id: `track-${Date.now()}`,
      message: "Enhanced tracking enabled for critical objects.",
      time: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
  };

  // Function to export data
  const handleExportData = () => {
    // In a real app, this would generate and download a file
    const notification = {
      id: `export-${Date.now()}`,
      message: "Data export completed. File saved to system.",
      time: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
  };

  // Format time from Date object
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="relative flex gap-4">
      {/* Main content panel */}
      <div className={`flex-grow bg-gray-800/60 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-gray-700/30 transition-all duration-300 hover:shadow-cyan-900/10 hover:border-cyan-800/30 ${menuOpen ? 'sm:mr-60' : ''}`}>
        {/* Header with tabs */}
        <div className="flex flex-col space-y-4 mb-4">
          <h2 className="text-xl font-semibold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
            <InfoIcon size={20} className="mr-2 text-blue-400" /> AuroGuard System
          </h2>
          
          <div className="flex space-x-1 border-b border-gray-700/50">
            <button 
              onClick={() => setSelectedTab('position')}
              className={`px-4 py-2 text-sm rounded-t-lg transition-all duration-200 ${
                selectedTab === 'position' 
                  ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center">
                <MapPinIcon size={16} className="mr-2" />
                Aircraft
              </div>
            </button>
            <button 
              onClick={() => setSelectedTab('debris')}
              className={`px-4 py-2 text-sm rounded-t-lg transition-all duration-200 flex items-center ${
                selectedTab === 'debris' 
                  ? 'bg-yellow-500/10 text-yellow-400 border-b-2 border-yellow-400' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <BarChart3Icon size={16} className="mr-2" />
              Debris
              {closeObjects > 0 && (
                <span className="ml-2 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
                  {closeObjects} close
                </span>
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Aircraft Position Card - Only shown when position tab is active */}
          {selectedTab === 'position' && (
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-lg p-5 border border-gray-700/40 transition-all duration-300 hover:border-blue-500/20 hover:bg-gray-900/50 animate-fadeIn">
              <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Aircraft Position Data
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {['X', 'Y', 'Z'].map((axis) => (
                  <div key={axis} className="bg-gray-900/70 p-4 rounded-lg border border-gray-700/40 transition-all duration-200 hover:border-blue-400/30 hover:translate-y-[-2px]">
                    <div className="text-xs text-gray-400 mb-2">{axis}-Axis</div>
                    <div className="font-mono text-blue-400 text-lg">
                      {aircraft[axis.toLowerCase() as keyof Position].toFixed(2)}
                    </div>
                    <div className="mt-2 w-full bg-gray-800/70 h-1 rounded overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded"
                        style={{
                          width: `${Math.min(100, Math.abs(aircraft[axis.toLowerCase() as keyof Position]) % 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-blue-900/10 border border-blue-900/20">
                <div className="text-xs font-medium text-blue-400 mb-1">System Status</div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Tracking {systemStatus.status} • Last update: {formatTime(systemStatus.lastUpdate)}
                </div>
              </div>
            </div>
          )}
          
          {/* Debris Objects Card - Only shown when debris tab is active */}
          {selectedTab === 'debris' && (
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-lg p-5 border border-gray-700/40 transition-all duration-300 hover:border-yellow-500/20 hover:bg-gray-900/50 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-300 flex items-center">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                  Debris Tracking
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowOnlyClose(!showOnlyClose)}
                    className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                      showOnlyClose 
                        ? 'bg-blue-900/30 text-blue-300 border-blue-900/50' 
                        : 'bg-gray-800/80 text-gray-300 border-gray-700/50 hover:bg-gray-700/50'
                    }`}
                  >
                    {showOnlyClose ? <Eye size={12} className="mr-1" /> : <EyeOff size={12} className="mr-1" />}
                    {showOnlyClose ? 'Showing Close' : 'Show All'}
                  </button>
                  <span className="bg-gray-800/80 px-3 py-1 rounded-full text-xs font-medium text-gray-300 border border-gray-700/50">
                    Total: {filteredDebris.length}
                  </span>
                  {closeObjects > 0 && (
                    <span className="bg-yellow-900/30 px-3 py-1 rounded-full text-xs font-medium text-yellow-300 border border-yellow-700/50 flex items-center">
                      <AlertTriangleIcon size={12} className="mr-1" />
                      Proximity: {closeObjects}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-1 max-h-[400px] overflow-auto custom-scrollbar rounded-lg border border-gray-700/40">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900/80 sticky top-0 z-10">
                    <tr className="text-gray-400 text-xs">
                      <th className="text-left py-3 px-4 font-medium">ID</th>
                      <th className="text-left py-3 px-4 font-medium">Distance</th>
                      <th className="text-left py-3 px-4 font-medium">Coordinates</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {filteredDebris.map((d: DebrisObject) => {
                      const distance = calculateDistance(aircraft, d);
                      const isClose = distance < alertDistance;
                      const isCritical = distance < 500;
                      
                      // Skip critical items if they're turned off
                      if (isCritical && !showCriticalAlerts) return null;
                      
                      let rowClasses = "transition-colors duration-150 ";
                      let statusDisplay;
                      
                      if (isCritical) {
                        rowClasses += "bg-red-900/30 text-red-300 hover:bg-red-900/40";
                        statusDisplay = (
                          <span className="flex items-center text-red-300">
                            <AlertTriangleIcon size={14} className="mr-1" />
                            Critical
                          </span>
                        );
                      } else if (isClose) {
                        rowClasses += "bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/40";
                        statusDisplay = <span className="text-yellow-300">Proximity Alert</span>;
                      } else {
                        rowClasses += "text-gray-300 hover:bg-gray-800/70";
                        statusDisplay = <span className="text-green-400">Normal</span>;
                      }
                      
                      return (
                        <tr key={d.id} className={rowClasses}>
                          <td className="py-3 px-4 font-medium">{d.id}</td>
                          <td className="py-3 px-4 font-mono">
                            {distance.toFixed(2)}m
                            <div className="w-full mt-1 bg-gray-800/70 h-1 rounded overflow-hidden">
                              <div 
                                className={`h-full rounded ${
                                  isCritical ? 'bg-red-500' : isClose ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{
                                  width: `${Math.max(0, 100 - Math.min(100, (distance / 2000) * 100))}%`
                                }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">
                            {d.x.toFixed(0)},{d.y.toFixed(0)},{d.z.toFixed(0)}
                          </td>
                          <td className="py-3 px-4">
                            {statusDisplay}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with system info */}
        <div className="mt-6 pt-3 border-t border-gray-700/30 flex justify-between items-center text-xs text-gray-500">
          <div>AuroGuard v1.0.3</div>
          <div>Processing: {showOnlyClose ? filteredDebris.length : debris.length} objects</div>
        </div>
      </div>

      {/* Menu toggle button - adjusted position */}
      <div className="absolute -right-3 top-6 z-30 menu-toggle">
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-gray-800/80 backdrop-blur-md p-2.5 rounded-full shadow-2xl border border-gray-700/50 text-gray-300 hover:text-blue-400 transition-all duration-300 hover:scale-110 hover:shadow-blue-900/20"
          aria-label="Toggle menu"
        >
          {menuOpen ? <XCircle size={20} className="animate-pulse" /> : <Menu size={20} />}
        </button>
      </div>

      {/* Notifications toggle button */}
      <div className="absolute -right-3 top-20 z-30 notification-toggle">
        <button 
          onClick={() => setShowNotificationPanel(!showNotificationPanel)}
          className="bg-gray-800/80 backdrop-blur-md p-2.5 rounded-full shadow-2xl border border-gray-700/50 text-gray-300 hover:text-blue-400 transition-all duration-300 hover:scale-110 hover:shadow-blue-900/20"
          aria-label="Toggle notifications"
        >
          <div className="relative">
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                {notifications.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Notifications panel */}
      <div 
        className={`notification-panel absolute top-20 right-12 z-20 w-72 max-h-96
        ${showNotificationPanel ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'} 
        overflow-hidden bg-gray-800/85 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/30 
        transition-all duration-300 ease-in-out`}
      >
        {showNotificationPanel && (
          <>
            <div className="sticky top-0 z-10 p-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">Notifications</h3>
                <button 
                  onClick={() => setNotifications([])}
                  className="text-gray-400 hover:text-blue-400 text-xs font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-80 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                <div className="divide-y divide-gray-700/30">
                  {notifications.map(notification => (
                    <div key={notification.id} className="p-3 hover:bg-gray-700/20 transition-colors duration-150">
                      <div className="flex justify-between items-start">
                        <div className="text-xs text-gray-300">{notification.message}</div>
                        <button 
                          onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                          className="text-gray-500 hover:text-gray-300 ml-2"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{formatTime(notification.time)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right side menu - Fixed size and positioning issues */}
      <div 
        className={`menu-container absolute top-0 right-0 z-20 max-h-screen
        ${menuOpen ? 'w-60 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-16'} 
        overflow-hidden bg-gray-800/85 backdrop-blur-xl rounded-l-xl shadow-2xl border-l border-gray-700/30 
        transition-all duration-300 ease-in-out flex flex-col`}
        style={{ 
          boxShadow: menuOpen ? '0 0 40px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {menuOpen && (
          <>
            <div className="sticky top-0 z-10 p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">Control Panel</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`text-gray-400 hover:text-blue-400 transition-all duration-200 hover:scale-110 ${!showNotifications && 'opacity-50'}`}
                    >
                      <Bell size={16} />
                    </button>
                    {closeObjects > 0 && showNotifications && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                        {closeObjects}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:rotate-45"
                  >
                    {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar p-2 bg-gradient-to-b from-gray-800/60 to-gray-900/60">
              <div className="space-y-1 py-2">
                {[
                  { 
                    icon: <Shield size={14} />, 
                    label: 'Security', 
                    badge: 'New', 
                    action: () => {
                      const notification = {
                        id: `security-${Date.now()}`,
                        message: "Security scan initiated",
                        time: new Date()
                      };
                      setNotifications(prev => [notification, ...prev]);
                    }
                  },
                  { 
                    icon: <Filter size={14} />, 
                    label: 'Filters', 
                    badge: '', 
                    action: () => setShowOnlyClose(!showOnlyClose) 
                  },
                  { 
                    icon: <Zap size={14} />, 
                    label: 'Critical Alerts', 
                    badge: criticalObjects > 0 ? criticalObjects.toString() : '', 
                    action: () => setShowCriticalAlerts(!showCriticalAlerts) 
                  },
                  { 
                    icon: darkMode ? <Moon size={14} /> : <Sun size={14} />, 
                    label: 'Display Mode', 
                    badge: '', 
                    action: () => setDarkMode(!darkMode) 
                  },
                  { 
                    icon: <Download size={14} />, 
                    label: 'Export Data', 
                    badge: '', 
                    action: handleExportData 
                  },
                ].map((item, index) => (
                  <button 
                    key={index}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs
                      ${activeMenuIndex === index ? 'bg-blue-900/30 text-blue-300 border border-blue-900/30' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'} 
                      transition-all duration-150 transform hover:translate-x-1`}
                    onMouseEnter={() => setActiveMenuIndex(index)}
                    onMouseLeave={() => setActiveMenuIndex(-1)}
                  >
                    <div className="flex items-center">
                      <span className={`${activeMenuIndex === index ? 'text-blue-400' : 'text-gray-400'} mr-2 transition-colors duration-150`}>{item.icon}</span>
                      {item.label}
                    </div>
                    <div className="flex items-center">
                      {item.badge && (
                        <span className={`${
                          index === 2 && criticalObjects > 0 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-blue-500/20 text-blue-400'
                          } text-xs px-1.5 py-0.5 rounded-full mr-1`}>
                          {item.badge}
                        </span>
                      )}
                      {index === 1 && (
                        <span className={`w-3 h-3 rounded-full mr-1 ${showOnlyClose ? 'bg-blue-500' : 'bg-gray-600'}`}></span>
                      )}
                      {index === 2 && (
                        <span className={`w-3 h-3 rounded-full mr-1 ${showCriticalAlerts ? 'bg-red-500' : 'bg-gray-600'}`}></span>
                      )}
                      <ChevronRight size={12} className={`text-gray-500 transition-transform duration-200 ${activeMenuIndex === index ? 'translate-x-1 opacity-100' : 'opacity-40'}`} />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <div className="px-3 py-1 text-xs font-medium text-gray-500">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { label: 'Scan', color: 'blue', action: handleScan },
                    { label: 'Alert', color: 'yellow', action: handleAlert },
                    { label: 'Identify', color: 'green', action: handleIdentify },
                    { label: 'Track', color: 'purple', action: handleTrack }
                  ].map((action, index) => (
                    <button 
                      key={index}
                      onClick={action.action}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium 
                        ${action.color === 'blue' ? 'bg-blue-900/20 text-blue-400 border border-blue-900/20 hover:bg-blue-900/40' : 
                          action.color === 'yellow' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-900/20 hover:bg-yellow-900/40' :
                          action.color === 'green' ? 'bg-green-900/20 text-green-400 border border-green-900/20 hover:bg-green-900/40' :
                          'bg-purple-900/20 text-purple-400 border border-purple-900/20 hover:bg-purple-900/40'} 
                        transition-all duration-200 hover:scale-105 active:scale-95`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert distance slider */}
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <div className="px-3 py-1 flex justify-between items-center">
                  <div className="text-xs font-medium text-gray-500">Alert Distance</div>
                  <div className="text-xs font-mono text-blue-400">{alertDistance}m</div>
                </div>
                <div className="px-3 py-2">
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={alertDistance}
                    onChange={(e) => setAlertDistance(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 p-3 border-t border-gray-700/50 bg-gray-900/40">
              <div className="bg-gray-900/50 rounded-lg p-2 hover:bg-gray-900/70 transition-colors duration-200">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-medium text-gray-400">System Load</div>
                  <div className="text-xs font-mono text-blue-400">{systemStatus.load}%</div>
                </div>
                <div className="w-full bg-gray-800/70 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-in-out ${
                      systemStatus.load > 90 ? 'bg-red-500' : 
                      systemStatus.load > 75 ? 'bg-yellow-500' : 
                      'bg-gradient-to-r from-blue-500 to-cyan-400'
                    }`}
                    style={{ width: `${systemStatus.load}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};