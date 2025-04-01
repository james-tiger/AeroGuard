import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
export const AircraftSimulation = ({
  aircraft,
  debris,
  dangerRadius,
  warningRadius,
  alerts,
  predictedCollisions,
  isAIEnabled,
  aiStatus,
  targetDebris
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const aircraftMeshRef = useRef(null);
  const debrisMeshesRef = useRef([]);
  const aiStatusTextRef = useRef(null);
  const aiTargetLineRef = useRef(null);
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    sceneRef.current = scene;
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 20000);
    camera.position.z = 2000;
    camera.position.y = 1000;
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    // Add grid helper
    const gridHelper = new THREE.GridHelper(10000, 50, 0x444444, 0x222222);
    scene.add(gridHelper);
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    // Create aircraft
    const aircraftGeometry = new THREE.ConeGeometry(50, 200, 4);
    const aircraftMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00
    });
    const aircraftMesh = new THREE.Mesh(aircraftGeometry, aircraftMaterial);
    aircraftMesh.rotation.x = Math.PI / 2;
    scene.add(aircraftMesh);
    aircraftMeshRef.current = aircraftMesh;
    // Danger radius visualization
    const dangerRadiusGeometry = new THREE.SphereGeometry(dangerRadius, 32, 32);
    const dangerRadiusMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    const dangerRadiusMesh = new THREE.Mesh(dangerRadiusGeometry, dangerRadiusMaterial);
    scene.add(dangerRadiusMesh);
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);
  // Update aircraft position
  useEffect(() => {
    if (!aircraftMeshRef.current) return;
    aircraftMeshRef.current.position.set(aircraft.x, aircraft.y, aircraft.z);
    // Update camera to follow aircraft
    if (cameraRef.current) {
      cameraRef.current.position.set(aircraft.x, aircraft.y + 1000, aircraft.z + 2000);
      cameraRef.current.lookAt(aircraft.x, aircraft.y, aircraft.z);
    }
  }, [aircraft]);
  // Update danger radius size
  useEffect(() => {
    if (!sceneRef.current) return;
    // Remove old danger radius and add new one
    sceneRef.current.children = sceneRef.current.children.filter(child => !(child.geometry instanceof THREE.SphereGeometry));
    const dangerRadiusGeometry = new THREE.SphereGeometry(dangerRadius, 32, 32);
    const dangerRadiusMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    const dangerRadiusMesh = new THREE.Mesh(dangerRadiusGeometry, dangerRadiusMaterial);
    dangerRadiusMesh.position.copy(aircraftMeshRef.current.position);
    sceneRef.current.add(dangerRadiusMesh);
  }, [dangerRadius, aircraft]);
  // Update debris positions
  useEffect(() => {
    if (!sceneRef.current) return;
    // Remove old debris meshes
    debrisMeshesRef.current.forEach(mesh => {
      sceneRef.current.remove(mesh);
    });
    // Create new debris meshes
    const newDebrisMeshes = [];
    debris.forEach(d => {
      const isInDanger = alerts.some(alert => alert.id === d.id);
      const isTargeted = targetDebris && targetDebris.id === d.id;
      
      // Determine debris color based on status
      let debrisColor = 0xffaa00; // Default color
      if (isInDanger) debrisColor = 0xff0000; // Danger color
      if (isTargeted && isAIEnabled) debrisColor = 0x00ffff; // AI target color
      
      // Create debris with appropriate size based on status
      const debrisSize = isTargeted && isAIEnabled ? 45 : 30; // Larger if targeted
      const debrisGeometry = new THREE.SphereGeometry(debrisSize, 16, 16);
      
      // Create debris material with glow effect if targeted
      const debrisMaterial = new THREE.MeshPhongMaterial({
        color: debrisColor,
        emissive: isTargeted && isAIEnabled ? 0x00ffff : 0x000000,
        emissiveIntensity: isTargeted && isAIEnabled ? 0.5 : 0,
        shininess: isTargeted && isAIEnabled ? 100 : 30
      });
      
      const debrisMesh = new THREE.Mesh(debrisGeometry, debrisMaterial);
      debrisMesh.position.set(d.x, d.y, d.z);
      sceneRef.current.add(debrisMesh);
      newDebrisMeshes.push(debrisMesh);
      
      // If this is the targeted debris and AI is enabled, create a line from aircraft to debris
      if (isTargeted && isAIEnabled && aircraftMeshRef.current) {
        // Remove old target line if exists
        if (aiTargetLineRef.current) {
          sceneRef.current.remove(aiTargetLineRef.current);
        }
        
        // Create line geometry from aircraft to debris
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(aircraft.x, aircraft.y, aircraft.z),
          new THREE.Vector3(d.x, d.y, d.z)
        ]);
        
        // Create pulsing line material
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          linewidth: 2
        });
        
        // Create line and add to scene
        const line = new THREE.Line(lineGeometry, lineMaterial);
        sceneRef.current.add(line);
        aiTargetLineRef.current = line;
      }
    });
    debrisMeshesRef.current = newDebrisMeshes;
  }, [debris, alerts, targetDebris, isAIEnabled, aircraft]);
  // Update AI status visualization
  useEffect(() => {
    if (!sceneRef.current || !aircraftMeshRef.current) return;
    
    // Remove old AI status text if exists
    if (aiStatusTextRef.current) {
      sceneRef.current.remove(aiStatusTextRef.current);
    }
    
    if (isAIEnabled) {
      // Create AI status indicator above aircraft
      const loader = new THREE.TextureLoader();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 128;
      
      // Draw status text on canvas
      context.fillStyle = '#000000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = 'Bold 24px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      // Set color based on AI status
      let statusColor = '#FFFFFF';
      if (aiStatus === 'active') statusColor = '#00FF00';
      if (aiStatus === 'warning') statusColor = '#FFFF00';
      if (aiStatus === 'critical') statusColor = '#FF0000';
      
      context.fillStyle = statusColor;
      context.fillText(`AI: ${aiStatus.toUpperCase()}`, canvas.width / 2, canvas.height / 2);
      
      // Create sprite with status text
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(
        aircraftMeshRef.current.position.x,
        aircraftMeshRef.current.position.y + 200,
        aircraftMeshRef.current.position.z
      );
      sprite.scale.set(200, 100, 1);
      
      sceneRef.current.add(sprite);
      aiStatusTextRef.current = sprite;
      
      // Change aircraft color based on AI status
      if (aircraftMeshRef.current) {
        const material = aircraftMeshRef.current.material;
        if (aiStatus === 'active') material.color.set(0x00ff00); // Green
        if (aiStatus === 'warning') material.color.set(0xffff00); // Yellow
        if (aiStatus === 'critical') material.color.set(0xff0000); // Red
        if (aiStatus === 'standby') material.color.set(0x0088ff); // Blue
      }
    } else {
      // Reset aircraft color when AI is disabled
      if (aircraftMeshRef.current) {
        aircraftMeshRef.current.material.color.set(0x00ff00);
      }
      
      // Remove target line when AI is disabled
      if (aiTargetLineRef.current) {
        sceneRef.current.remove(aiTargetLineRef.current);
        aiTargetLineRef.current = null;
      }
    }
  }, [isAIEnabled, aiStatus, aircraft]);
  
  return <div ref={containerRef} className="w-full h-full bg-gray-900" />;
};