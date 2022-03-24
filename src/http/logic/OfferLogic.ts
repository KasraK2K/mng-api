import Logic from "./Logic";
import offerRepository from "../repository/OfferRepository";

class OfferLogic extends Logic {
  public list(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.offer.list);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await offerRepository
          .list(value)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
    });
  }

  public upsert(args: Record<string, any> = {}): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args.data, objectSchema.offer.upsert);

      if ("errors" in value) {
        reject({ result: false, error_code: 3002, errors: value.errors });
        return;
      } else {
        value.time_tag_str = value.time_tags.join("|");
        value.days = value.available_days.join("|");
        value.categories = value.type_categories.join("|");
        value.icon = "KISS";
        value.type = "OFFER";
        value.instruction = "";

        const sql_schema = {
          table_name: `"Offers"`,
          checking_data_field: "id",
          table_id: "id",
          returning: "id",
          fields: {
            venueID: { field: "venue_id" },
            description: { field: "description" },
            icon: { field: "icon" },
            type: { field: "type" },
            instruction: { field: "type" },
            active: { field: "active" },
            hidden: { field: "is_group" },
            uses: { field: "uses" },
            startTime: { field: "start_time" },
            endTime: { field: "end_time" },
            startDate: { field: "start_date" },
            endDate: { field: "end_date" },
            teaser: { field: "teaser" },
            requiredInitialPoints: { field: "required_initial_points" },
            requiredSeparatePoints: { field: "required_separate_points" },
            cooldown: { field: "cooldown" },
            loyaltySchemeID: { field: "scheme_id" },
            condition: { field: "condition" },
            time_tag: { field: "time_tags", is_array: true },
            timeTags: { field: "time_tag_str" }, // support old version
            available_days: { field: "available_days", is_array: true },
            days: { field: "days" }, // support old version
            type_categories: { field: "type_categories", is_array: true },
            categories: { field: "categories" }, // support old version
          },
        };

        await offerRepository
          .upsert(value, sql_schema)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
      }
    });
  }
}

export default new OfferLogic();
