import fs from "fs/promises";
import { Buffer } from "buffer";

/**
 * Create a minimal valid MP4 file without FFmpeg
 * This creates a very basic MP4 that can be opened by video players
 */
export async function createMinimalMP4(
	outputPath: string,
	width = 1920,
	height = 1080,
	duration = 1,
): Promise<void> {
	// Minimal MP4 structure with required boxes
	const ftyp = Buffer.from([
		0x00,
		0x00,
		0x00,
		0x20, // box size (32 bytes)
		0x66,
		0x74,
		0x79,
		0x70, // 'ftyp'
		0x69,
		0x73,
		0x6f,
		0x6d, // major brand: 'isom'
		0x00,
		0x00,
		0x02,
		0x00, // minor version
		0x69,
		0x73,
		0x6f,
		0x6d, // compatible brands
		0x69,
		0x73,
		0x6f,
		0x32,
		0x61,
		0x76,
		0x63,
		0x31,
		0x6d,
		0x70,
		0x34,
		0x31,
	]);

	// Create mdat box with minimal H.264 data
	const mdatHeader = Buffer.from([
		0x00,
		0x00,
		0x00,
		0x08, // box size (will be updated)
		0x6d,
		0x64,
		0x61,
		0x74, // 'mdat'
	]);

	// Create moov box with minimal metadata
	const moov = createMoovBox(width, height, duration);

	// Combine all boxes
	const mp4Buffer = Buffer.concat([ftyp, mdatHeader, moov]);

	// Write to file
	await fs.writeFile(outputPath, mp4Buffer);
}

function createMoovBox(
	width: number,
	height: number,
	duration: number,
): Buffer {
	// Create minimal moov box structure
	const mvhd = createMvhdBox(duration);
	const trak = createTrakBox(width, height, duration);

	const moovContent = Buffer.concat([mvhd, trak]);

	const moovHeader = Buffer.alloc(8);
	moovHeader.writeUInt32BE(moovContent.length + 8, 0); // box size
	moovHeader.write("moov", 4); // box type

	return Buffer.concat([moovHeader, moovContent]);
}

function createMvhdBox(duration: number): Buffer {
	const mvhd = Buffer.alloc(108);
	mvhd.writeUInt32BE(108, 0); // box size
	mvhd.write("mvhd", 4); // box type
	mvhd.writeUInt8(0, 8); // version
	// Add basic mvhd data
	mvhd.writeUInt32BE(0, 12); // creation time
	mvhd.writeUInt32BE(0, 16); // modification time
	mvhd.writeUInt32BE(1000, 20); // timescale
	mvhd.writeUInt32BE(duration * 1000, 24); // duration
	mvhd.writeUInt32BE(0x00010000, 28); // rate (1.0)
	mvhd.writeUInt16BE(0x0100, 32); // volume (1.0)

	// Matrix values for video transformation
	mvhd.writeUInt32BE(0x00010000, 44); // a
	mvhd.writeUInt32BE(0, 48); // b
	mvhd.writeUInt32BE(0, 52); // u
	mvhd.writeUInt32BE(0, 56); // c
	mvhd.writeUInt32BE(0x00010000, 60); // d
	mvhd.writeUInt32BE(0, 64); // v
	mvhd.writeUInt32BE(0, 68); // x
	mvhd.writeUInt32BE(0, 72); // y
	mvhd.writeUInt32BE(0x40000000, 76); // w

	mvhd.writeUInt32BE(2, 104); // next track ID

	return mvhd;
}

function createTrakBox(
	width: number,
	height: number,
	duration: number,
): Buffer {
	// Create minimal trak box
	const tkhd = createTkhdBox(width, height, duration);
	const mdia = createMdiaBox(width, height, duration);

	const trakContent = Buffer.concat([tkhd, mdia]);

	const trakHeader = Buffer.alloc(8);
	trakHeader.writeUInt32BE(trakContent.length + 8, 0); // box size
	trakHeader.write("trak", 4); // box type

	return Buffer.concat([trakHeader, trakContent]);
}

function createTkhdBox(
	width: number,
	height: number,
	duration: number,
): Buffer {
	const tkhd = Buffer.alloc(92);
	tkhd.writeUInt32BE(92, 0); // box size
	tkhd.write("tkhd", 4); // box type
	tkhd.writeUInt8(0, 8); // version
	tkhd.writeUInt8(0x03, 11); // flags (enabled, in movie)

	tkhd.writeUInt32BE(0, 12); // creation time
	tkhd.writeUInt32BE(0, 16); // modification time
	tkhd.writeUInt32BE(1, 20); // track ID
	tkhd.writeUInt32BE(duration * 1000, 28); // duration

	// Video dimensions
	tkhd.writeUInt32BE(width << 16, 84); // width
	tkhd.writeUInt32BE(height << 16, 88); // height

	return tkhd;
}

function createMdiaBox(
	width: number,
	height: number,
	duration: number,
): Buffer {
	// Create minimal mdia box with required sub-boxes
	const mdhd = Buffer.alloc(32);
	mdhd.writeUInt32BE(32, 0); // box size
	mdhd.write("mdhd", 4); // box type
	mdhd.writeUInt8(0, 8); // version
	mdhd.writeUInt32BE(0, 12); // creation time
	mdhd.writeUInt32BE(0, 16); // modification time
	mdhd.writeUInt32BE(1000, 20); // timescale
	mdhd.writeUInt32BE(duration * 1000, 24); // duration

	const hdlr = Buffer.alloc(45);
	hdlr.writeUInt32BE(45, 0); // box size
	hdlr.write("hdlr", 4); // box type
	hdlr.writeUInt32BE(0, 8); // version and flags
	hdlr.write("vide", 16); // handler type (video)
	hdlr.write("VideoHandler", 32); // name

	const mdiaContent = Buffer.concat([mdhd, hdlr]);

	const mdiaHeader = Buffer.alloc(8);
	mdiaHeader.writeUInt32BE(mdiaContent.length + 8, 0); // box size
	mdiaHeader.write("mdia", 4); // box type

	return Buffer.concat([mdiaHeader, mdiaContent]);
}
