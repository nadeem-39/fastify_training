import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from "fastify";

export const bodyParser = (
  req: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) => {
  const body = req.body as Record<string, any>;
  const parsedBody: Record<string, any> = {};

  for (const [key, value] of Object.entries(body)) {
    if (value?.type === "field") {
      parsedBody[key] = value.value;
    } else {
      parsedBody[key] = value; // keep files
    }
  }

  req.body = parsedBody;
  done();
};
