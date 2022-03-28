import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";
import _ from "lodash";

class ClaimRepository extends Repository {
  private collection = "Claims";

  claims(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const user_id = "user_id" in args ? parseInt(args.user_id) || 0 : 0;

      const query = `
        SELECT c.id, c.reward_id, c.rtimestamp, r.offer_id, o.description
        FROM public."UserRewardClaims" c
        LEFT JOIN "UserRewards" r ON r.id = c.reward_id
        LEFT JOIN "Offers" o ON o.id = r.offer_id
        WHERE r.user_id = ${user_id}
        ORDER BY reward_id
      `;

      await super
        .executeQuery({ source: pg.pool_main, query })
        .then((response) => resolve(response.rows))
        .catch((err) => {
          logger(`{red}Error at getting UserClaims{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }
}

export default new ClaimRepository();
