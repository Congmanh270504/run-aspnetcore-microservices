using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace Catalog.API.Data;

public class CatalogContext : ICatalogContext
{
    public IMongoCollection<Product> Products { get; }

    static CatalogContext()
    {
        try
        {
            BsonSerializer.RegisterSerializer(new GuidSerializer(BsonType.String));
        }
        catch (BsonSerializationException)
        {
            // Already registered
        }
    }

    public CatalogContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Database")
            ?? "mongodb://localhost:27017/CatalogDb";

        var mongoUrl = new MongoUrl(connectionString);
        var client = new MongoClient(mongoUrl);
        var databaseName = !string.IsNullOrEmpty(mongoUrl.DatabaseName) ? mongoUrl.DatabaseName : "CatalogDb";
        var database = client.GetDatabase(databaseName);

        Products = database.GetCollection<Product>("Products");
    }
}
