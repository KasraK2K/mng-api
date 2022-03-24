import Logic from "./Logic";
import loyaltySchemeRepository from "../repository/LoyaltySchemeRepository";

class LoyaltySchemeLogic extends Logic {
  public list(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.scheme.list);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await loyaltySchemeRepository
          .list(value)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
    });
  }

  public upsert(args: Record<string, any> = {}): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args.data, objectSchema.scheme.upsert);
      value.scheme = "";

      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else {
        const sql_schema = {
          table_name: `"LoyaltySchemes"`,
          checking_data_field: "id",
          table_id: "id",
          returning: "id",
          fields: {
            name: { field: "name" },
            pointsCycle: { field: "point_cycle" },
            active: { field: "active" },
            isGroup: { field: "is_group" },
            description: { field: "description", is_string: true },
            colour1: { field: "colour1" },
            colour2: { field: "colour2" },
            textColour1: { field: "text_colour1" },
            textColour2: { field: "text_colour2" },
            scheme: { field: "scheme" },
          },
        };

        await loyaltySchemeRepository
          .upsert(value, sql_schema)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
      }
    });
  }
}

export default new LoyaltySchemeLogic();
