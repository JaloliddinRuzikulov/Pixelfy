import { CacheManager } from "@/lib/cache-manager";

describe("CacheManager", () => {
	let cache: CacheManager<any>;

	beforeEach(() => {
		cache = new CacheManager({
			maxSizeMB: 1, // 1MB for testing
			ttlMinutes: 1, // 1 minute TTL
			maxEntries: 5,
		});
	});

	afterEach(() => {
		cache.destroy();
	});

	describe("Basic operations", () => {
		it("should store and retrieve items", () => {
			cache.set("test-key", { data: "test-value" });
			const result = cache.get("test-key");

			expect(result).toEqual({ data: "test-value" });
		});

		it("should return null for non-existent keys", () => {
			const result = cache.get("non-existent");

			expect(result).toBeNull();
		});

		it("should delete items", () => {
			cache.set("test-key", "test-value");
			const deleted = cache.delete("test-key");

			expect(deleted).toBe(true);
			expect(cache.get("test-key")).toBeNull();
		});

		it("should clear all items", () => {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			cache.clear();

			expect(cache.get("key1")).toBeNull();
			expect(cache.get("key2")).toBeNull();
			expect(cache.getStats().entries).toBe(0);
		});
	});

	describe("Size management", () => {
		it("should respect max entries limit", () => {
			// Set 6 items (max is 5)
			for (let i = 0; i < 6; i++) {
				cache.set(`key${i}`, `value${i}`);
			}

			const stats = cache.getStats();
			expect(stats.entries).toBeLessThanOrEqual(5);
		});

		it("should evict items when size limit is exceeded", () => {
			// Create a large object (approximately 500KB)
			const largeObject = "x".repeat(500 * 1024);

			cache.set("large1", largeObject);
			cache.set("large2", largeObject);
			cache.set("large3", largeObject); // This should trigger eviction

			const stats = cache.getStats();
			// Total size should not exceed 1MB
			expect(stats.totalSize).toBeLessThanOrEqual(1024 * 1024);
		});

		it("should reject items larger than max cache size", () => {
			// Try to add 2MB object to 1MB cache
			const hugeObject = "x".repeat(2 * 1024 * 1024);

			// Should warn but not throw
			const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
			cache.set("huge", hugeObject);

			expect(consoleSpy).toHaveBeenCalled();
			expect(cache.get("huge")).toBeNull();

			consoleSpy.mockRestore();
		});
	});

	describe("TTL and expiration", () => {
		it("should expire items after TTL", () => {
			jest.useFakeTimers();

			cache.set("expiring", "value");

			// Fast forward 2 minutes (TTL is 1 minute)
			jest.advanceTimersByTime(2 * 60 * 1000);

			expect(cache.get("expiring")).toBeNull();

			jest.useRealTimers();
		});

		it("should update access time on get", () => {
			cache.set("test", "value");
			const stats1 = cache.getStats();

			// Wait a bit
			jest.useFakeTimers();
			jest.advanceTimersByTime(100);

			cache.get("test");

			// Access count should increase
			expect(cache.get("test")).toBe("value");

			jest.useRealTimers();
		});
	});

	describe("Statistics", () => {
		it("should provide accurate statistics", () => {
			cache.set("key1", "value1");
			cache.set("key2", "value2");

			const stats = cache.getStats();

			expect(stats.entries).toBe(2);
			expect(stats.totalSize).toBeGreaterThan(0);
			expect(stats.utilizationPercent).toBeGreaterThan(0);
			expect(stats.utilizationPercent).toBeLessThanOrEqual(100);
		});

		it("should track most accessed entry", () => {
			cache.set("popular", "value");
			cache.set("unpopular", "value");

			// Access popular item multiple times
			cache.get("popular");
			cache.get("popular");
			cache.get("popular");

			const stats = cache.getStats();
			expect(stats.mostAccessedEntry).toBe("popular");
		});
	});

	describe("Eviction strategy", () => {
		it("should evict least recently used items", () => {
			// Fill cache to limit
			for (let i = 0; i < 5; i++) {
				cache.set(`key${i}`, `value${i}`);
			}

			// Access some items to make them "hot"
			cache.get("key2");
			cache.get("key3");
			cache.get("key4");

			// Add new item, should evict least recently used
			cache.set("new", "value");

			// key0 or key1 should be evicted (not accessed)
			const hasKey0 = cache.get("key0") !== null;
			const hasKey1 = cache.get("key1") !== null;
			const hasKey2 = cache.get("key2") !== null;
			const hasKey3 = cache.get("key3") !== null;

			// At least one of the unaccessed items should be evicted
			expect(hasKey0 && hasKey1).toBe(false);
			// Accessed items should still be there
			expect(hasKey2).toBe(true);
			expect(hasKey3).toBe(true);
		});
	});

	describe("Special data types", () => {
		it("should handle Blob objects", () => {
			const blob = new Blob(["test data"], { type: "text/plain" });
			cache.set("blob", blob);

			const retrieved = cache.get("blob");
			expect(retrieved).toBeInstanceOf(Blob);
		});

		it("should handle ArrayBuffer objects", () => {
			const buffer = new ArrayBuffer(8);
			cache.set("buffer", buffer);

			const retrieved = cache.get("buffer");
			expect(retrieved).toBeInstanceOf(ArrayBuffer);
		});

		it("should handle string data", () => {
			const longString = "x".repeat(1000);
			cache.set("string", longString);

			const retrieved = cache.get("string");
			expect(retrieved).toBe(longString);
		});
	});
});
