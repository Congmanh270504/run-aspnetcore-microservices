using System.Text.RegularExpressions;

namespace Catalog.API.ProductTypes;

public record ProductTypeDto(string Name, int ProductCount);

public record GetProductTypesResponse(List<ProductTypeDto> ProductTypes);
public record CreateProductTypeRequest(string Name);
public record CreateProductTypeResponse(ProductTypeDto ProductType);
public record RenameProductTypeRequest(string OldName, string NewName);
public record RenameProductTypeResponse(bool IsSuccess);
public record DeleteProductTypeResponse(bool IsSuccess);

public class ProductTypesEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/product-types")
            .WithTags("ProductTypes");

        // GET /product-types
        group.MapGet("/", async (ICatalogContext context, CancellationToken cancellationToken) =>
        {
            var productTypes = await context.ProductTypes.Find(FilterDefinition<ProductTypeItem>.Empty).ToListAsync(cancellationToken);
            var products = await context.Products.Find(FilterDefinition<Product>.Empty).ToListAsync(cancellationToken);

            // Compute counts from products
            var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            foreach (var p in products)
            {
                if (p.ProductType != null && !string.IsNullOrWhiteSpace(p.ProductType.Name))
                {
                    var name = p.ProductType.Name.Trim();
                    counts[name] = counts.TryGetValue(name, out var val) ? val + 1 : 1;
                }
            }

            var result = new List<ProductTypeDto>();
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var pt in productTypes.OrderBy(p => p.SortOrder).ThenBy(p => p.Name))
            {
                if (string.IsNullOrWhiteSpace(pt.Name)) continue;
                var trimmed = pt.Name.Trim();
                if (seen.Add(trimmed))
                {
                    var count = counts.TryGetValue(trimmed, out var cnt) ? cnt : 0;
                    result.Add(new ProductTypeDto(trimmed, count));
                }
            }

            // Also include any product types present on existing products that weren't in ProductTypes collection
            foreach (var kvp in counts.OrderBy(k => k.Key))
            {
                if (seen.Add(kvp.Key))
                {
                    result.Add(new ProductTypeDto(kvp.Key, kvp.Value));
                    try
                    {
                        await context.ProductTypes.InsertOneAsync(new ProductTypeItem
                        {
                            Id = Guid.NewGuid(),
                            Name = kvp.Key,
                            SortOrder = seen.Count,
                            CreatedAt = DateTimeOffset.UtcNow
                        }, cancellationToken: cancellationToken);
                    }
                    catch
                    {
                        // Ignore race condition duplicate
                    }
                }
            }

            return Results.Ok(new GetProductTypesResponse(result.OrderBy(r => r.Name).ToList()));
        })
        .WithName("GetProductTypes")
        .Produces<GetProductTypesResponse>(StatusCodes.Status200OK)
        .WithSummary("Get all product types with product counts");

        // POST /product-types
        group.MapPost("/", async (CreateProductTypeRequest request, ICatalogContext context, CancellationToken cancellationToken) =>
        {
            var trimmed = request.Name?.Trim();
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                return Results.BadRequest("Product type name cannot be empty");
            }

            var existing = await context.ProductTypes
                .Find(c => c.Name.ToLower() == trimmed.ToLower())
                .FirstOrDefaultAsync(cancellationToken);

            if (existing != null)
            {
                return Results.BadRequest("Product type already exists");
            }

            var count = await context.ProductTypes.CountDocumentsAsync(FilterDefinition<ProductTypeItem>.Empty, cancellationToken: cancellationToken);

            var item = new ProductTypeItem
            {
                Id = Guid.NewGuid(),
                Name = trimmed,
                SortOrder = (int)count + 1,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await context.ProductTypes.InsertOneAsync(item, cancellationToken: cancellationToken);

            return Results.Created($"/product-types/{Uri.EscapeDataString(trimmed)}", new CreateProductTypeResponse(new ProductTypeDto(trimmed, 0)));
        })
        .WithName("CreateProductType")
        .Produces<CreateProductTypeResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Create a new product type");

        // PUT /product-types
        group.MapPut("/", async (RenameProductTypeRequest request, ICatalogContext context, CancellationToken cancellationToken) =>
        {
            var oldTrimmed = request.OldName?.Trim();
            var newTrimmed = request.NewName?.Trim();

            if (string.IsNullOrWhiteSpace(oldTrimmed) || string.IsNullOrWhiteSpace(newTrimmed))
            {
                return Results.BadRequest("Product type names cannot be empty");
            }

            if (string.Equals(oldTrimmed, newTrimmed, StringComparison.OrdinalIgnoreCase))
            {
                return Results.Ok(new RenameProductTypeResponse(true));
            }

            // 1. Update or upsert in ProductTypes collection
            var filter = Builders<ProductTypeItem>.Filter.Regex(c => c.Name, new BsonRegularExpression($"^{Regex.Escape(oldTrimmed)}$", "i"));
            var update = Builders<ProductTypeItem>.Update.Set(c => c.Name, newTrimmed);
            var updateResult = await context.ProductTypes.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);

            if (updateResult.MatchedCount == 0)
            {
                var ptCount = await context.ProductTypes.CountDocumentsAsync(FilterDefinition<ProductTypeItem>.Empty, cancellationToken: cancellationToken);
                await context.ProductTypes.InsertOneAsync(new ProductTypeItem
                {
                    Id = Guid.NewGuid(),
                    Name = newTrimmed,
                    SortOrder = (int)ptCount + 1,
                    CreatedAt = DateTimeOffset.UtcNow
                }, cancellationToken: cancellationToken);
            }

            // 2. Update all Products in MongoDB where ProductType.Name == OldName
            var productsToUpdate = await context.Products
                .Find(p => p.ProductType != null && p.ProductType.Name.ToLower() == oldTrimmed.ToLower())
                .ToListAsync(cancellationToken);

            foreach (var product in productsToUpdate)
            {
                product.ProductType!.Name = newTrimmed;
                await context.Products.UpdateOneAsync(
                    p => p.Id == product.Id,
                    Builders<Product>.Update
                        .Set(p => p.ProductType, product.ProductType)
                        .Set(p => p.UpdatedAt, DateTimeOffset.UtcNow),
                    cancellationToken: cancellationToken
                );
            }

            return Results.Ok(new RenameProductTypeResponse(true));
        })
        .WithName("RenameProductType")
        .Produces<RenameProductTypeResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Rename a product type and update all products");

        // DELETE /product-types/{name}
        group.MapDelete("/{name}", async (string name, ICatalogContext context, CancellationToken cancellationToken) =>
        {
            var trimmed = Uri.UnescapeDataString(name).Trim();
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                return Results.BadRequest("Product type name cannot be empty");
            }

            // 1. Remove from ProductTypes collection
            var filter = Builders<ProductTypeItem>.Filter.Regex(c => c.Name, new BsonRegularExpression($"^{Regex.Escape(trimmed)}$", "i"));
            await context.ProductTypes.DeleteManyAsync(filter, cancellationToken);

            // 2. Clear product type on all affected Products in MongoDB
            var productsWithPt = await context.Products
                .Find(p => p.ProductType != null && p.ProductType.Name.ToLower() == trimmed.ToLower())
                .ToListAsync(cancellationToken);

            foreach (var product in productsWithPt)
            {
                await context.Products.UpdateOneAsync(
                    p => p.Id == product.Id,
                    Builders<Product>.Update
                        .Set<ProductType?>(p => p.ProductType, null)
                        .Set(p => p.UpdatedAt, DateTimeOffset.UtcNow),
                    cancellationToken: cancellationToken
                );
            }

            return Results.Ok(new DeleteProductTypeResponse(true));
        })
        .WithName("DeleteProductType")
        .Produces<DeleteProductTypeResponse>(StatusCodes.Status200OK)
        .WithSummary("Delete a product type and remove from products");
    }
}
