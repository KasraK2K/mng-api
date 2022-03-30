import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";

class MngUserRepository extends Repository {
  list(args: Record<string, any>): Promise<Record<string, any>[]> {
    return new Promise(async (resolve, reject) => {
      const whereArray = [];
      if (args.email) whereArray.push(` email = '${args.email}' `);
      if (args.id) whereArray.push(` id = '${args.id}' `);
      const whereStr = whereArray.join(" AND ");

      await super
        .readTable({ table: " mng_users ", where: whereStr }, pg.pool_cloud)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          logger(`{red} error manager user list {reset}`);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          reject(err);
        });
    });
  }

  async upsert(data: Record<string, any>) {
    return await new Promise(async (resolve, reject) => {
      /* REVIEW In this case we created query by hand */
      //const query = super.getUpsertQuery(data, schema);

      const { id, email, password, hashPassword, name, access } = data;

      let query = "";
      let existUser: Record<string, any>[] = [];

      await this.list({ email })
        .then((response) => {
          existUser = response;
        })
        .catch((err) => {
          logger(`{red} error manager user upsert {reset}`);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          reject(err);
        });

      // ─────────────────────────────────────────── INSERT NEW USER ─────
      if (Number(id) === 0) {
        if (existUser.length) return reject({ result: false, error_code: 3003 });
        else
          query = `
            INSERT INTO mng_users
            (email, password, name, access )
            VALUES ('${email}', '${hashPassword}', '${name}' , '${access}' )
            RETURNING id
          `;
      }
      // ───────────────────────────────────────── UPDATE EXIST USER ─────
      else {
        const editPassword = password.length ? `, password = '${hashPassword}'` : "";
        if (existUser.length && existUser[0].id !== Number(id)) {
          return reject({ result: false, error_code: 3003 });
        } else {
          query = `
            Update mng_users
            SET name = '${name}', email = '${email}', access = '${access}' ${editPassword}
            WHERE id = '${id}'
          `;
        }
      }

      query &&
        (await super
          .executeQuery({ query, source: pg.pool_cloud })
          .then((qres) => {
            const returnData: Record<string, any> = {};
            if (!data.id || String(data.id) === "0") {
              const lastID = qres.rows[0].id;
              returnData.saved_id = lastID;
            } else {
              returnData.saved_id = data.id;
            }

            resolve({ result: true, data: returnData });
          })
          .catch((err) => {
            logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
            reject({ result: false });
          }));
    });
  }
}

export default new MngUserRepository();
