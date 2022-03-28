import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";

class AppUserRepository extends Repository {
  private collection = "Users";

  list(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const where = [];
      if ("search" in args) {
        const search = args.search;
        const searchInt = parseInt(args.search) || -1;
        where.push(`(name LIKE '%${search}%') OR (email LIKE '%${search}%') OR (id = ${searchInt})`);
      }
      const whereStr = where.length ? where.join(" AND ") : "";

      await super
        .readTable(
          {
            fields:
              " id , email , name , gender , registered , approved , birthday , system , device , blacklisted , login_type , build , os_type  ",
            table: ' "Users" ',
            where: whereStr,
            limit: "200",
          },
          pg.pool_main
        )
        .then((response) => resolve(response))
        .catch((err) => {
          logger(`{red}Error at getting AppUserList{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }

  details(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const user_id = "id" in args ? args.id : 0;

      const fields = `id , email, name, gender, registered, approved, birthday, firebase, version, identifier, system, device, 
        "lastIP" as last_ip, tracker, blacklisted, "contactNumber" as contact_number, "addressLine1" as address_line1,
        "addressLine2"  as address_line2, "addressCity"  as address_city, "addressCountry"  as address_country, 
        "addressPostcode" as address_postcode, rtimestamp as register_timestamp, login_type, os_type, build `;

      await super
        .readTable(
          {
            fields: fields,
            table: ' "Users" ',
            where: ` id = ${user_id} `,
            limit: "10",
          },
          pg.pool_main
        )
        .then((response) => resolve({ result: true, data: response }))
        .catch((err) => {
          logger(`{red}Error at getting AppUserDetails{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }

  rewards(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const user_id = "user_id" in args ? parseInt(args.user_id) || 0 : 0;
      const query = `
        SELECT r.id as reward_id, 
          coalesce(v.name,'') as venue_name, 
          coalesce(l.name,'') as scheme_name, 
          r.scheme_id, r.venue_id, r.offer_id, r.user_id, r.rtimestamp, r.uses, 
          count(c.reward_id) as count,
          coalesce(max(c.rtimestamp)::TEXT,'') as claim_rtimestamp
        FROM "UserRewards" r
        LEFT JOIN "UserRewardClaims" c ON r.id = c.reward_id
        LEFT JOIN "Venues" v ON r.venue_id = v.id
        LEFT JOIN "LoyaltySchemes" l ON r.scheme_id = l.id
        WHERE r.user_id = ${user_id} 
        GROUP BY r.id,v.name,l.name
      `;

      await super
        .executeQuery({ source: pg.pool_main, query: query })
        .then((response) => resolve({ count: response.rowCount, list: response.rows }))
        .catch((err) => {
          logger(`{red}Error at getting UserRewardsList{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }
}

export default new AppUserRepository();
