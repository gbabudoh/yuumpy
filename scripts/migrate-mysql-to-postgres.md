# MySQL → PostgreSQL Data Migration Guide

This guide walks you through migrating your existing MySQL data to the new PostgreSQL database.

## Prerequisites

- PostgreSQL 14+ installed and running
- `pg_restore` / `psql` available on your machine
- `mysqldump` available (from your MySQL installation)
- pgloader installed (optional but easiest method)

---

## Option A — pgloader (Recommended, handles type conversion automatically)

pgloader streams data directly from MySQL to PostgreSQL and converts types automatically.

### 1. Install pgloader

```bash
# Ubuntu/Debian
sudo apt install pgloader

# macOS
brew install pgloader
```

### 2. Create the PostgreSQL database and schema

```bash
psql -U adminyum1 -c "CREATE DATABASE yuumpy;"
psql -U adminyum1 -d yuumpy -f src/lib/schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/direct-checkout-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/admin-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/analytics-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/marketplace-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/notifications-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/rewards-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/wishlist-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/seo-schema.sql
```

### 3. Create a pgloader config file (`pgloader.load`)

```
LOAD DATABASE
  FROM mysql://adminyum1:g1vMeace$%now@localhost:3307/yuumpy
  INTO postgresql://adminyum1:YOUR_PG_PASSWORD@localhost:5432/yuumpy

WITH include drop, create tables, create indexes, reset sequences,
     workers = 4, concurrency = 1

SET PostgreSQL PARAMETERS
  maintenance_work_mem to '128MB',
  work_mem to '12MB'

CAST
  type tinyint to boolean using tinyint-to-boolean,
  type datetime to timestamp,
  type json to jsonb,
  column products.gallery to jsonb,
  column products.colors to jsonb,
  column admin_users.permissions to jsonb

EXCLUDING TABLE NAMES MATCHING 'schema_migrations'

BEFORE LOAD DO
  $$ SET session_replication_role = replica; $$

AFTER LOAD DO
  $$ SET session_replication_role = DEFAULT; $$;
```

### 4. Run pgloader

```bash
pgloader pgloader.load
```

---

## Option B — mysqldump + manual import

### 1. Export data from MySQL (data only, no schema)

```bash
mysqldump \
  -h localhost -P 3307 \
  -u adminyum1 -p \
  --no-create-info \
  --complete-insert \
  --skip-triggers \
  --hex-blob \
  yuumpy > yuumpy_data.sql
```

### 2. Create the PostgreSQL schema (run order matters for foreign keys)

```bash
psql -U adminyum1 -d yuumpy -f src/lib/schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/direct-checkout-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/admin-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/analytics-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/marketplace-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/notifications-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/rewards-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/wishlist-schema.sql
psql -U adminyum1 -d yuumpy -f src/lib/seo-schema.sql
```

### 3. Convert and import the data

The MySQL dump uses `\0` for NULL booleans and MySQL-specific syntax. The easiest converter is:

```bash
# Install pgloader and use it to import the mysqldump
pgloader mysql://adminyum1:PASSWORD@localhost:3307/yuumpy \
         postgresql://adminyum1:PG_PASSWORD@localhost:5432/yuumpy
```

---

## Option C — pg_dump from existing data (if you already have data in PG)

Skip this section — use Option A or B above.

---

## After migration

### 1. Reset PostgreSQL sequences

After importing data, SERIAL sequences need to be updated so new INSERTs start from the right value:

```sql
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('brands_id_seq', (SELECT MAX(id) FROM brands));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
SELECT setval('admin_users_id_seq', (SELECT MAX(id) FROM admin_users));
SELECT setval('sellers_id_seq', (SELECT MAX(id) FROM sellers));
SELECT setval('banner_ads_id_seq', (SELECT MAX(id) FROM banner_ads));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
SELECT setval('escrow_transactions_id_seq', (SELECT MAX(id) FROM escrow_transactions));
SELECT setval('disputes_id_seq', (SELECT MAX(id) FROM disputes));
```

### 2. Update .env.local

The `.env.local` file has already been updated to use port `5432`. Update the credentials to match your PostgreSQL user:

```
DB_HOST=localhost
DB_USER=adminyum1        # your PostgreSQL username
DB_PASSWORD=YOUR_PG_PW   # your PostgreSQL password
DB_NAME=yuumpy
DB_PORT=5432
```

### 3. Verify the migration

```bash
psql -U adminyum1 -d yuumpy -c "\dt"             # list all tables
psql -U adminyum1 -d yuumpy -c "SELECT COUNT(*) FROM products;"
psql -U adminyum1 -d yuumpy -c "SELECT COUNT(*) FROM orders;"
psql -U adminyum1 -d yuumpy -c "SELECT COUNT(*) FROM customers;"
```

### 4. Start the app

```bash
npm run dev
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `role "adminyum1" does not exist` | `CREATE USER adminyum1 WITH PASSWORD 'yourpassword';` |
| `database "yuumpy" does not exist` | `CREATE DATABASE yuumpy OWNER adminyum1;` |
| `permission denied` | `GRANT ALL PRIVILEGES ON DATABASE yuumpy TO adminyum1;` |
| Sequence out of sync (duplicate key errors) | Run the `setval` commands in step 1 above |
| Boolean column shows `0`/`1` instead of `true`/`false` | Cast in query: `is_active::boolean` or re-import with pgloader's tinyint cast |
