// WebGL shader for chroma key effect
export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

export const fragmentShaderSource = `
  precision mediump float;
  
  uniform sampler2D u_texture;
  uniform vec3 u_keyColor;
  uniform float u_similarity;
  uniform float u_smoothness;
  uniform float u_spill;
  uniform float u_contrast;
  uniform float u_brightness;
  
  varying vec2 v_texCoord;
  
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }
  
  float colorDistance(vec3 color1, vec3 color2) {
    vec3 hsv1 = rgb2hsv(color1);
    vec3 hsv2 = rgb2hsv(color2);
    
    float hueDiff = abs(hsv1.x - hsv2.x);
    if (hueDiff > 0.5) hueDiff = 1.0 - hueDiff;
    
    float satDiff = abs(hsv1.y - hsv2.y);
    float valDiff = abs(hsv1.z - hsv2.z);
    
    return sqrt(hueDiff * hueDiff + satDiff * satDiff * 0.5 + valDiff * valDiff * 0.5);
  }
  
  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    
    float dist = colorDistance(color.rgb, u_keyColor);
    
    // Calculate alpha based on distance
    float alpha = 1.0;
    if (dist < u_similarity) {
      alpha = 0.0;
    } else if (dist < u_similarity + u_smoothness) {
      alpha = (dist - u_similarity) / u_smoothness;
    }
    
    // Spill suppression
    if (u_spill > 0.0 && alpha > 0.0) {
      float spillAmount = max(0.0, 1.0 - dist / u_similarity) * u_spill;
      color.rgb = mix(color.rgb, vec3(0.5), spillAmount);
    }
    
    // Apply contrast and brightness
    color.rgb = ((color.rgb - 0.5) * u_contrast) + 0.5 + u_brightness;
    color.rgb = clamp(color.rgb, 0.0, 1.0);
    
    gl_FragColor = vec4(color.rgb, color.a * alpha);
  }
`;

export class ChromaKeyProcessor {
	private canvas: HTMLCanvasElement;
	private gl: WebGLRenderingContext;
	private program: WebGLProgram;
	private texture: WebGLTexture;
	private positionBuffer: WebGLBuffer;
	private texCoordBuffer: WebGLBuffer;

	constructor(width: number, height: number) {
		this.canvas = document.createElement("canvas");
		this.canvas.width = width;
		this.canvas.height = height;

		const gl = this.canvas.getContext("webgl", {
			alpha: true,
			premultipliedAlpha: false,
		});

		if (!gl) {
			throw new Error("WebGL not supported");
		}

		this.gl = gl;
		this.program = this.createProgram();
		this.texture = gl.createTexture()!;
		this.positionBuffer = gl.createBuffer()!;
		this.texCoordBuffer = gl.createBuffer()!;

		this.setupBuffers();
	}

	private createShader(type: number, source: string): WebGLShader {
		const shader = this.gl.createShader(type)!;
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.error("Shader compile error:", this.gl.getShaderInfoLog(shader));
			this.gl.deleteShader(shader);
			throw new Error("Failed to compile shader");
		}

		return shader;
	}

	private createProgram(): WebGLProgram {
		const vertexShader = this.createShader(
			this.gl.VERTEX_SHADER,
			vertexShaderSource,
		);
		const fragmentShader = this.createShader(
			this.gl.FRAGMENT_SHADER,
			fragmentShaderSource,
		);

		const program = this.gl.createProgram()!;
		this.gl.attachShader(program, vertexShader);
		this.gl.attachShader(program, fragmentShader);
		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			console.error("Program link error:", this.gl.getProgramInfoLog(program));
			throw new Error("Failed to link program");
		}

		return program;
	}

	private setupBuffers() {
		// Position buffer
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
			this.gl.STATIC_DRAW,
		);

		// Texture coordinate buffer
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]),
			this.gl.STATIC_DRAW,
		);
	}

	process(
		videoElement: HTMLVideoElement,
		settings: {
			keyColor: string;
			similarity: number;
			smoothness: number;
			spill: number;
			contrast: number;
			brightness: number;
		},
	): HTMLCanvasElement {
		const gl = this.gl;

		// Use program
		gl.useProgram(this.program);

		// Update canvas size if needed
		if (
			this.canvas.width !== videoElement.videoWidth ||
			this.canvas.height !== videoElement.videoHeight
		) {
			this.canvas.width = videoElement.videoWidth;
			this.canvas.height = videoElement.videoHeight;
			gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		}

		// Upload video to texture
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			videoElement,
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		// Set attributes
		const positionLocation = gl.getAttribLocation(this.program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

		const texCoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.enableVertexAttribArray(texCoordLocation);
		gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

		// Set uniforms
		const textureLocation = gl.getUniformLocation(this.program, "u_texture");
		gl.uniform1i(textureLocation, 0);

		// Convert hex color to RGB
		const hex = settings.keyColor.replace("#", "");
		const r = parseInt(hex.substr(0, 2), 16) / 255;
		const g = parseInt(hex.substr(2, 2), 16) / 255;
		const b = parseInt(hex.substr(4, 2), 16) / 255;

		const keyColorLocation = gl.getUniformLocation(this.program, "u_keyColor");
		gl.uniform3f(keyColorLocation, r, g, b);

		const similarityLocation = gl.getUniformLocation(
			this.program,
			"u_similarity",
		);
		gl.uniform1f(similarityLocation, settings.similarity);

		const smoothnessLocation = gl.getUniformLocation(
			this.program,
			"u_smoothness",
		);
		gl.uniform1f(smoothnessLocation, settings.smoothness);

		const spillLocation = gl.getUniformLocation(this.program, "u_spill");
		gl.uniform1f(spillLocation, settings.spill);

		const contrastLocation = gl.getUniformLocation(this.program, "u_contrast");
		gl.uniform1f(contrastLocation, settings.contrast);

		const brightnessLocation = gl.getUniformLocation(
			this.program,
			"u_brightness",
		);
		gl.uniform1f(brightnessLocation, settings.brightness);

		// Clear and draw
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		return this.canvas;
	}

	dispose() {
		this.gl.deleteProgram(this.program);
		this.gl.deleteTexture(this.texture);
		this.gl.deleteBuffer(this.positionBuffer);
		this.gl.deleteBuffer(this.texCoordBuffer);
	}
}
