namespace Catalog.API.Products.GetProductByCategory;

public record GetProductByCategoryQuery(string Category) : IQuery<GetProductByCategoryResult>;
public record GetProductByCategoryResult(IEnumerable<Product> Products);

internal class GetProductByCategoryQueryHandler
    (ICatalogContext context)
    : IQueryHandler<GetProductByCategoryQuery, GetProductByCategoryResult>
{
    public async Task<GetProductByCategoryResult> Handle(GetProductByCategoryQuery query, CancellationToken cancellationToken)
    {
        var products = await context.Products
            .Find(p => (p.ProductType != null && p.ProductType.Name == query.Category) || p.Tags.Contains(query.Category))
            .ToListAsync(cancellationToken);

        return new GetProductByCategoryResult(products);
    }
}
