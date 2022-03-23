// const schemeList = async (args={}) =>  {

//     return new Promise(async (resolve, reject) => {
//         const list = []

//         // > ***** start generate where string
//         const where = []
//         const searchObj = args.search ?? {}

//         const searchSchemeId = helpers.getValue({obj:searchObj, field:'id', default:-1})
//         const searchName = helpers.getValue({obj:searchObj, field:'name', type:"string", default:""})

//         if (searchSchemeId>0) where.push(` id = ${searchSchemeId} `)
//         if (searchName.length>0) where.push(` name ilike '%${searchName}%' `)

//         const whereStr =  where.length>0 ? ' where '+where.join(' and '):''
//         // < ***** end generate where string

//         // > ***** start generate field string
//         let fields = ` id, name, "isGroup" as is_group, "pointsCycle" as point_cycle, active, logo, image,
//              colour1, colour2, "textColour1" as text_color1, "textColour2"as text_color2, rtimestamp, description
//         `

//         if ('fields' in args){
//             if (args.fields == 'summary') {
//                 fields =  ` id, name, active,  "pointsCycle" as point_cycle, "isGroup" as is_group, rtimestamp  `
//             }
//         }
//         // < ***** end generate field string

//         const query = `
//                 SELECT
//                    ${fields}
//                 FROM "LoyaltySchemes"
//                 ${whereStr}
//                 ORDER BY id desc limit 200
//         `

//         await executeQuery({source:'prod', query:query, function_requesting:"schemeList"})
//         .then( (qres) => {
//             for (let row of qres.qres.rows) {
//                 list.push(row);
//             }
//             resolve ({result:true, data:list})
//         })
//         .catch(err => {  reject({result:false}) })
//     })
// }

// const schemeAddEdit = async (args={}) =>  {

//     return new Promise(async (resolve, reject) => {

//         const portal_user_id = args.portal_user_id || -2
//         const portal_user_name = args.portal_user_name || '-'

//         const validationSchema = {
//             id:{type:"int"},
//             point_cycle:{type:"int", min_value:1},
//             name:{type:"string", force_type:true , min_length:5 , cut_at_max:100},
//             active:{type:"boolean", default: false},
//             is_group:{type:"boolean", default: false},
//             description:{type:"string", force_type:true , min_length:5 , cut_at_max:200},
//             colour1:{type:"string", cut_at_max:10},
//             colour2:{type:"string", cut_at_max:10},
//             text_colour1:{type:"string", cut_at_max:10},
//             text_colour2:{type:"string", cut_at_max:10},
//         }
//         const value = Validator.validate(args.data ?? {},validationSchema,{})
//         value.scheme = ''
//         console.log({vvvv:value});
//     //logo, image

//         if ('errors' in value) {

//             reject({result:false, error_code:3011, error_message:value.errors})
//             return
//         }
//         else {

//             const sql_schema = {
//                 table_name: `"LoyaltySchemes"`,
//                 checking_data_field: 'id',
//                 table_id: 'id' ,
//                 returning: 'id',
//                 fields:{
//                     name:{ field:'name'},
//                     pointsCycle:{ field:'point_cycle'},
//                     active:{ field:'active' } ,
//                     isGroup:{ field:'is_group'} ,
//                     description:{ field:'description' , is_string:true} ,
//                     colour1:{ field:'colour1'} ,
//                     colour2:{ field:'colour2'} ,
//                     textColour1:{ field:'text_colour1'} ,
//                     textColour2:{ field:'text_colour2'} ,
//                     scheme:{field:'scheme'}
//                 }
//             }

//             const query = getAddEditQuery(value , sql_schema)

//             await executeQuery({source:'prod', query:query})
//             .then( (qres) => {
//                 const returnData = {}
//                 if ((value.id || 0) == 0){
//                     const lastID = qres.qres.rows[0].id
//                     returnData.saved_id = lastID
//                     console.log({lastID});
//                 //     addLog({des:`venue (${value.name}) created by ${portal_user_name}`, venue_id:lastID, user_id:portal_user_id})
//                 }
//                 else {
//                     returnData.saved_id = venue.id
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
