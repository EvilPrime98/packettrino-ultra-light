import { env } from '../src/env.js'

export function pauseSimulation() {
    env.paused = true;
}

export function resumeSimulation() {
    env.paused = false;
}

export function waitUntilResumed() {
    return new Promise(resolve => {
        const check = () => {
            if (!env.paused) resolve();
            else requestAnimationFrame(check);
        };
        check();
    });
}

export async function movePacket(x1, y1, x2, y2, type) {

    return new Promise(resolve => {

        const $svg = document.getElementById("svg-board");
        const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        x1 = parseInt(x1.replace("px", ""));
        y1 = parseInt(y1.replace("px", ""));
        x2 = parseInt(x2.replace("px", ""));
        y2 = parseInt(y2.replace("px", ""));
        img.setAttribute("href", `./assets/packets/${type}.png`);
        img.setAttribute("width", "50");
        img.setAttribute("height", "50");
        img.setAttribute("x", x1);
        img.setAttribute("y", y1);
        $svg.appendChild(img);

        let startTime;

        function animateMove(time) {
            if (!startTime) startTime = time;
            const elapsed = time - startTime;
            const progress = elapsed / env.visualSpeed;
            const currentX = x1 + (x2 - x1) * Math.min(progress, 1);
            const currentY = y1 + (y2 - y1) * Math.min(progress, 1);
            img.setAttribute("x", currentX);
            img.setAttribute("y", currentY);

            if (progress < 1) {
                if (env.paused) {
                    waitUntilResumed().then(() => {
                        startTime = performance.now() - elapsed;
                        requestAnimationFrame(animateMove);
                    });
                } else {
                    requestAnimationFrame(animateMove);
                }
            } else {
                $svg.removeChild(img);
                resolve();
            }
        }

        requestAnimationFrame(animateMove);
    });
}
