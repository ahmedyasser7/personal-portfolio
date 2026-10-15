(() => {
  const galleryStage = document.querySelector(".gallery-three-stage");
  const certificateStage = document.querySelector(".certificate-three-stage");
  if (!galleryStage && !certificateStage) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js")
    .then((THREE) => {
      if (galleryStage) mountGalleryScene(THREE, galleryStage);
      if (certificateStage) mountCertificateScene(THREE, certificateStage);
    })
    .catch(() => {
      document.querySelectorAll(".three-stage").forEach((stage) => {
        stage.classList.add("three-unavailable");
      });
    });

  function createRenderer(THREE, stage) {
    try {
      return new THREE.WebGLRenderer({
        canvas: stage.querySelector("canvas"),
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      stage.classList.add("three-unavailable");
      return null;
    }
  }

  function animateWhenVisible(THREE, stage, renderer, scene, camera, update) {
    let visible = false;
    let frameId;
    const render = (time) => {
      frameId = undefined;
      update(time);
      renderer.render(scene, camera);
      if (visible && !reducedMotion.matches && !document.hidden) {
        frameId = requestAnimationFrame(render);
      }
    };
    const draw = () => {
      if (!frameId) frameId = requestAnimationFrame(render);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) draw();
        else if (frameId) {
          cancelAnimationFrame(frameId);
          frameId = undefined;
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(stage);

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = stage.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      if (camera.userData.fitWidth) {
        const fitWidth =
          stage.clientWidth < 640
            ? camera.userData.mobileFitWidth || camera.userData.fitWidth
            : camera.userData.fitWidth;
        camera.position.z = Math.max(
          4.2,
          fitWidth /
            (2 *
              Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
              camera.aspect),
        );
      }
      camera.updateProjectionMatrix();
      draw();
    });
    resizeObserver.observe(stage);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && frameId) {
        cancelAnimationFrame(frameId);
        frameId = undefined;
      } else if (!document.hidden && visible) draw();
    });
    reducedMotion.addEventListener("change", () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = undefined;
      }
      if (visible) draw();
    });
    draw();
  }

  function trackPointer(stage, target, scaleX, scaleY) {
    stage.addEventListener("pointermove", (event) => {
      const bounds = stage.getBoundingClientRect();
      target.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * scaleX;
      target.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * scaleY;
    });
    stage.addEventListener("pointerleave", () => {
      target.x = 0;
      target.y = 0;
    });
  }

  function mountGalleryScene(THREE, stage) {
    const renderer = createRenderer(THREE, stage);
    if (!renderer) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.userData.fitWidth = 12.8;
    camera.userData.mobileFitWidth = 8.2;
    const orbit = new THREE.Group();
    scene.add(orbit);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(6.1, 0.012, 6, 120),
      new THREE.MeshBasicMaterial({
        color: 0x65c9b6,
        transparent: true,
        opacity: 0.38,
      }),
    );
    ring.rotation.x = -0.12;
    ring.position.z = -1.4;
    orbit.add(ring);

    const images = Array.from(document.querySelectorAll(".gallery-item img"));
    const loader = new THREE.TextureLoader();
    images.forEach((image, index) => {
      loader.load(image.currentSrc || image.src, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const scale = Math.min(
          2.15 / texture.image.width,
          1.55 / texture.image.height,
        );
        const width = texture.image.width * scale;
        const height = texture.image.height * scale;
        const group = new THREE.Group();
        const frame = new THREE.Mesh(
          new THREE.PlaneGeometry(width + 0.1, height + 0.1),
          new THREE.MeshBasicMaterial({
            color: 0xe3f2e9,
            transparent: true,
            opacity: 0.9,
          }),
        );
        const photo = new THREE.Mesh(
          new THREE.PlaneGeometry(width, height),
          new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }),
        );
        photo.position.z = 0.025;
        group.add(frame, photo);
        group.position.set(
          (index - (images.length - 1) / 2) * 2.48,
          index % 2 ? 0.28 : -0.08,
          0.15,
        );
        group.rotation.y = (index - 2) * -0.055;
        group.rotation.z = index % 2 ? 0.025 : -0.025;
        group.userData.baseY = group.position.y;
        group.userData.phase = index * 0.75;
        orbit.add(group);
      });
    });

    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(120 * 3);
    for (let index = 0; index < 120; index += 1) {
      particlePositions[index * 3] = (Math.random() - 0.5) * 14;
      particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 4.2;
      particlePositions[index * 3 + 2] = -1.8 - Math.random() * 1.5;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    scene.add(
      new THREE.Points(
        particlesGeometry,
        new THREE.PointsMaterial({
          color: 0x8cd9ca,
          size: 0.035,
          transparent: true,
          opacity: 0.65,
        }),
      ),
    );

    const pointer = { x: 0, y: 0 };
    trackPointer(stage, pointer, 0.12, 0.08);
    animateWhenVisible(THREE, stage, renderer, scene, camera, (time) => {
      const seconds = time * 0.001;
      orbit.rotation.y += (pointer.x - orbit.rotation.y) * 0.025;
      orbit.rotation.x += (pointer.y - orbit.rotation.x) * 0.025;
      orbit.children.forEach((child) => {
        if (child.userData.baseY !== undefined) {
          child.position.y =
            child.userData.baseY +
            (reducedMotion.matches
              ? 0
              : Math.sin(seconds + child.userData.phase) * 0.07);
        }
      });
    });
  }

  function mountCertificateScene(THREE, stage) {
    const renderer = createRenderer(THREE, stage);
    if (!renderer) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.z = 4.2;
    scene.add(new THREE.AmbientLight(0xffffff, 1.3));
    const keyLight = new THREE.PointLight(0xffd37a, 42, 12);
    keyLight.position.set(-2, 2.5, 4);
    scene.add(keyLight);

    const medal = new THREE.Group();
    scene.add(medal);
    const gold = new THREE.MeshStandardMaterial({
      color: 0xe9ad42,
      metalness: 0.72,
      roughness: 0.27,
    });
    const paleGold = new THREE.MeshStandardMaterial({
      color: 0xffd976,
      metalness: 0.64,
      roughness: 0.25,
    });
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.88, 0.88, 0.2, 64),
      gold,
    );
    disc.rotation.x = Math.PI / 2;
    medal.add(disc);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.72, 64), paleGold);
    face.position.z = 0.115;
    medal.add(face);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.055, 12, 64),
      paleGold,
    );
    rim.position.z = 0.15;
    medal.add(rim);

    const starShape = new THREE.Shape();
    for (let point = 0; point < 10; point += 1) {
      const radius = point % 2 === 0 ? 0.43 : 0.2;
      const angle = (point * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (point === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();
    const star = new THREE.Mesh(
      new THREE.ShapeGeometry(starShape),
      new THREE.MeshBasicMaterial({
        color: 0x76501c,
        side: THREE.DoubleSide,
      }),
    );
    star.position.z = 0.14;
    medal.add(star);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.012, 6, 100),
      new THREE.MeshBasicMaterial({
        color: 0x39b6a6,
        transparent: true,
        opacity: 0.8,
      }),
    );
    orbit.rotation.set(0.55, 0.25, -0.4);
    scene.add(orbit);
    const orbitTwo = orbit.clone();
    orbitTwo.scale.set(1.18, 0.78, 1);
    orbitTwo.rotation.set(-0.55, 0.5, 0.7);
    scene.add(orbitTwo);

    const pointer = { x: 0, y: 0 };
    trackPointer(stage, pointer, 0.22, 0.16);
    animateWhenVisible(THREE, stage, renderer, scene, camera, (time) => {
      const seconds = time * 0.001;
      medal.rotation.y +=
        (pointer.x +
          (reducedMotion.matches ? 0 : Math.sin(seconds * 0.65) * 0.12) -
          medal.rotation.y) *
        0.035;
      medal.rotation.x += (pointer.y - medal.rotation.x) * 0.035;
      orbit.rotation.z = seconds * 0.16;
      orbitTwo.rotation.y = seconds * -0.13;
    });
  }
})();
