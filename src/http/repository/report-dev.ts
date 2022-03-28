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
