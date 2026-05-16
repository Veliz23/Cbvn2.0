import crypto from 'crypto'

const SECRET = process.env.AUTH_SECRET ?? 'cbvn-dev-secret-change-in-production'
const TOKEN_COOKIE = 'cbvn_session'
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000 // 7 días

export { TOKEN_COOKIE }

export function createToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + TOKEN_TTL })).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyToken(token: string): { email: string } | null {
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return null
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
    if (sig !== expected) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (data.exp < Date.now()) return null
    return { email: data.email }
  } catch {
    return null
  }
}

export function checkCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@cbvn.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'cbvn1234'
  return email === adminEmail && password === adminPassword
}
