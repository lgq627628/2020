let lastTime = performance.now();
let frame = 0;
let lastFrameTime = performance.now();

const loop = function(time) {
	const now =  performance.now();
	const fs = (now - lastFrameTime);
	lastFrameTime = now;
	let fps = Math.round(1000/fs);
	frame++;
	if (now > 1000 + lastTime) {
        fps = Math.round( ( frame * 1000 ) / ( now - lastTime ) );
        console.log(fps)
		frame = 0;    
		lastTime = now;    
	};           
	window.requestAnimationFrame(loop);   
}

loop()
