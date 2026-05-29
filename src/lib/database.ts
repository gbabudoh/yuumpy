import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function getConnection() {
  return prisma;
}

function convertPlaceholders(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

/**
 * Recursively converts non-serializable Prisma types to plain JS values
 * so rows can be safely passed across the Next.js server/client boundary:
 *   - Decimal  → number
 *   - BigInt   → number
 *   - Date     → ISO string
 */
function toPlain(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Prisma.Decimal) return parseFloat(value.toString());
  if (typeof value === 'bigint') return Number(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toPlain);
  if (typeof value === 'object') {
    // Prisma Decimal also shows up as objects with a `d` array — catch by constructor name
    if ((value as any).constructor?.name === 'Decimal') {
      return parseFloat((value as any).toString());
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as object)) {
      out[k] = toPlain(v);
    }
    return out;
  }
  return value;
}

export async function query(sql: string, params?: any[]): Promise<any> {
  try {
    const pgSql = convertPlaceholders(sql);

    const isInsert = /^\s*INSERT/i.test(pgSql);
    const hasReturning = /\bRETURNING\b/i.test(pgSql);
    const finalSql = isInsert && !hasReturning ? `${pgSql} RETURNING id` : pgSql;

    const returnsRows = /^\s*SELECT/i.test(finalSql) || /\bRETURNING\b/i.test(finalSql);

    let rows: any[];
    let rowCount = 0;

    if (returnsRows) {
      const raw = await prisma.$queryRawUnsafe(finalSql, ...(params ?? [])) as any[];
      // Convert every Decimal / BigInt / Date to plain JS so rows are serializable
      rows = toPlain(raw) as any[];
      rowCount = rows.length;
    } else {
      rowCount = await prisma.$executeRawUnsafe(finalSql, ...(params ?? []));
      rows = [];
    }

    (rows as any).insertId = rows[0]?.id ?? null;
    (rows as any).affectedRows = rowCount;

    return rows;
  } catch (error: any) {
    const pgCode = error?.meta?.code ?? error?.code;
    if (pgCode === '42P01') {
      console.log(`Table not found, returning empty result: ${sql.substring(0, 50)}...`);
      const empty: any[] = [];
      (empty as any).insertId = null;
      (empty as any).affectedRows = 0;
      return empty;
    }

    console.error('Database query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

export async function closeConnection() {
  await prisma.$disconnect();
}
