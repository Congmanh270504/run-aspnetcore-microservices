using Discount.Grpc;
using Discount.Grpc.Data;
using Discount.Grpc.Endpoints;
using Discount.Grpc.Models;
using Discount.Grpc.Services;
using Mapster;
using Microsoft.EntityFrameworkCore;

// Configure Mapster for nullable Description to proto string mapping
TypeAdapterConfig<Coupon, CouponModel>.NewConfig()
    .Map(dest => dest.Description, src => src.Description ?? string.Empty);

TypeAdapterConfig<CouponModel, Coupon>.NewConfig()
    .Map(dest => dest.Description, src => string.IsNullOrEmpty(src.Description) ? null : src.Description);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddGrpc();
builder.Services.AddDbContext<DiscountContext>(opts =>
        opts.UseSqlite(builder.Configuration.GetConnectionString("Database")));

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMigration();
app.MapGrpcService<DiscountService>();
app.MapDiscountEndpoints();
app.MapGet("/", () => "Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");

app.Run();

