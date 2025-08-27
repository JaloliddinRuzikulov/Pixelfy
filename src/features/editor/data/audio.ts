import { IAudio } from "@designcombo/types";

export const AUDIOS = [
	{
		id: "xxx0",
		details: {
			src: "/media/audio/openai-ceo-on-ai.mp3",
		},
		name: "Open AI",
		type: "audio",
		metadata: {
			author: "Open AI",
		},
	},
	{
		id: "xx1",
		details: {
			src: "/media/audio/dawn-of-change.mp3",
		},
		name: "Dawn of change",
		type: "audio",
		metadata: {
			author: "Roman Senyk",
		},
	},
	{
		id: "xx2",
		details: {
			src: "/media/audio/hope.mp3",
		},
		name: "Hope",
		type: "audio",
		metadata: {
			author: "Hugo Dujardin",
		},
	},
	{
		id: "xx3",
		details: {
			src: "/media/audio/tenderness.mp3",
		},
		name: "Tenderness",
		type: "audio",
		metadata: {
			author: "Benjamin Tissot",
		},
	},
	{
		id: "xx4",
		details: {
			src: "/media/audio/piano-moment.mp3",
		},
		name: "Piano moment",
		type: "audio",
		metadata: {
			author: "Benjamin Tissot",
		},
	},
] as Partial<IAudio>[];
