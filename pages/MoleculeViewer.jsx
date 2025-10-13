import React, { useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber/native";
import { OrbitControls, Sphere, Line, Text, Bounds } from "@react-three/drei/native";
import * as THREE from "three";
import { View } from "react-native";

const Atom = ({ position, color = "gray", size = 0.5, symbol }) => {
  return (
    <group position={position}>
      <Sphere args={[size, 32, 32]}>
        <meshStandardMaterial attach="material" color={color} roughness={0.5} metalness={0.1} />
      </Sphere>
      {symbol && (
        <Text position={[0, 0, size * 1.1]} fontSize={size * 0.8} color="black" anchorX="center" anchorY="middle" depthOffset={-1}>
          {symbol}
        </Text>
      )}
    </group>
  );
};

const BondLine = ({ start, end, order }) => {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize();
  let offset = new THREE.Vector3(0, 1, 0).cross(direction);
  if (offset.length() < 0.1) offset = new THREE.Vector3(1, 0, 0).cross(direction);
  offset.normalize().multiplyScalar(0.08);

  if (order >= 3.0) {
    return (
      <>
        <Line points={[startVec, endVec]} color="grey" lineWidth={1.5} />
        <Line points={[startVec.clone().add(offset), endVec.clone().add(offset)]} color="grey" lineWidth={1.5} />
        <Line points={[startVec.clone().sub(offset), endVec.clone().sub(offset)]} color="grey" lineWidth={1.5} />
      </>
    );
  }
  if (order >= 2.0) {
    offset.multiplyScalar(0.7);
    return (
      <>
        <Line points={[startVec.clone().add(offset), endVec.clone().add(offset)]} color="grey" lineWidth={1.5} />
        <Line points={[startVec.clone().sub(offset), endVec.clone().sub(offset)]} color="grey" lineWidth={1.5} />
      </>
    );
  }
  return <Line points={[startVec, endVec]} color="grey" lineWidth={1.5} />;
};

const Molecule = ({ atoms, bonds }) => {
  const center = useMemo(() => {
    if (!atoms || atoms.length === 0) return new THREE.Vector3(0, 0, 0);
    const avgPos = atoms.reduce((acc, atom) => { acc.x += atom.x; acc.y += atom.y; acc.z += atom.z; return acc; }, { x: 0, y: 0, z: 0 });
    avgPos.x /= atoms.length; avgPos.y /= atoms.length; avgPos.z /= atoms.length;
    return new THREE.Vector3(avgPos.x, avgPos.y, avgPos.z);
  }, [atoms]);

  if (!atoms || atoms.length === 0) return null;

  return (
    <group position={[-center.x, -center.y, -center.z]}>
      {atoms.map((atom) => (
        <Atom key={atom.id} position={[atom.x, atom.y, atom.z]} color={atom.color} size={atom.symbol === "H" ? 0.3 : 0.5} symbol={atom.symbol} />
      ))}
      {bonds.map((bond, index) => {
        const atom1 = atoms.find((a) => a.id === bond.source);
        const atom2 = atoms.find((a) => a.id === bond.target);
        if (!atom1 || !atom2) return null;
        return <BondLine key={`${bond.source}-${bond.target}-${index}`} start={[atom1.x, atom1.y, atom1.z]} end={[atom2.x, atom2.y, atom2.z]} order={bond.order} />;
      })}
    </group>
  );
};

const MoleculeViewer = ({ moleculeData }) => {
  if (!moleculeData || !moleculeData.atoms || !moleculeData.bonds) {
    return <View><Text>No hay datos de molécula para mostrar.</Text></View>;
  }

  return (
    <Canvas gl={{ antialias: true }} camera={{ fov: 50 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 10]} intensity={1.0} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.2}>
          <Molecule atoms={moleculeData.atoms} bonds={moleculeData.bonds} />
        </Bounds>
      </Suspense>
      <OrbitControls makeDefault enableZoom={true} enablePan={true} />
    </Canvas>
  );
};

export default MoleculeViewer;