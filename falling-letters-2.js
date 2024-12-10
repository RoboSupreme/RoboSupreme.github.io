// Enable poly-decomp for complex shapes
Matter.use('matter-poly-decomp');

// Destructure Matter.js modules
const {
    Engine: Engine2,
    Render: Render2,
    Runner: Runner2,
    Bodies: Bodies2,
    Body: Body2,
    Svg: Svg2,
    Vertices: Vertices2,
    World: World2,
    Composite: Composite2
} = Matter;

// Letter SVG paths
const A2 = 'M 18 114 46 114 70 37 81 74 57 74 51 94 87 94 93 114 121 114 81 7 57 7 z'
const U2 = 'M 16 7 16 82 C 17 125 101 125 99 82 L 99 82 99 7 74 7 74 82 C 73 100 41 99 41 82 L 41 82 41 7 16 7 z'
const W2 = 'M 6 7 29 114 56 114 70 53 84 114 111 114 134 7 108 7 96 74 81 7 59 7 44 74 32 7 6 7 z'
const N2 = 'M 16 114 16 7 42 7 80 74 80 7 106 7 106 114 80 114 42 48 42 114 16 114 z'
const P2 = 'M 20 8 20 114 46 114 46 28 66 28 C 83 28 83 59 66 58 L 66 58 46 58 46 78 67 78 C 116 78 116 7 65 8 L 65 8 z'
const D2 = 'M 19 7 57 7 C 120 13 120 109 57 114 L 57 114 45 114 45 94 56 94 C 85 93 86 30 56 27 L 56 27 45 27 45 114 19 114 19 7 z'
const O2 = 'M 13 59 C 9 -12 109 -12 107 59 L 107 59 80 59 C 84 14 34 14 39 59 L 39 59 C 33 107 86 107 80 59 L 80 59 107 59 C 109 133 9 133 13 59 L 13 59 z'
const R2 = 'M 21 114 21 7 64 7 C 122 8 105 67 85 69 L 85 69 107 113 80 113 61 76 47 76 47 56 65 56 C 84 57 84 26 65 27 L 65 27 47 27 47 114 z'

// Make these variables global
let bodiesUpward2 = [];
let bodiesDownward2 = [];

const toVertices2 = (path) => {
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathEl.setAttribute('d', path)
    const vertices = Svg2.pathToVertices(pathEl, 10) // Reduced sampling for better shape
    return Vertices2.scale(vertices, 1, 1) // Increased scale from 0.5 to 1.5
}

// Generate random color
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const toBody2 = (letter) => {
    const vertices = toVertices2(letter)
    const color = getRandomColor();
    return Bodies2.fromVertices(0, 0, [vertices], {
        render: {
            fillStyle: color,
            strokeStyle: color,
            lineWidth: 1
        },
        friction: 0.3,
        restitution: 0.6
    })
}

// Add function to update colors
window.updateLetterColors2 = function() {
    [...bodiesUpward2, ...bodiesDownward2].forEach(body => {
        const color = getRandomColor();
        body.render.fillStyle = color;
        body.render.strokeStyle = color;
    });
}

// Create bodies for both directions
bodiesUpward2 = [
    toBody2(U2),
    toBody2(P2),
    toBody2(W2),
    toBody2(A2)
]

bodiesDownward2 = [
    toBody2(D2),
    toBody2(O2),
    toBody2(W2),
    toBody2(N2)
]

// Change colors every second
setInterval(window.updateLetterColors2, 1000);

// Create engines and worlds
const leftEngine2 = Engine2.create()
const rightEngine2 = Engine2.create()

// Set gravity
leftEngine2.gravity.y = 1  // Positive gravity for downward movement
rightEngine2.gravity.y = 1  // Positive gravity for downward movement

// Create renderers
const leftRender2 = Render2.create({
    element: document.querySelector('#left'),
    engine: leftEngine2,
    options: {
        width: window.innerWidth / 2,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
    }
})

const rightRender2 = Render2.create({
    element: document.querySelector('#right'),
    engine: rightEngine2,
    options: {
        width: window.innerWidth / 2,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
    }
})

// Add boundaries with larger bounds to prevent sticking
const wallOptions2 = {
    isStatic: true,
    render: { visible: false },
    friction: 0.1,
    restitution: 0.6
}

// Position functions
const positionLeftBodies2 = () => {
    let y = window.innerHeight - 50;  // Start from bottom of viewport
    const centerX = window.innerWidth * 0.25;
    
    bodiesUpward2.forEach(body => {
        Body2.setPosition(body, {
            x: centerX + (Math.random() * 100 - 50),
            y: y
        });
        Body2.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: -15 });
        y -= 150;
    });
}

const positionRightBodies2 = () => {
    let y = window.innerHeight - 200;  // Start from bottom of viewport
    const centerX = window.innerWidth * 0.2;
    
    bodiesDownward2.forEach(body => {
        Body2.setPosition(body, {
            x: centerX + (Math.random() * 100 - 50),
            y: y
        });
        Body2.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: -15 });
        y -= 150;
    });
}

// Add world boundaries for left engine with wider bounds
World2.add(leftEngine2.world, [
    Bodies2.rectangle(window.innerWidth * 0.25, window.innerHeight + 50, window.innerWidth * 0.5, 100, wallOptions2),  // floor
    Bodies2.rectangle(window.innerWidth * 0.25, -50, window.innerWidth * 0.5, 100, wallOptions2),  // ceiling
    Bodies2.rectangle(0, window.innerHeight / 2, 100, window.innerHeight * 2, wallOptions2),  // left wall
    Bodies2.rectangle(window.innerWidth * 0.5, window.innerHeight / 2, 100, window.innerHeight * 2, wallOptions2)  // right wall
])

// Add world boundaries for right engine with wider bounds
World2.add(rightEngine2.world, [
    Bodies2.rectangle(window.innerWidth * 0.25, window.innerHeight + 50, window.innerWidth * 0.5, 100, wallOptions2),  // floor
    Bodies2.rectangle(window.innerWidth * 0.25, -50, window.innerWidth * 0.5, 100, wallOptions2),  // ceiling
    Bodies2.rectangle(0, window.innerHeight / 2, 100, window.innerHeight * 2, wallOptions2),  // left wall
    Bodies2.rectangle(window.innerWidth * 0.5, window.innerHeight / 2, 100, window.innerHeight * 2, wallOptions2)  // right wall
])

// Add bodies to world
World2.add(leftEngine2.world, bodiesUpward2)
World2.add(rightEngine2.world, bodiesDownward2)

// Initial positioning
positionLeftBodies2()
positionRightBodies2()

// Create runners
const leftRunner2 = Runner2.create()
const rightRunner2 = Runner2.create()

// Run the engines
Runner2.run(leftRunner2, leftEngine2)
Runner2.run(rightRunner2, rightEngine2)

// Run the renderers
Render2.run(leftRender2)
Render2.run(rightRender2)

// Reset positions periodically and check for stuck letters
const resetPositions = () => {
    const threshold = 0.1;
    const isDarkMode = document.body.classList.contains('dark-mode');
    const color = isDarkMode ? '#ffffff' : '#ffffff';
    
    bodiesUpward2.forEach(body => {
        const velocity = body.velocity;
        if (Math.abs(velocity.x) < threshold && Math.abs(velocity.y) < threshold) {
            Body2.setPosition(body, {
                x: window.innerWidth * 0.25 + (Math.random() * 100 - 50),
                y: window.innerHeight - 50
            });
            Body2.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: -15 });
            body.render.fillStyle = color;
            body.render.strokeStyle = color;
        }
    });
    
    bodiesDownward2.forEach(body => {
        const velocity = body.velocity;
        if (Math.abs(velocity.x) < threshold && Math.abs(velocity.y) < threshold) {
            Body2.setPosition(body, {
                x: window.innerWidth * 0.2 + (Math.random() * 100 - 50),
                y: window.innerHeight - 50
            });
            Body2.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: -15 });
            body.render.fillStyle = color;
            body.render.strokeStyle = color;
        }
    });
    
    // Regular reset
    positionLeftBodies2();
    positionRightBodies2();
};

// Run reset and stuck letter check more frequently
setInterval(resetPositions, 3000);
