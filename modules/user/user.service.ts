import prisma from "../../utils/prisma";
import { hashPassword } from "../../utils/hash";
import { CreateUserInput } from "./user.schema";

export async function createUser(input: CreateUserInput) {
  // const { email, name, password } = input;
  const { password, ...rest } = input;

  const { hash, salt } = hashPassword(password);

  const user = await prisma.user.create({
    data: { ...rest, salt, password: hash },
  });
  return user;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function findUsers() {
  return prisma.user.findMany({
    select: {
      email: true,
      name: true,
      id: true,
    },
  });
}

export async function updateUser(id: number, updatedFields: Partial<User>) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (updatedFields.password) {
    const { salt, hash, ...rest } = user;
    const { salt: newSalt, hash: newHash } = hashPassword(updatedFields.password);

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...rest,
        salt: newSalt,
        password: newHash,
      },
    });
  } else {
    await prisma.user.update({
      where: {
        id,
      },
      data: updatedFields,
    });
  }

  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}