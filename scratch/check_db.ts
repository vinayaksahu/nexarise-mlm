import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const stagingUrl = "postgresql://neondb_owner:npg_IEe6vlra3YsJ@ep-patient-wind-azwoe0el.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const prodUrl = "postgresql://neondb_owner:npg_zwPy7Quos2Nv@ep-small-hat-aybqcvr8-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function inspectDb(connectionString: string, name: string) {
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const tables: any[] = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;`;
    const tableNames = tables.map(t => t.table_name);
    console.log(`=== ${name} TABLES (${tableNames.length}) ===`);
    console.log(tableNames.join(', '));
    
    const hasOtpToken = tableNames.includes('OtpToken') || tableNames.includes('otptoken');
    console.log(`OtpToken table present: ${hasOtpToken}`);

    const userCount: any[] = await prisma.$queryRaw`SELECT count(*) FROM "User";`;
    console.log(`Total Users: ${userCount[0]?.count}`);
    
  } catch (err: any) {
    console.error(`Error inspecting ${name}:`, err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

async function main() {
  await inspectDb(stagingUrl, "OLD STAGING DB (ep-patient-wind-azwoe0el)");
  console.log('\n----------------------------------------\n');
  await inspectDb(prodUrl, "NEW PRODUCTION DB (ep-small-hat-aybqcvr8)");
}

main();
