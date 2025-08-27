/**
 * Optimized cache manager with automatic memory management
 * Prevents memory leaks and implements LRU eviction
 */

interface CacheEntry<T> {
	data: T;
	size: number;
	timestamp: number;
	lastAccess: number;
	accessCount: number;
}

interface CacheOptions {
	maxSizeMB?: number;
	ttlMinutes?: number;
	maxEntries?: number;
	onEvict?: (key: string, entry: CacheEntry<any>) => void;
}

export class CacheManager<T = any> {
	private cache = new Map<string, CacheEntry<T>>();
	private totalSize = 0;
	private readonly maxSize: number;
	private readonly ttl: number;
	private readonly maxEntries: number;
	private cleanupTimer?: NodeJS.Timeout;
	private readonly onEvict?: (key: string, entry: CacheEntry<T>) => void;

	constructor(options: CacheOptions = {}) {
		this.maxSize = (options.maxSizeMB || 100) * 1024 * 1024; // Convert MB to bytes
		this.ttl = (options.ttlMinutes || 30) * 60 * 1000; // Convert minutes to ms
		this.maxEntries = options.maxEntries || 1000;
		this.onEvict = options.onEvict;

		// Start periodic cleanup
		this.startCleanupTimer();
	}

	/**
	 * Get item from cache
	 */
	get(key: string): T | null {
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		// Check if expired
		if (this.isExpired(entry)) {
			this.delete(key);
			return null;
		}

		// Update access info
		entry.lastAccess = Date.now();
		entry.accessCount++;

		return entry.data;
	}

	/**
	 * Set item in cache with size calculation
	 */
	set(key: string, data: T, sizeBytes?: number): void {
		// Calculate size if not provided
		const size = sizeBytes || this.estimateSize(data);

		// Check if single item exceeds max size
		if (size > this.maxSize) {
			console.warn(
				`Cache item ${key} exceeds max size (${size} > ${this.maxSize})`,
			);
			return;
		}

		// Evict items if necessary
		this.evictIfNeeded(size);

		// Remove old entry if exists
		if (this.cache.has(key)) {
			this.delete(key);
		}

		// Add new entry
		const entry: CacheEntry<T> = {
			data,
			size,
			timestamp: Date.now(),
			lastAccess: Date.now(),
			accessCount: 1,
		};

		this.cache.set(key, entry);
		this.totalSize += size;
	}

	/**
	 * Delete item from cache
	 */
	delete(key: string): boolean {
		const entry = this.cache.get(key);

		if (!entry) {
			return false;
		}

		// Call eviction callback if provided
		if (this.onEvict) {
			this.onEvict(key, entry);
		}

		this.totalSize -= entry.size;
		return this.cache.delete(key);
	}

	/**
	 * Clear entire cache
	 */
	clear(): void {
		// Call eviction callbacks
		if (this.onEvict) {
			this.cache.forEach((entry, key) => {
				this.onEvict!(key, entry);
			});
		}

		this.cache.clear();
		this.totalSize = 0;
	}

	/**
	 * Get cache statistics
	 */
	getStats() {
		return {
			entries: this.cache.size,
			totalSize: this.totalSize,
			maxSize: this.maxSize,
			utilizationPercent: (this.totalSize / this.maxSize) * 100,
			oldestEntry: this.getOldestEntry(),
			mostAccessedEntry: this.getMostAccessedEntry(),
		};
	}

	/**
	 * Destroy cache and cleanup
	 */
	destroy(): void {
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
		}
		this.clear();
	}

	// Private methods

	private evictIfNeeded(requiredSize: number): void {
		// Check entry count limit
		while (this.cache.size >= this.maxEntries) {
			const oldest = this.getOldestEntry();
			if (oldest) {
				this.delete(oldest);
			}
		}

		// Check size limit
		while (
			this.totalSize + requiredSize > this.maxSize &&
			this.cache.size > 0
		) {
			const victim = this.selectEvictionVictim();
			if (victim) {
				this.delete(victim);
			} else {
				break;
			}
		}
	}

	private selectEvictionVictim(): string | null {
		let victim: string | null = null;
		let lowestScore = Infinity;

		const now = Date.now();

		for (const [key, entry] of this.cache) {
			// Calculate eviction score (lower = more likely to evict)
			// Consider: age, access frequency, and recency
			const age = now - entry.timestamp;
			const recency = now - entry.lastAccess;
			const frequency = entry.accessCount;

			// Score formula: frequency / (age * recency)
			// Lower score = less valuable, should evict
			const score = (frequency * 1000) / ((age + 1) * (recency + 1));

			if (score < lowestScore) {
				lowestScore = score;
				victim = key;
			}
		}

		return victim;
	}

	private getOldestEntry(): string | null {
		let oldest: string | null = null;
		let oldestTime = Infinity;

		for (const [key, entry] of this.cache) {
			if (entry.timestamp < oldestTime) {
				oldestTime = entry.timestamp;
				oldest = key;
			}
		}

		return oldest;
	}

	private getMostAccessedEntry(): string | null {
		let mostAccessed: string | null = null;
		let maxAccess = 0;

		for (const [key, entry] of this.cache) {
			if (entry.accessCount > maxAccess) {
				maxAccess = entry.accessCount;
				mostAccessed = key;
			}
		}

		return mostAccessed;
	}

	private isExpired(entry: CacheEntry<T>): boolean {
		return Date.now() - entry.timestamp > this.ttl;
	}

	private estimateSize(data: any): number {
		// Rough estimation of object size in bytes
		if (data instanceof Blob) {
			return data.size;
		}

		if (data instanceof ArrayBuffer) {
			return data.byteLength;
		}

		if (typeof data === "string") {
			return data.length * 2; // UTF-16 encoding
		}

		// For objects, use JSON stringify (not perfect but reasonable)
		try {
			return JSON.stringify(data).length * 2;
		} catch {
			return 1024; // Default 1KB for unknown types
		}
	}

	private startCleanupTimer(): void {
		// Run cleanup every minute
		this.cleanupTimer = setInterval(() => {
			this.cleanup();
		}, 60000);

		// Prevent timer from keeping process alive
		if (this.cleanupTimer.unref) {
			this.cleanupTimer.unref();
		}
	}

	private cleanup(): void {
		const now = Date.now();
		const keysToDelete: string[] = [];

		for (const [key, entry] of this.cache) {
			if (this.isExpired(entry)) {
				keysToDelete.push(key);
			}
		}

		keysToDelete.forEach((key) => this.delete(key));

		if (keysToDelete.length > 0) {
			console.log(
				`Cache cleanup: removed ${keysToDelete.length} expired entries`,
			);
		}
	}
}

// Singleton instances for different cache types
export const thumbnailCache = new CacheManager({
	maxSizeMB: 50,
	ttlMinutes: 60,
	maxEntries: 500,
});

export const audioCache = new CacheManager({
	maxSizeMB: 100,
	ttlMinutes: 30,
	maxEntries: 100,
});

export const frameCache = new CacheManager({
	maxSizeMB: 200,
	ttlMinutes: 15,
	maxEntries: 1000,
});

// Cleanup on page unload
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		thumbnailCache.destroy();
		audioCache.destroy();
		frameCache.destroy();
	});
}
