import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";
import _ from "lodash";

class LoyaltySchemeRepository extends Repository {
  private collection = "venues";

  list(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      // ─── START: GENERATE WHERE STRING ────────────────────────────────
      const where: string[] = [];
      if (_.keys(args.search).length) {
        if (args.search.id) where.push(` id = ${parseInt(args.search.id) || -1} `);
        if (args.search.name) where.push(`name ILIKE '%${args.search.name}%' `);
      }

      const whereStr = where.length > 0 ? " WHERE " + where.join(" AND ") : "";
      // ─── END: GENERATE WHERE STRING ──────────────────────────────────

      // ─── START: GENERATE FIELD STRING ────────────────────────────────
      let fields = ` id, name, "isGroup" AS is_group, "pointsCycle" AS point_cycle, active, logo, image,
        colour1, colour2, "textColour1" AS text_color1, "textColour2"as text_color2, rtimestamp, description
      `;

      if ("fields" in args) {
        if (args.fields == "summary") {
          fields = ` id, name, active, "pointsCycle" AS point_cycle, "isGroup" AS is_group, rtimestamp  `;
        }
      }
      // ─── END: GENERATE FIELD STRING ──────────────────────────────────

      const query = ` SELECT ${fields} FROM "LoyaltySchemes" ${whereStr} ORDER BY id DESC limit 200`;

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
      const query = await super.getUpsertQuery(args, sql_schema);
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

export default new LoyaltySchemeRepository();
