namespace Catalog.API.Products.CreateProduct;

public record CreateProductRequest(
    string Title,
    string Handle,
    string? BodyHtml,
    string? Vendor,
    string ProductType,
    List<string>? Tags = null,
    List<ProductVariant>? Variants = null,
    List<ProductImage>? Images = null,
    List<ProductOption>? Options = null
);

public record CreateProductResponse(Guid Id);

public class CreateProductEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/products",
            async (CreateProductRequest request, ISender sender) =>
        {
            var command = request.Adapt<CreateProductCommand>();

            var result = await sender.Send(command);

            var response = result.Adapt<CreateProductResponse>();

            return Results.Created($"/products/{response.Id}", response);

        })
        .WithName("CreateProduct")
        .Produces<CreateProductResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Create Product")
        .WithDescription("Create Product");
    }
}
