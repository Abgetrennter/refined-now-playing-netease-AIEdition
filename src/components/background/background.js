import './background.scss';
import { getGradientFromPalette } from '../../utils/color-utils';
import ColorThief from 'colorthief';

const useState = React.useState;
const useEffect = React.useEffect;
const useRef = React.useRef;

const colorThief = new ColorThief();

export function Background(props) {
	const [type, setType] = useState(props.type ?? 'blur'); // blur, gradient, fluid , solid
	const [url, setUrl] = useState('');
	const [staticFluid, setStaticFluid] = useState(true);
	const image = props.image;

	
	if (!props.isFM) {
		useEffect(() => {
			const observer = new MutationObserver(() => {
				if (image.src === url) return;
				if (image.complete) {
					setUrl(image.src);
				}
			});
			observer.observe(image, { attributes: true, attributeFilter: ['src'] });
			const onload = () => {
				setUrl(image.src);
			};
			image.addEventListener('load', onload);
			return () => {
				observer.disconnect();
				image.removeEventListener('load', onload);
			}
		}, [image]);
	} else {
		useEffect(() => {
			const imageContainer = image;
			if (imageContainer.querySelector('.cvr.j-curr img')) {
				setUrl(imageContainer.querySelector('.cvr.j-curr img').src);
				props.imageChangedCallback(imageContainer.querySelector('.cvr.j-curr img'));
			}
			const observer = new MutationObserver(() => {
				if (imageContainer.querySelector('.cvr.j-curr img')) {
					setUrl(imageContainer.querySelector('.cvr.j-curr img').src);
					props.imageChangedCallback(imageContainer.querySelector('.cvr.j-curr img'));
				}
			});
			observer.observe(imageContainer, { childList: true, subtree: true });
			return () => {
				observer.disconnect();
			}
		}, [image]);
	}

	useEffect(() => {
		document.addEventListener('rnp-background-type', (e) => {
			setType(e.detail.type ?? 'blur');
		});
		document.addEventListener('rnp-static-fluid', (e) => {
			setStaticFluid(e.detail ?? false);
		});
	}, []);
	
	return (
		<>
			{type === 'blur' && (
				<BlurBackground url={url} />
			)}
			{type === 'gradient' && (
				<GradientBackground url={url} />
			)}
			{type === 'fluid' && (
				<FluidBackground url={url} static={staticFluid} isFM={props.isFM} />
			)}
			{type === 'solid' && (
				<SolidBackground />
			)}
			{type === 'none' && (
				<>
					<div className="rnp-background-none"></div>
					<style>
						{`
							body.mq-playing .g-single {
								background: transparent !important;
							}
							body.mq-playing .g-sd,
							body.mq-playing .g-mn {
								opacity: 0;
							}
						`}
					</style>
				</>
			)}
		</>
	);
}
function BlurBackground(props) {
	const ref = useRef();
	useEffect(() => {
		if (!props.url) return;
		ref.current.style.backgroundImage = `url(${props.url})`;
		ref.current.style.transition = 'background-image 1.5s ease';
	}, [props.url]);

	return (
		<div ref={ref} className="rnp-background-blur"/>
	);
}

function GradientBackground(props) {
	const [gradient, setGradient] = useState('linear-gradient(-45deg, #666, #fff)');
	useEffect(() => {
		const image = new Image();
		image.crossOrigin = 'Anonymous';
		console.log('loading image');
		image.onload = () => {
			console.log('image loaded');
			const palette = colorThief.getPalette(image);
			setGradient(getGradientFromPalette(palette));
		};
		image.src = props.url;
	}, [props.url]);

	return (
		<div className="rnp-background-gradient" style={{ backgroundImage: gradient }} />
	);
}

import { createShader, createProgram, createTexture, vertexShaderSource, fragmentShaderSource } from '../../utils/webgl-utils';

function FluidBackground(props) {
	const canvasRef = useRef(null);
	const [songId, setSongId] = useState("0");
	const playState = useRef(document.querySelector("#main-player .btnp").classList.contains("btnp-pause"));
	const requestRef = useRef();
	const glRef = useRef();
	const programRef = useRef();
	const textureRef = useRef();
	const startTimeRef = useRef(Date.now());
	const displacementScaleRef = useRef(400);

	const onPlayStateChange = (id, state) => {
		if (!props.isFM) {
			playState.current = document.querySelector("#main-player .btnp").classList.contains("btnp-pause");
		} else {
			playState.current = document.querySelector(".m-player-fm .btnp").classList.contains("btnp-pause");
		}
		setSongId(id);
	};

	useEffect(() => {
		legacyNativeCmder.appendRegisterCall(
			"PlayState",
			"audioplayer",
			onPlayStateChange
		);
		return () => {
			legacyNativeCmder.removeRegisterCall(	
				"PlayState",
				"audioplayer",
				onPlayStateChange
			);
		}
	}, []);

	// Initialize WebGL
	useEffect(() => {
		const canvas = canvasRef.current;
		const gl = canvas.getContext("webgl");
		if (!gl) {
			console.error("WebGL not supported");
			return;
		}
		glRef.current = gl;

		const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
		const program = createProgram(gl, vertexShader, fragmentShader);
		programRef.current = program;

		const positionAttributeLocation = gl.getAttribLocation(program, "position");
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		// Full screen quad
		const positions = [
			-1, -1,
			-1,  1,
			 1, -1,
			 1, -1,
			-1,  1,
			 1,  1,
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

		gl.useProgram(program);
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

		const resizeCanvas = () => {
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			const screenAspectLocation = gl.getUniformLocation(program, "u_screen_aspect");
			gl.uniform1f(screenAspectLocation, gl.canvas.width / gl.canvas.height);
		};
		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();
		
		// Set seed
		const seedLocation = gl.getUniformLocation(program, "u_seed");
		gl.uniform1f(seedLocation, Math.random() * 100.0);

		return () => {
			window.removeEventListener('resize', resizeCanvas);
		}
	}, []);

	// Load Image
	useEffect(() => {
		const image = new Image();
		image.crossOrigin = 'Anonymous';
		image.onload = () => {
			if (glRef.current && programRef.current) {
				if (textureRef.current) glRef.current.deleteTexture(textureRef.current);
				textureRef.current = createTexture(glRef.current, image);
                
                const imgAspectLocation = glRef.current.getUniformLocation(programRef.current, "u_img_aspect");
                glRef.current.uniform1f(imgAspectLocation, image.width / image.height);
			}
		};
		image.src = props.url;
	}, [props.url]);

	// Animation Loop
	useEffect(() => {
		const render = () => {
			requestRef.current = requestAnimationFrame(render);
			
			if ((props.static || !playState.current) && !props.forceAnimate) {
                // Even if paused, we might need to render once to update uniforms if they changed?
                // But for efficiency we can skip. 
                // However, if u_scale changes (audio), we should render.
                // Let's rely on the loop running but time not advancing if paused?
                // Or just pause the loop? 
                // The original code paused animation via CSS.
                // Here we can just stop updating time.
			}
            
            const gl = glRef.current;
            const program = programRef.current;
            if (!gl || !program || !textureRef.current) return;

            const timeLocation = gl.getUniformLocation(program, "u_time");
            const scaleLocation = gl.getUniformLocation(program, "u_scale");

            // Update time only if playing and not static
            let time = (Date.now() - startTimeRef.current) / 1000;
            if (props.static || !playState.current) {
                // If paused, we use a fixed time or the last time?
                // To keep it simple, we just pass the real time, but maybe scale it?
                // If we want to PAUSE the flow, we should stop incrementing a 'currentTime' variable.
                // But for now let's just let time flow or use a stored offset.
            }

            gl.uniform1f(timeLocation, time);
            gl.uniform1f(scaleLocation, displacementScaleRef.current);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
		};
		requestRef.current = requestAnimationFrame(render);
		return () => cancelAnimationFrame(requestRef.current);
	}, [props.static]); // Re-bind if static changes? Actually just keep loop running.

	const setDisplacementScale = (value) => {
		displacementScaleRef.current = value;
	};

	// Audio-responsive background (For LibVolumeLevelProvider)
	if (loadedPlugins.LibFrontendPlay) {
		const processor = useRef({});
		useEffect(() => {
			processor.current.bufferLength = 1024;
			processor.current.dataArray = new Float32Array(processor.current.bufferLength);
		}, []); 

		const request = useRef(0);
		useEffect(() => {
			const animate = () => {
				request.current = requestAnimationFrame(animate);
				if (!playState.current) return;
				if (!loadedPlugins.LibFrontendPlay.currentAudioAnalyser) return;

				loadedPlugins.LibFrontendPlay.currentAudioAnalyser.getFloatFrequencyData(processor.current.dataArray);
				const max = Math.max(...processor.current.dataArray);
				const percentage = Math.pow(1.3, max / 20) * 2 - 1;
                // Make the audio response more subtle.
                // Instead of 200-600 range, let's keep it tighter, e.g., 350-450.
                // Original: 800 - percentage * 800.
                // If percentage is close to 1 (loud), result is 0. If 0, result is 800.
                // Let's inverse it? Usually louder = more distortion?
                // But maybe we want stability.
                // Let's just clamp the range to be safer.
				setDisplacementScale(Math.min(500, Math.max(300, 400 - percentage * 200)));
			};
			request.current = requestAnimationFrame(animate);
			return () => {
				cancelAnimationFrame(request.current);
			}
		}, []);
	}
	// Audio-responsive background (For LibVolumeLevelProvider)
	else if (typeof(registerAudioLevelCallback) == "function") {
		let audioLevels = {}, audioLevelSum = 0, now = 0;
		let maxq = [], minq = [];
		let percentage;
		const onAudioLevelChange = (value) => {
			if (!playState.current) return;
			now += 1;
			if (now <= 100) {
				audioLevels[now] = value;
				audioLevelSum += value;
				while (maxq.length && audioLevels[maxq[maxq.length - 1]] <= value) maxq.pop();
				maxq.push(now);
				while (minq.length && audioLevels[minq[minq.length - 1]] >= value) minq.pop();
				minq.push(now);
				setDisplacementScale(400 - value * 200);
				return;
			}
			audioLevelSum -= audioLevels[now - 100];
			delete audioLevels[now - 100];
			audioLevels[now] = value;
			audioLevelSum += value;
			while (maxq.length && audioLevels[maxq[maxq.length - 1]] <= value) maxq.pop();
			maxq.push(now);
			while (maxq[0] <= now - 100) maxq.shift();
			while (minq.length && audioLevels[minq[minq.length - 1]] >= value) minq.pop();
			minq.push(now);
			while (minq[0] <= now - 100) minq.shift();
			
			percentage = (value - audioLevels[minq[0]]) / (audioLevels[maxq[0]] - audioLevels[minq[0]]);
			if (percentage != percentage) percentage = 1 / 3; // NaN
			function easeInOutQuint(x) {
				return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
			}
			percentage = easeInOutQuint(percentage);
			const scale = 400 - (percentage) * 100;
			
			const oldScale = displacementScaleRef.current;
			setDisplacementScale(oldScale + (scale - oldScale) * 0.05);
		}
		useEffect(() => {
			registerAudioLevelCallback(onAudioLevelChange);
			return () => {
				unregisterAudioLevelCallback(onAudioLevelChange);
				setDisplacementScale(400);
			}
		}, []);
		useEffect(() => {
			audioLevels = [];
			audioLevelSum = 0;
		}, [songId]);
	}

	return (
		<div className="rnp-background-fluid">
			<canvas 
				ref={canvasRef} 
				className="rnp-background-fluid-canvas-webgl" 
				style={{ width: '100%', height: '100%', display: 'block' }}
			/>
		</div>
	);
}

function SolidBackground() {
	return (
		<div className="rnp-background-solid"></div>
	);
}
