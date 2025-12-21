console.log("DEBUG: main.js loaded");
// Global Motion Constants
const DURATION_ENTRY = 1.0;

// Initial Data Fallback (Hardcoded to ensure content ALWAYS shows)
const STATIC_PROJECTS = [
    {
        title: "E-Commerce Luxury",
        description: "A high-fidelity shopping experience with 3D product previews.",
        imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2670&auto=format&fit=crop",
        demoLink: "#",
        repoLink: "#"
    },
    {
        title: "Fintech Dashboard",
        description: "Real-time data visualization for financial assets.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
        demoLink: "#",
        repoLink: "#"
    },
    {
        title: "AI Chat Interface",
        description: "Generative AI powered assistant with glassmorphic UI.",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2670&auto=format&fit=crop",
        demoLink: "#",
        repoLink: "#"
    }
];

const STATIC_SERVICES = [
    {
        title: "Frontend Architecture",
        problem: "Slow load times and janky animations.",
        solution: "Optimized React/Vanilla builds with GSAP."
    },
    {
        title: "UI/UX Design",
        problem: "User confusion and low conversion.",
        solution: "Clean, accessible interfaces with clear CTAs."
    },
    {
        title: "Backend Scalability",
        problem: "Server crashes under load.",
        solution: "Node.js microservices with MongoDB."
    }
];

// STATIC_BIO removed as it is now hardcoded in HTML for static performance


// Initialize Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    direction: 'vertical',
});
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Data & Init
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Init Three.js Scenes
    // 1. Init Three.js Scenes
    try {
        initThreeHero();
    } catch (e) { console.error("ThreeJS Hero Error:", e); }

    try {
        initThreeAbout();
    } catch (e) { console.error("ThreeJS About Error:", e); }

    // 2. Init UI Features (IMMEDIATE POPULATION)
    populateLogos();
    initTiltEffect();
    initClickSpark();
    initFooterParallax();

    // Populate Static Data Immediately
    // populateContent removed for bio (hardcoded)
    populateProjects(STATIC_PROJECTS);
    populateServices(STATIC_SERVICES);

    // 3. Try to fetch fresh data (Optional Update)
    // 3. Fresh data fetch removed (Static Only Mode)
    console.log("Static Mode: Using hardcoded data.");

    // 4. Animate Entry
    setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
            initAnimations();
        }
    }, 100);

    setupContactForm();

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') ? '<i class="fa-solid fa-xmark"></i>' : 'Menu';
        });
    }
});

function populateContent(content) {
    if (!content) return;
    // Bio is now static in HTML, do not overwrite.

    if (content.footerText) {
        const el = document.getElementById('footer-text');
        if (el) el.innerText = content.footerText;
    }
}

function populateProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container || !projects) return;
    container.innerHTML = '';
    projects.forEach((project) => {
        const wrapper = document.createElement('a');
        wrapper.href = project.demoLink || project.repoLink || '#';
        wrapper.target = "_blank";
        wrapper.className = 'project-card';

        const imgUrl = project.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';

        const gitHubLinkHTML = project.repoLink && project.repoLink !== '#' ?
            `<a href="${project.repoLink}" target="_blank" class="project-github-link" onclick="event.stopPropagation()">
                <i class="fa-brands fa-github"></i>
             </a>` : '';

        wrapper.innerHTML = `
            <div class="project-image-container">
                <div class="project-bg" style="background-image: url('${imgUrl}')"></div>
            </div>
            <div class="project-info">
                <div class="project-header">
                    <h3 class="project-title">${project.title}</h3>
                    ${gitHubLinkHTML}
                </div>
                <p class="project-desc">${project.description || 'A curated digital experience.'}</p>
            </div>
        `;
        container.appendChild(wrapper);
    });
}

function populateServices(services) {
    // Note: User mentioned "What I Do / service section no blog cards". 
    // Assuming "Blog" section in HTML might be the target if services-container is missing.
    // However, I will check for 'services-container' first.
    const container = document.getElementById('services-container');
    // If services container missing, maybe check for blog-container? 
    // User said "What I Do / service section". Let's assume there is a section.
    if (!container || !services) return;

    container.innerHTML = '';
    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: var(--color-accent); font-size: 1.5rem;">${service.title}</h3>
            <p style="margin-bottom: 0.5rem; font-weight: 600;">The Challenge</p>
            <p style="margin-bottom: 1rem; font-size: 1rem;">${service.problem}</p>
            <p style="margin-bottom: 0.5rem; font-weight: 600;">The Solution</p>
            <p style="font-size: 1rem;">${service.solution}</p>
        `;
        container.appendChild(card);
    });
}

// -----------------------------------------------------------
// 1. HERO 3D (Floating Wireframe Geometry)
// -----------------------------------------------------------
function initThreeHero() {
    const container = document.getElementById('hero-visuals');
    if (!container) return;

    const scene = new THREE.Scene();

    // Add subtle fog for depth
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.05);

    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- OBJECTS ---
    const shapes = [];
    const geometryCount = 15;

    const geometries = [
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.OctahedronGeometry(1, 0),
        new THREE.TetrahedronGeometry(1, 0),
        new THREE.TorusGeometry(0.8, 0.2, 8, 20)
    ];

    // Wireframe Material
    const material = new THREE.MeshBasicMaterial({
        color: 0x333333,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    // Accent Material
    const accentMaterial = new THREE.MeshBasicMaterial({
        color: 0x555555,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });

    for (let i = 0; i < geometryCount; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)];
        const isAccent = Math.random() > 0.8;
        const mesh = new THREE.Mesh(geo, isAccent ? accentMaterial : material);

        // Random Position Spread
        mesh.position.x = (Math.random() - 0.5) * 15;
        mesh.position.y = (Math.random() - 0.5) * 15;
        mesh.position.z = (Math.random() - 0.5) * 10 - 2;

        // Random Rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        // Random Scale
        const scale = Math.random() * 0.5 + 0.5;
        mesh.scale.set(scale, scale, scale);

        // Animation Data
        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.02,
            rotSpeedY: (Math.random() - 0.5) * 0.02,
            floatSpeed: Math.random() * 0.01 + 0.005,
            floatOffset: Math.random() * Math.PI * 2
        };

        scene.add(mesh);
        shapes.push(mesh);
    }

    // --- MOUSE ---
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    });

    const clock = new THREE.Clock();

    function animate() {
        const time = clock.getElapsedTime();

        // Rotate Global Group or Camera ideally, but here we move camera
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        shapes.forEach(mesh => {
            // Individual Rotation
            mesh.rotation.x += mesh.userData.rotSpeedX;
            mesh.rotation.y += mesh.userData.rotSpeedY;

            // Float
            mesh.position.y += Math.sin(time + mesh.userData.floatOffset) * 0.002;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    const resizeObserver = new ResizeObserver(() => {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    });
    resizeObserver.observe(container);
}

// -----------------------------------------------------------
// 2. ABOUT 3D (High-Fidelity Mac)
// -----------------------------------------------------------
// -----------------------------------------------------------
// 2. ABOUT 3D (Realistic Workstation)
// -----------------------------------------------------------
function initThreeAbout() {
    const container = document.getElementById('about-3d');
    if (!container) return;

    // Force container dimension
    if (container.clientHeight === 0) {
        // Fallback or explicit set if hidden
        // User reports "not displaying", check if parent is hidden or layout issue
        console.warn("ThreeJS About: Container height is 0. Setting min-height.");
        container.style.height = "600px";
    }
    console.log("ThreeJS About: Initializing in", container.offsetWidth, "x", container.offsetHeight);

    const scene = new THREE.Scene();

    // Camera params
    const width = container.offsetWidth || 400;
    const height = container.offsetHeight || 600;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8.5); // Slightly elevated view
    camera.lookAt(0, 0, 0);

    // High Quality Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Tone Mapping for realism
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- MATERIALS ---
    // Aluminum (Stand, Body)
    const materialAluminum = new THREE.MeshStandardMaterial({
        color: 0xe0e0e0, // Light silver
        roughness: 0.25,
        metalness: 0.95,
    });

    // Dark Glass (Bezel)
    const materialGlassBorder = new THREE.MeshPhysicalMaterial({
        color: 0x111111,
        roughness: 0.0,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0
    });

    // Screen (Emissive Code)
    // We'll use a dynamic canvas texture for the screen content if possible, or a nice emissive material
    const materialScreen = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x1a1a1a, // Slight glow
        roughness: 0.2,
        metalness: 0.5
    });

    // --- GEOMETRY CONSTRUCTION (The Desk Setup) ---
    const deskGroup = new THREE.Group();

    // 1. MONITOR BODY
    // Main slab
    const monitorGeo = new THREE.BoxGeometry(4.2, 2.6, 0.15); // 16:10 aspectish
    const monitor = new THREE.Mesh(monitorGeo, materialAluminum);
    monitor.castShadow = true;
    monitor.receiveShadow = true;
    deskGroup.add(monitor);

    // Bezel (Black Glass) - slightly smaller scale overlay or just front face
    const bezelGeo = new THREE.BoxGeometry(4.1, 2.5, 0.01);
    const bezel = new THREE.Mesh(bezelGeo, materialGlassBorder);
    bezel.position.z = 0.08; // Pop out
    deskGroup.add(bezel);

    // Screen (The Display Area)
    const screenGeo = new THREE.PlaneGeometry(3.9, 2.3);
    const screen = new THREE.Mesh(screenGeo, materialScreen);
    screen.position.z = 0.086;
    deskGroup.add(screen);

    // Stand Neck
    const neckGeo = new THREE.BoxGeometry(0.8, 1.2, 0.1);
    const neck = new THREE.Mesh(neckGeo, materialAluminum);
    neck.position.set(0, -1.5, -0.2); // Behind and down
    neck.rotation.x = -0.15; // Tilted back
    neck.castShadow = true;
    deskGroup.add(neck);

    // Stand Base
    const baseGeo = new THREE.BoxGeometry(1.4, 0.08, 1.0);
    const base = new THREE.Mesh(baseGeo, materialAluminum);
    base.position.set(0, -2.1, -0.1);
    base.receiveShadow = true;
    base.castShadow = true;
    deskGroup.add(base);

    // 2. PERIPHERALS
    // Keyboard (Magic Board style)
    const kbGroup = new THREE.Group();
    const kbBodyGeo = new THREE.BoxGeometry(2.2, 0.08, 0.9);
    const kbBody = new THREE.Mesh(kbBodyGeo, materialAluminum);
    kbBody.castShadow = true;
    kbGroup.add(kbBody);

    // Keys (Simplified as a textured-like block or small buttons)
    // For performance, just a slightly raised white area
    const keysGeo = new THREE.BoxGeometry(2.1, 0.02, 0.8);
    const keysMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const keys = new THREE.Mesh(keysGeo, keysMat);
    keys.position.y = 0.05;
    kbGroup.add(keys);

    kbGroup.position.set(0, -2.1, 1.5); // On desk in front
    kbGroup.rotation.x = 0.05; // Slight tilt
    deskGroup.add(kbGroup);

    // Mouse
    const mouseGeo = new THREE.CapsuleGeometry(0.2, 0.3, 4, 8);
    const mouseMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, clearcoat: 1.0 });
    const mouse = new THREE.Mesh(mouseGeo, mouseMat);
    mouse.rotation.x = Math.PI / 2;
    mouse.scale.set(1, 1, 0.6); // Flatten
    mouse.position.set(1.6, -2.1, 1.5);
    mouse.castShadow = true;
    deskGroup.add(mouse);

    scene.add(deskGroup);

    // --- LIGHTING ---
    // Ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Key Light (Warm, from top-right)
    const spotLight = new THREE.SpotLight(0xffffff, 10);
    spotLight.position.set(5, 8, 5);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    // Fill Light (Cool, from left)
    const fillLight = new THREE.DirectionalLight(0xccddff, 2);
    fillLight.position.set(-5, 0, 5);
    scene.add(fillLight);

    // Rim Light (Back light for separation)
    const rimLight = new THREE.PointLight(0xff4d00, 2); // Orange Accent Rim
    rimLight.position.set(0, 2, -5);
    scene.add(rimLight);


    // --- ANIMATION & INTERACTION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    // Mouse Tracking
    document.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
            // Only track if visible approx
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            mouseX = (e.clientX - cx) / (rect.width / 2);
            mouseY = (e.clientY - cy) / (rect.height / 2);
        }
    });

    // Resize Handler
    const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            const w = entry.contentRect.width;
            const h = entry.contentRect.height;
            if (w > 0 && h > 0) {
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
        }
    });
    resizeObserver.observe(container);

    function animate() {
        requestAnimationFrame(animate);

        // Gentle Sway
        targetRotationY = mouseX * 0.2; // Max 0.2 rad
        targetRotationX = mouseY * 0.1;

        // Smooth dampening
        deskGroup.rotation.y += (targetRotationY - deskGroup.rotation.y) * 0.05;
        deskGroup.rotation.x += (targetRotationX - deskGroup.rotation.x) * 0.05;

        renderer.render(scene, camera);
    }
    animate();

    // GSAP Scroll Trigger - Rotate the workstation 360 or present it
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        // Initial State
        deskGroup.rotation.y = 0; // Start facing FRONT so it is visible immediately

        // Optional: Add a slight rotation animation on scroll if desired
        // Scroll Trigger - Rotate 360 degrees while scrolling
        // Reset rotation first
        deskGroup.rotation.y = -Math.PI * 0.5; // Start slightly angled

        gsap.to(deskGroup.rotation, {
            y: Math.PI * 1.5, // Rotate full 360 (from -0.5 to 1.5 = 2 PI)
            scrollTrigger: {
                trigger: '#about',
                start: "top bottom", // Start as soon as section enters view
                end: "bottom top", // End when section leaves view
                scrub: 1 // Smooth scrolling
            },
            ease: "none" // Linear rotation relative to scroll
        });

        // Floating Levitation Effect
        gsap.to(deskGroup.position, {
            y: 0.15,
            duration: 3,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    }
}

// -----------------------------------------------------------
// 3. LOGO TICKER
// -----------------------------------------------------------
function populateLogos() {
    const track = document.getElementById('logo-track');
    if (!track) return;
    const logos = [
        { icon: 'fa-html5', color: '#E34F26' }, { icon: 'fa-css3-alt', color: '#1572B6' },
        { icon: 'fa-js', color: '#F7DF1E' }, { icon: 'fa-react', color: '#61DAFB' },
        { icon: 'fa-node', color: '#339933' }, { icon: 'fa-python', color: '#3776AB' },
        { icon: 'fa-figma', color: '#F24E1E' }, { icon: 'fa-git-alt', color: '#F05032' },
        { icon: 'fa-docker', color: '#2496ED' }, { icon: 'fa-aws', color: '#FF9900' },
        { icon: 'fa-php', color: '#777BB4' }, { icon: 'fa-laravel', color: '#FF2D20' }
    ];

    // Create two massive sets for seamless infinite scroll (CSS moves -50%)
    let fullSet = [...logos, ...logos, ...logos, ...logos];
    // We need enough width to ensure smooth scroll. 4 sets of 12 = 48 items.

    let html = '';
    // Double the fullSet to ensure 50% translation lands exactly on a match
    [...fullSet, ...fullSet].forEach(logo => {
        html += `<div class="logo-item" style="color: #888888;"><i class="fa-brands ${logo.icon}"></i></div>`;
    });

    track.innerHTML = html;
}

// -----------------------------------------------------------
// 4. TILT PROJECT CARDS
// -----------------------------------------------------------
function initTiltEffect() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
        });
    });
}

// -----------------------------------------------------------
// 5. CLICK SPARK
// -----------------------------------------------------------
function initClickSpark() {
    document.addEventListener('click', (e) => {
        createSpark(e.clientX, e.clientY);
    });
}

function createSpark(x, y) {
    const count = 12;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'click-spark-particle';
        document.body.appendChild(p);

        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 50;
        const duration = 0.4 + Math.random() * 0.4;
        const color = Math.random() > 0.5 ? '#FF4D00' : '#888888';

        if (typeof gsap !== 'undefined') {
            gsap.set(p, {
                x: x,
                y: y,
                backgroundColor: color,
                width: 4 + Math.random() * 4,
                height: 4 + Math.random() * 4,
                borderRadius: '50%',
                opacity: 1
            });
            gsap.to(p, {
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                opacity: 0,
                scale: 0,
                duration: duration,
                ease: "power2.out",
                onComplete: () => {
                    if (p.parentNode) p.parentNode.removeChild(p);
                }
            });
        }
    }
}

// -----------------------------------------------------------
// 6. SCROLL & FOOTER FX
// -----------------------------------------------------------
function initFooterParallax() {
    const footer = document.querySelector('footer');
    if (footer && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.from(footer, {
            y: 50,
            opacity: 0,
            scrollTrigger: {
                trigger: footer,
                start: "top bottom",
                end: "bottom bottom",
                scrub: 1
            }
        });
    }
}

// -----------------------------------------------------------
// 7. BASE ANIMATIONS
// -----------------------------------------------------------
function initAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    initTextReveal();
    initMagneticButtons();
    initVelocitySkew();
    initImageReveals();

    // Responsive Pinning (Only on Desktop)
    ScrollTrigger.matchMedia({
        "(min-width: 968px)": function () {
            // Pin Hero Section (Curtain Effect)
            ScrollTrigger.create({
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                pin: true,
                pinSpacing: false, // About slides over Hero
            });

            // Pin About Section (Stacking Effect)
            ScrollTrigger.create({
                trigger: ".about-section",
                start: "top top", // When top of about hits top of viewport
                end: "bottom top",
                pin: true,
                pinSpacing: false, // Projects slides over About
            });
        }
    });

    gsap.to('#iam-text', {
        scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: '+=100%',
            scrub: 1,
        },
        y: '70vh',
        scale: 2,
        rotationX: 180,
        color: '#FF4D00',
        zIndex: 100
    });

    gsap.utils.toArray('.blog-card').forEach((card, i) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 20%",
                end: "top 5%",
                scrub: true,
                id: `blog-${i}`
            },
            scale: 1 - (i * 0.05),
            opacity: 1 - (i * 0.1)
        });
    });

    const tl = gsap.timeline();
    tl.from('#iam-text', { y: -50, opacity: 0, duration: 1 })
        .from('.hero-title', { scale: 0.9, opacity: 0, duration: 1 }, "-=0.5");
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            const formData = new FormData(contactForm);
            const jsonData = Object.fromEntries(formData.entries());

            // Mock Submission (Frontend Only)
            setTimeout(() => {
                alert("Message simulation: Your message would be sent here.\n(Backend removed)");
                submitBtn.innerText = 'Sent!';
                submitBtn.style.backgroundColor = 'var(--color-accent)';
                contactForm.reset();
                setTimeout(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.style.backgroundColor = '';
                }, 3000);
            }, 1000);

            // Access to logic below removed as fetch is gone
            /* 
            try {
               ...
            } 
            */
        });
    }
}


function initTextReveal() {
    // 1. HERO REVEAL (Specific "Line" Animation)
    const heroLines = document.querySelectorAll('.hero-title .reveal-span');
    if (heroLines.length > 0) {
        gsap.fromTo(heroLines,
            { y: '100%' }, // Start from bottom
            {
                y: '0%',
                duration: 1.5,
                ease: 'power4.out',
                stagger: 0.15,
                delay: 0.2
            }
        );
    }

    gsap.fromTo('#iam-text',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0, ease: 'power2.out' }
    );

    gsap.fromTo('.reveal-fade',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: 'power2.out' }
    );

    // 2. GENERAL SECTION REVEALS
    const textElements = gsap.utils.toArray('.section-title, p, h3');
    textElements.forEach(el => {
        // Skip hero elements
        if (el.closest('.hero-section')) return;

        gsap.fromTo(el,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
}

function initMagneticButtons() {
    const magnets = document.querySelectorAll('.btn, .nav-link, .social-icon');
    magnets.forEach((magnet) => {
        magnet.addEventListener('mousemove', (e) => {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(magnet, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
        });
        magnet.addEventListener('mouseleave', () => {
            gsap.to(magnet, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        });
    });
}

function initVelocitySkew() {
    let proxy = { skew: 0 },
        skewSetter = gsap.quickSetter('.projects-grid, .services-grid', 'skewY', 'deg'),
        clamp = gsap.utils.clamp(-10, 10); // Don't skew too much!

    ScrollTrigger.create({
        onUpdate: (self) => {
            let skew = clamp(self.getVelocity() / -300);
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
                proxy.skew = skew;
                gsap.to(proxy, { skew: 0, duration: 0.8, ease: 'power3', overwrite: true, onUpdate: () => skewSetter(proxy.skew) });
            }
        }
    });
}

function initImageReveals() {
    const containers = document.querySelectorAll('.project-image-container');
    containers.forEach(container => {
        const image = container.querySelector('.project-bg');
        if (image) {
            gsap.set(image, { scale: 1.2 });
            gsap.to(image, {
                scale: 1,
                scrollTrigger: {
                    trigger: container,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }
    });
}