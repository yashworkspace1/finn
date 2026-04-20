export function generateFallbackInsights(stats: any): any {
  const insights = []

  // Savings insight
  if (stats.savingsRate < 10) {
    insights.push({
      title: 'Low savings rate detected',
      description: `You saved only ${stats.savingsRate?.toFixed(1)}% of your income. Try to save at least 20%. Consider reducing ${stats.topCategories?.[0]?.category || 'top'} expenses by 15%.`,
      type: 'danger',
    })
  } else if (stats.savingsRate >= 20) {
    insights.push({
      title: 'Excellent savings rate!',
      description: `You saved ${stats.savingsRate?.toFixed(1)}% of income — better than most people. Consider investing your savings in index mutual funds for better returns.`,
      type: 'positive',
    })
  } else {
    insights.push({
      title: 'Good savings progress',
      description: `You saved ${stats.savingsRate?.toFixed(1)}% of income. You're on the right track. Aim for 20% to build a strong financial foundation.`,
      type: 'info',
    })
  }

  // Anomaly insight
  if (stats.anomalyCount > 0) {
    insights.push({
      title: `${stats.anomalyCount} unusual transaction${stats.anomalyCount > 1 ? 's' : ''} detected`,
      description: `We found ${stats.anomalyCount} transactions significantly higher than your normal spending pattern. Review them in SpendLens.`,
      type: 'warning',
    })
  }

  // Top category insight
  if (stats.topCategories?.[0]) {
    const top = stats.topCategories[0]
    insights.push({
      title: `${top.category} is your biggest expense`,
      description: `You spent ₹${top.amount?.toLocaleString('en-IN')} (${top.percentage?.toFixed(1)}%) on ${top.category}. ${top.percentage > 30 ? 'This is high — consider setting a budget.' : 'This looks reasonable.'}`,
      type: top.percentage > 30 ? 'warning' : 'info',
    })
  }

  // Subscription insight
  if (stats.subscriptionCount > 5) {
    insights.push({
      title: 'Too many subscriptions',
      description: `You have ${stats.subscriptionCount} active subscriptions. Cancel unused ones to save money every month.`,
      type: 'warning',
    })
  }

  const referenceIncome = stats.monthlyIncome || stats.totalIncome || 0
  const savingsAmount = Math.round((referenceIncome * (stats.savingsRate || 0)) / 100)

  return {
    summary: `Your financial health score is ${stats.healthScore}/100. You analyzed ${stats.transactionCount} transactions with a ${stats.savingsRate?.toFixed(1)}% savings rate. ${stats.healthScore >= 70 ? 'Keep up the great work!' : 'Focus on reducing top expenses.'}`,
    insights: insights.slice(0, 3),
    weeklyNudge:
      stats.savingsRate < 20
        ? `This week, reduce ${stats.topCategories?.[0]?.category || 'top'} spending by 20%. Could save you ₹${Math.round((stats.topCategories?.[0]?.amount || 0) * 0.2).toLocaleString('en-IN')} this month.`
        : `Great job saving ₹${savingsAmount.toLocaleString('en-IN')}! Consider investing it in index funds for long-term wealth building.`,
    savingOpportunity: `Reducing ${stats.topCategories?.[0]?.category || 'top'} expenses by 15% could save ₹${Math.round((stats.topCategories?.[0]?.amount || 0) * 0.15).toLocaleString('en-IN')} per month.`,
  }
}

export function generateFallbackChatResponse(message: string, context: any): string {
  const msg = message.toLowerCase()

  // ─── Personal data questions ─────────────────────────────────────────────────

  if (msg.includes('spend') || msg.includes('most') || msg.includes('biggest')) {
    const top = context.topCategories?.[0]
    const top2 = context.topCategories?.[1]
    if (!top) return `Upload your bank statement first and I'll analyze your spending patterns! 📊`
    return (
      `Your biggest expense category is **${top.category}** at ₹${top.amount?.toLocaleString('en-IN')} ` +
      `(${top.percentage?.toFixed(1)}% of total spending).` +
      (top2 ? ` **${top2.category}** comes second at ₹${top2.amount?.toLocaleString('en-IN')}.` : '') +
      ` Consider setting a monthly budget for ${top.category} to keep it in check.`
    )
  }

  if (msg.includes('sav')) {
    const rate = context.savingsRate?.toFixed(1)
    const saved = Math.round(((context.totalIncome || 0) * (context.savingsRate || 0)) / 100)
    if (rate >= 20) {
      return `You're saving **${rate}%** of your income — that's excellent! 💪 You've put away ₹${saved.toLocaleString('en-IN')} this period. Consider moving it into a low-risk mutual fund or FD to make it work for you.`
    }
    return `Your current savings rate is **${rate}%**. The target is 20%. You're saving ₹${saved.toLocaleString('en-IN')} — try to increase it by reducing your top expense category by 10%.`
  }

  if (msg.includes('health') || msg.includes('score')) {
    const score = context.healthScore || 0
    const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention'
    return `Your financial health score is **${score}/100** (${grade}). ${score >= 70 ? 'You have strong savings discipline — keep it up!' : `To improve, focus on: (1) raising your savings rate above 20%, (2) reducing anomalous spending, (3) reviewing your subscriptions.`}`
  }

  if (msg.includes('unusual') || msg.includes('anomal') || msg.includes('weird')) {
    return context.anomalyCount > 0
      ? `I found **${context.anomalyCount} unusual transactions** in your data — these are significantly higher than your normal spending. Check the **SpendLens** page for a detailed breakdown. It's worth verifying each one.`
      : `No unusual transactions detected! ✅ Your spending patterns look consistent and predictable.`
  }

  if (msg.includes('subscri')) {
    return `You have **${context.subscriptionCount} active subscriptions** detected. Head to **SpendLens** to see each one. Cancelling even 2-3 unused subscriptions can save ₹500–2,000/month.`
  }

  if (msg.includes('income') || msg.includes('earn') || msg.includes('salary')) {
    return `Your total income tracked is **₹${context.totalIncome?.toLocaleString('en-IN')}** over the analyzed period. Your expenses are ₹${context.totalExpenses?.toLocaleString('en-IN')}, giving you a **${context.savingsRate?.toFixed(1)}% savings rate**. Not bad — but there's always room to grow!`
  }

  if (msg.includes('recent') || msg.includes('last') || msg.includes('latest')) {
    const recent = context.recentTransactions?.slice(0, 3) || []
    if (recent.length === 0) return `No recent transactions found. Try uploading your latest bank statement.`
    const list = recent
      .map((t: any) => `- **${t.description}**: ${t.type === 'credit' ? '+' : '-'}₹${t.amount?.toLocaleString('en-IN')} (${t.date})`)
      .join('\n')
    return `Your most recent transactions:\n\n${list}\n\nWant a full breakdown? Check the **SpendLens** page.`
  }

  // ─── General finance advice ───────────────────────────────────────────────────

  if (msg.includes('invest') || msg.includes('mutual fund') || msg.includes('stock') || msg.includes('sip')) {
    const sipAmount = Math.round((context.totalIncome || 0) * 0.1)
    return (
      `**Investment basics for your situation:**\n\n` +
      `- **Index funds** (Nifty 50 / Nifty Next 50) for long-term wealth — low cost, high returns\n` +
      `- **SIP of ₹${sipAmount.toLocaleString('en-IN')}/month** is a good starting point (10% of income)\n` +
      `- **Liquid funds** for your emergency fund instead of a savings account\n\n` +
      `Rule: Save 20%, invest 10%, keep 6 months expenses in emergency fund. 📈`
    )
  }

  if (msg.includes('emergency') || msg.includes('rainy day') || msg.includes('fund')) {
    const target = Math.round((context.totalExpenses || 0) * 6)
    return (
      `Aim for **6 months of expenses** (₹${target.toLocaleString('en-IN')}) in a high-yield savings account or liquid mutual fund. ` +
      `Build this before aggressive investing. Even ₹${Math.round(target / 12).toLocaleString('en-IN')}/month gets you there in a year.`
    )
  }

  if (msg.includes('budget') || msg.includes('plan') || msg.includes('50/30/20') || msg.includes('rule')) {
    const savRate = context.savingsRate?.toFixed(1)
    return (
      `Try the **50/30/20 rule**:\n\n` +
      `- **50% needs**: rent, food, utilities, EMIs\n` +
      `- **30% wants**: entertainment, dining, shopping\n` +
      `- **20% savings**: investments, emergency fund\n\n` +
      `You're currently saving **${savRate}%** — ${parseFloat(savRate) >= 20 ? 'right on track! 💪' : 'a bit below target. Cut wants first.'}`
    )
  }

  if (msg.includes('emi') || msg.includes('loan') || msg.includes('debt')) {
    return (
      `**Managing EMIs and loans:**\n\n` +
      `- Keep total EMIs under **40% of your monthly income**\n` +
      `- Pay off high-interest debt (credit cards, personal loans) first\n` +
      `- Consider prepaying loans when you have surplus — saves interest\n\n` +
      `If you share your loan details, I can calculate your exact debt-free date!`
    )
  }

  if (msg.includes('tax') || msg.includes('80c') || msg.includes('deduction')) {
    return (
      `**Tax-saving options under Section 80C (up to ₹1.5L):**\n\n` +
      `- **ELSS Mutual Funds** — best returns + 3-year lock-in\n` +
      `- **PPF** — safe, 15-year, 7.1% interest\n` +
      `- **NPS** — extra ₹50K deduction under 80CCD(1B)\n\n` +
      `Start with ELSS SIP early in the financial year to avoid last-minute rush. 📅`
    )
  }

  if (msg.includes('insurance') || msg.includes('term') || msg.includes('life insurance')) {
    return (
      `**Insurance basics:**\n\n` +
      `- Get a **term life insurance** = 15-20x annual income (not ULIPs!)\n` +
      `- **Health insurance** = min ₹5L cover per person\n` +
      `- Avoid mixing insurance and investment\n\n` +
      `Term insurance for ₹1Cr coverage costs as little as ₹8,000-12,000/year if you're young and healthy.`
    )
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('how are')) {
    return `Hi! I'm FINN, your personal financial advisor. 👋 I've analyzed your finances and I'm ready to help. Ask me anything — "where did I overspend?", "should I invest?", "how's my savings rate?" — I'll give you real, specific answers.`
  }

  // ─── Smart default ────────────────────────────────────────────────────────────
  return (
    `Here's a quick snapshot of your finances:\n\n` +
    `- **Income**: ₹${context.totalIncome?.toLocaleString('en-IN') || 0}\n` +
    `- **Expenses**: ₹${context.totalExpenses?.toLocaleString('en-IN') || 0}\n` +
    `- **Savings rate**: ${context.savingsRate?.toFixed(1) || 0}%\n` +
    `- **Health score**: ${context.healthScore || 0}/100\n\n` +
    `Ask me something specific — *"where did I overspend"*, *"should I invest"*, *"am I saving enough"* — and I'll dig into the real numbers. 🔍`
  )
}
