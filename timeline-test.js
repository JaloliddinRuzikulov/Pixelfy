// Test script to simulate timeline track creation and resizing
// This will help debug the track resizing functionality

console.log("🎬 Starting Timeline Track Resize Test");

// Simulate the editor loading process
function simulateEditorLoad() {
    console.log("📝 Simulating editor load sequence...");

    // Check if we're in browser environment
    if (typeof window === 'undefined') {
        console.log("❌ Not in browser environment, exiting");
        return;
    }

    // Wait for page to fully load
    if (document.readyState !== 'complete') {
        window.addEventListener('load', simulateEditorLoad);
        return;
    }

    console.log("✅ Page loaded, starting timeline tests");

    // Test 1: Check if timeline canvas exists
    const canvas = document.getElementById('designcombo-timeline-canvas');
    if (canvas) {
        console.log("✅ Timeline canvas found:", canvas);
    } else {
        console.log("❌ Timeline canvas not found");

        // Look for any canvas elements
        const allCanvases = document.querySelectorAll('canvas');
        console.log("📊 All canvas elements found:", allCanvases.length);
        allCanvases.forEach((c, i) => {
            console.log(`  Canvas ${i}: id="${c.id}", class="${c.className}"`);
        });
    }

    // Test 2: Check for timeline container
    const timelineContainer = document.getElementById('timeline-container');
    if (timelineContainer) {
        console.log("✅ Timeline container found:", timelineContainer);
    } else {
        console.log("❌ Timeline container not found");
    }

    // Test 3: Look for media elements to add to timeline
    setTimeout(() => {
        console.log("🔍 Looking for media elements to test with...");

        // Look for video elements or media buttons
        const mediaButtons = document.querySelectorAll('[data-testid*="media"], button[class*="media"], button[class*="video"], button[class*="image"]');
        console.log("📺 Media buttons found:", mediaButtons.length);

        if (mediaButtons.length > 0) {
            console.log("🖱️ Attempting to click first media button to add to timeline");

            // Try to add media to timeline
            const firstButton = mediaButtons[0];
            console.log("Clicking button:", firstButton);

            firstButton.click();

            // Wait and check if track was created
            setTimeout(() => {
                checkForTracks();
            }, 2000);
        } else {
            console.log("⚠️ No media buttons found, checking for other ways to add media");
            checkForTracks();
        }
    }, 1000);
}

function checkForTracks() {
    console.log("🎯 Checking for created tracks...");

    // Check for track elements in timeline
    const canvas = document.getElementById('designcombo-timeline-canvas');
    if (canvas) {
        // Try to get canvas context and check for drawn elements
        const ctx = canvas.getContext('2d');
        console.log("Canvas context:", ctx);
        console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

        // Check for any track-related elements in DOM
        const trackElements = document.querySelectorAll('[class*="track"], [data-type*="track"]');
        console.log("🛤️ Track elements found:", trackElements.length);

        // Listen for mouse events on canvas to test resize functionality
        if (canvas) {
            console.log("🖱️ Setting up mouse event listeners for resize testing");

            let mouseX = 0, mouseY = 0;

            canvas.addEventListener('mousedown', (e) => {
                const rect = canvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
                console.log(`🖱️ Mouse down at: ${mouseX}, ${mouseY}`);

                // Check if we're near a track edge (for resize detection)
                checkResizeArea(mouseX, mouseY);
            });

            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                const newX = e.clientX - rect.left;
                const newY = e.clientY - rect.top;

                // Only log significant movements to avoid spam
                if (Math.abs(newX - mouseX) > 5 || Math.abs(newY - mouseY) > 5) {
                    console.log(`🖱️ Mouse move to: ${newX}, ${newY}`);
                    mouseX = newX;
                    mouseY = newY;

                    // Check cursor style for resize indicators
                    const cursorStyle = canvas.style.cursor;
                    if (cursorStyle && cursorStyle.includes('resize')) {
                        console.log(`🔄 Resize cursor detected: ${cursorStyle}`);
                    }
                }
            });

            canvas.addEventListener('mouseup', (e) => {
                console.log("🖱️ Mouse up");
            });
        }
    }

    // Test adding a sample track programmatically if possible
    setTimeout(() => {
        testTrackCreation();
    }, 1000);
}

function checkResizeArea(x, y) {
    console.log(`🔍 Checking resize area at ${x}, ${y}`);

    // Simulate checking for track boundaries
    // In a real implementation, this would check against actual track positions
    const simulatedTracks = [
        { x: 0, y: 50, width: 200, height: 50, name: "Track 1" },
        { x: 0, y: 110, width: 150, height: 40, name: "Track 2" }
    ];

    simulatedTracks.forEach((track, index) => {
        const trackTop = track.y;
        const trackBottom = track.y + track.height;
        const trackLeft = track.x;
        const trackRight = track.x + track.width;

        // Check if mouse is near track edges (within 5px)
        const nearTopEdge = Math.abs(y - trackTop) <= 5 && x >= trackLeft && x <= trackRight;
        const nearBottomEdge = Math.abs(y - trackBottom) <= 5 && x >= trackLeft && x <= trackRight;
        const nearLeftEdge = Math.abs(x - trackLeft) <= 5 && y >= trackTop && y <= trackBottom;
        const nearRightEdge = Math.abs(x - trackRight) <= 5 && y >= trackTop && y <= trackBottom;

        if (nearTopEdge || nearBottomEdge) {
            console.log(`🔄 Near vertical resize edge of ${track.name} (${nearTopEdge ? 'top' : 'bottom'})`);
        }

        if (nearLeftEdge || nearRightEdge) {
            console.log(`🔄 Near horizontal resize edge of ${track.name} (${nearLeftEdge ? 'left' : 'right'})`);
        }

        // Check if mouse is inside track
        if (x >= trackLeft && x <= trackRight && y >= trackTop && y <= trackBottom) {
            console.log(`🎯 Mouse inside ${track.name}`);
        }
    });
}

function testTrackCreation() {
    console.log("🧪 Testing track creation...");

    // Look for global variables that might contain the timeline instance
    if (typeof window !== 'undefined') {
        console.log("🔍 Checking for global timeline variables...");

        // Check for common global variables
        const possibleGlobals = ['timeline', 'canvasTimeline', 'editor', 'stateManager'];
        possibleGlobals.forEach(name => {
            if (window[name]) {
                console.log(`✅ Found global variable: ${name}`, window[name]);

                // Try to inspect the timeline object
                if (name.includes('timeline') || name.includes('Timeline')) {
                    inspectTimelineObject(window[name]);
                }
            }
        });

        // Check for React DevTools or other debugging hooks
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            console.log("⚛️ React DevTools detected");
        }
    }
}

function inspectTimelineObject(timelineObj) {
    console.log("🔬 Inspecting timeline object:", timelineObj);

    if (!timelineObj) return;

    // Check for common timeline methods
    const expectedMethods = [
        'addTrackItem', 'removeTrackItem', 'getTrackItems',
        'createTrack', 'removeTrack', 'getTracks',
        'addTrack', 'renderTracks', 'alignItemsToTrack',
        'requestRenderAll', 'getObjects', 'add'
    ];

    expectedMethods.forEach(method => {
        if (typeof timelineObj[method] === 'function') {
            console.log(`✅ Timeline has method: ${method}`);
        } else {
            console.log(`❌ Timeline missing method: ${method}`);
        }
    });

    // Check for track-related properties
    const expectedProps = ['tracks', 'trackItems', 'trackItemsMap', 'trackItemIds'];
    expectedProps.forEach(prop => {
        if (timelineObj[prop] !== undefined) {
            console.log(`✅ Timeline has property: ${prop}`, timelineObj[prop]);
        } else {
            console.log(`❌ Timeline missing property: ${prop}`);
        }
    });
}

// Monitor console for timeline-related logs
const originalConsoleLog = console.log;
console.log = function(...args) {
    // Call original console.log
    originalConsoleLog.apply(console, args);

    // Check for timeline-related messages
    const message = args.join(' ');
    if (message.includes('Track') || message.includes('timeline') || message.includes('addTrackItem')) {
        console.log("🎯 TIMELINE LOG DETECTED:", message);
    }
};

// Start the simulation
if (typeof window !== 'undefined') {
    simulateEditorLoad();
} else {
    console.log("❌ This script needs to run in a browser environment");
}