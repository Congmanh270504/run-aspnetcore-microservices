namespace Catalog.API.Products.CreateProduct;

public record CreateProductCommand(
    string Title,
    string Handle,
    string? BodyHtml,
    string? Vendor,
    string ProductType,
    List<string>? Tags = null,
    List<ProductVariant>? Variants = null,
    List<ProductImage>? Images = null,
    List<ProductOption>? Options = null
) : ICommand<CreateProductResult>;

public record CreateProductResult(Guid Id);

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Title is required");
        RuleFor(x => x.ProductType).NotEmpty().WithMessage("ProductType is required");
    }
}

internal class CreateProductCommandHandler
    (IDocumentSession session)
    : ICommandHandler<CreateProductCommand, CreateProductResult>
{
    public async Task<CreateProductResult> Handle(CreateProductCommand command, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Title = command.Title,
            Handle = command.Handle,
            BodyHtml = command.BodyHtml,
            Vendor = command.Vendor ?? string.Empty,
            ProductType = command.ProductType,
            Tags = command.Tags ?? new(),
            Variants = command.Variants ?? new(),
            Images = command.Images ?? new(),
            Options = command.Options ?? new(),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        session.Store(product);
        await session.SaveChangesAsync(cancellationToken);

        return new CreateProductResult(product.Id);
    }
}
