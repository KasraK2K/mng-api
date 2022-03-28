import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";
import _ from "lodash";

class OfferRepository extends Repository {
  list(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      // ─── START: GENERATE WHERE STRING ────────────────────────────────
      const where: string[] = [];
      if (_.keys(args.search).length) {
        if (args.search.id) where.push(` o.id = ${parseInt(args.search.id) || -1} `);
        if (args.search.scheme_id) where.push(` o."loyaltySchemeID" = ${args.search.scheme_id} `);
        if (args.search.venue_id) where.push(` o."venueID" = ${args.search.venue_id} `);
      }
      const whereStr = where.length > 0 ? " WHERE " + where.join(" AND ") : "";
      // ─── END: GENERATE WHERE STRING ──────────────────────────────────

      // ─── START: GENERATE FIELD STRING ────────────────────────────────
      let fields = `
        o.id, o."venueID" AS venue_id, o.description, o.icon, o.type, o.uses, o.hidden,
        o."startTime" AS start_time, o."endTime" AS end_time, o."startDate" AS start_date, o."endDate" AS end_date,
        o."requiredInitialPoints" AS required_initial_points, o."requiredSeparatePoints" AS required_separate_points,
        o.active, o.instruction, o.cooldown, o.teaser, o.image, o.condition, o.created,
        o."loyaltySchemeID" AS scheme_id, o."replacedBy" AS replaced_by, o.rtimestamp, o.utimestamp,
        o.time_tag AS time_tags, o.available_days, o.type_categories
      `;

      if ("fields" in args) {
        if (args.fields == "summary") {
          fields = `
            o.id, o."venueID" AS venue_id, o.description, o.uses, o.hidden,
            o."requiredInitialPoints" AS required_initial_points, o."requiredSeparatePoints" AS required_separate_points,
            o.active, o."loyaltySchemeID" AS scheme_id
          `;
        }
      }
      // ─── END: GENERATE FIELD STRING ──────────────────────────────────

      const query = `
        SELECT ${fields}, coalesce(l.name,'') AS scheme_name, coalesce(v.name,'') AS venue_name
        FROM "Offers" o
        LEFT JOIN "LoyaltySchemes" l ON l.id = o."loyaltySchemeID"
        LEFT JOIN "Venues" v ON v.id = o."venueID"
        ${whereStr}
        ORDER BY id DESC limit 200
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

export default new OfferRepository();
