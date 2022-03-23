import Logic from "./Logic";
import venueRepository from "../repository/VenueRepository";
import { beaconValidator } from "../validator/objectValidator";

class VenueLogic extends Logic {
  public async list(args: Record<string, any> = {}): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.venue.list);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await venueRepository
          .list(value)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
    });
  }

  public async upsert(args: Record<string, any> = {}): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args.data, objectSchema.venue.upsert);

      if (!value.errors) {
        await beaconValidator(value);
        //await Validator.validateVenueWorkingHours(value, value.working_hours);
      }

      if ("errors" in value) {
        return reject({ result: false, error_code: 3002, errors: value.errors });
      } else {
        value.beacons_old = value.beacons[0];
        value.scheme_id_old = value.scheme_ids[0];

        const sql_schema = {
          table_name: `"Venues"`,
          checking_data_field: "id",
          table_id: "id",
          returning: "id",
          fields: {
            name: { field: "name" },
            description: { field: "description" },
            latitude: { field: "latitude" },
            longitude: { field: "longitude" },
            timezone: { field: "timezone" },
            street: { field: "street" },
            city: { field: "city" },
            country: { field: "country" },
            zip: { field: "zip" },
            area: { field: "area" },
            active: { field: "active" },
            released: { field: "released" },
            launch: { field: "launch_date" },
            cuisines: { field: "cuisines" },
            orderlink: { field: "order_link" },
            pointLimit: { field: "point_limit" },
            pointPeriod: { field: "point_period" },
            distanceLimit: { field: "distance_limit" },
            mappingVanueID: { field: "mapping_vanue_id" },
            onlineOrderingCommission: { field: "online_ordering_commission" },
            pointAmountFormula: { field: "point_formula" },
            contactNumber: { field: "contact_number" },
            currency: { field: "currency" },
            beacon: { field: "beacons", is_array: true },
            beacons: { field: "beacons_old" },
            scheme_ids: { field: "scheme_ids", is_array: true },
            loyaltySchemeID: { field: "scheme_id_old" },
            working_hours: { field: "working_hours", is_json: true },
            venue_categories: { field: "categories", is_array: true },
          },
        };

        await venueRepository
          .upsert(args.data, sql_schema)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
      }
    });
  }
}

export default new VenueLogic();
