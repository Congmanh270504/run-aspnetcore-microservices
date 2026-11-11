namespace Catalog.API.Products.GetProductByCategory;

public record GetProductByCategoryQuery(string Category, int? PageNumber = 1, int? PageSize = 12, decimal? MinPrice = null, decimal? MaxPrice = null) : IQuery<GetProductByCategoryResult>;
public record GetProductByCategoryResult(IEnumerable<Product> Products, long TotalCount = 0);

internal class GetProductByCategoryQueryHandler
    (ICatalogContext context)
    : IQueryHandler<GetProductByCategoryQuery, GetProductByCategoryResult>
{
    public async Task<GetProductByCategoryResult> Handle(GetProductByCategoryQuery query, CancellationToken cancellationToken)
    {
        var pageNumber = query.PageNumber ?? 1;
        var pageSize = query.PageSize ?? 12;

        var builder = Builders<Product>.Filter;
        var categories = (query.Category ?? "")
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

        if (query.MinPrice.HasValue && query.MinPrice.Value > 0)
        {
            filter &= builder.Gte(p => p.Price, query.MinPrice.Value);
        }
        if (query.MaxPrice.HasValue && query.MaxPrice.Value < 1000)
        {
            filter &= builder.Gt(p => p.Price, 0m) & builder.Lte(p => p.Price, query.MaxPrice.Value);
        }

        var totalCount = await context.Products
            .CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var products = await context.Products
            .Find(filter)
            .Skip((pageNumber - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        return new GetProductByCategoryResult(products, totalCount);
    }
}
