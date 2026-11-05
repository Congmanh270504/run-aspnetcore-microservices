namespace Discount.Grpc.Models;

public class Coupon
{
    public int Id { get; set; }
    public string ProductName { get; set; } = default!;
    public string? Description { get; set; }
    public int Amount { get; set; }

    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }

    public DateTimeOffset? CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
