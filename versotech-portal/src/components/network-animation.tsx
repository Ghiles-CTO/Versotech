'use client'

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial, Line } from '@react-three/drei'
import * as THREE from 'three'

export function NetworkAnimation() {
  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ParticleNetwork />
      </Canvas>
    </div>
  )
}

function ParticleNetwork(props: any) {
  const ref = useRef<THREE.Points>(null!)
  const { mouse, viewport } = useThree()
  
  const count = 150
  // Use state to keep track of positions for lines
  const [particles] = useState(() => {
    const temp = []
    for(let i=0; i<count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          0
        )
      })
    }
    return temp
  })

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()
    
    particles.forEach((p, i) => {
      positions[i * 3] = p.position.x
      positions[i * 3 + 1] = p.position.y
      positions[i * 3 + 2] = p.position.z
      
      // Luxury Palette: Gold/Emerald/White mix
      const rand = Math.random()
      if (rand > 0.7) {
        color.setHex(0x10b981) // Emerald
      } else if (rand > 0.4) {
        color.setHex(0xffffff) // White
      } else {
        color.setHex(0x0ea5e9) // Blue
      }
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    })
    
    return [positions, colors]
  }, [count, particles])

  // Line connections
  const linesGeometry = useRef<THREE.BufferGeometry>(null!)
  
  useFrame((state) => {
    // Update particles
    particles.forEach((particle, i) => {
      particle.position.add(particle.velocity)
      
      // Mouse interaction (gentle repel)
      const mousePos = new THREE.Vector3(
        (state.mouse.x * viewport.width) / 2,
        (state.mouse.y * viewport.height) / 2,
        0
      )
      const dist = particle.position.distanceTo(mousePos)
      
      if (dist < 4) {
        const repel = new THREE.Vector3().subVectors(particle.position, mousePos).normalize().multiplyScalar(0.05)
        particle.position.add(repel)
      }

      // Bounce off bounds
      if (particle.position.x > 15 || particle.position.x < -15) particle.velocity.x *= -1
      if (particle.position.y > 10 || particle.position.y < -10) particle.velocity.y *= -1

      // Update buffer
      positions[i * 3] = particle.position.x
      positions[i * 3 + 1] = particle.position.y
      positions[i * 3 + 2] = particle.position.z
    })
    
    ref.current.geometry.attributes.position.needsUpdate = true

    // Update connections
    if (linesGeometry.current) {
      const linePositions = []
      const lineColors = []
      
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dist = particles[i].position.distanceTo(particles[j].position)
          if (dist < 3.5) {
            linePositions.push(
              particles[i].position.x, particles[i].position.y, particles[i].position.z,
              particles[j].position.x, particles[j].position.y, particles[j].position.z
            )
            // Fade line based on distance
            const opacity = 1 - (dist / 3.5)
            lineColors.push(0.2, 0.2, 0.2, opacity) // Greyish lines
            lineColors.push(0.2, 0.2, 0.2, opacity)
          }
        }
      }
      
      linesGeometry.current.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
      // Ideally we'd use custom shader for varying opacity per vertex, but basic lines work for now
      linesGeometry.current.setDrawRange(0, linePositions.length / 3)
    }
  })

  return (
    <group>
      <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          vertexColors
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <lineSegments>
        <bufferGeometry ref={linesGeometry}>
           <bufferAttribute attach="attributes-position" args={[new Float32Array(count*count*3), 3]} count={0} />
        </bufferGeometry>
        <lineBasicMaterial color="#334155" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}
