using System.Text.Json;
using System.Text.Json.Serialization;

namespace Catalog.API.Data;

public static class CatalogInitialData
{
    public static async Task SeedAsync(ICatalogContext context, CancellationToken cancellation = default)
    {
        try
        {
            var count = await context.Products.CountDocumentsAsync(FilterDefinition<Product>.Empty, cancellationToken: cancellation);
            if (count >= 30)
                return;

            var products = GetPreconfiguredProducts();
            if (products.Any())
            {
                foreach (var product in products)
                {
                    await context.Products.ReplaceOneAsync(
                        p => p.Id == product.Id,
                        product,
                        new ReplaceOptions { IsUpsert = true },
                        cancellation);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CatalogInitialData] Error during seed: {ex.Message}");
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
