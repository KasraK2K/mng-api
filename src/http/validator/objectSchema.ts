export const objectSchema = {
  // ────────────────────────────────────────────────────────────
  //   :::::: L O G I N : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────
  login: {
    email: { type: "string", force_type: true },
    password: { type: "string", force_type: true },
  },
  // ──────────────────────────────────────────────────────────────────────────
  //   :::::: M A N A G E R   U S E R : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────
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
  // ────────────────────────────────────────────────────────────
  //   :::::: V E N U E : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────
  venue: {
    list: {
      fields: { type: "string", force_type: true },
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
  // ────────────────────────────────────────────────────────────────
  //   :::::: S C H E M E S : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────
  scheme: {
    list: {
      fields: { type: "string", force_type: true },
      search: { type: "object", default: {} },
    },
    upsert: {
      id: { type: "int" },
      point_cycle: { type: "int", min_value: 1 },
      name: { type: "string", force_type: true, min_length: 5, cut_at_max: 100 },
      active: { type: "boolean", default: false },
      is_group: { type: "boolean", default: false },
      description: { type: "string", force_type: true, min_length: 5, cut_at_max: 200 },
      colour1: { type: "string", cut_at_max: 10 },
      colour2: { type: "string", cut_at_max: 10 },
      text_colour1: { type: "string", cut_at_max: 10 },
      text_colour2: { type: "string", cut_at_max: 10 },
    },
  },
  // ────────────────────────────────────────────────────────────
  //   :::::: O F F E R : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────
  offer: {
    list: {
      fields: { type: "string", force_type: true },
      search: { type: "object", default: {} },
    },
    upsert: {
      id: { type: "int" },
      venue_id: { type: "int" },
      description: { type: "string", force_type: true, min_length: 5, cut_at_max: 100 },
      active: { type: "boolean", default: false },
      hidden: { type: "boolean", default: false },
      cooldown: { type: "boolean", default: false },
      uses: { type: "int", default: 1 },
      start_time: { type: "string", cut_at_max: 5 },
      end_time: { type: "string", cut_at_max: 5 },
      start_date: { type: "string", cut_at_max: 10 },
      end_date: { type: "string", cut_at_max: 10 },
      required_initial_points: { type: "int" },
      required_separate_points: { type: "int" },
      scheme_id: { type: "int" },
      condition: { type: "string", cut_at_max: 250 },
      time_tags: { type: "array", force_type: true },
      available_days: { type: "array", force_type: true },
      type_categories: { type: "type_categories", force_type: true },
      teaser: { type: "string", cut_at_max: 40 },
    },
  },
  // ──────────────────────────────────────────────────────────────────
  //   :::::: A P P   U S E R : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────
  appUser: {
    list: {
      search: { type: "object", default: {} },
    },
    details: {
      id: { type: "int", force_type: true },
    },
  },
  // ──────────────────────────────────────────────────────────────
  //   :::::: R E W A R D : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────
  rewards: {
    user_id: { type: "int", force_type: true },
  },
  // ────────────────────────────────────────────────────────────
  //   :::::: C L A I M : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────
  claims: {
    user_id: { type: "int", force_type: true },
  },
  // ────────────────────────────────────────────────────────────
  //   :::::: P O I N T : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────
  points: {
    user_id: { type: "int", force_type: true },
  },
};

export default objectSchema;
