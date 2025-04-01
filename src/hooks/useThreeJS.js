import * as THREE from "three";
import { useRef, useCallback } from "react";

export const useThreeJS = (containerRef: React.RefObject<HTMLDivElement>) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const initializeScene = useCallback(
    ({
      backgroundColor,
      cameraSettings,
      addGrid,
      lighting,
    }: {
      backgroundColor: number;
      cameraSettings: {
        fov: number;
        position: { x: number; y: number; z: number };
        lookAt: { x: number; y: number; z: number };
      };
      addGrid?: boolean;
      lighting?: {
        ambient?: { color: number };
        directional?: {
          color: number;
          intensity: number;
          position: { x: number; y: number; z: number };
        };
      };
    }) => {
      if (!containerRef.current) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        cameraSettings.fov,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        20000
      );
      camera.position.set(
        cameraSettings.position.x,
        cameraSettings.position.y,
        cameraSettings.position.z
      );
      camera.lookAt(
        cameraSettings.lookAt.x,
        cameraSettings.lookAt.y,
        cameraSettings.lookAt.z
      );
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      if (addGrid) {
        scene.add(new THREE.GridHelper(10000, 50, 0x444444, 0x222222));
      }

      if (lighting?.ambient) {
        scene.add(new THREE.AmbientLight(lighting.ambient.color));
      }
      if (lighting?.directional) {
        const light = new THREE.DirectionalLight(
          lighting.directional.color,
          lighting.directional.intensity
        );
        light.position.set(
          lighting.directional.position.x,
          lighting.directional.position.y,
          lighting.directional.position.z
        );
        scene.add(light);
      }

      const handleResize = () => {
        if (!containerRef.current || !camera || !renderer) return;
        camera.aspect =
          containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    },
    [containerRef]
  );

  const cleanupScene = useCallback(() => {
    if (containerRef.current && rendererRef.current?.domElement) {
      containerRef.current.removeChild(rendererRef.current.domElement);
    }
    sceneRef.current = null;
    cameraRef.current = null;
    rendererRef.current = null;
  }, []);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    initializeScene,
    cleanupScene,
  };
};