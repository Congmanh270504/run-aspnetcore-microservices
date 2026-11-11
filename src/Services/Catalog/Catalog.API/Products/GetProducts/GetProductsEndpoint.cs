using System.Text.Json.Serialization;

namespace Catalog.API.Products.GetProducts;

public record GetProductsRequest(int? PageNumber = 1, int? PageSize = 10, decimal? MinPrice = null, decimal? MaxPrice = null);
public record GetProductsResponse(
    [property: JsonPropertyName("products")] IEnumerable<Product> Products,
    [property: JsonPropertyName("totalCount")] long TotalCount = 0
);

public class GetProductsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products", async ([AsParameters] GetProductsRequest request, ISender sender) =>
        {
            var query = new GetProductsQuery(request.PageNumber, request.PageSize, request.MinPrice, request.MaxPrice);

            var result = await sender.Send(query);

            var response = new GetProductsResponse(result.Products, result.TotalCount);

            return Results.Ok(response);
        })
        .WithName("GetProducts")
        .Produces<GetProductsResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get Products")
        .WithDescription("Get Products");

        app.MapPost("/products/sync-prices", async (ICatalogContext context, CancellationToken ct) =>
        {
            await CatalogInitialData.SyncProductPricesAsync(context, ct);
            return Results.Ok(new { message = "Synced numeric price field on all products successfully." });
        })
        .WithName("SyncProductPrices")
        .Produces(StatusCodes.Status200OK)
        .WithSummary("Sync numeric price on all products in MongoDB");

        app.MapGet("/products/count", async (decimal? minPrice, decimal? maxPrice, ICatalogContext context, CancellationToken ct) =>
        {
            var builder = Builders<Product>.Filter;
            var filter = builder.Empty;
            if (minPrice.HasValue && minPrice.Value > 0) filter &= builder.Gte(p => p.Price, minPrice.Value);
            if (maxPrice.HasValue && maxPrice.Value < 1000) filter &= builder.Gt(p => p.Price, 0m) & builder.Lte(p => p.Price, maxPrice.Value);
            var count = await context.Products.CountDocumentsAsync(filter, cancellationToken: ct);
            return Results.Ok(new { totalCount = count });
        })
        .WithName("GetProductsCount")
        .Produces(StatusCodes.Status200OK)
        .WithSummary("Get total products count");

        app.MapGet("/products/color-variants", async (string? title, string? id, ICatalogContext context, CancellationToken ct) =>
        {
            string? targetTitle = title;
            if (string.IsNullOrWhiteSpace(targetTitle) && !string.IsNullOrWhiteSpace(id))
            {
                if (Guid.TryParse(id, out var guidId))
                {
                    var current = await context.Products.Find(p => p.Id == guidId).FirstOrDefaultAsync(ct);
                    targetTitle = current?.Title;
                }
            }

            if (string.IsNullOrWhiteSpace(targetTitle))
                return Results.Ok(new { products = Array.Empty<Product>() });

            var lastDash = targetTitle.LastIndexOf('-');
            var baseTitle = lastDash >= 0 ? targetTitle.Substring(0, lastDash).Trim() : targetTitle.Trim();

            var escapedBase = System.Text.RegularExpressions.Regex.Escape(baseTitle);
            var regex = new MongoDB.Bson.BsonRegularExpression($"^{escapedBase}(\\s*-|$)", "i");
            var filter = Builders<Product>.Filter.Regex(p => p.Title, regex);

            var products = await context.Products
                .Find(filter)
                .ToListAsync(ct);

            return Results.Ok(new { products });
        })
        .WithName("GetProductColorVariants")
        .Produces(StatusCodes.Status200OK)
        .WithSummary("Get color variants of a product by base title or product id");
    }
}
