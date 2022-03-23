// const offerList = async (args={}) =>  {

//     return new Promise(async (resolve, reject) => {
//         const list = []

//         // > ***** start generate where string
//         const where = []
//         const searchObj = args.search ?? {}

//         const searchVenueId = helpers.getValue({obj:searchObj, field:'venue_id', default:-1})
//         const searchSchemeId = helpers.getValue({obj:searchObj, field:'scheme_id', default:-1})
//         const searchOfferId = helpers.getValue({obj:searchObj, field:'id', default:-1})

//         if (searchVenueId>0) where.push(` o."venueID" = ${searchVenueId} `)
//         if (searchSchemeId>0) where.push(` o."loyaltySchemeID" = ${searchSchemeId} `)
//         if (searchOfferId>0) where.push(` o.id = ${searchOfferId} `)

//         const whereStr = where.length>0 ? ' where '+where.join(' and '):''
//         // // < ***** end generate where string

//         // > ***** start generate field string
//         let fields = ` o.id, o."venueID" as venue_id, o.description, o.icon, o.type, o.uses, o.hidden,
//         o."startTime" as start_time, o."endTime" as end_time, o."startDate" as start_date, o."endDate" as end_date,
//         o."requiredInitialPoints" as required_initial_points, o."requiredSeparatePoints" as required_separate_points,
//         o.active, o.instruction, o.cooldown, o.teaser, o.image, o.condition, o.created,
//         o."loyaltySchemeID" as scheme_id, o."replacedBy" as replaced_by, o.rtimestamp, o.utimestamp,
//         -- o."timeTags" as time_tage , o.days, o.categories,
//         o.time_tag as time_tags, o.available_days, o.type_categories `

//         if ('fields' in args){
//             if (args.fields == 'summary') {
//                 fields =  ` o.id, o."venueID" as venue_id, o.description, o.uses, o.hidden,
//                 o."requiredInitialPoints" as required_initial_points, o."requiredSeparatePoints" as required_separate_points,
//                 o.active, o."loyaltySchemeID" as scheme_id `
//             }
//         }
//         // < ***** end generate field string

//         const query = `
//                 SELECT
//                    ${fields},
//                    coalesce(l.name,'') as scheme_name,
//                    coalesce(v.name,'') as venue_name
//                 FROM "Offers" o
//                 LEFT JOIN "LoyaltySchemes" l on l.id = o."loyaltySchemeID"
//                 LEFT JOIN "Venues" v on v.id = o."venueID"
//                 ${whereStr}
//                 ORDER BY id desc limit 200
//         `
//         await executeQuery({source:'prod', query:query})
//         .then( (qres) => {
//             for (let row of qres.qres.rows) {
//                 list.push(row);
//             }
//             resolve ({result:true, data:list})
//         })
//         .catch(err => {
//             helpers.lg(`{red}error offerList function{reset}`)
//             helpers.lg(`{red}${err.stack}{reset}`)
//             reject({result:false})
//         })
//     })
// }

// const offerAddEdit = async (args={}) =>  {

//     return new Promise(async (resolve, reject) => {

//         const portal_user_id = args.portal_user_id || -2
//         const portal_user_name = args.portal_user_name || '-'

//         const validationSchema = {
//             id:{type:"int"},
//             venue_id:{type:"int"},
//             description:{type:"string", force_type:true , min_length:5 , cut_at_max:100},
//             active:{type:"boolean", default: false},
//             hidden:{type:"boolean", default: false},
//             cooldown:{type:"boolean", default: false},
//             uses:{type:"int", default: 1},
//             start_time:{type:"string", cut_at_max:5},
//             end_time:{type:"string", cut_at_max:5},
//             start_date:{type:"string", cut_at_max:10},
//             end_date:{type:"string", cut_at_max:10},
//             required_initial_points:{type:"int"},
//             required_separate_points:{type:"int"},
//             scheme_id:{type:"int"},
//             condition:{type:"string", cut_at_max:250},
//             time_tags:{type:"array", force_type:true},
//             available_days:{type:"array", force_type:true},
//             type_categories:{type:"type_categories", force_type:true},
//             teaser:{type:"string", cut_at_max:40},

//         }

// // icon , type, image,

//         const value = Validator.validate(args.data ?? {},validationSchema,{})

//         if ('errors' in value) {
//             reject({result:false, error_code:3011, error_message:value.errors})
//             return
//         }
//         else {

//             value.time_tag_str = value.time_tags.join('|')
//             value.days = value.available_days.join('|')
//             value.categories = value.type_categories.join('|')
//             value.icon = 'KISS'
//             value.type = 'OFFER'
//             value.instruction = ''

//             const sql_schema = {
//                 table_name: `"Offers"`,
//                 checking_data_field: 'id',
//                 table_id: 'id' ,
//                 returning: 'id',

//                 fields:{
//                     venueID:{ field:'venue_id'},
//                     description:{ field:'description'},
//                     icon:{ field:'icon' },
//                     type:{ field:'type' },
//                     instruction:{ field:'type' },
//                     active:{ field:'active' } ,
//                     hidden:{ field:'is_group'} ,
//                     uses:{ field:'uses'},
//                     startTime:{ field:'start_time'},
//                     endTime:{ field:'end_time'},
//                     startDate:{ field:'start_date'},
//                     endDate:{ field:'end_date'},
//                     teaser:{ field:'teaser'},
//                     requiredInitialPoints:{ field:'required_initial_points'},
//                     requiredSeparatePoints:{ field:'required_separate_points'},
//                     cooldown:{ field:'cooldown' } ,
//                     loyaltySchemeID:{ field:'scheme_id' } ,
//                     condition:{ field:'condition' } ,
//                     time_tag:{ field:'time_tags' , is_array:true } ,
//                     timeTags:{ field:'time_tag_str' }, // support old version
//                     available_days:{ field:'available_days' , is_array:true },
//                     days:{ field:'days' }, // support old version
//                     type_categories:{ field:'type_categories' , is_array:true },
//                     categories:{ field:'categories' }, // support old version

//                 }
//             }

//             const query = getAddEditQuery(value , sql_schema)

//             await executeQuery({source:'prod', query:query})
//             .then( (qres) => {
//                 const returnData = {}

//                 if ((value.id || 0) == 0){

//                     const lastID = qres.qres.rows[0].id
//                     returnData.saved_id = lastID

//                 //     addLog({des:`venue (${value.name}) created by ${portal_user_name}`, venue_id:lastID, user_id:portal_user_id})
//                 }
//                 else {
//                     returnData.saved_id = value.id
//                 }

//                 resolve({result:true, data:returnData})
//             })
//             .catch(err => {
//                 // helpers.lg(`{red}error venueAdd function{reset}`)
//                 helpers.lg(`{red}${err.stack}{reset}`)
//                 reject({result:false})
//             })

//         }

//     })
// }
