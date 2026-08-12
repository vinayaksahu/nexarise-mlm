import 'dotenv/config'
import { db } from '../src/lib/db'

async function checkAdam() {
  const user = await db.user.findFirst({
    where: { username: 'adam' },
    select: { id: true, username: true, email: true, role: true, status: true }
  })
  console.log('User Adam Details:', JSON.stringify(user, null, 2))

  const allUsers = await db.user.findMany({
    select: { username: true, email: true, role: true }
  })
  console.log('All Users in DB:', JSON.stringify(allUsers, null, 2))
}

checkAdam().catch(console.error).finally(() => process.exit())
