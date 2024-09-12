import bcrypt from "bcryptjs";

const saltRounds = 10;

export async function hashPass(password: string) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// Will return true or false depending on password verification outcome
export async function passCheck(inputPassword: string, storedPassword: string) {
  let check: boolean = await bcrypt.compare(inputPassword, storedPassword);

  return check;
}
