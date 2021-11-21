import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";
import gsap from "gsap";

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  toonMat.color.set(parameters.materialColor);
  particleMat.color.set(parameters.materialColor);
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */

// texture
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

// material
const toonMat = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

// mesh
const objDistance = 4;
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), toonMat);

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), toonMat);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  toonMat
);

mesh1.position.y = -objDistance * 0;
mesh1.position.x = 2;
mesh2.position.y = -objDistance * 1;
mesh2.position.x = -2;
mesh3.position.y = -objDistance * 2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

const sectionMesh = [mesh1, mesh2, mesh3];

/**
 * Particles
 */

// geometry
const particlesCount = 200;
const particlePosition = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount; i++) {
  particlePosition[i * 3 + 0] = (Math.random() - 0.5) * 10;
  particlePosition[i * 3 + 1] =
    objDistance * 0.5 - Math.random() * objDistance * sectionMesh.length;
  particlePosition[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePosition, 3)
);

// material
const particleMat = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

const particles = new THREE.Points(particleGeo, particleMat);

scene.add(particles);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff");
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setClearAlpha(0);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */

let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  const newSection = Math.round(scrollY / sizes.height);

  if (newSection != currentSection) {
    currentSection = newSection;

    gsap.to(sectionMesh[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+= 3",
      z: "+= 1.5",
    });
  }
});

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  //   animate camera
  camera.position.y = (-scrollY / sizes.height) * objDistance;

  const parallexX = cursor.x * 0.5;
  const parallexY = -cursor.y * 0.5;
  cameraGroup.position.x +=
    (parallexX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallexY - cameraGroup.position.y) * 5 * deltaTime;

  //   animating meshes
  for (const mesh of sectionMesh) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
