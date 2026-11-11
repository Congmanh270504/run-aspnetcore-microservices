using System.Text.Json.Serialization;

namespace Catalog.API.Models;

[BsonIgnoreExtraElements]
public class ProductTypeItem
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    [JsonPropertyName("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [JsonPropertyName("name")]
    public string Name { get; set; } = default!;

    [JsonPropertyName("sort_order")]
    public int SortOrder { get; set; }

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
