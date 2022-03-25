const pointList = async (args = {}) => {
  return new Promise(async (resolve, reject) => {
    const list = [];

    // > ***** start generate where string
    const where = [];
    const searchObj = args.search ?? {};
    const searchUserId = helpers.getValue({ obj: searchObj, field: "user_id", default: -1 });
    const searchVenueId = helpers.getValue({ obj: searchObj, field: "venue_id", default: -1 });
    const searchSchemeId = helpers.getValue({ obj: searchObj, field: "scheme_id", default: -1 });

    if (searchUserId > 0) where.push(` p.user_id = ${searchUserId} `);
    if (searchVenueId > 0) where.push(` p.venue_id = ${searchVenueId} `);
    if (searchSchemeId > 0) where.push(` p.scheme_id = ${searchSchemeId} `);

    // if ((args.search?.general || '').length > 0){
    //     const generalSearch = args.search.general
    //     const generalSearchInt = parseInt(generalSearch)||-1
    //     where.push(`
    //     (v.name like '%${generalSearch}%') or (v."loyaltySchemeID" = ${generalSearchInt}) or (v.id = ${generalSearchInt})
    //     `)
    // }

    // if ((args.search?.beacon || '').length > 0){
    //     where.push(` v.beacons like '%${args.search.beacon}%' `)
    // }

    const whereStr = where.length > 0 ? " where " + where.join(" and ") : "";
    // < ***** end generate where string

    // > ***** start generate field string
    let fields = "p.*";
    if ("fields" in args) {
      if (args.fields == "summary") {
        fields = `p.point_id, p.venue_id, p.user_id, p.point, p.type, p.rtimestamp, p.scheme_id, p.latitude, p.longitude, p.point_uid`;
      }
    }
    // < ***** end generate field string

    const query = `
                SELECT 
                   ${fields},
                    v.name as venue_name, 
                    l.name as scheme_name,
                    coalesce(u.name,'') as user_name,
                    coalesce(u.email,'') as user_email
                FROM "UserPoints" p
                LEFT JOIN "Venues" v on v.id = p.venue_id
                LEFT JOIN "LoyaltySchemes" l on l.id = p.scheme_id
                LEFT JOIN "Users" u on u.id = p.user_id
                ${whereStr}
                ORDER BY point_id desc limit 500
        `;

    await executeQuery({ source: "prod", query: query })
      .then((qres) => {
        for (let row of qres.qres.rows) {
          list.push(row);
        }
        resolve({ result: true, data: list });
      })
      .catch((err) => {
        helpers.lg(`{red}error pointList function{reset}`);
        helpers.lg(`{red}${err.stack}{reset}`);
        reject({ result: false });
      });
  });
};
