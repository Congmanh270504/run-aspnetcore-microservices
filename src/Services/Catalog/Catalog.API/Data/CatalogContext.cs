using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace Catalog.API.Data;

public class CatalogContext : ICatalogContext
{
    public IMongoCollection<Product> Products { get; }
    public IMongoCollection<Category> Categories { get; }
    public IMongoCollection<ProductTypeItem> ProductTypes { get; }

    static CatalogContext()
    {
        try
        {
            BsonSerializer.RegisterSerializer(new GuidSerializer(BsonType.String));
            BsonSerializer.RegisterSerializer(typeof(decimal), new DecimalSerializer(BsonType.Decimal128));
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
        Categories = database.GetCollection<Category>("Categories");
        ProductTypes = database.GetCollection<ProductTypeItem>("ProductTypes");

        CreateIndexes();
    }

    private void CreateIndexes()
    {
        try
        {
            var titleIndex = new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.Title),
                new CreateIndexOptions { Name = "idx_products_title" });

            var variantTitleIndex = new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending("variants.title"),
                new CreateIndexOptions { Name = "idx_products_variants_title" });

            Products.Indexes.CreateMany(new[] { titleIndex, variantTitleIndex });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CatalogContext] Note on index creation: {ex.Message}");
        }
    }
}
