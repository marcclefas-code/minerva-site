#!/usr/bin/env node
/**
 * Minerva Directus Setup Script
 * 
 * This script creates the required collections in Directus for the Minerva website.
 * Run with: node setup-directus.js
 * 
 * Prerequisites:
 * - Directus instance running
 * - ADMIN authentication token set in DIRECTUS_TOKEN env var
 * - DIRECTUS_URL set in env (e.g., https://directus.yourdomain.com)
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://directus.yourdomain.com';
const TOKEN = process.env.DIRECTUS_TOKEN;

if (!TOKEN) {
  console.error('ERROR: DIRECTUS_TOKEN environment variable is required');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

async function createCollection(data) {
  const res = await fetch(`${DIRECTUS_URL}/collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  return res.json();
}

async function createField(collection, data) {
  const res = await fetch(`${DIRECTUS_URL}/fields/${collection}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  return res.json();
}

async function updateCollection(collection, data) {
  const res = await fetch(`${DIRECTUS_URL}/collections/${collection}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data)
  });
  return res.json();
}

async function createPreset(data) {
  const res = await fetch(`${DIRECTUS_URL}/presets`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  return res.json();
}

async function setup() {
  console.log('Setting up Minerva Directus collections...\n');

  // 1. Create languages collection
  console.log('1. Creating languages collection...');
  try {
    await createCollection({
      collection: 'languages',
      fields: [
        { field: 'code', type: 'string', primary_key: true, meta: { special: 'cast-notnull' } },
        { field: 'name', type: 'string' },
        { field: 'direction', type: 'string' }
      ]
    });
    console.log('   ✓ languages collection created');
  } catch (e) {
    console.log('   - languages collection may already exist');
  }

  // Seed languages
  const languages = [
    { code: 'en-US', name: 'English', direction: 'ltr' },
    { code: 'nl-NL', name: 'Nederlands', direction: 'ltr' },
    { code: 'fr-FR', name: 'Français', direction: 'ltr' },
    { code: 'de-DE', name: 'Deutsch', direction: 'ltr' },
    { code: 'it-IT', name: 'Italiano', direction: 'ltr' },
    { code: 'es-ES', name: 'Español', direction: 'ltr' },
    { code: 'zh-CN', name: '中文', direction: 'ltr' },
    { code: 'ja-JP', name: '日本語', direction: 'ltr' }
  ];

  for (const lang of languages) {
    try {
      await fetch(`${DIRECTUS_URL}/items/languages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(lang)
      });
    } catch (e) {
      // Ignore duplicates
    }
  }
  console.log('   ✓ Languages seeded\n');

  // 2. Create site_settings singleton
  console.log('2. Creating site_settings collection...');
  try {
    await createCollection({
      collection: 'site_settings',
      singleton: true,
      fields: [
        {
          field: 'translations',
          type: 'translation',
          meta: {
            special: 'translations',
            translation_translations_collection: 'site_settings_translations'
          }
        }
      ]
    });

    await createCollection({
      collection: 'site_settings_translations',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'site_settings_id', type: 'integer', meta: { relational_key: true } },
        { field: 'languages_code', type: 'string', meta: { special: 'm2o' } },
        { field: 'nav_about', type: 'string' },
        { field: 'nav_history', type: 'string' },
        { field: 'nav_aegis', type: 'string' },
        { field: 'nav_sovereign', type: 'string' },
        { field: 'nav_news', type: 'string' },
        { field: 'footer_legal', type: 'text' },
        { field: 'gdpr_accept', type: 'string' },
        { field: 'gdpr_reject', type: 'string' },
        { field: 'gdpr_message', type: 'text' },
        { field: 'subscribe_cta', type: 'string' },
        { field: 'subscribe_placeholder', type: 'string' },
        { field: 'subscribe_thanks', type: 'string' }
      ]
    });
    console.log('   ✓ site_settings collection created\n');
  } catch (e) {
    console.log('   - site_settings may already exist\n');
  }

  // 3. Create pages collection
  console.log('3. Creating pages collection...');
  try {
    await createCollection({
      collection: 'pages',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'slug', type: 'string', meta: { unique: true } },
        { field: 'status', type: 'string' },
        {
          field: 'translations',
          type: 'translation',
          meta: {
            special: 'translations',
            translation_translations_collection: 'pages_translations'
          }
        }
      ]
    });

    await createCollection({
      collection: 'pages_translations',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'pages_id', type: 'integer', meta: { relational_key: true } },
        { field: 'languages_code', type: 'string', meta: { special: 'm2o' } },
        { field: 'title', type: 'string' },
        { field: 'meta_description', type: 'text' },
        { field: 'eyebrow', type: 'string' },
        { field: 'heading', type: 'string' },
        { field: 'body', type: 'text' },
        { field: 'tag_line', type: 'string' }
      ]
    });
    console.log('   ✓ pages collection created\n');
  } catch (e) {
    console.log('   - pages may already exist\n');
  }

  // 4. Create news_articles collection
  console.log('4. Creating news_articles collection...');
  try {
    await createCollection({
      collection: 'news_articles',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'slug', type: 'string' },
        { field: 'published_date', type: 'datetime' },
        { field: 'cover', type: 'file', meta: { special: 'file' } },
        {
          field: 'translations',
          type: 'translation',
          meta: {
            special: 'translations',
            translation_translations_collection: 'news_articles_translations'
          }
        }
      ]
    });

    await createCollection({
      collection: 'news_articles_translations',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'news_articles_id', type: 'integer', meta: { relational_key: true } },
        { field: 'languages_code', type: 'string', meta: { special: 'm2o' } },
        { field: 'title', type: 'string' },
        { field: 'body', type: 'text' },
        { field: 'excerpt', type: 'text' }
      ]
    });
    console.log('   ✓ news_articles collection created\n');
  } catch (e) {
    console.log('   - news_articles may already exist\n');
  }

  // 5. Create team_vacancies collection
  console.log('5. Creating team_vacancies collection...');
  try {
    await createCollection({
      collection: 'team_vacancies',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'department', type: 'string' },
        { field: 'location', type: 'string' },
        { field: 'type', type: 'string' },
        {
          field: 'translations',
          type: 'translation',
          meta: {
            special: 'translations',
            translation_translations_collection: 'team_vacancies_translations'
          }
        }
      ]
    });

    await createCollection({
      collection: 'team_vacancies_translations',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'team_vacancies_id', type: 'integer', meta: { relational_key: true } },
        { field: 'languages_code', type: 'string', meta: { special: 'm2o' } },
        { field: 'title', type: 'string' },
        { field: 'description', type: 'text' },
        { field: 'requirements', type: 'text' }
      ]
    });
    console.log('   ✓ team_vacancies collection created\n');
  } catch (e) {
    console.log('   - team_vacancies may already exist\n');
  }

  // 6. Create history_events collection
  console.log('6. Creating history_events collection...');
  try {
    await createCollection({
      collection: 'history_events',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'year', type: 'integer' },
        { field: 'order', type: 'integer' },
        {
          field: 'translations',
          type: 'translation',
          meta: {
            special: 'translations',
            translation_translations_collection: 'history_events_translations'
          }
        }
      ]
    });

    await createCollection({
      collection: 'history_events_translations',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'history_events_id', type: 'integer', meta: { relational_key: true } },
        { field: 'languages_code', type: 'string', meta: { special: 'm2o' } },
        { field: 'title', type: 'string' },
        { field: 'body', type: 'text' }
      ]
    });
    console.log('   ✓ history_events collection created\n');
  } catch (e) {
    console.log('   - history_events may already exist\n');
  }

  // 7. Create gallery_images collection
  console.log('7. Creating gallery_images collection...');
  try {
    await createCollection({
      collection: 'gallery_images',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'image', type: 'file', meta: { special: 'file' } },
        { field: 'page_slug', type: 'string' },
        { field: 'alt_key', type: 'string' }
      ]
    });
    console.log('   ✓ gallery_images collection created\n');
  } catch (e) {
    console.log('   - gallery_images may already exist\n');
  }

  // 8. Create product_reveals collection
  console.log('8. Creating product_reveals collection...');
  try {
    await createCollection({
      collection: 'product_reveals',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'slug', type: 'string', meta: { unique: true } },
        { field: 'target_date', type: 'datetime' },
        { field: 'teaser_image', type: 'file', meta: { special: 'file' } },
        {
          field: 'translations',
          type: 'translation',
          meta: {
            special: 'translations',
            translation_translations_collection: 'product_reveals_translations'
          }
        }
      ]
    });

    await createCollection({
      collection: 'product_reveals_translations',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'product_reveals_id', type: 'integer', meta: { relational_key: true } },
        { field: 'languages_code', type: 'string', meta: { special: 'm2o' } },
        { field: 'headline', type: 'string' },
        { field: 'subline', type: 'string' },
        { field: 'specs_html', type: 'text' }
      ]
    });
    console.log('   ✓ product_reveals collection created\n');
  } catch (e) {
    console.log('   - product_reveals may already exist\n');
  }

  // 9. Create legal_documents collection
  console.log('9. Creating legal_documents collection...');
  try {
    await createCollection({
      collection: 'legal_documents',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'slug', type: 'string', meta: { unique: true } },
        {
          field: 'translations',
          type: 'translation',
          meta: {
            special: 'translations',
            translation_translations_collection: 'legal_documents_translations'
          }
        }
      ]
    });

    await createCollection({
      collection: 'legal_documents_translations',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'legal_documents_id', type: 'integer', meta: { relational_key: true } },
        { field: 'languages_code', type: 'string', meta: { special: 'm2o' } },
        { field: 'body', type: 'text' }
      ]
    });
    console.log('   ✓ legal_documents collection created\n');
  } catch (e) {
    console.log('   - legal_documents may already exist\n');
  }

  // 10. Create gdpr_consents collection
  console.log('10. Creating gdpr_consents collection...');
  try {
    await createCollection({
      collection: 'gdpr_consents',
      fields: [
        { field: 'id', type: 'integer', primary_key: true },
        { field: 'visitor_id', type: 'string' },
        { field: 'accepted', type: 'boolean' },
        { field: 'timestamp', type: 'datetime' },
        { field: 'ip_hash', type: 'string' }
      ]
    });
    console.log('   ✓ gdpr_consents collection created\n');
  } catch (e) {
    console.log('   - gdpr_consents may already exist\n');
  }

  // 11. Set up public read access
  console.log('11. Setting up Public access...');
  const collections = [
    'languages', 'pages', 'pages_translations',
    'site_settings', 'site_settings_translations',
    'news_articles', 'news_articles_translations',
    'team_vacancies', 'team_vacancies_translations',
    'history_events', 'history_events_translations',
    'gallery_images', 'directus_files',
    'product_reveals', 'product_reveals_translations',
    'legal_documents', 'legal_documents_translations'
  ];

  for (const collection of collections) {
    try {
      await createPreset({
        collection: collection,
        role: 'public',
        permission: 'read'
      });
    } catch (e) {
      // Ignore
    }
  }
  console.log('   ✓ Public read access configured\n');

  console.log('✅ Minerva Directus setup complete!');
  console.log('\nNext steps:');
  console.log('1. Seed your content in Directus Data Studio');
  console.log('2. Set up Directus Flows for form handling (Phase 4)');
  console.log('3. Configure Cloudflare Pages deployment (Phase 6)');
}

setup().catch(console.error);
