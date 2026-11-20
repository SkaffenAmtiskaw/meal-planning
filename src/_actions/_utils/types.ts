declare const cacheTagBrand: unique symbol;

/**
 * A Next.js cache tag, built by `plannerCache` or `userCache` in `caches.ts`.
 * The brand keeps a plain string from passing as a tag, so every tag comes from
 * there.
 */
export type CacheTag = string & { readonly [cacheTagBrand]: true };

// The tags a mutation invalidates, which can't be an empty list.
export type CacheTags = readonly [CacheTag, ...CacheTag[]];
