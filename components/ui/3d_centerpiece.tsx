"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export const CenterpieceCube = ({ className = "w-80 h-80" }: { className?: string }) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    const size = 320 // 80 * 4 = 320px
    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)

    // Create main glass cube
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
    const cubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      transmission: 0.9,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    })
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    scene.add(cube)

    // Add wireframe overlay
    const wireframeGeometry = new THREE.EdgesGeometry(cubeGeometry)
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    })
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
    scene.add(wireframe)

    // Inner rotating octahedron
    const innerGeometry = new THREE.OctahedronGeometry(0.8)
    const innerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      transmission: 0.8,
      roughness: 0.2,
      metalness: 0.3,
    })
    const innerShape = new THREE.Mesh(innerGeometry, innerMaterial)
    scene.add(innerShape)

    // Floating particles
    const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8)
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    })
    const particles: THREE.Mesh[] = []

    for (let i = 0; i < 20; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      particle.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
      particles.push(particle)
      scene.add(particle)
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0xffffff, 0.5)
    pointLight.position.set(-5, -5, 5)
    scene.add(pointLight)

    camera.position.z = 5

    // Animation
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.01

      // Rotate main cube slowly
      cube.rotation.x += 0.003
      cube.rotation.y += 0.005
      wireframe.rotation.x += 0.003
      wireframe.rotation.y += 0.005

      // Rotate inner shape faster
      innerShape.rotation.x += 0.008
      innerShape.rotation.y += 0.012
      innerShape.rotation.z += 0.006

      // Animate particles
      particles.forEach((particle, index) => {
        particle.position.x += Math.sin(time + index) * 0.002
        particle.position.y += Math.cos(time + index * 0.5) * 0.002
        particle.position.z += Math.sin(time + index * 0.3) * 0.002
        // particle.material.opacity = 0.3 + Math.sin(time + index) * 0.3
      })

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      cubeGeometry.dispose()
      cubeMaterial.dispose()
      wireframeMaterial.dispose()
      innerGeometry.dispose()
      innerMaterial.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
    }
  }, [])

  return <div ref={mountRef} className={className} />
}
