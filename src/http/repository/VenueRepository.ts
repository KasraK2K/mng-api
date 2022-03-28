import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";
import _ from "lodash";

class VenueRepository extends Repository {
  list(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      // ────────────────────────────── START: GENERATE WHERE STRING ─────
      const where: string[] = [];
      if (_.keys(args.search).length) {
        if (args.search.general) {
          const generalSearch = args.search.general;
          const generalSearchInt = parseInt(generalSearch) || -1;
          where.push(`
          (v.name LIKE '%${generalSearch}%')
          OR (v."loyaltySchemeID" = ${generalSearchInt})
          OR (v.id = ${generalSearchInt})
        `);
        }

        if ((args.search.beacon || "").length > 0) where.push(` v.beacons LIKE '%${args.search.beacon}%' `);

        if (args.search.id) where.push(` v.id = ${parseInt(args.search.id) || -1} `);
      }

      const whereStr = where.length > 0 ? " WHERE " + where.join(" AND ") : "";
      // ──────────────────────────────── END: GENERATE WHERE STRING ─────

      // ────────────────────────────── START: GENERATE FIELD STRING ─────
      let fields = `
        v.id, v.name, v.description,  v.latitude, v.longitude, v.street, v.city, v.country, v.zip, v.area, v.timezone, 
        v.active, v.released, v.cuisines, v.orderlink AS order_link, v."pointPeriod" AS point_period, v."pointLimit" AS point_limit,
        v."distanceLimit" AS distance_limit, v."mappingVanueID" AS mapping_venue_id, v."onlineOrderingCommission"::float AS online_ordering_commission,
        v."contactNumber" AS contact_number, v."pointAmountFormula"::float AS point_formula, v.currency, v.working_hours , v.scheme_ids,
        v.launch AS launch_date, v.beacon AS beacons, v.venue_categories AS categories
      `;

      if ("fields" in args) {
        if (args.fields == "summary") {
          fields = `v.id, v.active, v."loyaltySchemeID" AS scheme_id, v.released, v.name AS venue_name, v.country, v.beacons`;
        }
      }
      // ──────────────────────────────── END: GENERATE FIELD STRING ─────

      const query = `
        SELECT ${fields}, l.name AS scheme_name
        FROM "Venues" v
        LEFT JOIN "LoyaltySchemes" l ON l.id = v."loyaltySchemeID"
        ${whereStr}
        ORDER BY id DESC LIMIT 200
      `;

      await super
        .executeQuery({ query, source: pg.pool_main })
        .then((response) => {
          const list: Record<string, any>[] = response.rows;
          return resolve(list);
        })
        .catch((err) => {
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject({ result: false, err });
        });
    });
  }

  upsert(args: Record<string, any>, sql_schema: Record<string, any>) {
    return new Promise(async (resolve, reject) => {
      const query = super.getUpsertQuery(args, sql_schema);
      await super
        .executeQuery({ query, source: pg.pool_main })
        .then((qres) => {
          const result = qres.rows;
          return resolve(result);
        })
        .catch((err) => reject(err));
    });
  }
}

export default new VenueRepository();
