import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Eye, Sun, Moon, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';

export const Stadium3DScreen: React.FC = () => {
  const { tenant, clubs, selectedClubId, setActiveScreen, playHapticFeedback } = useLeague();
  const canvasMountRef = useRef<HTMLDivElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'grandstand' | 'tactical' | 'goal' | 'low'>('grandstand');
  const [formation, setFormation] = useState<'4-3-3' | '3-5-2' | '4-2-3-1'>('4-3-3');
  const [isNightMode, setIsNightMode] = useState(true);

  const currentClub = clubs.find((c) => c.id === selectedClubId) || clubs[0];

  // Mutable refs for Three.js state outside React re-render cycle
  const threeStateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    playerMeshes: THREE.Group[];
    targetCamPos: THREE.Vector3;
    targetCamLook: THREE.Vector3;
    currentCamPos: THREE.Vector3;
    currentCamLook: THREE.Vector3;
    keyLight?: THREE.DirectionalLight;
    hemiLight?: THREE.HemisphereLight;
    floodlights: THREE.SpotLight[];
    isDragging: boolean;
    prevMousePos: { x: number; y: number };
    orbitAngles: { theta: number; phi: number; radius: number };
    animId?: number;
  }>({
    playerMeshes: [],
    targetCamPos: new THREE.Vector3(0, 38, 55),
    targetCamLook: new THREE.Vector3(0, 0, 0),
    currentCamPos: new THREE.Vector3(0, 38, 55),
    currentCamLook: new THREE.Vector3(0, 0, 0),
    floodlights: [],
    isDragging: false,
    prevMousePos: { x: 0, y: 0 },
    orbitAngles: { theta: 0, phi: 0.65, radius: 68 },
  });

  // Formation coordinates for 11 players on a pitch of size 70 x 48 (Z: -30 to +30, X: -22 to +22)
  const formationsMap: Record<string, [number, number][]> = {
    '4-3-3': [
      // GK
      [0, -28],
      // Back 4 (LB, CB, CB, RB)
      [-16, -18], [-6, -20], [6, -20], [16, -18],
      // Mid 3
      [-10, -6], [0, -4], [10, -6],
      // Front 3 (LW, ST, RW)
      [-14, 12], [0, 16], [14, 12],
    ],
    '3-5-2': [
      // GK
      [0, -28],
      // Back 3
      [-12, -20], [0, -21], [12, -20],
      // Mid 5
      [-18, -4], [-8, -2], [0, 0], [8, -2], [18, -4],
      // Front 2
      [-7, 15], [7, 15],
    ],
    '4-2-3-1': [
      // GK
      [0, -28],
      // Back 4
      [-16, -19], [-6, -21], [6, -21], [16, -19],
      // 2 Defensive Mid
      [-7, -10], [7, -10],
      // 3 Attacking Mid
      [-14, 4], [0, 6], [14, 4],
      // 1 Striker
      [0, 17],
    ],
  };

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    // 1. Scene & Renderer setup conforming to threejs skill
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? 0x09090e : 0xbfdbfe);
    scene.fog = new THREE.FogExp2(isNightMode ? 0x09090e : 0xbfdbfe, 0.012);

    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.5,
      350
    );
    camera.position.set(0, 38, 55);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    // 2. RoomEnvironment with PMREMGenerator for realistic PBR reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8db, 2.2);
    keyLight.position.set(25, 45, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // 4. Procedural Grass Pitch Texture (Zero 404 dependencies)
    const pitchCanvas = document.createElement('canvas');
    pitchCanvas.width = 1024;
    pitchCanvas.height = 1024;
    const ctx = pitchCanvas.getContext('2d')!;

    // Vibrant grass base with alternating turf stripes
    ctx.fillStyle = '#2d8a3e';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.fillStyle = '#227230';
    for (let i = 0; i < 1024; i += 64) {
      ctx.fillRect(0, i, 1024, 32);
    }

    // White field markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    // Outer touchlines
    ctx.strokeRect(64, 64, 896, 896);
    // Halfway line
    ctx.beginPath();
    ctx.moveTo(64, 512);
    ctx.lineTo(960, 512);
    ctx.stroke();
    // Center circle
    ctx.beginPath();
    ctx.arc(512, 512, 110, 0, Math.PI * 2);
    ctx.stroke();
    // Center spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(512, 512, 10, 0, Math.PI * 2);
    ctx.fill();
    // Penalty boxes
    ctx.strokeRect(280, 64, 464, 160);
    ctx.strokeRect(280, 800, 464, 160);
    // Goal boxes
    ctx.strokeRect(380, 64, 264, 64);
    ctx.strokeRect(380, 896, 264, 64);

    const pitchTexture = new THREE.CanvasTexture(pitchCanvas);
    pitchTexture.colorSpace = THREE.SRGBColorSpace;
    pitchTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const pitchGeo = new THREE.PlaneGeometry(60, 80);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: pitchTexture,
      roughness: 0.85,
      metalness: 0.05,
    });
    const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
    pitchMesh.rotation.x = -Math.PI / 2;
    pitchMesh.receiveShadow = true;
    scene.add(pitchMesh);

    // Ground surround terrain extending naturally
    const terrainGeo = new THREE.PlaneGeometry(160, 180);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.95,
      metalness: 0.1,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.position.y = -0.05;
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // 5. Composite Stadium Grandstand Structure (3-12 Part Procedural Model)
    const stadiumGroup = new THREE.Group();

    // Part 1: Concrete foundation base ring
    const baseRingGeo = new THREE.BoxGeometry(76, 4, 96);
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.75,
      metalness: 0.2,
    });
    const baseRing = new THREE.Mesh(baseRingGeo, concreteMat);
    baseRing.position.y = -2;
    baseRing.receiveShadow = true;
    stadiumGroup.add(baseRing);

    // Part 2 & 3: Tiered spectator grandstands (North & South)
    const standGeo = new THREE.BoxGeometry(64, 8, 14);
    const seatsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.3,
    });
    const northStand = new THREE.Mesh(standGeo, seatsMat);
    northStand.position.set(0, 4, -46);
    northStand.castShadow = true;
    northStand.receiveShadow = true;
    stadiumGroup.add(northStand);

    const southStand = new THREE.Mesh(standGeo, seatsMat);
    southStand.position.set(0, 4, 46);
    southStand.castShadow = true;
    southStand.receiveShadow = true;
    stadiumGroup.add(southStand);

    // Part 4 & 5: Tiered grandstands (East & West)
    const sideStandGeo = new THREE.BoxGeometry(14, 10, 80);
    const eastStand = new THREE.Mesh(sideStandGeo, seatsMat);
    eastStand.position.set(-36, 5, 0);
    eastStand.castShadow = true;
    eastStand.receiveShadow = true;
    stadiumGroup.add(eastStand);

    const westStand = new THREE.Mesh(sideStandGeo, seatsMat);
    westStand.position.set(36, 5, 0);
    westStand.castShadow = true;
    westStand.receiveShadow = true;
    stadiumGroup.add(westStand);

    // Part 6 & 7: Modern Cantilever Roof Canopies
    const roofGeo = new THREE.BoxGeometry(16, 1.2, 84);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.3,
      metalness: 0.8,
    });
    const roofEast = new THREE.Mesh(roofGeo, roofMat);
    roofEast.position.set(-33, 14, 0);
    roofEast.rotation.z = 0.08;
    stadiumGroup.add(roofEast);

    const roofWest = new THREE.Mesh(roofGeo, roofMat);
    roofWest.position.set(33, 14, 0);
    roofWest.rotation.z = -0.08;
    stadiumGroup.add(roofWest);

    scene.add(stadiumGroup);

    // 6. Composite 3D Goalposts (3-12 parts)
    const goalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.9,
    });

    const createGoal = (zPos: number, rotY: number) => {
      const g = new THREE.Group();
      // Posts
      const postGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.5, 12);
      const postL = new THREE.Mesh(postGeo, goalMat);
      postL.position.set(-4, 2.25, 0);
      postL.castShadow = true;
      g.add(postL);

      const postR = new THREE.Mesh(postGeo, goalMat);
      postR.position.set(4, 2.25, 0);
      postR.castShadow = true;
      g.add(postR);

      // Crossbar
      const barGeo = new THREE.CylinderGeometry(0.2, 0.2, 8.2, 12);
      const crossbar = new THREE.Mesh(barGeo, goalMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, 4.4, 0);
      crossbar.castShadow = true;
      g.add(crossbar);

      // Rear net box
      const netMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const netGeo = new THREE.BoxGeometry(8, 4.2, 3);
      const netMesh = new THREE.Mesh(netGeo, netMat);
      netMesh.position.set(0, 2.1, zPos > 0 ? 1.5 : -1.5);
      g.add(netMesh);

      g.position.set(0, 0, zPos);
      g.rotation.y = rotY;
      return g;
    };

    scene.add(createGoal(-38, 0));
    scene.add(createGoal(38, Math.PI));

    // 7. 4x Composite Floodlight Towers with Spotlights
    const towerCoords = [
      [-36, -46],
      [36, -46],
      [-36, 46],
      [36, 46],
    ];

    const floodlights: THREE.SpotLight[] = [];

    towerCoords.forEach(([tx, tz]) => {
      const towerGroup = new THREE.Group();

      // Truss Mast (Composite part 1)
      const mastGeo = new THREE.CylinderGeometry(0.5, 1.2, 26, 8);
      const trussMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.4,
        metalness: 0.7,
      });
      const mast = new THREE.Mesh(mastGeo, trussMat);
      mast.position.y = 13;
      towerGroup.add(mast);

      // Head Array (Composite part 2)
      const headGeo = new THREE.BoxGeometry(5, 3.5, 1);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.8,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, 25, 0);
      head.lookAt(0, 0, 0);
      towerGroup.add(head);

      // High-intensity emissive lamp cluster (Composite part 3)
      const lampGeo = new THREE.PlaneGeometry(4.4, 2.8);
      const lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(0, 25, 0.55);
      lamp.lookAt(0, 0, 0);
      towerGroup.add(lamp);

      towerGroup.position.set(tx, 0, tz);
      scene.add(towerGroup);

      // Real Spotlight
      const spot = new THREE.SpotLight(0xfffae0, 2.2, 110, Math.PI / 4, 0.45, 1.2);
      spot.position.set(tx, 25, tz);
      spot.target.position.set(tx * 0.2, 0, tz * 0.2);
      scene.add(spot);
      scene.add(spot.target);
      floodlights.push(spot);
    });

    // 8. 11 Tactical Player Pucks (3-Part Composite Model per player)
    const playerMeshes: THREE.Group[] = [];
    const baseCoords = formationsMap['4-3-3'];

    baseCoords.forEach((coord, idx) => {
      const playerGroup = new THREE.Group();

      // Part 1: Ground contact shadow
      const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.38,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      playerGroup.add(shadow);

      // Part 2: Cylindrical Puck Body
      const puckGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.45, 24);
      const isGK = idx === 0;
      const puckMat = new THREE.MeshStandardMaterial({
        color: isGK ? 0xf59e0b : 0xc8f135, // Electric lime or GK amber
        roughness: 0.25,
        metalness: 0.75,
      });
      const puck = new THREE.Mesh(puckGeo, puckMat);
      puck.position.y = 0.25;
      puck.castShadow = true;
      playerGroup.add(puck);

      // Part 3: Inner White Core Ring
      const coreGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.5, 24);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x0e0e12,
        roughness: 0.4,
        metalness: 0.3,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 0.27;
      playerGroup.add(core);

      playerGroup.position.set(coord[0], 0, coord[1]);
      scene.add(playerGroup);
      playerMeshes.push(playerGroup);
    });

    // Save refs
    threeStateRef.current = {
      ...threeStateRef.current,
      renderer,
      scene,
      camera,
      playerMeshes,
      keyLight,
      hemiLight,
      floodlights,
    };

    // 9. Input & Orbit Handlers (Damped Rotation)
    let isDown = false;
    let lastX = 0;
    let lastY = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      lastX = clientX;
      lastY = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - lastX;
      const dy = clientY - lastY;
      lastX = clientX;
      lastY = clientY;

      threeStateRef.current.orbitAngles.theta -= dx * 0.008;
      threeStateRef.current.orbitAngles.phi = Math.max(
        0.15,
        Math.min(1.4, threeStateRef.current.orbitAngles.phi + dy * 0.008)
      );

      // Update target camera position based on spherical coordinates
      const { theta, phi, radius } = threeStateRef.current.orbitAngles;
      threeStateRef.current.targetCamPos.x = radius * Math.sin(phi) * Math.sin(theta);
      threeStateRef.current.targetCamPos.y = radius * Math.cos(phi);
      threeStateRef.current.targetCamPos.z = radius * Math.sin(phi) * Math.cos(theta);
    };

    const handlePointerUp = () => {
      isDown = false;
    };

    mount.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    mount.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    // 10. Lossless 60fps Animation Loop with Exponential Damping
    let prevTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - prevTime) / 1000, 0.1);
      prevTime = time;

      const state = threeStateRef.current;
      if (state.camera && state.renderer && state.scene) {
        // Exponential damping for camera movement (1 - exp(-k * dt))
        const k = 4.5;
        const alpha = 1 - Math.exp(-k * dt);

        state.currentCamPos.lerp(state.targetCamPos, alpha);
        state.currentCamLook.lerp(state.targetCamLook, alpha);

        state.camera.position.copy(state.currentCamPos);
        state.camera.lookAt(state.currentCamLook);

        // Smooth subtle idle breathing for tactical players
        state.playerMeshes.forEach((mesh, idx) => {
          mesh.position.y = Math.sin(time * 0.002 + idx * 0.4) * 0.08;
        });

        state.renderer.render(state.scene, state.camera);
      }

      state.animId = requestAnimationFrame(animate);
    };

    threeStateRef.current.animId = requestAnimationFrame(animate);

    // Resize observer
    const handleResize = () => {
      if (!mount || !camera || !renderer) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (threeStateRef.current.animId) {
        cancelAnimationFrame(threeStateRef.current.animId);
      }
      mount.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      mount.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Camera Preset
  const applyCameraPreset = (preset: 'grandstand' | 'tactical' | 'goal' | 'low') => {
    setCameraPreset(preset);
    playHapticFeedback();
    const state = threeStateRef.current;
    if (preset === 'grandstand') {
      state.targetCamPos.set(0, 36, 52);
      state.targetCamLook.set(0, 0, 0);
      state.orbitAngles = { theta: 0, phi: 0.65, radius: 64 };
    } else if (preset === 'tactical') {
      state.targetCamPos.set(0, 68, 0.1);
      state.targetCamLook.set(0, 0, 0);
      state.orbitAngles = { theta: 0, phi: 0.01, radius: 68 };
    } else if (preset === 'goal') {
      state.targetCamPos.set(0, 8, -48);
      state.targetCamLook.set(0, 4, 0);
      state.orbitAngles = { theta: Math.PI, phi: 1.25, radius: 52 };
    } else if (preset === 'low') {
      state.targetCamPos.set(34, 12, 34);
      state.targetCamLook.set(0, 2, 0);
      state.orbitAngles = { theta: 0.78, phi: 1.1, radius: 48 };
    }
  };

  // Update Formation with smooth translation
  const applyFormation = (newForm: '4-3-3' | '3-5-2' | '4-2-3-1') => {
    setFormation(newForm);
    playHapticFeedback();
    const coords = formationsMap[newForm];
    const meshes = threeStateRef.current.playerMeshes;

    meshes.forEach((mesh, idx) => {
      if (coords[idx]) {
        // Animate position smoothly
        mesh.position.x = coords[idx][0];
        mesh.position.z = coords[idx][1];
      }
    });
  };

  // Toggle Day / Night lighting
  const toggleDayNight = () => {
    const nextNight = !isNightMode;
    setIsNightMode(nextNight);
    playHapticFeedback();

    const state = threeStateRef.current;
    if (!state.scene || !state.keyLight || !state.hemiLight) return;

    if (nextNight) {
      state.scene.background = new THREE.Color(0x09090e);
      state.scene.fog = new THREE.FogExp2(0x09090e, 0.012);
      state.keyLight.intensity = 1.8;
      state.keyLight.color.setHex(0xfff6e5);
      state.hemiLight.intensity = 0.6;
      state.floodlights.forEach((f) => (f.intensity = 2.2));
    } else {
      state.scene.background = new THREE.Color(0xdbeafe);
      state.scene.fog = new THREE.FogExp2(0xdbeafe, 0.008);
      state.keyLight.intensity = 3.0;
      state.keyLight.color.setHex(0xffffff);
      state.hemiLight.intensity = 1.4;
      state.floodlights.forEach((f) => (f.intensity = 0.2));
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#09090E]">
      {/* 1. Full-Bleed Three.js WebGL Mount (100vw x 100vh) */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 touch-none cursor-grab active:cursor-grabbing" />

      {/* 2. Minimal Top Spec Badge & Back Button */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={() => {
            setActiveScreen('home');
            playHapticFeedback();
          }}
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/80 text-white font-condensed text-base uppercase border border-white/10 hover:bg-black cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 text-[#C8F135]" />
          <span>EXIT 3D LAB</span>
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-full bg-black/80 border border-white/10 text-white font-condensed text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C8F135]" />
            <span>{currentClub.venueName} · 60 FPS PBR</span>
          </div>
        </div>
      </div>

      {/* 3. Unified Bottom Control Dock (<= 15% Viewport Footprint, Zero Backdrop-Filter over WebGL) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsCollapsed((p) => !p);
              playHapticFeedback();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-t-xl bg-neutral-900 text-white text-xs font-condensed font-bold uppercase border-t border-x border-white/10 shadow-lg cursor-pointer hover:bg-black -mb-px"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#C8F135]" />
                <span>EXPAND TACTIC DOCK</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#C8F135]" />
                <span>HIDE CONTROLS (ZEN)</span>
              </>
            )}
          </button>

          {/* Dock Content */}
          {!isCollapsed && (
            <div className="w-full bg-neutral-900 text-white rounded-2xl p-3 border border-white/10 shadow-2xl space-y-2.5 animate-fade-in">
              {/* Row 1: Camera Presets */}
              <div className="flex items-center justify-between gap-1 text-xs">
                <span className="font-condensed text-[11px] font-black uppercase text-neutral-400 shrink-0 mr-1">
                  CAMERA:
                </span>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  {[
                    { id: 'grandstand', label: 'STAND' },
                    { id: 'tactical', label: 'TACTICAL' },
                    { id: 'goal', label: 'BEHIND GOAL' },
                    { id: 'low', label: 'FIELD CAM' },
                  ].map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => applyCameraPreset(cam.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-condensed text-xs uppercase font-bold transition-colors cursor-pointer ${
                        cameraPreset === cam.id
                          ? 'bg-[#C8F135] text-black font-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {cam.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Formations & Lighting */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center gap-1">
                  <span className="font-condensed text-[11px] font-black uppercase text-neutral-400 mr-1">
                    FORMATION:
                  </span>
                  {(['4-3-3', '3-5-2', '4-2-3-1'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => applyFormation(fmt)}
                      className={`px-2.5 py-1 rounded-lg font-condensed text-xs uppercase font-bold cursor-pointer ${
                        formation === fmt
                          ? 'bg-[#7B6CF2] text-white font-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                {/* Day / Night Toggle */}
                <button
                  type="button"
                  onClick={toggleDayNight}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-condensed font-bold uppercase cursor-pointer"
                >
                  {isNightMode ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-amber-300" />
                      <span>NIGHT</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>DAYLIGHT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
