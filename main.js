// Existing code for the button
const button = document.querySelector('.button');

button.addEventListener('click', () => {
    alert('Button clicked!');
});

// Rotating Letters Animation
window.addEventListener('load', function() {
    const letterContainers = document.querySelectorAll('.letter-container');
    const totalLetters = letterContainers.length;
    const radius = 22; // Adjust as needed
    const angleBetweenLetters = 360 / totalLetters;

    function updateLettersRotation() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / maxScroll;
        const rotation = scrollPercent * 540;

        letterContainers.forEach((container, index) => {
            const angleDeg = (angleBetweenLetters * index) + rotation;
            const angleRad = angleDeg * (Math.PI / 180);

            const x = radius * Math.cos(angleRad);
            const y = radius * Math.sin(angleRad);

            // Position and rotate the container
            container.style.transform = `
                translate(-50%, -50%)
                translate(${x}px, ${y}px)
                rotate(${angleDeg}deg)
            `;

            // Rotate the letter inside to spin
            const letter = container.querySelector('.letter');
            const letterSpin = rotation; // Adjust the multiplier for spin speed
            letter.style.transform = `rotate(${letterSpin}deg)`;
        });
    }

    // Initialize the positions
    updateLettersRotation();

    // Optimize scroll event with requestAnimationFrame
    let ticking = false;

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateLettersRotation();
                ticking = false;
            });
            ticking = true;
        }
    });
});

// Menu Button Toggle
document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.getElementById('menu-btn');
    const menuOverlay = document.getElementById('menu-overlay');

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    });
});

// Matter.js module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Events = Matter.Events;

// Create an engine
var engine = Engine.create();
var world = engine.world;

// Get the dimensions of the container
var matterContainer = document.getElementById('matter-container');
var containerWidth = matterContainer.offsetWidth;
var containerHeight = matterContainer.offsetHeight;

// Create a renderer
var render = Render.create({
    element: matterContainer,
    engine: engine,
    canvas: document.getElementById('matter-canvas'),
    options: {
        width: containerWidth,
        height: containerHeight,
        background: 'transparent', // Transparent background
        wireframes: false, // Render solid shapes
        pixelRatio: window.devicePixelRatio,
    }
});

Render.run(render);

// Create runner
var runner = Runner.create();
Runner.run(runner, engine);

// Updated letters array
var letters = ['S', 'C', 'Y']; // You can add more letters if you'd like

// Function to create letter bodies with updates
function createLetterBodies() {
    letters.forEach(function(letter) {
        if (letter === ' ') return; // Skip spaces

        // Limit x to be within 25% to 75% of container width
        var minX = containerWidth * 0.25;
        var maxX = containerWidth * 0.75;
        var x = minX + Math.random() * (maxX - minX);

        // Start higher above the container
        var y = -500; // Spawn 500 pixels above the top of the container

        // Increase the size of the letters
        var size = 200;

        // Set a random starting orientation
        var randomAngle = Math.random() * 2 * Math.PI; // Random angle between 0 and 2π radians

        var body = Bodies.rectangle(x, y, size, size, {
            angle: randomAngle, // Apply the random starting angle
            restitution: 0.7,   // Increase bounciness slightly
            friction: 0.5,      // Adjust friction to make physics more unstable
            density: 0.001,     // Adjust density to affect inertia
            render: {
                sprite: {
                    texture: './img/' + letter + '.png', // Ensure you have images for these letters
                    xScale: size / 100, // Adjust scale based on image size
                    yScale: size / 100,
                }
            },
            label: letter,
        });

        Composite.add(world, body);
    });
}

// Add walls
function addWalls() {
    var thickness = 100;
    var width = containerWidth;
    var height = containerHeight;

    var ground = Bodies.rectangle(width / 2, height + thickness / 2, width * 2, thickness, {
        isStatic: true,
        render: { visible: false },
    });

    // Adjust the ceiling height to prevent immediate collision
    var ceiling = Bodies.rectangle(width / 2, -thickness / 2 - 600, width * 2, thickness, {
        isStatic: true,
        render: { visible: false },
    });

    var leftWall = Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, {
        isStatic: true,
        render: { visible: false },
    });

    var rightWall = Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, {
        isStatic: true,
        render: { visible: false },
    });

    Composite.add(world, [ground, ceiling, leftWall, rightWall]);
}

// Handle window resize
window.addEventListener('resize', function() {
    // Update container dimensions
    containerWidth = matterContainer.offsetWidth;
    containerHeight = matterContainer.offsetHeight;

    // Update renderer size
    render.canvas.width = containerWidth;
    render.canvas.height = containerHeight;

    render.options.width = containerWidth;
    render.options.height = containerHeight;

    // Clear the world
    Composite.clear(world);

    // Re-add walls and letters
    addWalls();
    createLetterBodies();
});

// Initialize
addWalls();

// Variable to track if we've added letters
var lettersAdded = false;

// Function to check if the container is in view
function isContainerInView() {
    var rect = matterContainer.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom >= 0;
}

// Scroll event listener to add letters when the container comes into view
window.addEventListener('scroll', function() {
    if (isContainerInView() && !lettersAdded) {
        createLetterBodies();
        lettersAdded = true;
    }
});

// Optional: Add mouse control
var mouse = Mouse.create(render.canvas);
var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: { visible: false },
    }
});

Composite.add(world, mouseConstraint);
render.mouse = mouse;
