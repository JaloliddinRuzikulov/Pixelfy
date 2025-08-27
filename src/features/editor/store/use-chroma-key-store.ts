import { create } from "zustand";

interface ChromaKeySettings {
	enabled: boolean;
	keyColor: string;
	similarity: number;
	smoothness: number;
	spill: number;
	contrast: number;
	brightness: number;
}

interface ChromaKeyStore {
	chromaKeySettings: Record<string, ChromaKeySettings>;
	setChromaKey: (itemId: string, settings: ChromaKeySettings) => void;
	getChromaKey: (itemId: string) => ChromaKeySettings | undefined;
	removeChromaKey: (itemId: string) => void;
}

export const useChromaKeyStore = create<ChromaKeyStore>((set, get) => ({
	chromaKeySettings: {},

	setChromaKey: (itemId: string, settings: ChromaKeySettings) => {
		set((state) => ({
			chromaKeySettings: {
				...state.chromaKeySettings,
				[itemId]: settings,
			},
		}));
	},

	getChromaKey: (itemId: string) => {
		return get().chromaKeySettings[itemId];
	},

	removeChromaKey: (itemId: string) => {
		set((state) => {
			const newSettings = { ...state.chromaKeySettings };
			delete newSettings[itemId];
			return { chromaKeySettings: newSettings };
		});
	},
}));

export default useChromaKeyStore;
