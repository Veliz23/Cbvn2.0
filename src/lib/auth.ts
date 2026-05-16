import { SignJWT, jwtVerify } from 'jose'

const TOKEN_COOKIE = 'cbvn_session'
const TOKEN_TTL = 7 * 24 * 60 * 60 // 7 días en segundos

export { TOKEN_COOKIE }

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? 'cbvn-dev-secret-change-in-production'
  return new TextEncoder().encode(secret)
}

export async function createToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL}s`)
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (typeof payload.email !== 'string') return null
    return { email: payload.email }
  } catch {
    return null
  }
}

export function checkCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@cbvn.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'cbvn1234'
  return email === adminEmail && password === adminPassword
}
