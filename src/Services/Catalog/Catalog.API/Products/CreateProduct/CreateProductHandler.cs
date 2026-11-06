namespace Catalog.API.Products.CreateProduct;

public record CreateProductCommand(
    string Title,
    string Handle,
    string? BodyHtml,
    string? Vendor,
    ProductType? ProductType,
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
        RuleFor(x => x.ProductType).NotNull().WithMessage("ProductType is required");
    }
}

internal class CreateProductCommandHandler
    (ICatalogContext context)
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

        await context.Products.InsertOneAsync(product, cancellationToken: cancellationToken);

        return new CreateProductResult(product.Id);
    }
}
