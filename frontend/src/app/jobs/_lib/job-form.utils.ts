export function normalizeCronExpression(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

