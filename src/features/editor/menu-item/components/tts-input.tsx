"use client";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Languages, ChevronDown, ChevronUp, Loader2, Mic2 } from "lucide-react";

interface TTSSettings {
	ttsMethod: string;
	ttsModel: string;
	ttsLanguage: string;
}

interface TTSInputProps {
	text: string;
	onTextChange: (text: string) => void;
	settings: TTSSettings;
	onSettingsChange: (settings: Partial<TTSSettings>) => void;
}

interface Language {
	code: string;
	name: string;
	flag: string;
}

interface TTSMethod {
	value: string;
	label: string;
	icon: string;
	quality?: string;
}

interface VoiceModel {
	value: string;
	label: string;
	gender: string;
	disabled?: boolean;
}

interface TTSConfig {
	languages: Language[];
	tts_methods_by_language: Record<string, TTSMethod[]>;
	voice_models_by_language: Record<string, Record<string, VoiceModel[]>>;
}

// Default fallback data
const DEFAULT_CONFIG: TTSConfig = {
	languages: [
		{ code: "uz", name: "O'zbekcha", flag: "🇺🇿" },
		{ code: "en", name: "English", flag: "🇺🇸" },
		{ code: "ru", name: "Русский", flag: "🇷🇺" },
	],
	tts_methods_by_language: {
		uz: [
			{ value: "aisha", label: "Aisha", icon: "🎙️", quality: "high" },
			{ value: "azure", label: "Azure", icon: "☁️", quality: "high" },
			{ value: "espeak", label: "Espeak", icon: "⚡", quality: "low" },
		],
		en: [
			{ value: "google", label: "Google", icon: "🔊", quality: "high" },
			{ value: "azure", label: "Azure", icon: "☁️", quality: "high" },
			{ value: "espeak", label: "Espeak", icon: "⚡", quality: "low" },
		],
		ru: [
			{ value: "google", label: "Google", icon: "🔊", quality: "high" },
			{ value: "azure", label: "Azure", icon: "☁️", quality: "high" },
			{ value: "espeak", label: "Espeak", icon: "⚡", quality: "low" },
		],
	},
	voice_models_by_language: {
		uz: {
			aisha: [
				{ value: "gulnoza", label: "Gulnoza", gender: "♀", disabled: false },
			],
			azure: [
				{ value: "uz-UZ-MadinaNeural", label: "Madina", gender: "♀", disabled: false },
				{ value: "uz-UZ-SardorNeural", label: "Sardor", gender: "♂", disabled: false },
			],
		},
		en: {
			google: [
				{ value: "en-US-Neural2-C", label: "Neural2-C", gender: "♀" },
				{ value: "en-US-Neural2-D", label: "Neural2-D", gender: "♂" },
				{ value: "en-US-Neural2-E", label: "Neural2-E", gender: "♀" },
				{ value: "en-US-Neural2-I", label: "Neural2-I", gender: "♂" },
			],
			azure: [
				{ value: "en-US-AvaNeural", label: "Ava", gender: "♀" },
				{ value: "en-US-AndrewNeural", label: "Andrew", gender: "♂" },
				{ value: "en-US-JennyNeural", label: "Jenny", gender: "♀" },
				{ value: "en-US-GuyNeural", label: "Guy", gender: "♂" },
			],
		},
		ru: {
			google: [
				{ value: "ru-RU-Wavenet-A", label: "Wavenet-A", gender: "♀" },
				{ value: "ru-RU-Wavenet-B", label: "Wavenet-B", gender: "♂" },
				{ value: "ru-RU-Wavenet-C", label: "Wavenet-C", gender: "♀" },
				{ value: "ru-RU-Wavenet-D", label: "Wavenet-D", gender: "♂" },
			],
			azure: [
				{ value: "ru-RU-SvetlanaNeural", label: "Svetlana", gender: "♀" },
				{ value: "ru-RU-DariyaNeural", label: "Dariya", gender: "♀" },
				{ value: "ru-RU-DmitryNeural", label: "Dmitry", gender: "♂" },
			],
		},
	},
};

export default function TTSInput({
	text,
	onTextChange,
	settings,
	onSettingsChange,
}: TTSInputProps) {
	const [config, setConfig] = useState<TTSConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	// Fetch TTS config from backend
	useEffect(() => {
		const fetchConfig = async () => {
			try {
				const response = await fetch("/api/lipsync/tts-config");
				if (response.ok) {
					const data = await response.json();
					setConfig(data);
					setHasError(false);
				} else {
					setHasError(true);
				}
			} catch (error) {
				console.error("Failed to fetch TTS config:", error);
				setHasError(true);
			} finally {
				setIsLoading(false);
			}
		};

		fetchConfig();
	}, []);

	// Show loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Show error state
	if (hasError || !config) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
				<div className="text-4xl">🔧</div>
				<div className="space-y-1">
					<p className="text-sm font-medium">
						{settings.ttsLanguage === "uz"
							? "Tizimda profilaktika ishlari olib borilmoqda"
							: settings.ttsLanguage === "ru"
								? "В системе проводятся профилактические работы"
								: "System maintenance in progress"}
					</p>
					<p className="text-xs text-muted-foreground">
						{settings.ttsLanguage === "uz"
							? "Iltimos, keyinroq qayta urinib ko'ring"
							: settings.ttsLanguage === "ru"
								? "Пожалуйста, попробуйте позже"
								: "Please try again later"}
					</p>
				</div>
			</div>
		);
	}

	const selectedLanguage =
		config.languages.find((lang) => lang.code === settings.ttsLanguage) ||
		config.languages[0];

	// Get available TTS methods for current language
	const availableTTSMethods =
		config.tts_methods_by_language[settings.ttsLanguage] ||
		config.tts_methods_by_language.uz;

	// Get available voices for current language and TTS method
	const availableVoices =
		config.voice_models_by_language[settings.ttsLanguage]?.[
			settings.ttsMethod
		] || [];

	const getPlaceholder = () => {
		switch (settings.ttsLanguage) {
			case "uz":
				return "Matn yozing va ovozga aylantiring...";
			case "en":
				return "Type text to convert to speech...";
			case "ru":
				return "Введите текст для озвучivания...";
			default:
				return "Type your text here...";
		}
	};

	return (
		<div className="space-y-3">
			{/* Text Input */}
			<div className="space-y-2">
				<Textarea
					value={text}
					onChange={(e) => onTextChange(e.target.value)}
					placeholder={getPlaceholder()}
					rows={6}
					className="w-full resize-none text-sm"
				/>
				<div className="flex items-center justify-end">
					<span className="text-xs text-muted-foreground">
						{text.length}{" "}
						{settings.ttsLanguage === "uz"
							? "belgi"
							: settings.ttsLanguage === "ru"
								? "символов"
								: "characters"}
					</span>
				</div>
			</div>

			{/* Settings - Side by Side */}
			<div className="grid grid-cols-2 gap-2">
				{/* Language */}
				<div>
					<Select
						value={settings.ttsLanguage}
						onValueChange={(value) => {
							// Get available TTS methods for new language
							const newTTSMethods = config.tts_methods_by_language[value];
							const recommendedMethod =
								newTTSMethods?.find((m) => m.recommended) || newTTSMethods?.[0];

							// Get first available voice model for the recommended method
							const newVoiceModels =
								config.voice_models_by_language[value]?.[
									recommendedMethod?.value || "google"
								];
							const firstVoice = newVoiceModels?.[0];

							// Update all settings at once
							onSettingsChange({
								ttsLanguage: value,
								ttsMethod: recommendedMethod?.value || "google",
								ttsModel: firstVoice?.value || "",
							});
						}}
					>
						<SelectTrigger className="h-8">
							<SelectValue>
								<div className="flex items-center gap-2">
									<Languages className="w-3.5 h-3.5 text-muted-foreground" />
									<span className="text-base">{selectedLanguage.flag}</span>
									<span>{selectedLanguage.name}</span>
								</div>
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{config.languages.map((lang) => (
								<SelectItem key={lang.code} value={lang.code}>
									<div className="flex items-center gap-2">
										<span className="text-base">{lang.flag}</span>
										<span>{lang.name}</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Voice */}
				<div>
					<Select
						value={`${settings.ttsMethod}:${settings.ttsModel}`}
						onValueChange={(value) => {
							const [method, model] = value.split(":");
							onSettingsChange({
								ttsMethod: method,
								ttsModel: model,
							});
						}}
					>
						<SelectTrigger className="h-8">
							<SelectValue>
								<div className="flex items-center gap-2">
									<Mic2 className="w-3.5 h-3.5 text-muted-foreground" />
									<span>
										{availableVoices.find((v) => v.value === settings.ttsModel)
											?.gender || "♀"}
									</span>
									<span>
										{availableVoices.find((v) => v.value === settings.ttsModel)
											?.label || settings.ttsModel}
									</span>
								</div>
							</SelectValue>
						</SelectTrigger>
						<SelectContent className="max-h-96">
							{availableTTSMethods.map((method) => {
								const methodVoices =
									config.voice_models_by_language[settings.ttsLanguage]?.[
										method.value
									] || [];

								if (methodVoices.length === 0) {
									// Show method without voices
									return (
										<SelectItem
											key={method.value}
											value={`${method.value}:`}
											className="font-medium"
										>
											<div className="flex items-center gap-2">
												<span>{method.icon}</span>
												<span>{method.label}</span>
												{method.recommended && (
													<span className="text-xs text-primary">★</span>
												)}
											</div>
										</SelectItem>
									);
								}

								// Show method as group with voices
								return (
									<div key={method.value}>
										{/* Group Header */}
										<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 flex items-center gap-2">
											<span>{method.icon}</span>
											<span>{method.label}</span>
											{method.recommended && (
												<span className="text-primary">★</span>
											)}
										</div>
										{/* Group Items */}
										{methodVoices.map((voice) => (
											<SelectItem
												key={`${method.value}:${voice.value}`}
												value={`${method.value}:${voice.value}`}
												disabled={voice.disabled}
												className="pl-8"
											>
												<div className="flex items-center gap-2">
													<span>{voice.gender}</span>
													<span>{voice.label}</span>
												</div>
											</SelectItem>
										))}
									</div>
								);
							})}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
