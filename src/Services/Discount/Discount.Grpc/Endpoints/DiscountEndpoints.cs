using Discount.Grpc.Data;
using Discount.Grpc.Models;
using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Endpoints;

public static class DiscountEndpoints
{
    public static void MapDiscountEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/discounts");

        group.MapGet("/", async (DiscountContext dbContext) =>
        {
            var coupons = await dbContext.Coupons.ToListAsync();
            return Results.Ok(coupons);
        });

        group.MapGet("/{productName}", async (string productName, DiscountContext dbContext) =>
        {
            var coupon = await dbContext.Coupons.FirstOrDefaultAsync(x => x.ProductName.ToLower() == productName.ToLower());
            if (coupon is null)
            {
                return Results.Ok(new Coupon { ProductName = "No Discount", Amount = 0, Description = "No Discount Desc" });
            }
            return Results.Ok(coupon);
        });

        group.MapPost("/", async (Coupon coupon, DiscountContext dbContext) =>
        {
            if (coupon is null) return Results.BadRequest("Invalid coupon data");
            
            var now = DateTimeOffset.UtcNow;
            coupon.CreatedAt = now;
            coupon.UpdatedAt = now;
            if (!coupon.StartDate.HasValue) coupon.StartDate = now;
            if (!coupon.EndDate.HasValue) coupon.EndDate = now.AddDays(30);

            dbContext.Coupons.Add(coupon);
            await dbContext.SaveChangesAsync();

            return Results.Created($"/discounts/{coupon.ProductName}", coupon);
        });

        group.MapPut("/", async (Coupon coupon, DiscountContext dbContext) =>
        {
            if (coupon is null) return Results.BadRequest("Invalid coupon data");

            var existing = await dbContext.Coupons.FindAsync(coupon.Id);
            if (existing is null)
            {
                existing = await dbContext.Coupons.FirstOrDefaultAsync(x => x.ProductName.ToLower() == coupon.ProductName.ToLower());
            }

            if (existing is null)
            {
                return Results.NotFound($"Coupon for product {coupon.ProductName} not found");
            }

            existing.ProductName = coupon.ProductName;
            existing.Description = coupon.Description;
            existing.Amount = coupon.Amount;
            if (coupon.StartDate.HasValue) existing.StartDate = coupon.StartDate;
            if (coupon.EndDate.HasValue) existing.EndDate = coupon.EndDate;
            existing.UpdatedAt = DateTimeOffset.UtcNow;

            dbContext.Coupons.Update(existing);
            await dbContext.SaveChangesAsync();

            return Results.Ok(existing);
        });

        group.MapDelete("/{id:int}", async (int id, DiscountContext dbContext) =>
        {
            var coupon = await dbContext.Coupons.FindAsync(id);
            if (coupon is null) return Results.NotFound();

            dbContext.Coupons.Remove(coupon);
            await dbContext.SaveChangesAsync();

            return Results.Ok(new { isSuccess = true });
        });

        group.MapDelete("/{productName}", async (string productName, DiscountContext dbContext) =>
        {
            var coupon = await dbContext.Coupons.FirstOrDefaultAsync(x => x.ProductName.ToLower() == productName.ToLower());
            if (coupon is null) return Results.NotFound();

            dbContext.Coupons.Remove(coupon);
            await dbContext.SaveChangesAsync();

            return Results.Ok(new { isSuccess = true });
        });
    }
}
