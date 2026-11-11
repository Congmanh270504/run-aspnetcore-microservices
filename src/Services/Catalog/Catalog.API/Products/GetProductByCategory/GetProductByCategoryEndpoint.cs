
using System.Text.Json.Serialization;

namespace Catalog.API.Products.GetProductByCategory;

public record GetProductByCategoryResponse(
    [property: JsonPropertyName("products")] IEnumerable<Product> Products,
    [property: JsonPropertyName("totalCount")] long TotalCount = 0
);

public class GetProductByCategoryEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/category/{category}",
            async (string category, int? pageNumber, int? pageSize, decimal? minPrice, decimal? maxPrice, ISender sender) =>
        {
            var result = await sender.Send(new GetProductByCategoryQuery(category, pageNumber ?? 1, pageSize ?? 12, minPrice, maxPrice));

            var response = new GetProductByCategoryResponse(result.Products, result.TotalCount);

            return Results.Ok(response);
        })
        .WithName("GetProductByCategory")
        .Produces<GetProductByCategoryResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get Product By Category")
        .WithDescription("Get Product By Category");

        app.MapGet("/products/category/{category}/count",
            async (string category, decimal? minPrice, decimal? maxPrice, ICatalogContext context, CancellationToken ct) =>
        {
            var builder = Builders<Product>.Filter;
            var categories = (category ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            FilterDefinition<Product> filter;
            if (categories.Length > 1)
            {
                var catFilters = categories.Select(c =>
                    builder.Where(p =>
                        (p.ProductType != null && p.ProductType.Name == c) ||
                        p.Tags.Contains(c) ||
                        (p.Category != null && p.Category.Contains(c)))
                );
                filter = builder.Or(catFilters);
            }
            else if (categories.Length == 1)
            {
                var c = categories[0];
                filter = builder.Where(p =>
                    (p.ProductType != null && p.ProductType.Name == c) ||
                    p.Tags.Contains(c) ||
                    (p.Category != null && p.Category.Contains(c)));
            }
            else
            {
                filter = builder.Empty;
            }

            if (minPrice.HasValue && minPrice.Value > 0) filter &= builder.Gte(p => p.Price, minPrice.Value);
            if (maxPrice.HasValue && maxPrice.Value < 1000) filter &= builder.Gt(p => p.Price, 0m) & builder.Lte(p => p.Price, maxPrice.Value);

            var count = await context.Products.CountDocumentsAsync(filter, cancellationToken: ct);
            return Results.Ok(new { totalCount = count });
        })
        .WithName("GetProductByCategoryCount")
        .Produces(StatusCodes.Status200OK)
        .WithSummary("Get product count by category");
    }
}
