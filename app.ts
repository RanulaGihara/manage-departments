import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import userRoutes from "./modules/user/user.route";
import productRoutes from "./modules/product/product.route";
import fastifyJwt , { JWT } from "@fastify/jwt";
import { userSchemas } from "./modules/user/user.schema";
// import { productSchemas } from "./modules/product/product.schema";

export const server = Fastify();

server.register(fastifyJwt, {
  secret: "ieee_demo_Secret_Key",
});

server.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      return reply.send(error);
    }
  }
);

server.get("/health-check", async () => {
  return "OK";
});

async function main() {
  for (const schema of [...userSchemas]) {
    server.addSchema(schema);
  }

  console.log("Registering routes working fin...");
  
  server.register(userRoutes, { prefix: "/api/users" });
  // server.register(productRoutes, { prefix: "/api/products" });

  console.log("Registering routes...");
  
  try {
    await server.listen(3002, "0.0.0.0");
    console.info("Server listening on port 3002");
  } catch (error) {
    console.log("Error starting server");
    
    console.error(error);
    process.exit(1); 
  }
}

main();
