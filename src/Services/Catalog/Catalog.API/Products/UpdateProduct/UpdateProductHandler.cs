namespace Catalog.API.Products.UpdateProduct;

public record UpdateProductCommand(
    Guid Id,
    string Title,
    string Handle,
    string? BodyHtml,
    string? Vendor,
    string ProductType,
    List<string>? Tags = null,
    List<ProductVariant>? Variants = null,
    List<ProductImage>? Images = null,
    List<ProductOption>? Options = null
) : ICommand<UpdateProductResult>;

public record UpdateProductResult(bool IsSuccess);

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty().WithMessage("Product ID is required");
        RuleFor(command => command.Title)
            .NotEmpty().WithMessage("Title is required")
            .Length(2, 250).WithMessage("Title must be between 2 and 250 characters");
        RuleFor(command => command.ProductType).NotEmpty().WithMessage("ProductType is required");
    }
}

internal class UpdateProductCommandHandler
    (IDocumentSession session)
    : ICommandHandler<UpdateProductCommand, UpdateProductResult>
{
    public async Task<UpdateProductResult> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
    {
        var product = await session.LoadAsync<Product>(command.Id, cancellationToken);

        if (product is null)
        {
            throw new ProductNotFoundException(command.Id);
        }

        product.Title = command.Title;
        product.Handle = command.Handle;
        product.BodyHtml = command.BodyHtml;
        product.Vendor = command.Vendor ?? string.Empty;
        product.ProductType = command.ProductType;
        if (command.Tags is not null) product.Tags = command.Tags;
        if (command.Variants is not null) product.Variants = command.Variants;
        if (command.Images is not null) product.Images = command.Images;
        if (command.Options is not null) product.Options = command.Options;
        product.UpdatedAt = DateTimeOffset.UtcNow;

        session.Update(product);
        await session.SaveChangesAsync(cancellationToken);

        return new UpdateProductResult(true);
    }
}
