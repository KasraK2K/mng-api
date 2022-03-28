import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";
import { IPointList } from "../../common/interfaces/point";

class PointRepository extends Repository {
  list(args: IPointList): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const whereArray = [];
      if ("user_id" in args) whereArray.push(` r.user_id = ${Number(args.user_id) || 0} `);
      if ("venue_id" in args) whereArray.push(` r.venue_id = ${Number(args.venue_id) || 0} `);
      if ("scheme_id" in args) whereArray.push(` r.scheme_id = ${Number(args.scheme_id) || 0} `);

      const whereStr = whereArray.length > 0 ? " WHERE " + whereArray.join(" AND ") : "";

      const query = `
        SELECT p.point_id, p.rtimestamp, v.name AS venue_name, l.name AS scheme_name, p.point, p.type, p.latitude, p.longitude, p.point_uid,p.scheme_id, p.venue_id
        FROM public."UserPoints" p
        LEFT JOIN "Venues" v ON v.id = p.venue_id
        LEFT JOIN "LoyaltySchemes" l ON l.id = p.scheme_id
        ${whereStr}
        ORDER BY point_id DESC
        LIMIT 3000
      `;

      await super
        .executeQuery({ source: pg.pool_main, query })
        .then((response) => resolve(response.rows))
        .catch((err) => {
          logger(`{red}Error at getting UserPoints list{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }
}

export default new PointRepository();
