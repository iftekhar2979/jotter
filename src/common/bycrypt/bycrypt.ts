import * as bcrypt from 'bcryptjs';
import * as argon from 'argon2';

export async function comparePassword(
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return argon.verify(hashedPassword,plainTextPassword);
}

export async function comparePasswordWithArgon(
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return argon.verify(hashedPassword,plainTextPassword);
}


 export async function hashPassword(password: string):Promise<string> {
    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
  //  password = ;
    return await bcrypt.hash(password, salt)
  }

