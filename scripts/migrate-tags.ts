/**
 * Data Migration Script: JSON Tags → Relational Tags
 * 
 * This script migrates existing JSON tags from the articles table
 * to the new relational tags and article_tags tables.
 * 
 * Usage: npx tsx scripts/migrate-tags.ts
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { articles, tags, articleTags } from '../src/db/schema';
import { sql } from 'drizzle-orm';

// Helper to create slug from name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

async function migrateTags() {
  console.log('🚀 Starting tag migration...');
  
  const sqlite = new Database(process.env.DB_FILE_NAME || './sqlite.db');
  const db = drizzle(sqlite);

  try {
    // 1. Get all articles with JSON tags
    console.log('\n📖 Reading existing articles with tags...');
    const articlesWithTags = await db
      .select({
        id: articles.id,
        tags: articles.tags,
      })
      .from(articles)
      .where(sql`${articles.tags} IS NOT NULL`);

    console.log(`Found ${articlesWithTags.length} articles with tags`);

    if (articlesWithTags.length === 0) {
      console.log('✅ No articles with tags found. Migration complete.');
      return;
    }

    // 2. Parse JSON tags and collect unique tag names
    const tagMap = new Map<string, { name: string; slug: string }>();
    const articleTagPairs: { articleId: string; tagName: string }[] = [];

    for (const article of articlesWithTags) {
      try {
        const parsedTags = JSON.parse(article.tags || '[]');
        if (Array.isArray(parsedTags)) {
          for (const tagName of parsedTags) {
            if (typeof tagName === 'string' && tagName.trim()) {
              const name = tagName.trim().slice(0, 50);
              const slug = slugify(name);
              
              if (slug) {
                tagMap.set(slug, { name, slug });
                articleTagPairs.push({ articleId: article.id, tagName: name });
              }
            }
          }
        }
      } catch (e) {
        console.warn(`⚠️  Failed to parse tags for article ${article.id}:`, e);
      }
    }

    console.log(`\n🏷️  Found ${tagMap.size} unique tags`);
    console.log(`🔗 Found ${articleTagPairs.length} article-tag associations`);

    // 3. Insert unique tags into tags table
    console.log('\n💾 Inserting tags into database...');
    const uniqueTags = Array.from(tagMap.values());
    
    if (uniqueTags.length > 0) {
      // Use INSERT OR IGNORE to skip duplicates
      const insertTag = sqlite.prepare(`
        INSERT OR IGNORE INTO tags (id, name, slug, created_at)
        VALUES (lower(hex(randomblob(16))), ?, ?, ?)
      `);

      const now = Math.floor(Date.now() / 1000);
      
      const insertMany = sqlite.transaction((tagsList: typeof uniqueTags) => {
        for (const tag of tagsList) {
          insertTag.run(tag.name, tag.slug, now);
        }
      });

      insertMany(uniqueTags);
      console.log(`✅ Inserted ${uniqueTags.length} tags`);
    }

    // 4. Get all tags with their IDs for creating junction entries
    console.log('\n📖 Reading inserted tags...');
    const allTags = await db.select().from(tags);
    const tagIdMap = new Map(allTags.map((t) => [t.slug, t.id]));

    // 5. Create article_tags junction entries
    console.log('\n🔗 Creating article-tag associations...');
    const junctionEntries: { articleId: string; tagId: string }[] = [];

    for (const pair of articleTagPairs) {
      const slug = slugify(pair.tagName);
      const tagId = tagIdMap.get(slug);
      
      if (tagId) {
        junctionEntries.push({
          articleId: pair.articleId,
          tagId,
        });
      }
    }

    // Remove duplicates
    const uniquePairs = new Map<string, { articleId: string; tagId: string }>();
    for (const entry of junctionEntries) {
      const key = `${entry.articleId}-${entry.tagId}`;
      uniquePairs.set(key, entry);
    }

    if (uniquePairs.size > 0) {
      const insertJunction = sqlite.prepare(`
        INSERT OR IGNORE INTO article_tags (article_id, tag_id)
        VALUES (?, ?)
      `);

      const insertManyJunction = sqlite.transaction((entries: typeof junctionEntries) => {
        for (const entry of entries) {
          insertJunction.run(entry.articleId, entry.tagId);
        }
      });

      insertManyJunction(Array.from(uniquePairs.values()));
      console.log(`✅ Created ${uniquePairs.size} article-tag associations`);
    }

    // 6. Verify migration
    console.log('\n🔍 Verifying migration...');
    const tagCount = await db.select({ count: sql<number>`count(*)` }).from(tags);
    const junctionCount = await db.select({ count: sql<number>`count(*)` }).from(articleTags);
    
    console.log(`📊 Tags in database: ${tagCount[0].count}`);
    console.log(`📊 Article-tag associations: ${junctionCount[0].count}`);

    // Sample check: Compare first few articles
    console.log('\n📝 Sample verification (first 3 articles):');
    const sampleArticles = await db
      .select({
        id: articles.id,
        jsonTags: articles.tags,
      })
      .from(articles)
      .limit(3);

    for (const article of sampleArticles) {
      const dbTags = await db
        .select({ name: tags.name })
        .from(articleTags)
        .innerJoin(tags, sql`${articleTags.tagId} = ${tags.id}`)
        .where(sql`${articleTags.articleId} = ${article.id}`);

      const jsonTags = JSON.parse(article.jsonTags || '[]');
      console.log(`\n  Article ${article.id.slice(0, 8)}...`);
      console.log(`    JSON tags: ${JSON.stringify(jsonTags)}`);
      console.log(`    DB tags:   ${JSON.stringify(dbTags.map((t) => t.name))}`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  NOTE: The JSON tags column in articles table has been kept as backup.');
    console.log('   You can remove it after verifying the migration.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrateTags();
}

export { migrateTags };
