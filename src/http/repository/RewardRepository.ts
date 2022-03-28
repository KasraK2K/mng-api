import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";
import _ from "lodash";

class RewardRepository extends Repository {
  private collection = "Rewards";

  rewards(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const user_id = "user_id" in args ? parseInt(args.user_id) || 0 : 0;
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
        WHERE r.user_id = ${user_id} 
        GROUP BY r.id,v.name,l.name
      `;

      await super
        .executeQuery({ source: pg.pool_main, query })
        .then((response) => resolve(response.rows))
        .catch((err) => {
          logger(`{red}Error at getting UserRewards{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }
}

export default new RewardRepository();
