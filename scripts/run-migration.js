/**
 * MySQL → PostgreSQL full data migration script
 * Run with: node scripts/run-migration.js
 */

require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

const mysqlConfig = {
  host: 'localhost', port: 3307,
  user: 'adminyum1', password: 'g1vMeace$%now',
  database: 'yuumpy',
};

const pg = new Pool({ connectionString: process.env.DATABASE_URL });

// Helper: convert MySQL 0/1 booleans to true/false
function toBool(v) {
  if (v === null || v === undefined) return null;
  return v === 1 || v === true || v === '1';
}

// Helper: truncate text for logs
function esc(s, len = 60) {
  if (!s) return '';
  const str = String(s);
  return str.length > len ? str.substring(0, len) + '...' : str;
}

async function clearPostgres(pgClient) {
  console.log('\n⚠️  Clearing existing PostgreSQL data...');
  // Disable FK checks, truncate in safe order, re-enable
  await pgClient.query('SET session_replication_role = replica');

  const tables = [
    'page_seo', 'category_seo', 'product_seo', 'seo_settings',
    'wishlist', 'rewards_history', 'customer_rewards',
    'customer_notifications', 'customer_sessions',
    'dispute_messages', 'disputes', 'escrow_transactions',
    'seller_reviews', 'seller_sessions', 'seller_settings',
    'order_items', 'orders', 'customer_addresses',
    'product_variations', 'products',
    'sellers', 'customers', 'admin_sessions', 'admin_users',
    'analytics', 'analytics_settings', 'payments',
    'banner_ads', 'product_banner_ads',
    'commission_config', 'categories', 'brands', 'pages',
  ];

  for (const t of tables) {
    try {
      await pgClient.query(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE`);
    } catch { /* table might not exist yet */ }
  }

  await pgClient.query('SET session_replication_role = DEFAULT');
  console.log('✅ PostgreSQL cleared');
}

async function ensureExtraTables(pgClient) {
  // Tables that exist in MySQL but weren't in the original PG schema
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key_name VARCHAR(100) NOT NULL UNIQUE,
      value TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS product_variations (
      id SERIAL PRIMARY KEY,
      product_id INT NOT NULL,
      colour_name VARCHAR(100) NOT NULL,
      colour_hex VARCHAR(7),
      main_image_url TEXT,
      gallery_images JSONB,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      subject VARCHAR(500),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS custom_requests (
      id SERIAL PRIMARY KEY,
      customer_id INT,
      seller_id INT,
      product_id INT,
      description TEXT,
      attachment_urls JSONB,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS product_banner_ads (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url VARCHAR(500),
      link_url VARCHAR(500),
      is_active BOOLEAN DEFAULT TRUE,
      start_date DATE,
      end_date DATE,
      expires_at TIMESTAMP,
      duration VARCHAR(20),
      is_repeating BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Extra tables ensured');
}

async function migrateTable(my, pgClient, mysqlTable, pgTable, transform) {
  const [rows] = await my.execute(`SELECT * FROM \`${mysqlTable}\``);
  if (rows.length === 0) {
    console.log(`  ⏭️  ${mysqlTable} (0 rows)`);
    return;
  }
  let ok = 0, skip = 0;
  for (const row of rows) {
    const mapped = transform(row);
    if (!mapped) { skip++; continue; }
    const cols = Object.keys(mapped);
    const vals = Object.values(mapped);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO "${pgTable}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
    try {
      await pgClient.query(sql, vals);
      ok++;
    } catch (e) {
      console.error(`    ❌ ${mysqlTable} row id=${row.id}: ${e.message.split('\n')[0]}`);
      skip++;
    }
  }
  console.log(`  ✅ ${mysqlTable} → ${pgTable}: ${ok} rows${skip ? ` (${skip} skipped)` : ''}`);
}

async function resetSequences(pgClient) {
  const tables = [
    'categories', 'brands', 'products', 'banner_ads', 'product_banner_ads',
    'admin_users', 'admin_sessions', 'customers', 'customer_addresses',
    'customer_sessions', 'customer_notifications', 'customer_rewards',
    'rewards_history', 'sellers', 'seller_sessions', 'seller_settings',
    'seller_reviews', 'orders', 'order_items', 'payments',
    'escrow_transactions', 'disputes', 'dispute_messages',
    'analytics', 'analytics_settings', 'commission_config',
    'wishlist', 'pages', 'seo_settings', 'product_seo', 'category_seo',
    'page_seo', 'settings', 'product_variations', 'contact_submissions',
    'custom_requests',
  ];
  for (const t of tables) {
    try {
      await pgClient.query(`SELECT setval('${t}_id_seq', COALESCE((SELECT MAX(id) FROM "${t}"), 1))`);
    } catch { /* table may not exist */ }
  }
  console.log('✅ Sequences reset');
}

async function main() {
  console.log('🚀 Starting MySQL → PostgreSQL migration\n');
  const my = await mysql.createConnection(mysqlConfig);
  const pgClient = await pg.connect();

  try {
    await clearPostgres(pgClient);
    await ensureExtraTables(pgClient);

    console.log('\n📦 Migrating tables...\n');

    // ── Categories (self-referential: root first, then children) ──
    const [allCats] = await my.execute('SELECT * FROM categories ORDER BY parent_id IS NOT NULL, parent_id, id');
    let catOk = 0;
    for (const r of allCats) {
      try {
        await pgClient.query(
          `INSERT INTO categories (id, name, slug, description, image_url, parent_id, sort_order, is_active, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
          [r.id, r.name, r.slug, r.description, r.image_url, r.parent_id, r.sort_order ?? 0, toBool(r.is_active), r.created_at, r.updated_at]
        );
        catOk++;
      } catch (e) {
        console.error(`  ❌ category id=${r.id}: ${e.message.split('\n')[0]}`);
      }
    }
    console.log(`  ✅ categories: ${catOk} rows`);

    // ── Subcategories → merge into categories with parent_id offset ──
    const [subCats] = await my.execute('SELECT * FROM subcategories');
    // Use ID offset 10000 to avoid clash with existing category IDs
    const SUB_OFFSET = 10000;
    let subOk = 0;
    for (const r of subCats) {
      try {
        await pgClient.query(
          `INSERT INTO categories (id, name, slug, description, parent_id, sort_order, is_active, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
          [r.id + SUB_OFFSET, r.name, r.slug ?? `sub-${r.id}`, r.description, r.category_id, r.sort_order ?? 0, toBool(r.is_active), r.created_at, r.updated_at]
        );
        subOk++;
      } catch (e) {
        // Slug might conflict with existing categories
        console.log(`  ⚠️  subcategory id=${r.id} (${r.name}) skipped: ${e.message.split('\n')[0]}`);
      }
    }
    console.log(`  ✅ subcategories → categories: ${subOk} rows (offset +${SUB_OFFSET})`);

    // ── Brands ──
    await migrateTable(my, pgClient, 'brands', 'brands', r => ({
      id: r.id, name: r.name, slug: r.slug, description: r.description,
      logo_url: r.logo_url, website_url: r.website_url, is_active: toBool(r.is_active),
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Products ──
    await migrateTable(my, pgClient, 'products', 'products', r => ({
      id: r.id, name: r.name, slug: r.slug, description: r.description,
      short_description: r.short_description, price: r.price, original_price: r.original_price,
      affiliate_url: r.affiliate_url || '', purchase_type: r.purchase_type || 'affiliate',
      product_condition: r.product_condition, stock_quantity: r.stock_quantity,
      image_url: r.image_url,
      gallery: r.gallery ? (typeof r.gallery === 'string' ? r.gallery : JSON.stringify(r.gallery)) : null,
      category_id: r.category_id, brand_id: r.brand_id,
      is_featured: toBool(r.is_featured), is_bestseller: toBool(r.is_bestseller), is_active: toBool(r.is_active),
      meta_title: r.meta_title, meta_description: r.meta_description,
      banner_ad_title: r.banner_ad_title, banner_ad_description: r.banner_ad_description,
      banner_ad_image_url: r.banner_ad_image_url, banner_ad_link_url: r.banner_ad_link_url,
      banner_ad_duration: r.banner_ad_duration || '1_week',
      banner_ad_is_repeating: toBool(r.banner_ad_is_repeating),
      banner_ad_start_date: r.banner_ad_start_date, banner_ad_end_date: r.banner_ad_end_date,
      banner_ad_is_active: toBool(r.banner_ad_is_active),
      colors: r.colors ? (typeof r.colors === 'string' ? r.colors : JSON.stringify(r.colors)) : null,
      seller_id: r.seller_id, seller_approved: toBool(r.seller_approved),
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Product variations ──
    await migrateTable(my, pgClient, 'product_variations', 'product_variations', r => ({
      id: r.id, product_id: r.product_id, colour_name: r.colour_name,
      colour_hex: r.colour_hex, main_image_url: r.main_image_url,
      gallery_images: r.gallery_images ? (typeof r.gallery_images === 'string' ? r.gallery_images : JSON.stringify(r.gallery_images)) : null,
      sort_order: r.sort_order ?? 0, created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Banner ads ──
    await migrateTable(my, pgClient, 'banner_ads', 'banner_ads', r => ({
      id: r.id, title: r.title, description: r.description, image_url: r.image_url,
      link_url: r.link_url, position: r.position || 'top',
      is_active: toBool(r.is_active), start_date: r.start_date, end_date: r.end_date,
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Product banner ads ──
    await migrateTable(my, pgClient, 'product_banner_ads', 'product_banner_ads', r => ({
      id: r.id, title: r.title, description: r.description, image_url: r.image_url,
      link_url: r.link_url, is_active: toBool(r.is_active),
      start_date: r.start_date, end_date: r.end_date, expires_at: r.expires_at,
      duration: r.duration, is_repeating: toBool(r.is_repeating),
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Admin users (self-referential: null created_by first) ──
    const [rawAdmins] = await my.execute('SELECT * FROM admin_users ORDER BY id');
    // Insert nulls-first to satisfy the self-referential FK
    const adminUsers = [
      ...rawAdmins.filter(r => !r.created_by),
      ...rawAdmins.filter(r =>  r.created_by),
    ];
    let adminOk = 0;
    for (const r of adminUsers) {
      try {
        await pgClient.query(
          `INSERT INTO admin_users (id, username, email, password_hash, role, permissions, is_active, last_login, created_by, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO NOTHING`,
          [r.id, r.username, r.email, r.password_hash, r.role || 'content_admin',
           r.permissions ? (typeof r.permissions === 'string' ? r.permissions : JSON.stringify(r.permissions)) : null,
           toBool(r.is_active), r.last_login, r.created_by, r.created_at, r.updated_at]
        );
        adminOk++;
      } catch (e) {
        console.error(`  ❌ admin_user id=${r.id}: ${e.message.split('\n')[0]}`);
      }
    }
    console.log(`  ✅ admin_users: ${adminOk} rows`);

    // ── Customers ──
    await migrateTable(my, pgClient, 'customers', 'customers', r => ({
      id: r.id, email: r.email, password_hash: r.password_hash,
      first_name: r.first_name, last_name: r.last_name, phone: r.phone,
      is_active: toBool(r.is_active), email_verified: toBool(r.email_verified),
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Customer addresses ──
    await migrateTable(my, pgClient, 'customer_addresses', 'customer_addresses', r => ({
      id: r.id, customer_id: r.customer_id, address_type: r.address_type || 'shipping',
      first_name: r.first_name, last_name: r.last_name,
      address_line1: r.address_line1, address_line2: r.address_line2,
      city: r.city, county: r.county, postcode: r.postcode,
      country: r.country || 'United Kingdom', phone: r.phone,
      is_default: toBool(r.is_default), created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Customer sessions ──
    await migrateTable(my, pgClient, 'customer_sessions', 'customer_sessions', r => ({
      id: r.id, customer_id: r.customer_id, token: r.token,
      expires_at: r.expires_at, created_at: r.created_at,
    }));

    // ── Sellers ──
    await migrateTable(my, pgClient, 'sellers', 'sellers', r => ({
      id: r.id, email: r.email, password_hash: r.password_hash,
      store_name: r.store_name, store_slug: r.store_slug,
      business_name: r.business_name, description: r.description,
      logo_url: r.logo_url, banner_url: r.banner_url, phone: r.phone, website: r.website,
      address_line1: r.address_line1, address_line2: r.address_line2,
      city: r.city, state_province: r.state_province, postal_code: r.postal_code,
      country: r.country || 'United States',
      stripe_connect_id: r.stripe_connect_id,
      stripe_onboarding_complete: toBool(r.stripe_onboarding_complete),
      commission_rate: r.commission_rate ?? 12.00,
      status: r.status || 'pending',
      is_featured: toBool(r.is_featured), is_verified: toBool(r.is_verified),
      total_sales: r.total_sales ?? 0, total_orders: r.total_orders ?? 0,
      average_rating: r.average_rating ?? 0, total_reviews: r.total_reviews ?? 0,
      email_verified: toBool(r.email_verified), last_login: r.last_login,
      // customer_id link if exists
      ...(r.customer_id ? { customer_id: r.customer_id } : {}),
      ...(r.is_online !== undefined ? { is_online: toBool(r.is_online) } : {}),
      ...(r.last_seen_at !== undefined ? { last_seen_at: r.last_seen_at } : {}),
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Seller settings ──
    await migrateTable(my, pgClient, 'seller_settings', 'seller_settings', r => ({
      id: r.id, seller_id: r.seller_id,
      shipping_policy: r.shipping_policy, free_shipping_threshold: r.free_shipping_threshold,
      flat_rate_shipping: r.flat_rate_shipping ?? 5.99,
      processing_time: r.processing_time || '1-3 business days',
      return_policy: r.return_policy, return_window_days: r.return_window_days ?? 30,
      accepts_returns: toBool(r.accepts_returns),
      payout_schedule: r.payout_schedule || 'weekly',
      minimum_payout: r.minimum_payout ?? 25.00,
      email_on_new_order: toBool(r.email_on_new_order),
      email_on_dispute: toBool(r.email_on_dispute),
      email_on_review: toBool(r.email_on_review),
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Seller sessions ──
    await migrateTable(my, pgClient, 'seller_sessions', 'seller_sessions', r => ({
      id: r.id, seller_id: r.seller_id, token: r.token,
      expires_at: r.expires_at, created_at: r.created_at,
    }));

    // ── Orders ──
    await migrateTable(my, pgClient, 'orders', 'orders', r => ({
      id: r.id, order_number: r.order_number, customer_id: r.customer_id,
      customer_email: r.customer_email, customer_first_name: r.customer_first_name,
      customer_last_name: r.customer_last_name, customer_phone: r.customer_phone,
      shipping_address_line1: r.shipping_address_line1, shipping_address_line2: r.shipping_address_line2,
      shipping_city: r.shipping_city, shipping_county: r.shipping_county,
      shipping_postcode: r.shipping_postcode, shipping_country: r.shipping_country || 'United Kingdom',
      subtotal: r.subtotal, shipping_cost: r.shipping_cost ?? 0,
      tax_amount: r.tax_amount ?? 0, total_amount: r.total_amount,
      currency: r.currency || 'GBP', stripe_payment_intent_id: r.stripe_payment_intent_id,
      payment_status: r.payment_status || 'pending', order_status: r.order_status || 'pending',
      tracking_number: r.tracking_number, tracking_url: r.tracking_url,
      customer_notes: r.customer_notes, admin_notes: r.admin_notes,
      estimated_delivery: r.estimated_delivery,
      seller_id: r.seller_id,
      escrow_status: r.escrow_status,
      commission_amount: r.commission_amount ?? 0,
      seller_payout_amount: r.seller_payout_amount ?? 0,
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Order items ──
    await migrateTable(my, pgClient, 'order_items', 'order_items', r => ({
      id: r.id, order_id: r.order_id, product_id: r.product_id,
      product_name: r.product_name, product_slug: r.product_slug,
      product_image_url: r.product_image_url, quantity: r.quantity ?? 1,
      unit_price: r.unit_price, total_price: r.total_price,
      seller_id: r.seller_id, created_at: r.created_at,
    }));

    // ── Payments ──
    await migrateTable(my, pgClient, 'payments', 'payments', r => ({
      id: r.id, stripe_payment_intent_id: r.stripe_payment_intent_id,
      amount: r.amount, currency: r.currency || 'GBP',
      status: r.status || 'pending', customer_email: r.customer_email,
      banner_ad_id: r.banner_ad_id, created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Escrow transactions ──
    await migrateTable(my, pgClient, 'escrow_transactions', 'escrow_transactions', r => ({
      id: r.id, order_id: r.order_id, seller_id: r.seller_id,
      total_amount: r.total_amount, commission_amount: r.commission_amount,
      seller_payout_amount: r.seller_payout_amount, status: r.status || 'held',
      hold_until: r.hold_until, released_at: r.released_at, refunded_at: r.refunded_at,
      stripe_transfer_id: r.stripe_transfer_id, admin_notes: r.admin_notes,
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Disputes ──
    await migrateTable(my, pgClient, 'disputes', 'disputes', r => ({
      id: r.id, order_id: r.order_id, customer_id: r.customer_id,
      seller_id: r.seller_id, escrow_id: r.escrow_id, reason: r.reason,
      description: r.description,
      evidence_urls: r.evidence_urls ? (typeof r.evidence_urls === 'string' ? r.evidence_urls : JSON.stringify(r.evidence_urls)) : null,
      status: r.status || 'open', resolution_notes: r.resolution_notes,
      refund_amount: r.refund_amount, resolved_by: r.resolved_by, resolved_at: r.resolved_at,
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Dispute messages ──
    await migrateTable(my, pgClient, 'dispute_messages', 'dispute_messages', r => ({
      id: r.id, dispute_id: r.dispute_id, sender_type: r.sender_type,
      sender_id: r.sender_id, message: r.message,
      attachment_urls: r.attachment_urls ? (typeof r.attachment_urls === 'string' ? r.attachment_urls : JSON.stringify(r.attachment_urls)) : null,
      created_at: r.created_at,
    }));

    // ── Seller reviews ──
    await migrateTable(my, pgClient, 'seller_reviews', 'seller_reviews', r => ({
      id: r.id, seller_id: r.seller_id, customer_id: r.customer_id,
      order_id: r.order_id, rating: r.rating, title: r.title,
      review_text: r.review_text,
      is_verified_purchase: toBool(r.is_verified_purchase),
      is_visible: toBool(r.is_visible),
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Commission config ──
    await migrateTable(my, pgClient, 'commission_config', 'commission_config', r => ({
      id: r.id, name: r.name, type: r.type, target_id: r.target_id,
      rate: r.rate, is_active: toBool(r.is_active),
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Customer rewards ──
    await migrateTable(my, pgClient, 'customer_rewards', 'customer_rewards', r => ({
      id: r.id, customer_id: r.customer_id, points_balance: r.points_balance ?? 0,
      lifetime_points_earned: r.lifetime_points_earned ?? 0,
      lifetime_points_redeemed: r.lifetime_points_redeemed ?? 0,
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Rewards history ──
    await migrateTable(my, pgClient, 'rewards_history', 'rewards_history', r => ({
      id: r.id, customer_id: r.customer_id, points: r.points,
      transaction_type: r.transaction_type || 'earned', description: r.description,
      order_id: r.order_id, order_number: r.order_number, expires_at: r.expires_at,
      created_at: r.created_at,
    }));

    // ── Customer notifications ──
    await migrateTable(my, pgClient, 'customer_notifications', 'customer_notifications', r => ({
      id: r.id, customer_id: r.customer_id, type: r.type || 'system',
      title: r.title, message: r.message, link_url: r.link_url,
      is_read: toBool(r.is_read), order_id: r.order_id, order_number: r.order_number,
      created_at: r.created_at,
    }));

    // ── Wishlist ──
    await migrateTable(my, pgClient, 'wishlist', 'wishlist', r => ({
      id: r.id, customer_id: r.customer_id, product_id: r.product_id,
      created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Analytics ──
    await migrateTable(my, pgClient, 'analytics', 'analytics', r => ({
      id: r.id, event_type: r.event_type, product_id: r.product_id,
      category_id: r.category_id, user_ip: r.user_ip, user_agent: r.user_agent,
      referrer: r.referrer, page_url: r.page_url,
      metadata: r.metadata ? (typeof r.metadata === 'string' ? r.metadata : JSON.stringify(r.metadata)) : null,
      created_at: r.created_at,
    }));

    // ── Pages ──
    await migrateTable(my, pgClient, 'pages', 'pages', r => ({
      id: r.id, title: r.title, slug: r.slug, content: r.content,
      meta_title: r.meta_title, meta_description: r.meta_description,
      is_active: toBool(r.is_active), created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Settings ──
    await migrateTable(my, pgClient, 'settings', 'settings', r => ({
      id: r.id, key_name: r.key_name, value: r.value,
      description: r.description, created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Custom requests ──
    await migrateTable(my, pgClient, 'custom_requests', 'custom_requests', r => ({
      id: r.id, customer_id: r.customer_id, seller_id: r.seller_id,
      product_id: r.product_id, description: r.description,
      attachment_urls: r.attachment_urls ? (typeof r.attachment_urls === 'string' ? r.attachment_urls : JSON.stringify(r.attachment_urls)) : null,
      status: r.status || 'pending', created_at: r.created_at, updated_at: r.updated_at,
    }));

    // ── Contact submissions ──
    await migrateTable(my, pgClient, 'contact_submissions', 'contact_submissions', r => ({
      id: r.id, name: r.name, email: r.email,
      subject: r.subject, message: r.message, created_at: r.created_at,
    }));

    await resetSequences(pgClient);

    // ── Final counts ──
    console.log('\n📊 Final row counts in PostgreSQL:');
    const checkTables = ['categories', 'brands', 'products', 'customers', 'admin_users', 'sellers', 'orders', 'order_items', 'settings'];
    for (const t of checkTables) {
      try {
        const { rows } = await pgClient.query(`SELECT COUNT(*)::int as n FROM "${t}"`);
        console.log(`  ${t.padEnd(20)} ${rows[0].n}`);
      } catch { /* skip */ }
    }

    console.log('\n✅ Migration complete!');
  } finally {
    pgClient.release();
    await my.end();
    await pg.end();
  }
}

main().catch(e => {
  console.error('\n❌ Migration failed:', e.message);
  process.exit(1);
});
