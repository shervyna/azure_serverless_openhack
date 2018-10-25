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
    
    async function getUserRatings(){
        const { container, database } = await init();
        const querySpec = {
            query: "SELECT * FROM ratings r WHERE  r.userId = @userId",
            parameters: [
              {
                name: "@userId",
                value: req.query.userId
              }
            ]
          };
          const { result: results } = await container.items.query(querySpec).toArray();
          if (results.length == 0) {
            // throw "No items found matching";
            context.res = {
                status: 404,
                body: "no items found"
            };
            return false;
          } else if (results.length > 1) {
            // throw "More than 1 item found matching";
            return results;
          }
    }

    var request = require('request-promise');
    var getuser_url = 'https://serverlessohlondonuser.azurewebsites.net/api/GetUser?userid='.concat(req.query.userId);
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
       
    if(user_exist){
        var user_ratings = await getUserRatings();
        if (user_ratings){
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: user_ratings
            };
        }
        
    }
    else {
        // console.log("user not found")
        context.res = {
            status: 404,
            body: "user not found"
        };
    }
   
};