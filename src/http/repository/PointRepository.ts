import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";
import _ from "lodash";

class PointRepository extends Repository {
  private collection = "Points";

  points(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const user_id = "user_id" in args ? parseInt(args.user_id) || 0 : 0;

      const query = `
        SELECT p.point_id, p.rtimestamp, v.name AS venue_name, l.name AS scheme_name, p.point, p.type, p.latitude, p.longitude, p.point_uid,p.scheme_id, p.venue_id
        FROM public."UserPoints" p
        LEFT JOIN "Venues" v ON v.id = p.venue_id
        LEFT JOIN "LoyaltySchemes" l ON l.id = p.scheme_id
        WHERE user_id = ${user_id} 
        ORDER BY point_id DESC
      `;

      await super
        .executeQuery({ source: pg.pool_main, query })
        .then((response) => resolve(response.rows))
        .catch((err) => {
          logger(`{red}Error at getting UserPoints{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }
}

export default new PointRepository();
