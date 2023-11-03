const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



// const canvasApp = () => {
//     const config = {
//         numCircles: 1,
//         maxMaxRad: 200,
//         minMaxRad: 200,
//         minRadFactor: 0,
//         iterations: 8,
//         drawsPerFrame: 8,
//         bgColor: "#FFFFFF",
//         urlColor: "#EEEEEE",
//         lineWidth: 1.01,
//         TWO_PI: 2 * Math.PI,
//         xSqueeze: 0.75
//     };

//     let circles, drawCount, timer;

//     const init = () => {
//         circles = [];
//         drawCount = 0;
//         startGenerate();
//     };

//     const startGenerate = () => {
//         drawCount = 0;
//         ctx.setTransform(1, 0, 0, 1, 0, 0);
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         setCircles();
//         timer = timer && clearInterval(timer);
//         timer = setInterval(onTimer, 1000 / 50);
//     };

//     const setCircles = () => {
//         circles = Array.from({ length: config.numCircles }, () => {
//             const maxR = config.minMaxRad + Math.random() * (config.maxMaxRad - config.minMaxRad);
//             const minR = config.minRadFactor * maxR;
//             const grad = ctx.createRadialGradient(0, 0, minR, 0, 0, maxR);
//             grad.addColorStop(1, "rgba(0,170,200,0.2)");
//             grad.addColorStop(0, "rgba(0,20,170,0.2)");

//             return {
//                 centerX: -maxR,
//                 centerY: canvas.height / 2 - 50,
//                 maxRad: maxR,
//                 minRad: minR,
//                 color: grad,
//                 param: 0,
//                 changeSpeed: 1 / 250,
//                 phase: Math.random() * config.TWO_PI,
//                 globalPhase: Math.random() * config.TWO_PI,
//                 pointList1: setLinePoints(config.iterations),
//                 pointList2: setLinePoints(config.iterations)
//             };
//         });
//     };

//     const onTimer = () => {
//         for (let i = 0; i < config.drawsPerFrame; i++) {
//             circles.forEach(c => {
//                 drawCount++;
//                 c.param += c.changeSpeed;
//                 if (c.param >= 1) {
//                     c.param = 0;
//                     c.pointList1 = c.pointList2;
//                     c.pointList2 = setLinePoints(config.iterations);
//                 }
//                 const cosParam = 0.5 - 0.5 * Math.cos(Math.PI * c.param);

//                 ctx.strokeStyle = c.color;
//                 ctx.lineWidth = config.lineWidth;
//                 ctx.beginPath();

//                 let point1 = c.pointList1.first;
//                 let point2 = c.pointList2.first;

//                 c.phase += 0.0002;

//                 const theta = c.phase;
//                 let rad = c.minRad + (point1.y + cosParam * (point2.y - point1.y)) * (c.maxRad - c.minRad);

//                 c.centerX += 0.5;
//                 c.centerY += 0.04;
//                 const yOffset = 40 * Math.sin(c.globalPhase + drawCount / 1000 * config.TWO_PI);
//                 if (c.centerX > canvas.width + config.maxMaxRad) {
//                     clearInterval(timer);
//                     timer = null;
//                 }

//                 ctx.setTransform(config.xSqueeze, 0, 0, 1, c.centerX, c.centerY + yOffset);

//                 let x0 = config.xSqueeze * rad * Math.cos(theta);
//                 let y0 = rad * Math.sin(theta);
//                 ctx.lineTo(x0, y0);
//                 while (point1.next != null) {
//                     point1 = point1.next;
//                     point2 = point2.next;
//                     const theta = config.TWO_PI * (point1.x + cosParam * (point2.x - point1.x)) + c.phase;
//                     rad = c.minRad + (point1.y + cosParam * (point2.y - point1.y)) * (c.maxRad - c.minRad);
//                     x0 = config.xSqueeze * rad * Math.cos(theta);
//                     y0 = rad * Math.sin(theta);
//                     ctx.lineTo(x0, y0);
//                 }
//                 ctx.closePath();
//                 ctx.stroke();
//             });
//         }
//     };

//     const setLinePoints = (iterations) => {
//         let first = { x: 0, y: 1 };
//         let last = { x: 1, y: 1 };
//         let minY = 1;
//         let maxY = 1;

//         first.next = last;
//         for (let i = 0; i < iterations; i++) {
//             let point = first;
//             while (point.next != null) {
//                 const nextPoint = point.next;
//                 const dx = nextPoint.x - point.x;
//                 const newX = 0.5 * (point.x + nextPoint.x);
//                 const newY = 0.5 * (point.y + nextPoint.y) + dx * (Math.random() * 2 - 1);
//                 const newPoint = { x: newX, y: newY, next: nextPoint };
//                 minY = Math.min(minY, newY);
//                 maxY = Math.max(maxY, newY);
//                 point.next = newPoint;
//                 point = nextPoint;
//             }
//         }

//         const normalizeRate = maxY - minY ? 1 / (maxY - minY) : 1;
//         let point = first;
//         while (point != null) {
//             point.y = normalizeRate * (point.y - minY);
//             point = point.next;
//         }

//         return { first };
//     };

//     init();
// };

// canvasApp();