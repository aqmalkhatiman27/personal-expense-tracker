export function formatMoney(amount) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(Number(amount) || 0)
}

export function dateForInput(value) {
  return value ? String(value).slice(0, 10) : ''
}

export function todayLocal() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
