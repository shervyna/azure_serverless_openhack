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
    
    async function getRatingbyId(){
        const { container, database } = await init();
        const item = container.item(req.query.ratingId);  
        try{   
            const { body: readDoc } = await item.read();
            return readDoc;
        }
        catch(err){
            return false;
        }
    }
    
    var rating_content = await getRatingbyId();
    if(rating_content){
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: rating_content
        };
    }
    else{
        context.res = {
            status: 404,
            body: "rating record by the given id not found."
        };
    }
   
};