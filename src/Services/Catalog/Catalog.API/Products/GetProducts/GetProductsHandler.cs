namespace Catalog.API.Products.GetProducts;

public record GetProductsQuery(int? PageNumber = 1, int? PageSize = 10) : IQuery<GetProductsResult>;
public record GetProductsResult(IEnumerable<Product> Products);

internal class GetProductsQueryHandler
    (ICatalogContext context)
    : IQueryHandler<GetProductsQuery, GetProductsResult>
{
    public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
    {
        var pageNumber = query.PageNumber ?? 1;
        var pageSize = query.PageSize ?? 10;

        var products = await context.Products
            .Find(_ => true)
            .Skip((pageNumber - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        return new GetProductsResult(products);
    }
}
