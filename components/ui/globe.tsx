"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export const Globe = ({ className }: { className?: string }) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(400, 400)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Create globe
    const geometry = new THREE.SphereGeometry(1.5, 64, 64)

    // Create wireframe material
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    })

    // Create points for stars effect
    const pointsGeometry = new THREE.BufferGeometry()
    const pointsCount = 1000
    const positions = new Float32Array(pointsCount * 3)

    for (let i = 0; i < pointsCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10
    }

    pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
    })

    const globe = new THREE.Mesh(geometry, wireframeMaterial)
    const stars = new THREE.Points(pointsGeometry, pointsMaterial)

    scene.add(globe)
    scene.add(stars)

    camera.position.z = 4

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      globe.rotation.y += 0.005
      globe.rotation.x += 0.002
      stars.rotation.y += 0.001

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      geometry.dispose()
      wireframeMaterial.dispose()
      pointsGeometry.dispose()
      pointsMaterial.dispose()
    }
  }, [])

  return <div ref={mountRef} className={className} />
}
