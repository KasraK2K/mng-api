const getReportQuery = (args = {}) => {
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
            LEFT JOIN "UserPoints" u on 
              v.id = u.venue_id and u.rtimestamp > '${fromDateStr1}' ${toDateStr1}
            WHERE active=true and released=true ${whereStr}
            GROUP BY v.id, v.name ,v.city, v.country,v.categories
            ${havingStr} `;

  return query;
};
const report1 = async (args = {}) => {
  // report kinds:
  //1 [all venue, restaurant, coffee shop,...] with[less than/over] [number] [stamps/claims]  in the last [number] days
  //2 [all venue, restaurant, coffee shop,...] with [less than/over] than average [stamps/claims] in the last [number] days
  //3 [total / average] number of [stamps / claims] per [all venue, restaurant, coffee shop,...]
  //4 [all venue, restaurant, coffee shop,...] with 50% less stamp in the last 7 days compared to previous 7 days

  const report_kind = "report_kind" in args ? args.report_kind : 1;

  const entity_number = args.entity_number ?? 30;
  const search_type = args.search_type ?? 0; // 0:less 1:over
  const last_day_number = "last_day_number" in args ? args.last_day_number : 10;
  const venue_type = "venue_type" in args ? args.venue_type : "";
  const result_kind = "result_kind" in args ? args.result_kind : 0; // 0:total   1:average

  return new Promise(async (resolve, reject) => {
    let query = getReportQuery({ ...args });
    let list = [];
    await getList({ query }).then((response) => {
      list = response.data;
    });

    let totalStamps = 0,
      totalVenues = 0;
    list.forEach((row) => {
      totalStamps += parseInt(row.amount);
      totalVenues++;
    });
    const average = parseFloat((totalStamps / totalVenues).toFixed(2));

    if (report_kind == 2) {
      let list2 = [];
      list.forEach((line) => {
        console.log({ search_type, a: line.amount, average });
        if (search_type == 0 && line.amount < average) list2.push(line);
        else if (search_type == 1 && line.amount > average) list2.push(line);
      });

      list = list2;
    } else if (report_kind == 4) {
      let query = getReportQuery({ ...args });
      // let list = []
      await getList({ query }).then((response) => {
        list = response.data;
      });
    }

    resolve({
      total_stamps: totalStamps,
      total_venues: totalVenues,
      average: average,
      all_venues: 1500,
      all_stamps: 12000,
      report_venue_percentage: 56,
      report_stamp_percentage: 70,
      data: list,
    });
  });
};
const getList = async (args = {}) => {
  const query = args.query ?? "";
  let list = [],
    totalStamps = 0,
    totalVenues = 0;

  return new Promise(async (resolve, reject) => {
    await executeQuery({ source: "prod", query: query })
      .then((qres) => {
        for (let row of qres.qres.rows) {
          list.push(row);
          // totalStamps += parseInt(row.amount)
          // totalVenues ++
        }

        // const average = (totalStamps/totalVenues).toFixed(2)

        // if (report_kind == 2){
        //     let list2 = []
        //     list.forEach( line  => {
        //         if (search_type == 0 && line.amount < average) list2.push(line)
        //         else if (search_type == 1 && line.amount > average) list2.push(line)

        //     })
        //     list = list2
        // }

        resolve({ data: list });
      })
      .catch((err) => {
        helpers.lg(`{red}error report1{reset}`);
        helpers.lg(`{red}${err.stack}{reset}`);
        reject({});
      });
  });
};

const onboardingReport = async (args = {}) => {
  return new Promise(async (resolve, reject) => {
    const list = [];
    const venue_id = helpers.getValue({ obj: args, field: "venue_id", default: -1 });

    const query = `
        WITH with_table AS (
            select u.id, u.name, u.email, u.rtimestamp as user_register_at, min(p.rtimestamp) as first_point_at
            from "Users" u
            left join "UserPoints" p on p.user_id = u.id
            where 
            -- u.rtimestamp > '2020-12-20' and 
            p.venue_id = ${venue_id}
            group by u.id,user_register_at
            limit 100
        )
        SELECT * 
        -- , user_register_at + '15 minute'::interval as aaa 
        FROM with_table
        WHERE 
            (user_register_at + '15 minute'::interval) > first_point_at
            and (user_register_at) < first_point_at
        `;
    await executeQuery({ source: "prod", query: query, function_requesting: "onboardingReport" })
      .then((qres) => {
        for (let row of qres.qres.rows) {
          console.log(row);
          list.push(row);
        }
        resolve({ result: "success", data: list });
      })
      .catch((err) => {
        helpers.lg(`{red}${err.stack}{reset}`);
        reject({ result: "error" });
      });
  });
};
