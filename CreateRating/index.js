module.exports = async function (context, req) {
    const cosmos = require("@azure/cosmos");
    const CosmosClient = cosmos.CosmosClient;
    const config = require("./config");
    const databaseId = config.names.database;
    const containerId = config.names.container;
    const endpoint = config.connection.endpoint;
    const masterKey = config.connection.authKey;
    const client = new CosmosClient({endpoint, auth: { masterKey }});

    async function init() {
        const { database } = await client.databases.createIfNotExists({ id: databaseId });
        const { container } = await database.containers.createIfNotExists({ id: containerId });
        return { database, container };
    }
    
    async function insert_item_to_cosmo(){
        const { container, database } = await init();
        var itemDefs = req.body;
        itemDefs.timestamp = new Date(); 
        var db_response = await container.items.create(itemDefs);
        return db_response;
       
    }

    var request = require('request-promise');
    var getuser_url = 'https://serverlessohlondonuser.azurewebsites.net/api/GetUser?userid='.concat(req.body.userId);
    var getproduct_url = 'https://serverlessohlondonproduct.azurewebsites.net/api/GetProduct?productId='.concat(req.body.productId)

    var user_exist = await request(getuser_url)
            .then(function (body) {
                var info = JSON.parse(body);
                if (info.userId != undefined){
                    return true;
                }
                else {
                    context.res = {
                        body: "user not found"
                    };
                    return false;
                }
            })
            .catch(function (err) {
                context.res = {
                    body: "error in finding user"
                };
                return false;
            });
       
        var product_exist = await request(getproduct_url)
            .then(function (body) {
                var info = JSON.parse(body);
                if (info.productId != undefined){
                    return true;
                }
                else {
                    context.res = {
                        body: "product not found!!!!!!!!!!!!!!!"
                    };
                    return false;
                }
            })
            .catch(function (err) {
                context.res = {
                    body: "error in finding product"
                };
                return false;
            });

    if(user_exist && product_exist){
        console.log("user and product found.");
        var db_response = await insert_item_to_cosmo();
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: db_response.body
        };
    }
    else {
        console.log("not found")
        context.res = {
            status: 404
        };
    }
   
};