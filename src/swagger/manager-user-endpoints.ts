import { TagsEnum } from "./enums";

export default {
  /* -------------------------------------------------------------------------- */
  /*                             ANCHOR: SHAKE HAND                             */
  /* -------------------------------------------------------------------------- */
  "/mng-users/list": {
    post: {
      tags: [TagsEnum.MANAGER_USER],
      summary: "Returns list of manager users.",
      description: "This api is created to get list of manager users.",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              in: "body",
              required: ["api_key"],
              properties: {
                api_key: { type: "string", example: { $ref: "#/variables/api_key" } },
              },
            },
          },
        },
      },
      responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
    },
  },
};
