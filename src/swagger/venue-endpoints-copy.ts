import { TagsEnum } from "./enums";

export default {
  // ────────────────────────────────────────────────────────────────────────
  //   :::::: V E N U E S   L I S T : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────────────
  "/venues/list": {
    post: {
      tags: [TagsEnum.VENUE],
      summary: "Returns list of manager users.",
      description: "This api is created to get list of manager users.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              in: "body",
              required: ["api_key"],
              properties: {
                api_key: { type: "string", example: { $ref: "#/variables/api_key" } },
                fields: { type: "string", example: "summary" },
                search: {
                  type: "object",
                  example: {
                    _general: { $ref: "#/variables/search/general" },
                    _beacon: { $ref: "#/variables/search/beacon" },
                    id: { $ref: "#/variables/search/id" },
                  },
                },
              },
            },
          },
        },
      },
      responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
    },
  },
  // ──────────────────────────────────────────────────────────────────────────
  //   :::::: V E N U E   U P S E R T : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────
  "/venues/upsert": {
    post: {
      tags: [TagsEnum.VENUE],
      summary: "Returns list of manager users.",
      description: "This api is created to get list of manager users.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              in: "body",
              required: ["api_key", "name", "email"],
              properties: {
                api_key: { type: "string", example: { $ref: "#/variables/api_key" } },
                source: { type: "string", example: "mng" },
                data: {
                  trype: "object",
                  properties: {
                    id: { type: "number", example: 0 },
                    name: { type: "string", example: "venue name" },
                    description: { type: "string", example: "venue description" },
                    latitude: { type: "integer", example: 51.4570633965138 },
                    longitude: { type: "integer", example: -0.188640942622881 },
                    street: { type: "string", example: "street address" },
                    city: { type: "string", example: "city name" },
                    country: { type: "string", example: "country name" },
                    zip: { type: "string", example: "zip code" },
                    area: { type: "string", example: "area name" },
                    categories: { type: "array", items: { type: "string" }, example: ["Restaurant"] },
                    timezone: { type: "string", example: "Europe/London" },
                    active: { type: "boolean", example: false },
                    released: { type: "boolean", example: true },
                    launch_date: { type: "string", example: "2020-12-02" },
                    cuisines: { type: "string", example: "cuisine name" },
                    order_link: { type: "string", example: "order_link" },
                    point_limit: { type: "integer", example: 1 },
                    point_period: { type: "integer", example: 3600 },
                    distance_limit: { type: "integer", example: 1000 },
                    mapping_vanue_id: { type: "string", example: "mapping_vanue_id" },
                    online_ordering_commission: { type: "integer", example: 12.5 },
                    point_formula: { type: "integer", example: 4.4 },
                    currency: { type: "integer", example: 4.4 },
                    contact_number: { type: "string", example: "contact_number" },
                    scheme_ids: { type: "array", items: { type: "integer" }, example: [123, 123] },
                    beacons: { type: "array", items: { type: "string" }, example: ["10002-12347"] },
                    working_hours: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", example: "open" },
                          time1: { type: "string", example: "0900" },
                          time2: { type: "string", example: "2230" },
                          day: { type: "string", example: "mon" },
                        },
                      },
                      example: [
                        { type: "open", time1: "1000", time2: "2230", day: "" },
                        { type: "open", time1: "1200", time2: "2230", day: "tue" },
                        { type: "open", time1: "1200", time2: "2230", day: "wed" },
                        { type: "open", time1: "1200", time2: "2230", day: "thu" },
                        { type: "open", time1: "1200", time2: "2230", day: "fri" },
                        { type: "open", time1: "1200", time2: "2230", day: "sat" },
                        { type: "closed", time1: "", time2: "", day: "sun" },
                        { type: "closed", time1: "", time2: "", day: "hol" },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
    },
  },
};
