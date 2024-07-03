import { FastifyReply, FastifyRequest } from "fastify";
import { verifyPassword } from "../../utils/hash";
import { CreateUserInput, LoginInput } from "./user.schema";
import prisma from "../../utils/prisma";

import {
  createUser,
  findUserByEmail,
  findUsers,
  updateUser,
} from "./user.service";
import { server } from "../../app";

export async function registerUserHandler(
  request: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const user = await createUser(body);

    return reply.code(201).send(user);
  } catch (e) {
    console.log(e);
    return reply.code(500).send(e);
  }
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  // find a user by email
  const user = await findUserByEmail(body.email);

  if (!user) {
    return reply.code(401).send({
      message: "Invalid email or password",
    });
  }

  // verify password
  const correctPassword = verifyPassword({
    candidatePassword: body.password,
    salt: user.salt,
    hash: user.password,
  });

  if (correctPassword) {
    const { password, salt, ...rest } = user;
    // generate access token
    return { accessToken: server.jwt.sign(rest) };
  }

  return reply.code(401).send({
    message: "Invalid email or password",
  });
}

export async function getUsersHandler() {
  const users = await findUsers();

  return users;
}

export async function updateUserHandler(
  request: FastifyRequest<{ Params: { id: number }; Body: UpdateUserInput }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { email, name, password } = request.body;

  // Find the user by id
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!user) {
    return reply.code(404).send({
      message: "User not found",
    });
  }

    await updateUser(Number(id), {
      email,
      name,
    });
  
  return reply.code(200).send({
    message: "User updated successfully",
  });
}
