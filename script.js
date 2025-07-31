window.onload = function() {
    // Three.js setup
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / document.querySelector('.header-bg').offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true }); // alpha: true for transparent background
    renderer.setSize(window.innerWidth, document.querySelector('.header-bg').offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Adjust camera aspect ratio on window resize
    window.addEventListener('resize', () => {
        const headerHeight = document.querySelector('.header-bg').offsetHeight;
        camera.aspect = window.innerWidth / headerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, headerHeight);
    });

    // Create nodes (spheres)
    const nodes = [];
    const numNodes = 50;
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 }); // Blue color
    const nodeGeometry = new THREE.SphereGeometry(0.1, 8, 8); // Small spheres

    for (let i = 0; i < numNodes; i++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.x = (Math.random() - 0.5) * 10;
        node.position.y = (Math.random() - 0.5) * 10;
        node.position.z = (Math.random() - 0.5) * 10;
        scene.add(node);
        nodes.push(node);
    }

    // Create connections (lines) between nearby nodes
    const connections = [];
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.5 }); // Lighter blue, semi-transparent

    for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
            const node1 = nodes[i];
            const node2 = nodes[j];
            const distance = node1.position.distanceTo(node2.position);

            if (distance < 2) { // Connect nodes that are close enough
                const points = [];
                points.push(node1.position);
                points.push(node2.position);
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, lineMaterial);
                scene.add(line);
                connections.push({ line: line, node1: node1, node2: node2, initialDistance: distance });
            }
        }
    }

    camera.position.z = 5;

    // Mouse interaction for camera rotation
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = document.querySelector('.header-bg').offsetHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Smooth camera movement based on mouse position
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        camera.rotation.y += 0.05 * (targetX - camera.rotation.y);
        camera.rotation.x += 0.05 * (targetY - camera.rotation.x);

        // Animate nodes
        nodes.forEach(node => {
            node.rotation.x += 0.005;
            node.rotation.y += 0.005;
            // Simple floating animation
            node.position.x += Math.sin(Date.now() * 0.0001 + node.id) * 0.001;
            node.position.y += Math.cos(Date.now() * 0.0001 + node.id) * 0.001;
        });

        // Update line positions if nodes move
        connections.forEach(connection => {
            const positions = connection.line.geometry.attributes.position.array;
            positions[0] = connection.node1.position.x;
            positions[1] = connection.node1.position.y;
            positions[2] = connection.node1.position.z;
            positions[3] = connection.node2.position.x;
            positions[4] = connection.node2.position.y;
            positions[5] = connection.node2.position.z;
            connection.line.geometry.attributes.position.needsUpdate = true;
        });

        renderer.render(scene, camera);
    }

    animate(); // Start the animation loop
};
