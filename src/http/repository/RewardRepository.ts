import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";
import { IRewardList } from "../../common/interfaces/reward";

class RewardRepository extends Repository {
  list(args: IRewardList): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const whereArray = [];
      if ("user_id" in args) whereArray.push(` r.user_id = ${Number(args.user_id) || 0} `);
      if ("venue_id" in args) whereArray.push(` r.venue_id = ${Number(args.venue_id) || 0} `);
      if ("scheme_id" in args) whereArray.push(` r.scheme_id = ${Number(args.scheme_id) || 0} `);

      const whereStr = whereArray.length > 0 ? " WHERE " + whereArray.join(" AND ") : "";

      const query = `
        SELECT r.id AS reward_id, 
          coalesce(v.name,'') AS venue_name, 
          coalesce(l.name,'') AS scheme_name, 
          r.scheme_id, r.venue_id, r.offer_id, r.user_id, r.rtimestamp, r.uses, 
          count(c.reward_id) AS count,
          coalesce(max(c.rtimestamp)::TEXT,'') AS claim_rtimestamp
        FROM "UserRewards" r
        LEFT JOIN "UserRewardClaims" c ON r.id = c.reward_id
        LEFT JOIN "Venues" v ON r.venue_id = v.id
        LEFT JOIN "LoyaltySchemes" l ON r.scheme_id = l.id
        ${whereStr}
        GROUP BY r.id,v.name,l.name
        LIMIT 3000
      `;

      await super
        .executeQuery({ source: pg.pool_main, query })
        .then((response) => resolve(response.rows))
        .catch((err) => {
          logger(`{red}Error at getting UserRewards list{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }
}

export default new RewardRepository();
