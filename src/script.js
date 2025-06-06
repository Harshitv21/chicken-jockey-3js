import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import GUI from 'lil-gui';

/**
 * Base
*/
// Debug
const debugObject = {};
debugObject.color = "#08213a";
const gui = new GUI({
    width: 250,
    title: "Debug UI 📜",
    closeFolders: false
});
gui.hide();
gui.close();

gui.addColor(debugObject, 'color').onChange(() => { renderer.setClearColor(debugObject.color) })

window.addEventListener('keydown', (event) => {
    if (event.key == 'h') gui.show(gui._hidden);
})

// Canvas
const canvas = document.querySelector('canvas.webgl');
// Scene
const scene = new THREE.Scene();


// AxesHelper
// const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper);

/**
 * Textures
*/
const textureLoader = new THREE.TextureLoader();
const toonMatcapTexture = textureLoader.load('/textures/matcaps/toon_1.png');
toonMatcapTexture.colorSpace = THREE.SRGBColorSpace;

// Minecraft block textures
const texturePaths = [
    "WARPED_NYLIUM", 'diamond_ore.png', 'emerald_ore.png', "CARTOGRAPHY", 'gold_block.png', 'gold_ore.png',
    'ice.png', "CRAFTING", 'mossy_cobblestone.png', 'mud_bricks.png', 'red_nether_bricks.png',
    'redstone_ore.png', "CRIMSON_NYLIUM", 'resin_bricks.png', 'rooted_dirt.png', "JACK_O_LANTERN",
    'tuff_bricks.png', "TNT"
];

// Three.js BoxGeometry face order
// 0: Right
// 1: Left
// 2: Top
// 3: Bottom
// 4: Front
// 5: Back

const specialBlockMappings = {
    "CARTOGRAPHY": {
        0: 'textures/minecraft/cartography/cartography_table_side2.png',
        1: 'textures/minecraft/cartography/cartography_table_side3.png',
        2: 'textures/minecraft/cartography/cartography_table_top.png',
        3: 'textures/minecraft/cartography/cartography_table_side3.png',
        4: 'textures/minecraft/cartography/cartography_table_side1.png',
        5: 'textures/minecraft/cartography/cartography_table_side3.png'
    },
    "CRAFTING": {
        0: 'textures/minecraft/crafting/crafting_table_side.png',
        1: 'textures/minecraft/crafting/crafting_table_side.png',
        2: 'textures/minecraft/crafting/crafting_table_top.png',
        3: 'textures/minecraft/crafting/oak_planks.png',
        4: 'textures/minecraft/crafting/crafting_table_front.png',
        5: 'textures/minecraft/crafting/crafting_table_side.png'
    },
    "CRIMSON_NYLIUM": {
        0: 'textures/minecraft/crimson_nylium/crimson_nylium_side.png',
        1: 'textures/minecraft/crimson_nylium/crimson_nylium_side.png',
        2: 'textures/minecraft/crimson_nylium/crimson_nylium.png',
        3: 'textures/minecraft/netherrack.png',
        4: 'textures/minecraft/crimson_nylium/crimson_nylium_side.png',
        5: 'textures/minecraft/crimson_nylium/crimson_nylium_side.png'
    },
    "JACK_O_LANTERN": {
        0: 'textures/minecraft/jack_o_lantern/pumpkin_side.png',
        1: 'textures/minecraft/jack_o_lantern/pumpkin_side.png',
        2: 'textures/minecraft/jack_o_lantern/pumpkin_top.png',
        3: 'textures/minecraft/jack_o_lantern/pumpkin_side.png',
        4: 'textures/minecraft/jack_o_lantern/jack_o_lantern.png',
        5: 'textures/minecraft/jack_o_lantern/pumpkin_side.png'
    },
    "TNT": {
        0: 'textures/minecraft/tnt/tnt_side.png',
        1: 'textures/minecraft/tnt/tnt_side.png',
        2: 'textures/minecraft/tnt/tnt_top.png',
        3: 'textures/minecraft/tnt/tnt_bottom.png',
        4: 'textures/minecraft/tnt/tnt_side.png',
        5: 'textures/minecraft/tnt/tnt_side.png'
    },
    "WARPED_NYLIUM": {
        0: 'textures/minecraft/warped_nylium/warped_nylium_side.png',
        1: 'textures/minecraft/warped_nylium/warped_nylium_side.png',
        2: 'textures/minecraft/warped_nylium/warped_nylium.png',
        3: 'textures/minecraft/netherrack.png',
        4: 'textures/minecraft/warped_nylium/warped_nylium_side.png',
        5: 'textures/minecraft/warped_nylium/warped_nylium_side.png'
    }
};

const texturesArray = texturePaths.map(file => {
    const texture = textureLoader.load(`/textures/minecraft/${file}`);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    return texture;
});

// Randomization
const RANGE = 10;
const MAX_INDEX = texturesArray.length;
const MIN_CUBE_SCALE = 0.2;
const MIN_DIST_FROM_TEXT = 1;

/**
 * Fonts
*/
let textGeometry;
const fontLoader = new FontLoader();
fontLoader.load(
    '/fonts/Minecraft_Regular.json',
    (font) => {
        textGeometry = new TextGeometry(
            'Chicken Jockey',
            {
                font,
                size: 0.5,
                depth: 0.2,
                curveSegments: 6,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 3
            }
        )

        textGeometry.center();

        const textMaterial = new THREE.MeshMatcapMaterial({ matcap: toonMatcapTexture });
        // textMaterial.wireframe = true;  
        const text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text);

        console.time('blocks_render_time');

        const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        for (let i = 0; i < 100; i++) {
            const randomIndex = Math.floor(Math.random() * MAX_INDEX);
            const textureKey = texturePaths[randomIndex];

            let block;

            if (specialBlockMappings[textureKey]) {
                const mapping = specialBlockMappings[textureKey];
                const materials = [];

                for (let face = 0; face < 6; face++) {
                    let texturePath = mapping[face];

                    const texture = textureLoader.load(texturePath);
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.magFilter = THREE.NearestFilter;

                    const material = new THREE.MeshMatcapMaterial({ map: texture });
                    materials.push(material);
                }

                block = new THREE.Mesh(boxGeometry, materials);
            } else {
                // Normal block: single texture
                const texture = texturesArray[randomIndex];
                const material = new THREE.MeshMatcapMaterial({ map: texture });
                block = new THREE.Mesh(boxGeometry, material);
            }

            let position;
            do {
                position = new THREE.Vector3(
                    (Math.random() - 0.5) * (RANGE + 2.25),
                    (Math.random() - 0.5) * (RANGE + 2.25),
                    (Math.random() - 0.5) * (RANGE + 2.25)
                );
            } while (position.distanceTo(new THREE.Vector3(0, 0, 0)) < MIN_DIST_FROM_TEXT);

            block.position.copy(position);

            block.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

            const scale = Math.random() * (1 - MIN_CUBE_SCALE) + MIN_CUBE_SCALE;
            block.scale.set(scale, scale, scale); block.scale.set(scale, scale, scale)

            scene.add(block);
        }

        console.timeEnd('blocks_render_time');
    }
)

/**
 * Sizes
*/
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) canvas.requestFullscreen();
    else document.exitFullscreen();
})

/**
 * Camera
*/
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true

/**
 * Renderer
*/
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setClearColor(debugObject.color);

/**
 * Animate
*/
const clock = new THREE.Clock()

const gameLoop = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update();

    scene.traverse((child) => {
        if (child.isMesh && child.geometry.type === 'BoxGeometry') {
            child.rotation.y += 0.005;
            child.rotation.x += 0.002;
            child.rotation.z += 0.005;
        }
    });

    // Render
    renderer.render(scene, camera)

    // Call gameLoop again on the next frame
    window.requestAnimationFrame(gameLoop)
}

gameLoop();