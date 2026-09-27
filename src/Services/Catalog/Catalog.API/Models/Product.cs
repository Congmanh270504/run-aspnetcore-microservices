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
    public ProductType? ProductType { get; set; }

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = new();

    [JsonPropertyName("variants")]
    public List<ProductVariant> Variants { get; set; } = new();

    [JsonPropertyName("images")]
    public List<ProductImage> Images { get; set; } = new();

    [JsonPropertyName("options")]
    public List<ProductOption> Options { get; set; } = new();

    // Convenience properties for backward and frontend compatibility
    [JsonPropertyName("name")]
    public string Name
    {
        get => Title;
        set => Title = value;
    }

    [JsonPropertyName("description")]
    public string? Description
    {
        get => BodyHtml;
        set => BodyHtml = value;
    }

    [JsonPropertyName("category")]
    public List<string> Category
    {
        get => Tags.Count > 0 ? Tags : (string.IsNullOrEmpty(ProductType?.Name) ? new() : new List<string> { ProductType!.Name });
        set => Tags = value;
    }

    [JsonPropertyName("imageFile")]
    public string? ImageFile
    {
        get => Images.FirstOrDefault()?.Src ?? string.Empty;
        set { }
    }

    [JsonPropertyName("price")]
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
        set { }
    }
}

[JsonConverter(typeof(ProductTypeJsonConverter))]
[Newtonsoft.Json.JsonConverter(typeof(NewtonsoftProductTypeJsonConverter))]
public class ProductType
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = default!;
    
    [JsonPropertyName("sort_order")]
    public int SortOrder { get; set; }

    [JsonPropertyName("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }
}

public class ProductTypeJsonConverter : JsonConverter<ProductType>
{
    public override ProductType? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (string.IsNullOrEmpty(str)) return null;
            return new ProductType { Name = str };
        }

        if (reader.TokenType == JsonTokenType.StartObject)
        {
            using var doc = JsonDocument.ParseValue(ref reader);
            var root = doc.RootElement;
            var pt = new ProductType();
            
            if (root.TryGetProperty("id", out var idElem) && idElem.TryGetInt64(out var id))
                pt.Id = id;
            else if (root.TryGetProperty("Id", out var idElemCap) && idElemCap.TryGetInt64(out var idCap))
                pt.Id = idCap;

            if (root.TryGetProperty("name", out var nameElem))
                pt.Name = nameElem.GetString() ?? string.Empty;
            else if (root.TryGetProperty("Name", out var nameElemCap))
                pt.Name = nameElemCap.GetString() ?? string.Empty;

            if (root.TryGetProperty("sort_order", out var sortElem) && sortElem.TryGetInt32(out var sort))
                pt.SortOrder = sort;
            else if (root.TryGetProperty("SortOrder", out var sortElemCap) && sortElemCap.TryGetInt32(out var sortCap))
                pt.SortOrder = sortCap;

            if (root.TryGetProperty("created_at", out var createdElem) && createdElem.TryGetDateTimeOffset(out var created))
                pt.CreatedAt = created;

            if (root.TryGetProperty("updated_at", out var updatedElem) && updatedElem.TryGetDateTimeOffset(out var updated))
                pt.UpdatedAt = updated;

            return pt;
        }

        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        return null;
    }

    public override void Write(Utf8JsonWriter writer, ProductType value, JsonSerializerOptions options)
    {
        if (value == null)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStartObject();
        writer.WriteNumber("id", value.Id);
        writer.WriteString("name", value.Name ?? string.Empty);
        writer.WriteNumber("sort_order", value.SortOrder);
        writer.WriteString("created_at", value.CreatedAt);
        writer.WriteString("updated_at", value.UpdatedAt);
        writer.WriteEndObject();
    }
}

public class NewtonsoftProductTypeJsonConverter : Newtonsoft.Json.JsonConverter
{
    public override bool CanConvert(Type objectType)
    {
        return objectType == typeof(ProductType);
    }

    public override object? ReadJson(Newtonsoft.Json.JsonReader reader, Type objectType, object? existingValue, Newtonsoft.Json.JsonSerializer serializer)
    {
        if (reader.TokenType == Newtonsoft.Json.JsonToken.String)
        {
            var str = reader.Value?.ToString();
            if (string.IsNullOrEmpty(str)) return null;
            return new ProductType { Name = str };
        }

        if (reader.TokenType == Newtonsoft.Json.JsonToken.StartObject)
        {
            var jObj = Newtonsoft.Json.Linq.JObject.Load(reader);
            var pt = new ProductType();

            if (jObj.TryGetValue("id", StringComparison.OrdinalIgnoreCase, out var idToken))
                pt.Id = idToken.ToObject<long>();

            if (jObj.TryGetValue("name", StringComparison.OrdinalIgnoreCase, out var nameToken))
                pt.Name = nameToken.ToObject<string>() ?? string.Empty;

            if (jObj.TryGetValue("sort_order", StringComparison.OrdinalIgnoreCase, out var sortToken))
                pt.SortOrder = sortToken.ToObject<int>();

            if (jObj.TryGetValue("created_at", StringComparison.OrdinalIgnoreCase, out var createdToken) && createdToken.Type != Newtonsoft.Json.Linq.JTokenType.Null)
                pt.CreatedAt = createdToken.ToObject<DateTimeOffset>();

            if (jObj.TryGetValue("updated_at", StringComparison.OrdinalIgnoreCase, out var updatedToken) && updatedToken.Type != Newtonsoft.Json.Linq.JTokenType.Null)
                pt.UpdatedAt = updatedToken.ToObject<DateTimeOffset>();

            return pt;
        }

        if (reader.TokenType == Newtonsoft.Json.JsonToken.Null)
        {
            return null;
        }

        return null;
    }

    public override void WriteJson(Newtonsoft.Json.JsonWriter writer, object? value, Newtonsoft.Json.JsonSerializer serializer)
    {
        if (value is not ProductType pt)
        {
            writer.WriteNull();
            return;
        }

        writer.WriteStartObject();
        writer.WritePropertyName("id");
        writer.WriteValue(pt.Id);
        writer.WritePropertyName("name");
        writer.WriteValue(pt.Name ?? string.Empty);
        writer.WritePropertyName("sort_order");
        writer.WriteValue(pt.SortOrder);
        writer.WritePropertyName("created_at");
        writer.WriteValue(pt.CreatedAt);
        writer.WritePropertyName("updated_at");
        writer.WriteValue(pt.UpdatedAt);
        writer.WriteEndObject();
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
