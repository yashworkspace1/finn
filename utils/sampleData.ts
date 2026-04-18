export function generateSampleCSV(): string {
  const transactions = [
    { date: '01/04/2025', description: 'SALARY CREDITED NEFT', debit: '', credit: '45000.00', balance: '52000.00' },
    { date: '02/04/2025', description: 'SWIGGY ORDER 9876', debit: '450.00', credit: '', balance: '51550.00' },
    { date: '03/04/2025', description: 'UBER RIDE BANGALORE', debit: '180.00', credit: '', balance: '51370.00' },
    { date: '04/04/2025', description: 'AMAZON SHOPPING', debit: '2340.00', credit: '', balance: '49030.00' },
    { date: '05/04/2025', description: 'NETFLIX SUBSCRIPTION', debit: '649.00', credit: '', balance: '48381.00' },
    { date: '06/04/2025', description: 'ZOMATO FOOD ORDER', debit: '380.00', credit: '', balance: '48001.00' },
    { date: '07/04/2025', description: 'ELECTRICITY BILL BBPS', debit: '1200.00', credit: '', balance: '46801.00' },
    { date: '08/04/2025', description: 'PETROL HP PUMP', debit: '2000.00', credit: '', balance: '44801.00' },
    { date: '09/04/2025', description: 'RENT PAYMENT NEFT', debit: '12000.00', credit: '', balance: '32801.00' },
    { date: '10/04/2025', description: 'SPOTIFY PREMIUM', debit: '119.00', credit: '', balance: '32682.00' },
    { date: '11/04/2025', description: 'APOLLO PHARMACY', debit: '850.00', credit: '', balance: '31832.00' },
    { date: '12/04/2025', description: 'IRCTC TRAIN TICKET', debit: '1450.00', credit: '', balance: '30382.00' },
    { date: '13/04/2025', description: 'FREELANCE PAYMENT IMPS', debit: '', credit: '8000.00', balance: '38382.00' },
    { date: '14/04/2025', description: 'BIGBASKET GROCERY', debit: '1680.00', credit: '', balance: '36702.00' },
    { date: '15/04/2025', description: 'OLA CAB BOOKING', debit: '220.00', credit: '', balance: '36482.00' },
    { date: '16/04/2025', description: 'HOTSTAR SUBSCRIPTION', debit: '299.00', credit: '', balance: '36183.00' },
    { date: '17/04/2025', description: 'ATM WITHDRAWAL', debit: '3000.00', credit: '', balance: '33183.00' },
    { date: '18/04/2025', description: 'ZOMATO FOOD ORDER', debit: '520.00', credit: '', balance: '32663.00' },
    { date: '19/04/2025', description: 'GROWW MUTUAL FUND SIP', debit: '5000.00', credit: '', balance: '27663.00' },
    { date: '20/04/2025', description: 'AIRTEL POSTPAID BILL', debit: '499.00', credit: '', balance: '27164.00' },
    { date: '21/04/2025', description: 'SWIGGY ORDER 1234', debit: '340.00', credit: '', balance: '26824.00' },
    { date: '22/04/2025', description: 'AMAZON SHOPPING SPIKE', debit: '8500.00', credit: '', balance: '18324.00' },
    { date: '23/04/2025', description: 'UBER RIDE AIRPORT', debit: '650.00', credit: '', balance: '17674.00' },
    { date: '24/04/2025', description: 'CLINIC CONSULTATION', debit: '500.00', credit: '', balance: '17174.00' },
    { date: '25/04/2025', description: 'UDEMY COURSE PURCHASE', debit: '399.00', credit: '', balance: '16775.00' },
    { date: '26/04/2025', description: 'BLINKIT GROCERY', debit: '920.00', credit: '', balance: '15855.00' },
    { date: '27/04/2025', description: 'JIO RECHARGE', debit: '239.00', credit: '', balance: '15616.00' },
    { date: '28/04/2025', description: 'PVR CINEMA TICKETS', debit: '760.00', credit: '', balance: '14856.00' },
    { date: '29/04/2025', description: 'INTEREST CREDITED SBI', debit: '', credit: '125.00', balance: '14981.00' },
    { date: '30/04/2025', description: 'ZERODHA STOCKS', debit: '2000.00', credit: '', balance: '12981.00' },
  ]

  const headers = 'Date,Description,Debit,Credit,Balance\n'
  const rows = transactions.map(t => 
    `${t.date},${t.description},${t.debit},${t.credit},${t.balance}`
  ).join('\n')
  
  return headers + rows
}

export function downloadSampleCSV() {
  const csv = generateSampleCSV()
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'finn-sample-statement.csv'
  a.click()
  URL.revokeObjectURL(url)
}
