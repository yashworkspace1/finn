export function generateFallbackInsights(
  stats: any
): any {
  const insights = []
  
  // Savings insight
  if (stats.savingsRate < 10) {
    insights.push({
      title: 'Low savings rate detected',
      description: `You saved only ${stats.savingsRate?.toFixed(1)}% of your income. Try to save at least 20%. Consider reducing ${stats.topCategories?.[0]?.category || 'top'} expenses by 15%.`,
      type: 'danger'
    })
  } else if (stats.savingsRate >= 20) {
    insights.push({
      title: 'Excellent savings rate!',
      description: `You saved ${stats.savingsRate?.toFixed(1)}% of income — better than most people. Consider investing your savings in mutual funds for better returns.`,
      type: 'positive'
    })
  } else {
    insights.push({
      title: 'Good savings progress',
      description: `You saved ${stats.savingsRate?.toFixed(1)}% of income. You're on the right track. Aim for 20% to build a strong financial foundation.`,
      type: 'info'
    })
  }
  
  // Anomaly insight
  if (stats.anomalyCount > 0) {
    insights.push({
      title: `${stats.anomalyCount} unusual transaction${stats.anomalyCount > 1 ? 's' : ''} detected`,
      description: `We found ${stats.anomalyCount} transactions significantly higher than your normal spending pattern. Review them in SpendLens.`,
      type: 'warning'
    })
  }
  
  // Top category insight
  if (stats.topCategories?.[0]) {
    const top = stats.topCategories[0]
    insights.push({
      title: `${top.category} is your biggest expense`,
      description: `You spent ₹${top.amount?.toLocaleString('en-IN')} (${top.percentage?.toFixed(1)}%) on ${top.category}. ${top.percentage > 30 ? 'This is high — consider setting a budget.' : 'This looks reasonable.'}`,
      type: top.percentage > 30 ? 'warning' : 'info'
    })
  }
  
  // Subscription insight
  if (stats.subscriptionCount > 5) {
    insights.push({
      title: 'Too many subscriptions',
      description: `You have ${stats.subscriptionCount} active subscriptions. Cancel unused ones to save money every month.`,
      type: 'warning'
    })
  }

  const referenceIncome = stats.monthlyIncome || stats.totalIncome || 0
  const savingsAmount = Math.round(referenceIncome * (stats.savingsRate || 0) / 100)

  return {
    summary: `Your financial health score is ${stats.healthScore}/100. You analyzed ${stats.transactionCount} transactions with a ${stats.savingsRate?.toFixed(1)}% savings rate. ${stats.healthScore >= 70 ? 'Keep up the great work!' : 'Focus on reducing top expenses.'}`,
    insights: insights.slice(0, 3),
    weeklyNudge: stats.savingsRate < 20
      ? `This week, reduce ${stats.topCategories?.[0]?.category || 'top'} spending by 20%. Could save you ₹${Math.round((stats.topCategories?.[0]?.amount || 0) * 0.2).toLocaleString('en-IN')} this month.`
      : `Great job saving ₹${savingsAmount.toLocaleString('en-IN')}! Consider investing it in index funds for long-term wealth building.`,
    savingOpportunity: `Reducing ${stats.topCategories?.[0]?.category || 'top'} expenses by 15% could save ₹${Math.round((stats.topCategories?.[0]?.amount || 0) * 0.15).toLocaleString('en-IN')} per month.`
  }
}

export function generateFallbackChatResponse(
  message: string,
  context: any
): string {
  const msg = message.toLowerCase()
  
  if (msg.includes('spend') || msg.includes('most')) {
    const top = context.topCategories?.[0]
    return top 
      ? `Your biggest expense category is ${top.category} at ₹${top.amount?.toLocaleString('en-IN')} (${top.percentage?.toFixed(1)}% of total spending). Consider setting a monthly budget for this category.`
      : `Upload your bank statement first and I'll analyze your spending patterns!`
  }
  
  if (msg.includes('sav')) {
    return `Your current savings rate is ${context.savingsRate?.toFixed(1)}%. ${context.savingsRate >= 20 ? `Great job! You saved ₹${Math.round(context.totalIncome * context.savingsRate / 100).toLocaleString('en-IN')} this period.` : `Try to reach 20% savings rate. Reduce your top expense category to get there.`}`
  }
  
  if (msg.includes('health') || msg.includes('score')) {
    return `Your financial health score is ${context.healthScore}/100. ${context.healthScore >= 70 ? 'This is excellent! Keep maintaining your spending discipline.' : context.healthScore >= 40 ? 'This is average. Focus on increasing your savings rate to improve.' : 'This needs attention. Start by reducing your top expense category.'}`
  }
  
  if (msg.includes('unusual') || msg.includes('anomal')) {
    return context.anomalyCount > 0
      ? `I found ${context.anomalyCount} unusual transactions in your data. Check the SpendLens page for details on which transactions are flagged.`
      : `No unusual transactions detected! Your spending patterns look consistent.`
  }
  
  if (msg.includes('subscri')) {
    return `You have ${context.subscriptionCount} active subscriptions detected. Review them in SpendLens to find ones you might not be using anymore.`
  }
  
  return `Based on your financial data: income ₹${context.totalIncome?.toLocaleString('en-IN')}, expenses ₹${context.totalExpenses?.toLocaleString('en-IN')}, savings rate ${context.savingsRate?.toFixed(1)}%. Your health score is ${context.healthScore}/100. Ask me anything specific about your finances!`
}
