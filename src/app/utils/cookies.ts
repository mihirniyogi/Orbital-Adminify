import { JwtPayload, sign, verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { JWT_TOKEN, MAX_AGE } from "../constants/constants";
import { UnauthorisedError, UserNotFoundError } from "../errors/errors";
import { serialize } from "cookie";

export async function extractDetailsFromCookies(): Promise<JwtPayload> {
  const token = cookies().get(JWT_TOKEN);
  if (!token) {
    throw new UserNotFoundError();
  }
  const { value } = token;
  const secret = process.env.JWT_SECRET || "";
  const decoded = verify(value, secret) as JwtPayload;

  if (!decoded) {
    throw new UnauthorisedError();
  }

  return decoded.payload;
}

export function createCookie(payload: any, expired = false): string {
  const expiry = expired ? -1 : MAX_AGE;

  const secret = process.env.JWT_SECRET || "";
  const token = sign({ payload }, secret, {
    expiresIn: expiry,
  });
  const serialized = serialize(JWT_TOKEN, token, {
    httpOnly: true,
    maxAge: expiry,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return serialized;
}
