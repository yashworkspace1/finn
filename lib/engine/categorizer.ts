import { Transaction } from '@/lib/parser/normalizer'

export type { Transaction }

// ─── Keyword Map ──────────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food & Dining': [
    'swiggy', 'zomato', 'restaurant', 'cafe', 'food',
    'pizza', 'burger', 'hotel', 'dhaba', 'canteen',
    'grocery', 'bigbasket', 'blinkit', 'instamart',
    'zepto', 'dunzo', 'starbucks', 'mcdonald', 'kfc',
    'dominos', 'subway', 'haldiram', 'amul',
  ],
  'Transportation': [
    'uber', 'ola', 'rapido', 'auto', 'taxi', 'cab',
    'metro', 'irctc', 'railway', 'train', 'bus', 'petrol',
    'fuel', 'hp petrol', 'indian oil', 'bharat petroleum',
    'fasttag', 'toll', 'parking', 'indigo', 'air india',
    'spicejet', 'vistara', 'flight', 'airways',
  ],
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'meesho', 'ajio',
    'nykaa', 'shopify', 'mall', 'store', 'market',
    'reliance', 'dmart', 'big bazaar', 'lifestyle',
    'westside', 'zara', 'h&m', 'snapdeal', 'tatacliq',
  ],
  'Entertainment': [
    'netflix', 'prime', 'hotstar', 'spotify', 'youtube',
    'disney', 'zee5', 'sonyliv', 'jiocinema', 'pvr',
    'inox', 'cinema', 'theatre', 'bookmyshow', 'gaming',
    'steam', 'playstation', 'xbox', 'apple music',
  ],
  'Health & Medical': [
    'pharmacy', 'hospital', 'clinic', 'doctor', 'medical',
    'apollo', 'fortis', 'medplus', 'netmeds', 'pharmeasy',
    '1mg', 'tata health', 'practo', 'lab', 'diagnostic',
    'health', 'medicine', 'wellness', 'gym', 'cult fit',
  ],
  'Utilities': [
    'electricity', 'water', 'gas', 'wifi', 'broadband',
    'airtel', 'jio', 'bsnl', 'vi ', 'vodafone', 'idea',
    'tata sky', 'dish tv', 'dth', 'recharge', 'mobile',
    'postpaid', 'prepaid', 'bill payment', 'bbps',
  ],
  'Rent & Housing': [
    'rent', 'maintenance', 'society', 'housing', 'flat',
    'apartment', 'pg ', 'hostel', 'nobroker', 'magicbricks',
    'housing.com', '99acres', 'deposit', 'lease',
  ],
  'Salary & Income': [
    'salary', 'stipend', 'credited by', 'neft cr',
    'imps cr', 'payment received', 'freelance', 'income',
    'wages', 'bonus', 'incentive', 'commission', 'refund',
    'cashback', 'interest credited', 'dividend',
  ],
  'Subscriptions': [
    'subscription', 'monthly', 'annual plan', 'renewal',
    'adobe', 'microsoft', 'google one', 'icloud',
    'dropbox', 'notion', 'figma', 'canva', 'zoom',
    'slack', 'github', 'aws', 'vercel', 'digitalocean',
  ],
  'Education': [
    'udemy', 'coursera', 'unacademy', 'byju', 'vedantu',
    'collegedunia', 'school', 'college', 'university',
    'course', 'class', 'tuition', 'coaching', 'upgrad',
    'simplilearn', 'pluralsight', 'linkedin learning',
  ],
  'Travel': [
    'oyo', 'makemytrip', 'goibibo', 'cleartrip',
    'booking.com', 'airbnb', 'homestay', 'resort',
    'holiday', 'tour', 'travel', 'trip', 'visa',
  ],
  'Investments': [
    'zerodha', 'groww', 'upstox', 'angel broking', 'icicidirect',
    'mutual fund', 'sip', 'stock', 'shares', 'demat',
    'fd ', 'fixed deposit', 'rd ', 'recurring deposit',
    'ppf', 'nps', 'insurance', 'lic', 'policy',
  ],
}

// ─── Single transaction ───────────────────────────────────────────────────────
export function categorizeTransaction(description: string): string {
  const lower = description.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }
  return 'Others'
}

// ─── Bulk categorize ──────────────────────────────────────────────────────────
export function categorizeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map((t) => ({
    ...t,
    category: t.category || categorizeTransaction(t.description),
  }))
}
