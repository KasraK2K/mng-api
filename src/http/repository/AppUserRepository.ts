import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";

class AppUserRepository extends Repository {
  list(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const whereArray = [];
      if ("search" in args) {
        const search = args.search;
        const searchInt = parseInt(args.search) || -1;
        whereArray.push(`(name LIKE '%${search}%') OR (email LIKE '%${search}%') OR (id = ${searchInt})`);
      }
      if ("id" in args) whereArray.push(`(id = ${Number(args.id) || 0})`);

      const whereStr = whereArray.length ? whereArray.join(" AND ") : "";

      const fields =
        "summary" in args
          ? " id , email , name , gender , registered , approved , birthday , system , device , blacklisted , login_type , build , os_type  "
          : `id , email, name, gender, registered, approved, birthday, firebase, version, identifier, system, device, 
        "lastIP" as last_ip, tracker, blacklisted, "contactNumber" as contact_number, "addressLine1" as address_line1,
        "addressLine2"  as address_line2, "addressCity"  as address_city, "addressCountry"  as address_country, 
        "addressPostcode" as address_postcode, rtimestamp as register_timestamp, login_type, os_type, build `;

      await super
        .readTable(
          {
            fields: fields,
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
}

export default new AppUserRepository();
