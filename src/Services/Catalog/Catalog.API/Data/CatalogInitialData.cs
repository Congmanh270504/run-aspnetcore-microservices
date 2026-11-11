using System.Text.Json;
using System.Text.Json.Serialization;

namespace Catalog.API.Data;

public static class CatalogInitialData
{
    public static async Task SeedAsync(
        ICatalogContext context,
        string? targetFileName = null,
        bool force = false,
        CancellationToken cancellation = default)
    {
        try
        {
            Console.WriteLine("[CatalogInitialData] Starting product and category seeding...");

            // Determine which file(s) to seed
            var filesToSeed = !string.IsNullOrWhiteSpace(targetFileName)
                ? new[] { targetFileName }
                : new[] { "data.json", "data2.json" };

            var processedProducts = new List<Product>();

            foreach (var fileName in filesToSeed)
            {
                var products = GetPreconfiguredProducts(fileName).ToList();
                if (!products.Any())
                {
                    Console.WriteLine($"[CatalogInitialData] No products found for file '{fileName}'.");
                    continue;
                }

                Console.WriteLine($"[CatalogInitialData] Found {products.Count} products in '{fileName}'. Upserting to MongoDB...");
                int insertedCount = 0;
                int updatedCount = 0;

                foreach (var product in products)
                {
                    var result = await context.Products.ReplaceOneAsync(
                        p => p.Id == product.Id,
                        product,
                        new ReplaceOptions { IsUpsert = true },
                        cancellation);

                    if (result.UpsertedId != null)
                        insertedCount++;
                    else
                        updatedCount++;

                    processedProducts.Add(product);
                }

                Console.WriteLine($"[CatalogInitialData] '{fileName}' complete: {insertedCount} inserted, {updatedCount} updated.");
            }

            // Sync numeric prices on all products
            await SyncProductPricesAsync(context, cancellation);

            // Sync Categories from all product tags
            await SyncCategoriesAsync(context, cancellation);

            // Sync ProductTypes from products
            await SyncProductTypesAsync(context, cancellation);

            // Ensure indexes on Products collection
            await EnsureIndexesAsync(context, cancellation);

            Console.WriteLine("[CatalogInitialData] Seeding completed successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CatalogInitialData] Error during seed: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }

    public static async Task SyncProductPricesAsync(ICatalogContext context, CancellationToken cancellation = default)
    {
        Console.WriteLine("[CatalogInitialData] Ensuring numeric price field is set on all products in MongoDB...");
        var allProducts = await context.Products.Find(FilterDefinition<Product>.Empty).ToListAsync(cancellation);
        int updated = 0;
        foreach (var p in allProducts)
        {
            decimal price = 0m;
            var firstPrice = p.Variants?.FirstOrDefault()?.Price;
            if (!string.IsNullOrEmpty(firstPrice) &&
                decimal.TryParse(firstPrice, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var parsedPrice))
            {
                price = parsedPrice;
            }
            else if (p.Price > 0)
            {
                price = p.Price;
            }

            if (price > 0)
            {
                var update = Builders<Product>.Update.Set(x => x.Price, price);
                await context.Products.UpdateOneAsync(x => x.Id == p.Id, update, cancellationToken: cancellation);
                updated++;
            }
        }
        Console.WriteLine($"[CatalogInitialData] Synced numeric price for {updated} products in MongoDB.");
    }

    public static async Task SyncCategoriesAsync(ICatalogContext context, CancellationToken cancellation = default)
    {
        Console.WriteLine("[CatalogInitialData] Checking and synchronizing categories from product tags...");

        var existingCategories = await context.Categories
            .Find(FilterDefinition<Category>.Empty)
            .ToListAsync(cancellation);

        var existingNames = new HashSet<string>(
            existingCategories
                .Where(c => !string.IsNullOrWhiteSpace(c.Name))
                .Select(c => c.Name.Trim()),
            StringComparer.OrdinalIgnoreCase);

        var allProducts = await context.Products
            .Find(FilterDefinition<Product>.Empty)
            .ToListAsync(cancellation);

        var allTags = allProducts
            .SelectMany(p => (p.Tags ?? new List<string>()).Concat(p.Category ?? new List<string>()))
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var newCategories = new List<Category>();
        foreach (var tag in allTags)
        {
            if (existingNames.Add(tag))
            {
                newCategories.Add(new Category
                {
                    Id = Guid.NewGuid(),
                    Name = tag,
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }
        }

        if (newCategories.Any())
        {
            await context.Categories.InsertManyAsync(newCategories, cancellationToken: cancellation);
            Console.WriteLine($"[CatalogInitialData] Successfully added {newCategories.Count} new categories to MongoDB.");
        }
        else
        {
            Console.WriteLine("[CatalogInitialData] All tags already exist in Categories table. No new categories needed.");
        }
    }

    public static async Task SyncProductTypesAsync(ICatalogContext context, CancellationToken cancellation = default)
    {
        Console.WriteLine("[CatalogInitialData] Checking and synchronizing product types...");

        var existingProductTypes = await context.ProductTypes
            .Find(FilterDefinition<ProductTypeItem>.Empty)
            .ToListAsync(cancellation);

        var existingNames = new HashSet<string>(
            existingProductTypes
                .Where(pt => !string.IsNullOrWhiteSpace(pt.Name))
                .Select(pt => pt.Name.Trim()),
            StringComparer.OrdinalIgnoreCase);

        var allProducts = await context.Products
            .Find(FilterDefinition<Product>.Empty)
            .ToListAsync(cancellation);

        var productTypeNames = allProducts
            .Where(p => p.ProductType != null && !string.IsNullOrWhiteSpace(p.ProductType.Name))
            .Select(p => p.ProductType!.Name.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var newProductTypes = new List<ProductTypeItem>();
        int sortOrder = existingProductTypes.Count;

        foreach (var name in productTypeNames)
        {
            if (existingNames.Add(name))
            {
                newProductTypes.Add(new ProductTypeItem
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    SortOrder = sortOrder++,
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }
        }

        if (newProductTypes.Any())
        {
            await context.ProductTypes.InsertManyAsync(newProductTypes, cancellationToken: cancellation);
            Console.WriteLine($"[CatalogInitialData] Successfully added {newProductTypes.Count} new product types.");
        }
    }

    public static IEnumerable<Product> GetPreconfiguredProducts(string fileName = "data2.json")
    {
        var possiblePaths = new List<string>();

        if (Path.IsPathRooted(fileName) && File.Exists(fileName))
        {
            possiblePaths.Add(fileName);
        }

        possiblePaths.AddRange(new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Data", fileName),
            Path.Combine(Directory.GetCurrentDirectory(), "Data", fileName),
            Path.Combine(Directory.GetCurrentDirectory(), "Services", "Catalog", "Catalog.API", "Data", fileName),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Data", fileName),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "Services", "Catalog", "Catalog.API", "Data", fileName),
            Path.GetFullPath(fileName)
        });

        foreach (var path in possiblePaths.Distinct())
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
                catch (Exception ex)
                {
                    Console.WriteLine($"[CatalogInitialData] Failed to parse {path}: {ex.Message}");
                }
            }
        }

        return Enumerable.Empty<Product>();
    }

    public static async Task EnsureIndexesAsync(ICatalogContext context, CancellationToken cancellation = default)
    {
        try
        {
            Console.WriteLine("[CatalogInitialData] Ensuring indexes on Products collection...");
            var titleIndex = new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.Title),
                new CreateIndexOptions { Name = "idx_products_title" });

            var variantTitleIndex = new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending("variants.title"),
                new CreateIndexOptions { Name = "idx_products_variants_title" });

            await context.Products.Indexes.CreateManyAsync(new[] { titleIndex, variantTitleIndex }, cancellation);
            Console.WriteLine("[CatalogInitialData] Indexes created or already exist.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CatalogInitialData] Error ensuring indexes: {ex.Message}");
        }
    }

    private class ProductDataWrapper
    {
        [JsonPropertyName("products")]
        public List<Product> Products { get; set; } = new();
    }
}
