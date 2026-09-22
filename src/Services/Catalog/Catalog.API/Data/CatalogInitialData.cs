using System.Text.Json;
using System.Text.Json.Serialization;
using Marten.Schema;

namespace Catalog.API.Data;

public class CatalogInitialData : IInitialData
{
    public async Task Populate(IDocumentStore store, CancellationToken cancellation)
    {
        using var session = store.LightweightSession();

        var existingProducts = await session.Query<Product>().ToListAsync(token: cancellation);
        if (existingProducts.Count >= 30 && existingProducts.All(p => !string.IsNullOrEmpty(p.Title)))
            return;

        // Remove old dummy products if any exist (e.g. products without Title)
        var oldDummyProducts = existingProducts.Where(p => string.IsNullOrEmpty(p.Title)).ToList();
        foreach (var old in oldDummyProducts)
        {
            session.Delete(old);
        }

        var products = GetPreconfiguredProducts();
        if (products.Any())
        {
            // Marten UPSERT will cater for existing records
            session.Store<Product>(products);
            await session.SaveChangesAsync(cancellation);
        }
    }

    private static IEnumerable<Product> GetPreconfiguredProducts()
    {
        var possiblePaths = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Data", "data.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "Data", "data.json"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Data", "data.json")
        };

        foreach (var path in possiblePaths)
        {
            if (File.Exists(path))
            {
                try
                {
                    var jsonString = File.ReadAllText(path);
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    var wrapper = JsonSerializer.Deserialize<ProductDataWrapper>(jsonString, options);
                    if (wrapper?.Products != null && wrapper.Products.Count > 0)
                    {
                        return wrapper.Products;
                    }
                }
                catch
                {
                    // If reading fails, try next path
                }
            }
        }

        return Enumerable.Empty<Product>();
    }

    private class ProductDataWrapper
    {
        [JsonPropertyName("products")]
        public List<Product> Products { get; set; } = new();
    }
}
