namespace Catalog.API.Products.GetProducts;

public record GetProductsQuery(int? PageNumber = 1, int? PageSize = 10, decimal? MinPrice = null, decimal? MaxPrice = null) : IQuery<GetProductsResult>;
public record GetProductsResult(IEnumerable<Product> Products, long TotalCount = 0);

internal class GetProductsQueryHandler
    (ICatalogContext context)
    : IQueryHandler<GetProductsQuery, GetProductsResult>
{
    public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
    {
        var pageNumber = query.PageNumber ?? 1;
        var pageSize = query.PageSize ?? 10;

        var builder = Builders<Product>.Filter;
        var filter = builder.Empty;

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

        return new GetProductsResult(products, totalCount);
    }
}
