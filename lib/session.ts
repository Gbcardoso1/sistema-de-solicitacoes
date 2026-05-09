import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "admin_session";
const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "sistema-patrimonio-saquarema-2024-secret-key"
);

export { SESSION_COOKIE };

export async function criarToken(payload: { usuario: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SESSION_SECRET);
}

export async function verificarToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as { usuario: string };
  } catch {
    return null;
  }
}
