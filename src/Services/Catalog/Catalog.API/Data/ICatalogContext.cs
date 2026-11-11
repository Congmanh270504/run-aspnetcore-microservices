namespace Catalog.API.Data;

public interface ICatalogContext
{
    IMongoCollection<Product> Products { get; }
    IMongoCollection<Category> Categories { get; }
    IMongoCollection<ProductTypeItem> ProductTypes { get; }
}
