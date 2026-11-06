namespace Catalog.API.Products.GetProductById;

public record GetProductByIdQuery(Guid Id) : IQuery<GetProductByIdResult>;
public record GetProductByIdResult(Product Product);

internal class GetProductByIdQueryHandler
    (ICatalogContext context)
    : IQueryHandler<GetProductByIdQuery, GetProductByIdResult>
{
    public async Task<GetProductByIdResult> Handle(GetProductByIdQuery query, CancellationToken cancellationToken)
    {
        var product = await context.Products
            .Find(p => p.Id == query.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (product is null)
        {
            throw new ProductNotFoundException(query.Id);
        }

        return new GetProductByIdResult(product);
    }
}
