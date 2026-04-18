import crypto from 'crypto'
import { createAdminClient } from '@/lib/database/supabaseAdmin'

export function hashTransactions(
  transactions: any[]
): string {
  const data = transactions
    .map(t => `${t.date}-${t.amount}-${t.type}`)
    .sort()
    .join('|')
  return crypto
    .createHash('md5')
    .update(data)
    .digest('hex')
}

export async function getCachedInsights(
  userId: string,
  dataHash: string
): Promise<any | null> {
  try {
    const supabase = createAdminClient()
    
    const { data } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .eq('data_hash', dataHash)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()
    
    if (!data) return null
    
    // Cache valid for 24 hours
    const generatedAt = new Date(data.generated_at)
    const hoursDiff = (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff > 24) return null
    
    console.log('Cache hit ✅')
    return data
    
  } catch {
    return null
  }
}

export async function saveInsightsCache(
  userId: string,
  dataHash: string,
  insights: any,
  engineData: any
): Promise<void> {
  try {
    const supabase = createAdminClient()
    
    await supabase
      .from('insights')
      .upsert({
        user_id: userId,
        data_hash: dataHash,
        health_score: engineData.healthScore?.score,
        grade: engineData.healthScore?.grade,
        personality: engineData.personality?.type,
        personality_desc: engineData.personality?.description,
        personality_emoji: engineData.personality?.emoji,
        summary: insights.summary,
        weekly_nudge: insights.weeklyNudge,
        saving_opportunity: insights.savingOpportunity,
        top_categories: engineData.topCategories,
        anomalies: engineData.anomalies,
        insights_data: insights.insights,
        generated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      
    console.log('Insights cached ✅')
  } catch (err) {
    console.error('Cache save failed:', err)
  }
}
