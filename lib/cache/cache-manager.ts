import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
}

interface CacheEntry<T> {
  data: T;
  expires: number;
  tags?: string[];
}

class CacheManager {
  private defaultTTL = 3600; // 1 hour default

  /**
   * Get cached data with callback support
   */
  async get<T>(
    key: string,
    callback?: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T | null> {
    try {
      const cached = await redis.get<CacheEntry<T>>(key);
      
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }

      // If callback provided and cache miss, execute and cache result
      if (callback) {
        const data = await callback();
        await this.set(key, data, options);
        return data;
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      // If cache fails, execute callback if provided
      if (callback) {
        return await callback();
      }
      return null;
    }
  }

  /**
   * Set cached data with TTL and tags
   */
  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const entry: CacheEntry<T> = {
        data,
        expires: Date.now() + (ttl * 1000),
        tags: options.tags,
      };

      await redis.set(key, entry, { ex: ttl });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear cache by pattern
   */
  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        // Clear all cache (use with caution)
        const keys = await redis.keys('*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Clear cache by tags
   */
  async clearByTags(tags: string[]): Promise<void> {
    try {
      // This is a simplified implementation
      // In a production system, you'd want to maintain a tag-to-key mapping
      for (const tag of tags) {
        const pattern = `*:${tag}:*`;
        await this.clear(pattern);
      }
    } catch (error) {
      console.error('Cache clear by tags error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number; memory: string }> {
    try {
      const info = await redis.info('memory');
      const keys = await redis.dbsize();
      
      return {
        keys,
        memory: info,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { keys: 0, memory: 'Unknown' };
    }
  }
}

export const cache = new CacheManager();
export default cache;
