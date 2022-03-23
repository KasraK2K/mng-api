export const objectSchema = {
  login: {
    email: { type: "string", force_type: true },
    password: { type: "string", force_type: true },
  },
  manager: {
    list: {
      id: { type: "int" },
      email: { type: "string" },
    },
    upsert: {
      id: { type: "int", default: 0 },
      name: { type: "string", force_type: true, min_length: 5, cut_at_max: 100 },
      email: { type: "string", force_type: true, min_length: 5, cut_at_max: 100 },
      access: { type: "string", force_type: true, min_length: 5, cut_at_max: 50 },
      password: { type: "string", min_length: 5, cut_at_max: 50 },
    },
  },
  venue: {
    list: {
      field: { type: "string", force_type: true },
      search: { type: "object", default: {} },
    },
    upsert: {
      id: { type: "int" },
      name: { type: "string", force_type: true, min_length: 5, cut_at_max: 240 },
      description: { type: "string", force_type: true, min_length: 5, cut_at_max: 4000 },
      latitude: { type: "float" },
      longitude: { type: "float" },
      street: { type: "string", cut_at_max: 10 },
      city: { type: "string", min_length: 2, cut_at_max: 240 },
      country: { type: "string", min_length: 5, cut_at_max: 240 },
      zip: { type: "string", min_length: 2, cut_at_max: 240 },
      area: { type: "string", min_length: 2, cut_at_max: 240 },
      timezone: { type: "string", min_length: 2, cut_at_max: 240 },
      active: { type: "boolean", default: false },
      released: { type: "boolean", default: false },
      cuisines: { type: "string", cut_at_max: 240 },
      order_link: { type: "string", cut_at_max: 70 },
      point_limit: { type: "int", min_value: 1 },
      point_period: { type: "int", min_value: 3600 },
      distance_limit: { type: "int", min_value: 1000 },
      mapping_vanue_id: { type: "string" },
      contact_number: { type: "string" },
      online_ordering_commission: { type: "float" },
      point_formula: { type: "float" },
      currency: { type: "int" },
      launch_date: { type: "string", is_date: true },
      working_hours: { type: "array", force_type: true },
      beacons: { type: "array", force_type: true, min_length: 1 },
      scheme_ids: { type: "array", force_type: true, min_length: 1 },
      categories: { type: "array", force_type: true, min_length: 1 },
    },
  },
};

export default objectSchema;
