import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";
import { IClaimList } from "../../common/interfaces/claim";

class ClaimRepository extends Repository {
  list(args: IClaimList): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const whereArray = [];
      if ("user_id" in args) whereArray.push(` r.user_id = ${Number(args.user_id) || 0} `);
      if ("venue_id" in args) whereArray.push(` r.venue_id = ${Number(args.venue_id) || 0} `);
      if ("scheme_id" in args) whereArray.push(` r.scheme_id = ${Number(args.scheme_id) || 0} `);
      if ("reward_id" in args) whereArray.push(` r.reward_id = ${Number(args.reward_id) || 0} `);
      if ("offer_id" in args) whereArray.push(` r.offer_id = ${Number(args.offer_id) || 0} `);

      const whereStr = whereArray.length > 0 ? " WHERE " + whereArray.join(" AND ") : "";

      const query = `
        SELECT c.id, c.reward_id, c.rtimestamp, r.offer_id, o.description
        FROM public."UserRewardClaims" c
        LEFT JOIN "UserRewards" r ON r.id = c.reward_id
        LEFT JOIN "Offers" o ON o.id = r.offer_id
        ${whereStr}
        ORDER BY reward_id
        LIMIT 3000
      `;

      await super
        .executeQuery({ source: pg.pool_main, query })
        .then((response) => resolve(response.rows))
        .catch((err) => {
          logger(`{red}Error at getting UserClaims list{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }
}

export default new ClaimRepository();
