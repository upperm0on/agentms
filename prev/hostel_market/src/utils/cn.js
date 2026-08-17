export function cn(...inputs) {
  const filtered = inputs.filter(Boolean)
  return filtered.join(' ')
}
