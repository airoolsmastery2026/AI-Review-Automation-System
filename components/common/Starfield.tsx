
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface StarfieldProps {
    mouseX: number;
    mouseY: number;
}

export const Starfield: React.FC<StarfieldProps> = ({ mouseX, mouseY }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const mousePosRef = useRef({ x: mouseX, y: mouseY });

    // Update mouse position ref without re-triggering the main effect
    useEffect(() => {
        mousePosRef.current = { x: mouseX, y: mouseY };
    }, [mouseX, mouseY]);

    // Main Three.js setup effect, runs only once
    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        // Scene, camera, renderer setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.z = 1000;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentMount.appendChild(renderer.domElement);

        // Create star particles
        const starCount = 10000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
        }

        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0x88ddff,
            size: 1.5,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Animation loop
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Animate stars to create "warp drive" effect
            const posArray = stars.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < starCount; i++) {
                posArray[i * 3 + 2] += 2; // Move along Z axis
                if (posArray[i * 3 + 2] > 1000) {
                    posArray[i * 3 + 2] = -1000; // Reset when past the camera
                }
            }
            stars.geometry.attributes.position.needsUpdate = true;
            
            // Apply parallax effect by rotating camera
            const { x, y } = mousePosRef.current;
            camera.rotation.y = x * 0.1;
            camera.rotation.x = -y * 0.1;

            renderer.render(scene, camera);
        };
        animate();

        // Handle window resizing
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (currentMount) {
                 currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
            starGeometry.dispose();
            starMaterial.dispose();
        };
    }, []);

    return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -2, width: '100vw', height: '100vh' }} />;
};
