"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeBackgroundCanvasProps {
  className?: string;
  particleCount?: number;
}

export function ThreeBackgroundCanvas({
  className = "",
  particleCount = 38,
}: ThreeBackgroundCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Disable on small screens (< 768px) and under prefers-reduced-motion
    if (
      window.innerWidth < 768 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let animationFrameId: number;
    let isVisible = true;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 24;

    // 2. Renderer setup with high performance & alpha transparency
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Ensure canvas fits container perfectly
    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    container.appendChild(canvas);

    // 3. Lighting setup (Warm gold + crisp milk white + subtle wine ambient)
    const ambientLight = new THREE.AmbientLight(0xfffdf7, 1.4);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xf5e729, 2.5, 45);
    goldLight.position.set(12, 10, 10);
    scene.add(goldLight);

    const milkLight = new THREE.DirectionalLight(0xffffff, 1.8);
    milkLight.position.set(-10, 14, 15);
    scene.add(milkLight);

    const wineBackLight = new THREE.PointLight(0x5c1b13, 1.2, 35);
    wineBackLight.position.set(0, -12, 5);
    scene.add(wineBackLight);

    // 4. Create floating 3D Milk & Cream Droplets / Spheres
    const sphereGeometry = new THREE.SphereGeometry(1, 24, 24);

    // Creamy translucent milk material with soft specular highlight
    const milkMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffef9,
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 0.72,
    });

    // Golden butterfat / sunshine pearl material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdee57,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.55,
    });

    const particles: Array<{
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      speedX: number;
      speedY: number;
      amplitude: number;
      phase: number;
    }> = [];

    const group = new THREE.Group();
    scene.add(group);

    for (let i = 0; i < particleCount; i++) {
      const isGold = i % 4 === 0;
      const material = isGold ? goldMaterial : milkMaterial;
      const mesh = new THREE.Mesh(sphereGeometry, material);

      // Random spatial distribution across frustum
      const scale = THREE.MathUtils.randFloat(0.18, isGold ? 0.45 : 0.65);
      mesh.scale.set(scale, scale, scale);

      // Constrain particles strictly to right-side visual area (baseX > 4) to NEVER overlap text on the left
      const baseX = THREE.MathUtils.randFloat(4, 16);
      const baseY = THREE.MathUtils.randFloatSpread(18);
      const baseZ = THREE.MathUtils.randFloat(-8, 6);

      mesh.position.set(baseX, baseY, baseZ);
      group.add(mesh);

      particles.push({
        mesh,
        baseX,
        baseY,
        baseZ,
        speedX: THREE.MathUtils.randFloat(0.2, 0.6),
        speedY: THREE.MathUtils.randFloat(0.4, 0.9),
        amplitude: THREE.MathUtils.randFloat(0.8, 1.8),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 5. Mouse Parallax Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 6. Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // 7. Intersection Observer to pause rendering when not in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 8. Animation loop
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth mouse interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      // Parallax camera sway
      camera.position.x = currentMouseX * 3.5;
      camera.position.y = currentMouseY * 2.5;
      camera.lookAt(0, 0, 0);

      // Subtle group rotation
      group.rotation.y = elapsedTime * 0.03 + currentMouseX * 0.15;
      group.rotation.x = currentMouseY * 0.1;

      // Organic bobbing of each 3D droplet
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.mesh.position.y =
          p.baseY + Math.sin(elapsedTime * p.speedY + p.phase) * p.amplitude;
        p.mesh.position.x =
          p.baseX + Math.cos(elapsedTime * p.speedX + p.phase) * (p.amplitude * 0.5);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();

      sphereGeometry.dispose();
      milkMaterial.dispose();
      goldMaterial.dispose();
      renderer.dispose();

      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    };
  }, [particleCount]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    />
  );
}
