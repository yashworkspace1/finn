/**
 * FINN API Integration Test
 * Run with: npx tsx test/apiTest.ts
 * (Requires Next.js server running on localhost:3000)
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const API_BASE = 'http://localhost:3000/api'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testApis() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║        FINN API Integration Test Suite           ║')
  console.log('╚══════════════════════════════════════════════════╝\n')

  // 1. Get session — try login first, then sign up as fallback
  const testEmail = 'finn.tester.1776502348083@gmail.com'
  const testPassword = 'TestPassword123!'
  
  console.log(`[1/5] Logging in test user: ${testEmail}...`)
  const loginRes = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword })
  
  let session = loginRes.data.session
  let authError = loginRes.error

  // If login fails, try sign up
  if (!session) {
    console.log('Fallback to sign up...')
    const signupRes = await supabase.auth.signUp({ email: testEmail, password: testPassword })
    session = signupRes.data.session
    authError = signupRes.error
  }

  if (authError || !session) {
    console.error('❌ Failed to authenticate test user:', authError)
    process.exit(1)
  }

  const token = session.access_token
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`
  }

  const projectRef = SUPABASE_URL.match(/\/\/(.*?)\./)?.[1]
  if (projectRef) {
    const cookieValue = JSON.stringify([session.access_token, session.refresh_token])
    headers['Cookie'] = `sb-${projectRef}-auth-token=${encodeURIComponent(cookieValue)};`
  }

  try {
    // 2. Test /api/upload
    console.log('\n[2/5] Testing POST /api/upload...')
    
    // Native Node FormData
    const form = new FormData()
    const csvPath = path.join(process.cwd(), 'test', 'sample_sbi.csv')
    const fileBuffer = fs.readFileSync(csvPath)
    const blob = new Blob([fileBuffer], { type: 'text/csv' })
    form.append('files', blob, 'sample_sbi.csv')
    form.append('rangeType', 'preset')
    form.append('days', '30')

    console.time('Upload API Processing Time')
    const uploadRes = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: form,
    })
    console.timeEnd('Upload API Processing Time')
    
    const uploadData = await uploadRes.json()
    console.log('Status:', uploadRes.status)
    if (uploadRes.status === 200) {
      console.log('✅ Upload API Response:')
      console.log(JSON.stringify({ ...uploadData, preview: '[Array truncated for brevity]' }, null, 2))
    } else {
      console.error('❌ Upload API Failed:', uploadData)
    }

    // 3. Test /api/transactions
    console.log('\n[3/5] Testing GET /api/transactions...')
    const txRes = await fetch(`${API_BASE}/transactions?limit=2`, { headers })
    const txData = await txRes.json()
    console.log('Status:', txRes.status)
    if (txRes.status === 200) {
      console.log('✅ Transactions API Response:')
      console.log(JSON.stringify({ ...txData, transactions: '[Array truncated for brevity]' }, null, 2))
    } else {
      console.error('❌ Transactions API Failed:', txData)
    }

    // 4. Test /api/reports
    console.log('\n[4/5] Testing GET /api/reports...')
    const reportRes = await fetch(`${API_BASE}/reports`, { headers })
    const reportData = await reportRes.json()
    console.log('Status:', reportRes.status)
    if (reportRes.status === 200) {
      console.log('✅ Reports API Response:')
      console.log(JSON.stringify({ 
        success: reportData.success,
        report_summary: {
          period: reportData.report.period,
          income: reportData.report.income.total,
          expenses: reportData.report.expenses.total,
          healthScore: reportData.report.healthScore.score,
          personality: reportData.report.personality.type,
          cashFlowPrediction: reportData.report.cashFlow.predictedBalance
        }
      }, null, 2))
    } else {
      console.error('❌ Reports API Failed:', reportData)
    }

    // 5. Test /api/insights
    console.log('\n[5/5] Testing GET /api/insights...')
    const insightsRes = await fetch(`${API_BASE}/insights`, { headers })
    const insightsData = await insightsRes.json()
    console.log('Status:', insightsRes.status)
    if (insightsRes.status === 200) {
      console.log('✅ Insights API Response:')
      console.log(JSON.stringify({
        success: insightsData.success,
        summary: insightsData.insights.summary,
        weeklyNudge: insightsData.insights.weeklyNudge,
        fromCache: insightsData.insights.fromCache
      }, null, 2))
    } else {
      console.error('❌ Insights API Failed:', insightsData)
    }

  } finally {
    // Cleanup: Delete the test user if possible, but our DELETE /transactions endpoint handles DB side.
    console.log('\n[Cleaning up] Testing DELETE /api/transactions...')
    const delRes = await fetch(`${API_BASE}/transactions`, { method: 'DELETE', headers })
    const delData = await delRes.json()
    console.log('DELETE status:', delRes.status, delData)
  }

  console.log('\n╔══════════════════════════════════════════════════╗')
  console.log('║       ✅ All API endpoints tested                ║')
  console.log('╚══════════════════════════════════════════════════╝\n')
}

testApis().catch(console.error)
