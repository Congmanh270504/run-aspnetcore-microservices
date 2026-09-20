using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Catalog.API.Models;

public class GuidJsonConverter : JsonConverter<Guid>
{
    public override Guid Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            long val = reader.GetInt64();
            byte[] bytes = new byte[16];
            BitConverter.GetBytes(val).CopyTo(bytes, 0);
            return new Guid(bytes);
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (Guid.TryParse(str, out var guid))
                return guid;

            if (long.TryParse(str, out var longVal))
            {
                byte[] bytes = new byte[16];
                BitConverter.GetBytes(longVal).CopyTo(bytes, 0);
                return new Guid(bytes);
            }
        }

        return Guid.NewGuid();
    }

    public override void Write(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}

public class Product
{
    [JsonPropertyName("id")]
    [JsonConverter(typeof(GuidJsonConverter))]
    public Guid Id { get; set; } = Guid.NewGuid();

    [JsonPropertyName("title")]
    public string Title { get; set; } = default!;

    [JsonPropertyName("handle")]
    public string Handle { get; set; } = default!;

    [JsonPropertyName("body_html")]
    public string? BodyHtml { get; set; }

    [JsonPropertyName("published_at")]
    public DateTimeOffset? PublishedAt { get; set; }

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    [JsonPropertyName("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    [JsonPropertyName("vendor")]
    public string Vendor { get; set; } = default!;

    [JsonPropertyName("product_type")]
    public string ProductType { get; set; } = default!;

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = new();

    [JsonPropertyName("variants")]
    public List<ProductVariant> Variants { get; set; } = new();

    [JsonPropertyName("images")]
    public List<ProductImage> Images { get; set; } = new();

    [JsonPropertyName("options")]
    public List<ProductOption> Options { get; set; } = new();

    // Convenience properties for backward compatibility
    [JsonIgnore]
    public string Name
    {
        get => Title;
        set => Title = value;
    }

    [JsonIgnore]
    public string? Description
    {
        get => BodyHtml;
        set => BodyHtml = value;
    }

    [JsonIgnore]
    public List<string> Category
    {
        get => Tags;
        set => Tags = value;
    }

    [JsonIgnore]
    public string? ImageFile => Images.FirstOrDefault()?.Src;

    [JsonIgnore]
    public decimal Price
    {
        get
        {
            var firstPrice = Variants.FirstOrDefault()?.Price;
            if (!string.IsNullOrEmpty(firstPrice) &&
                decimal.TryParse(firstPrice, NumberStyles.Any, CultureInfo.InvariantCulture, out var price))
            {
                return price;
            }
            return 0m;
        }
    }
}

public class ProductVariant
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = default!;

    [JsonPropertyName("option1")]
    public string? Option1 { get; set; }

    [JsonPropertyName("option2")]
    public string? Option2 { get; set; }

    [JsonPropertyName("option3")]
    public string? Option3 { get; set; }

    [JsonPropertyName("sku")]
    public string? Sku { get; set; }

    [JsonPropertyName("requires_shipping")]
    public bool RequiresShipping { get; set; }

    [JsonPropertyName("taxable")]
    public bool Taxable { get; set; }

    [JsonPropertyName("featured_image")]
    public object? FeaturedImage { get; set; }

    [JsonPropertyName("available")]
    public bool Available { get; set; }

    [JsonPropertyName("price")]
    public string Price { get; set; } = default!;

    [JsonPropertyName("grams")]
    public long Grams { get; set; }

    [JsonPropertyName("compare_at_price")]
    public string? CompareAtPrice { get; set; }

    [JsonPropertyName("position")]
    public int Position { get; set; }

    [JsonPropertyName("product_id")]
    public long ProductId { get; set; }

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }
}

public class ProductImage
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [JsonPropertyName("position")]
    public int Position { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }

    [JsonPropertyName("product_id")]
    public long ProductId { get; set; }

    [JsonPropertyName("variant_ids")]
    public List<long> VariantIds { get; set; } = new();

    [JsonPropertyName("src")]
    public string Src { get; set; } = default!;

    [JsonPropertyName("width")]
    public int Width { get; set; }

    [JsonPropertyName("height")]
    public int Height { get; set; }
}

public class ProductOption
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = default!;

    [JsonPropertyName("position")]
    public int Position { get; set; }

    [JsonPropertyName("values")]
    public List<string> Values { get; set; } = new();
}
