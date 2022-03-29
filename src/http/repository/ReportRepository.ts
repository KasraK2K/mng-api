import Repository from "./Repository";
import { LoggerEnum } from "../../common/enums/logger.enum";

class ReportRepository extends Repository {
  management(args: Record<string, any>): Promise<Record<string, any>> {
    return new Promise(async (resolve, reject) => {
      const report_kind = "report_kind" in args ? args.report_kind : 1;
      const reportGetter = report_kind < 4 ? "getReportResult123" : "getReportResult4";

      await this[reportGetter](args)
        .then((response) => resolve(response))
        .catch((err) => reject(err));
    });
  }

  onboarding(args: Record<string, any>) {
    const query = `
      WITH with_table AS (
        SELECT u.id, u.name, u.email, u.rtimestamp AS user_register_at, MIN(p.rtimestamp) AS first_point_at
        FROM "Users" u
        LEFT JOIN "UserPoints" p on p.user_id = u.id
        WHERE 
        p.venue_id = ${args.venue_id}
        GROUP BY u.id,user_register_at
        LIMIT 100
      )
      SELECT * 
      FROM with_table
      WHERE 
        (user_register_at + '15 minute'::interval) > first_point_at
        AND (user_register_at) < first_point_at
    `;

    return new Promise((resolve, reject) => {
      super
        .executeQuery({ source: pg.pool_main, query })
        .then((response) => {
          return resolve(response.rows);
        })
        .catch((err) => {
          logger(`{red}Error at getting onboardingReport{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }

  private getReportQuery(args: Record<string, any>): string {
    const report_kind = "report_kind" in args ? args.report_kind : 1;
    const search_type = args.search_type ?? 0; // 0:less 1:over
    const entity_number = args.entity_number ?? 0;
    const venue_type = "venue_type" in args ? args.venue_type : "";
    const last_day_number = "last_day_number" in args ? args.last_day_number : 0;
    const last_day_number_end = "last_day_number_end" in args ? args.last_day_number_end : 0;

    const now = new Date();
    const ms = now.getTime() - 86400000 * last_day_number;
    const fromDate = new Date(ms);
    const fromDateStr1 = fromDate.toISOString().slice(0, 10);

    let toDateStr1 = "";
    if (last_day_number_end != 0) {
      const ms2 = now.getTime() - 86400000 * last_day_number_end;
      const toDate = new Date(ms2);
      toDateStr1 = `and u.rtimestamp <'` + toDate.toISOString().slice(0, 10) + `'`;
    }

    let havingStr = "";
    if (report_kind == 1) {
      havingStr = `HAVING COALESCE(sum(point),0) ` + (search_type == 0 ? "<" : ">") + ` ${entity_number} `;
    }

    let whereStr = "";
    if (venue_type != "All") {
      whereStr = ` and categories like '%${venue_type}%' `;
    }

    const query = `
      SELECT v.id as venue_id, v.name, v.city, v.country, v.categories, COALESCE(sum(point),0) as amount
      FROM "Venues" v
      LEFT JOIN "UserPoints" u ON 
        v.id = u.venue_id and u.rtimestamp > '${fromDateStr1}' ${toDateStr1}
      WHERE active=true and released=true ${whereStr}
      GROUP BY v.id, v.name ,v.city, v.country,v.categories
      ${havingStr}
    `;

    return query;
  }

  private getReportResult123(args: Record<string, any>): Promise<Record<string, any>[]> {
    return new Promise(async (resolve, reject) => {
      const query = this.getReportQuery(args);

      await super
        .executeQuery({ source: pg.pool_main, query })
        .then((response) => {
          let list: Record<string, any>[] = response.rows;
          let totalStamps = 0,
            totalVenues = 0;
          list.forEach((item) => {
            totalStamps += parseInt(item.amount);
            totalVenues++;
          });
          const average = parseFloat((totalStamps / totalVenues).toFixed(2));
          const report_kind = "report_kind" in args ? args.report_kind : 1;
          const search_type = args.search_type ?? 0;

          // REPORT 2
          if (report_kind === 2)
            list = list.filter(
              (item) => (search_type == 0 && item.amount < average) || (search_type == 1 && item.amount > average)
            );

          return resolve([
            {
              total_stamps: totalStamps,
              total_venues: totalVenues,
              average: average,
              list,
            },
          ]);
        })
        .catch((err) => {
          logger(`{red}Error at getting UserPoints list{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }

  private getReportResult4(args: Record<string, any>): Promise<Record<string, any>[]> {
    return new Promise(async (resolve, reject) => {
      const now = new Date();
      const ms = now.getTime() - 86400000 * 30;
      const fromDate = new Date(ms);
      const fromDateStr1 = fromDate.toISOString().slice(0, 10);

      const ms2 = now.getTime() - 86400000 * 60;
      const fromDate2 = new Date(ms2);
      const fromDateStr2 = fromDate2.toISOString().slice(0, 10);

      const query = `
        WITH list1 as (
          SELECT v.id AS venue_id, v.name, v.city, v.country, v.categories, COALESCE(sum(point),0) AS amount 
            FROM "Venues" v 
            LEFT JOIN "UserPoints" u ON  
            v.id = u.venue_id AND u.rtimestamp > '${fromDateStr1}' 
            WHERE active=true AND released=true 
            GROUP BY v.id, v.name, v.city, v.country, v.categories 
        ),
        list2 AS (
          SELECT v.id AS venue_id, v.name, v.city, v.country, v.categories, COALESCE(sum(point),0) AS amount 
          FROM "Venues" v 
          LEFT JOIN "UserPoints" u ON
          v.id = u.venue_id AND u.rtimestamp > '${fromDateStr2}' AND u.rtimestamp < '${fromDateStr1}'
          WHERE active=true AND released=true 
          GROUP BY v.id, v.name ,v.city, v.country,v.categories 
        )
        SELECT
          list1.venue_id , list1.name, list1.city, list1.country, list1.categories, list1.amount AS this_week_amount , list2.amount AS last_week_amount
        FROM list1 
        LEFT JOIN list2 
          ON list1.venue_id = list2.venue_id
      `;

      await super
        .executeQuery({ source: pg.pool_main, query: query })
        .then((response) => {
          const list: Record<string, any>[] = [];
          console.log(typeof response.rows, response.rows);

          let total_venues = 0;
          response.rows.forEach((venue: Record<string, any>) => {
            if (venue.this_week_amount < venue.last_week_amount / 2) {
              total_venues++;
              list.push(venue);
            }
          });
          return resolve([
            {
              total_venues,
              list,
            },
          ]);
        })
        .catch((err) => {
          logger(`{red}Error at getting getReportResult4{reset}`, LoggerEnum.ERROR);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          return reject(err);
        });
    });
  }
}

export default new ReportRepository();
