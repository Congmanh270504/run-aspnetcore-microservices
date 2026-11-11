using System.Text.RegularExpressions;

namespace Catalog.API.Categories;

public record CategoryDto(string Name, int ProductCount);

public record GetCategoriesResponse(List<CategoryDto> Categories);
public record CreateCategoryRequest(string Name);
public record CreateCategoryResponse(CategoryDto Category);
public record RenameCategoryRequest(string OldName, string NewName);
public record RenameCategoryResponse(bool IsSuccess);
public record DeleteCategoryResponse(bool IsSuccess);

public class CategoriesEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/categories")
            .WithTags("Categories");

        // GET /categories
        var getCategoriesDelegate = async (ICatalogContext context, CancellationToken cancellationToken) =>
        {
            var categories = await context.Categories.Find(FilterDefinition<Category>.Empty).ToListAsync(cancellationToken);
            var products = await context.Products.Find(FilterDefinition<Product>.Empty).ToListAsync(cancellationToken);

            // Compute counts from products
            var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            foreach (var p in products)
            {
                var cats = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                if (p.Category != null)
                {
                    foreach (var c in p.Category)
                    {
                        if (!string.IsNullOrWhiteSpace(c) && !IsInternalTag(c)) cats.Add(c.Trim());
                    }
                }
                if (!string.IsNullOrWhiteSpace(p.ProductType?.Name) && !IsInternalTag(p.ProductType.Name))
                {
                    cats.Add(p.ProductType.Name.Trim());
                }

                foreach (var c in cats)
                {
                    counts[c] = counts.TryGetValue(c, out var val) ? val + 1 : 1;
                }
            }

            // Ensure categories with actual products are returned
            var result = new List<CategoryDto>();
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var cat in categories.OrderBy(c => c.Name))
            {
                if (string.IsNullOrWhiteSpace(cat.Name) || IsInternalTag(cat.Name)) continue;
                var trimmed = cat.Name.Trim();
                if (seen.Add(trimmed))
                {
                    var count = counts.TryGetValue(trimmed, out var cnt) ? cnt : 0;
                    if (count > 0)
                    {
                        result.Add(new CategoryDto(trimmed, count));
                    }
                }
            }

            // Also include any categories present on existing products that weren't in Categories table
            foreach (var kvp in counts.OrderBy(k => k.Key))
            {
                if (!IsInternalTag(kvp.Key) && kvp.Value > 0 && seen.Add(kvp.Key))
                {
                    result.Add(new CategoryDto(kvp.Key, kvp.Value));
                }
            }

            return Results.Ok(new GetCategoriesResponse(result.OrderByDescending(r => r.ProductCount).ThenBy(r => r.Name).ToList()));
        };

        group.MapGet("/", getCategoriesDelegate)
            .WithName("GetCategories")
            .Produces<GetCategoriesResponse>(StatusCodes.Status200OK)
            .WithSummary("Get all categories with product counts");

        // POST /categories/sync
        group.MapPost("/sync", async (ICatalogContext context, CancellationToken cancellationToken) =>
        {
            await CatalogInitialData.SyncCategoriesAsync(context, cancellationToken);
            return Results.Ok(new { message = "Categories synchronized with product tags successfully." });
        })
        .WithName("SyncCategories")
        .Produces(StatusCodes.Status200OK)
        .WithSummary("Sync categories from product tags into Categories collection");

        // POST /categories
        group.MapPost("/", async (CreateCategoryRequest request, ICatalogContext context, CancellationToken cancellationToken) =>
        {
            var trimmed = request.Name?.Trim();
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                return Results.BadRequest("Category name cannot be empty");
            }

            var existing = await context.Categories
                .Find(c => c.Name.ToLower() == trimmed.ToLower())
                .FirstOrDefaultAsync(cancellationToken);

            if (existing != null)
            {
                return Results.BadRequest("Category already exists");
            }

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = trimmed,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await context.Categories.InsertOneAsync(category, cancellationToken: cancellationToken);

            return Results.Created($"/categories/{Uri.EscapeDataString(trimmed)}", new CreateCategoryResponse(new CategoryDto(trimmed, 0)));
        })
        .WithName("CreateCategory")
        .Produces<CreateCategoryResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Create a new category");

        // PUT /categories
        group.MapPut("/", async (RenameCategoryRequest request, ICatalogContext context, CancellationToken cancellationToken) =>
        {
            var oldTrimmed = request.OldName?.Trim();
            var newTrimmed = request.NewName?.Trim();

            if (string.IsNullOrWhiteSpace(oldTrimmed) || string.IsNullOrWhiteSpace(newTrimmed))
            {
                return Results.BadRequest("Category names cannot be empty");
            }

            if (string.Equals(oldTrimmed, newTrimmed, StringComparison.OrdinalIgnoreCase))
            {
                return Results.Ok(new RenameCategoryResponse(true));
            }

            // 1. Update or upsert in Categories collection
            var filter = Builders<Category>.Filter.Regex(c => c.Name, new BsonRegularExpression($"^{Regex.Escape(oldTrimmed)}$", "i"));
            var update = Builders<Category>.Update.Set(c => c.Name, newTrimmed);
            var updateResult = await context.Categories.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);

            if (updateResult.MatchedCount == 0)
            {
                await context.Categories.InsertOneAsync(new Category
                {
                    Id = Guid.NewGuid(),
                    Name = newTrimmed,
                    CreatedAt = DateTimeOffset.UtcNow
                }, cancellationToken: cancellationToken);
            }

            // 2. Update all Products in MongoDB where Tags contains OldName
            var productsToUpdate = await context.Products
                .Find(p => p.Tags.Contains(oldTrimmed))
                .ToListAsync(cancellationToken);

            foreach (var product in productsToUpdate)
            {
                var newTags = product.Tags
                    .Select(t => string.Equals(t, oldTrimmed, StringComparison.OrdinalIgnoreCase) ? newTrimmed : t)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                await context.Products.UpdateOneAsync(
                    p => p.Id == product.Id,
                    Builders<Product>.Update.Set(p => p.Tags, newTags).Set(p => p.UpdatedAt, DateTimeOffset.UtcNow),
                    cancellationToken: cancellationToken
                );
            }

            return Results.Ok(new RenameCategoryResponse(true));
        })
        .WithName("RenameCategory")
        .Produces<RenameCategoryResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Rename a category and update all products");

        // DELETE /categories/{name}
        group.MapDelete("/{name}", async (string name, ICatalogContext context, CancellationToken cancellationToken) =>
        {
            var trimmed = Uri.UnescapeDataString(name).Trim();
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                return Results.BadRequest("Category name cannot be empty");
            }

            // 1. Remove from Categories collection
            var filter = Builders<Category>.Filter.Regex(c => c.Name, new BsonRegularExpression($"^{Regex.Escape(trimmed)}$", "i"));
            await context.Categories.DeleteManyAsync(filter, cancellationToken);

            // 2. Remove category from all Products in MongoDB
            var productsWithCat = await context.Products
                .Find(p => p.Tags.Contains(trimmed))
                .ToListAsync(cancellationToken);

            foreach (var product in productsWithCat)
            {
                var newTags = product.Tags
                    .Where(t => !string.Equals(t, trimmed, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                await context.Products.UpdateOneAsync(
                    p => p.Id == product.Id,
                    Builders<Product>.Update.Set(p => p.Tags, newTags).Set(p => p.UpdatedAt, DateTimeOffset.UtcNow),
                    cancellationToken: cancellationToken
                );
            }

            return Results.Ok(new DeleteCategoryResponse(true));
        })
        .WithName("DeleteCategory")
        .Produces<DeleteCategoryResponse>(StatusCodes.Status200OK)
        .WithSummary("Delete a category and remove from products");
    }

    private static bool IsInternalTag(string? tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return true;
        var t = tag.Trim();
        return t.StartsWith("__", StringComparison.OrdinalIgnoreCase) ||
               t.StartsWith("spo-", StringComparison.OrdinalIgnoreCase) ||
               t.StartsWith("swatch-", StringComparison.OrdinalIgnoreCase) ||
               t.StartsWith("group:", StringComparison.OrdinalIgnoreCase) ||
               t.StartsWith("position-", StringComparison.OrdinalIgnoreCase) ||
               t.Equals("hidden", StringComparison.OrdinalIgnoreCase) ||
               t.Equals("hide_searchspring", StringComparison.OrdinalIgnoreCase) ||
               t.Equals("single", StringComparison.OrdinalIgnoreCase) ||
               t.Equals("Republished", StringComparison.OrdinalIgnoreCase) ||
               t.Equals("NoConfect", StringComparison.OrdinalIgnoreCase);
    }
}
