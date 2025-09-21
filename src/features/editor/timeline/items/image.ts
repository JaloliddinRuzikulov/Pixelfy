import {
	Resizable,
	ResizableProps,
	Pattern,
	util,
	Control,
} from "@designcombo/timeline";
import { createResizeControls } from "../controls";

interface ImageProps extends ResizableProps {
	src: string;
}

class Image extends Resizable {
	static type = "Image";

	static createControls() {
		return createResizeControls();
	}
	public src: string;
	public hasSrc = true;
	public id: string = "";
	public height: number = 0;
	public display: any;
	public tScale: any;
	public canvas: any;
	public hasControls = true;
	public selectable = true;
	public evented = true;
	public hoverCursor = "move";
	public moveCursor = "move";
	public cornerSize = 12;
	public borderColor = "rgba(0, 216, 214, 1)";
	public cornerColor = "rgba(0, 216, 214, 1)";

	constructor(props: ImageProps) {
		super(props);
		console.log("Image constructor called with props:", props);
		this.id = props.id;
		this.src = props.src;

		console.log("Image constructor - src set to:", this.src);

		// Defensive programming for display property
		this.display = props.display || { from: 0, to: 5000 };

		this.tScale = props.tScale;

		// Set up resize controls
		this.controls = Image.createControls().controls;

		// Async load image
		if (this.src) {
			this.loadImage().catch(console.error);
		} else {
			console.warn("Image constructor - no src provided in props");
		}
	}

	public _render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
		this.updateSelected(ctx);
	}

	public updateSelected(ctx: CanvasRenderingContext2D) {
		// Update selected state visual feedback if needed
	}

	public loadImage() {
		if (!this.src) {
			console.warn("Image loadImage called but no src provided");
			return;
		}

		console.log("Loading image:", this.src);
		return new Promise<void>((resolve, reject) => {
			const img = new window.Image();
			img.crossOrigin = "anonymous";
			img.onload = () => {
				try {
					console.log("Image loaded successfully:", this.src);
					console.log("Image dimensions:", img.width, "x", img.height);
					console.log("Rect dimensions:", this.width, "x", this.height);

					// Calculate scale to fit height while maintaining aspect ratio
					const imgHeight = img.height;
					const imgWidth = img.width;
					const rectHeight = this.height;
					const rectWidth = this.width;

					// Scale to fit the rectangle height
					const scaleY = rectHeight / imgHeight;
					const scaledWidth = imgWidth * scaleY;

					// Center the image if it's smaller than rectangle width
					const offsetX = scaledWidth < rectWidth ? (rectWidth - scaledWidth) / 2 : 0;

					console.log("Calculated scale and offset:", { scaleY, scaledWidth, offsetX });

					const pattern = new Pattern({
						source: img,
						repeat: "no-repeat",
						patternTransform: [scaleY, 0, 0, scaleY, offsetX, 0],
					});

					console.log("Created pattern:", pattern);

					if (this.set) {
						this.set("fill", pattern);
						console.log("Pattern set as fill");
					} else {
						console.warn("this.set method not available");
					}

					// Force canvas re-render
					requestAnimationFrame(() => {
						this.canvas?.requestRenderAll();
						console.log("Canvas render requested");
					});

					resolve();
				} catch (error) {
					console.error("Error creating pattern:", error);
					reject(error);
				}
			};

			img.onerror = (error) => {
				console.error("Error loading image:", error);
				reject(error);
			};

			img.src = this.src;
		});
	}

	public async setSrc(src: string) {
		this.src = src;
		try {
			await this.loadImage();
		} catch (error) {
			console.error("Failed to load image:", error);
		}
	}

	public _render(ctx: CanvasRenderingContext2D) {
		console.log("Image _render called with src:", this.src);
		console.log("Image fill:", this.fill);

		// Call parent render
		super._render(ctx);

		// Additional custom rendering if needed
		if (!this.fill || typeof this.fill === 'string') {
			console.log("No pattern fill detected, rendering placeholder");
			// Render placeholder or background color
			ctx.save();
			ctx.translate(-this.width / 2, -this.height / 2);
			ctx.fillStyle = '#f0f0f0';
			ctx.fillRect(0, 0, this.width, this.height);

			// Add image icon placeholder
			ctx.fillStyle = '#999';
			ctx.font = '12px Arial';
			ctx.textAlign = 'center';
			ctx.fillText('IMG', this.width / 2, this.height / 2);
			ctx.restore();
		}
	}
}

// Register the class with Fabric.js
if (typeof window !== "undefined") {
	const fabric = (window as any).fabric;
	if (fabric && fabric.Object) {
		fabric.Object.customProperties = fabric.Object.customProperties || [];
		fabric.Object.customProperties.push("Image");
		(fabric as any).Image = Image;
	}
}

export default Image;
