"use client";
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LoadingAnimation.css';
import { useTranslations } from 'next-intl';

const LoadingAnimation: React.FC = () => {
  const canvasLeftRef = useRef<HTMLCanvasElement>(null);
  const canvasRightRef = useRef<HTMLCanvasElement>(null);
  const canvasCenterRef = useRef<HTMLCanvasElement>(null);
  const t_drawing = useTranslations('Drawing');

  useEffect(() => {
    const setupStarField = (canvas: HTMLCanvasElement, isLeftOrRight: boolean = false) => {
      const particles = 4000;
      const speed = 20;
      const dim = 200;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        preserveDrawingBuffer: true,
        alpha: true
      });
      renderer.autoClearColor = false;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(90, canvas.width/canvas.height, 0.1, 1000);

      // Create multiple particle groups with different speeds for left/right canvases
      const starGroups: THREE.Points[] = [];
      const cleanupFunctions: (() => void)[] = [];

      if (isLeftOrRight) {
        // Create 10 different star groups with different speeds
        const speeds = [1.77, 2.67, 2.23, 3.10, 2.00, 2.90, 2.43, 3.33, 2.23, 2.67];
        const particlesPerGroup = Math.floor(particles / speeds.length);

        speeds.forEach((speedMultiplier, groupIndex) => {
          const vertices = [];
          for (let i = 0; i < particlesPerGroup; i++) {
            const x = dim * 8 * (Math.random() - 0.5);
            const y = dim * 2 * (Math.random() - 0.5);
            const z = -dim * Math.random();
            vertices.push(x, y, z);
          }

          const starGeo = new THREE.BufferGeometry();
          starGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

          const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            depthTest: false
          });

          const starPoints = new THREE.Points(starGeo, starMat);
          starGroups.push(starPoints);
          scene.add(starPoints);

          // Store cleanup function
          cleanupFunctions.push(() => {
            scene.remove(starPoints);
            starGeo.dispose();
            starMat.dispose();
          });
        });
      } else {
        // Center canvas uses single speed
        const vertices = [];
        for (let i = 0; i < particles; i++) {
          const x = dim * 8 * (Math.random() - 0.5);
          const y = dim * 2 * (Math.random() - 0.5);
          const z = -dim * Math.random();
          vertices.push(x, y, z);
        }

        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const starMat = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.5,
          transparent: true,
          depthTest: false
        });

        const starPoints = new THREE.Points(starGeo, starMat);
        starGroups.push(starPoints);
        scene.add(starPoints);

        cleanupFunctions.push(() => {
          scene.remove(starPoints);
          starGeo.dispose();
          starMat.dispose();
        });
      }

      // Create fade plate for trails
      const fadeGeo = new THREE.PlaneGeometry(1, 1);
      const fadeMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.4,
      }) as THREE.Material;

      const fadePlate = new THREE.Mesh(fadeGeo, fadeMat);
      (fadePlate.material as any).renderOrder = -1;
      fadePlate.position.z = -0.1;

      scene.add(fadePlate);

      function draw() {
        if (canvas.height !== canvas.clientHeight || canvas.width !== canvas.clientWidth) {
          camera.aspect = canvas.clientWidth/canvas.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        }

        if (isLeftOrRight) {
          // Animate each group with different speeds
          const speeds = [1.77, 2.67, 2.23, 3.10, 2.00, 2.90, 2.43, 3.33, 2.23, 2.67];
          starGroups.forEach((starPoints, groupIndex) => {
            const starGeo = starPoints.geometry;
            starGeo.attributes.position.needsUpdate = true;
            const p = starGeo.attributes.position.array;
            const groupSpeed = speed * speeds[groupIndex];
            
            for (let i = 0; i < p.length; i += 3) {
              const z = p[i + 2];
              if (z >= 0) {
                p[i] = dim * 8 * (Math.random() - 0.5);
                p[i + 1] = dim * 2 * (Math.random() - 0.5);
                p[i + 2] = -dim;
              } else {
                p[i + 2] += -groupSpeed/p[i + 2];
              }
            }
          });
        } else {
          // Center canvas uses single speed
          const starPoints = starGroups[0];
          const starGeo = starPoints.geometry;
          starGeo.attributes.position.needsUpdate = true;
          const p = starGeo.attributes.position.array;
          
          for (let i = 0; i < p.length; i += 3) {
            const z = p[i + 2];
            if (z >= 0) {
              p[i] = dim * 8 * (Math.random() - 0.5);
              p[i + 1] = dim * 2 * (Math.random() - 0.5);
              p[i + 2] = -dim;
            } else {
              p[i + 2] += -speed/p[i + 2];
            }
          }
        }

        renderer.render(scene, camera);
        requestAnimationFrame(draw);
      }

      requestAnimationFrame(draw);

      return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
        scene.remove(fadePlate);
        fadeGeo.dispose();
        fadeMat.dispose();
        renderer.dispose();
      };
    };

    // Setup all canvases
    const cleanupLeft = canvasLeftRef.current ? setupStarField(canvasLeftRef.current, true) : undefined;
    const cleanupRight = canvasRightRef.current ? setupStarField(canvasRightRef.current, true) : undefined;
    const cleanupCenter = canvasCenterRef.current ? setupStarField(canvasCenterRef.current, false) : undefined;

    return () => {
      cleanupLeft?.();
      cleanupRight?.();
      cleanupCenter?.();
    };
  }, []);

  return (
    <div id="loading-wrapper">
      <div id="loading-text">{t_drawing('drawing')}</div>
      <div id="loading-content"></div>
      <div className="loader-section section-left">
        <canvas
          ref={canvasLeftRef}
          className="star-canvas"
        />
      </div>
      <div className="loader-section section-center">
        <canvas
          ref={canvasCenterRef}
          className="star-canvas"
        />
      </div>
      <div className="loader-section section-right">
        <canvas
          ref={canvasRightRef}
          className="star-canvas"
        />
      </div>
      <div
        className="sticky top-[55%] z-[1001] px-[30px] text-center"
        id="con-text"
      >
        <p className="text-white">
          {t_drawing('Description')}
        </p>
      </div>
    </div>
  );
};

export default LoadingAnimation; 