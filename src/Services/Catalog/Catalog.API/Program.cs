using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var assembly = typeof(Program).Assembly;
builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(assembly);
    config.AddOpenBehavior(typeof(ValidationBehavior<,>));
    config.AddOpenBehavior(typeof(LoggingBehavior<,>));
});
builder.Services.AddValidatorsFromAssembly(assembly);

builder.Services.AddCarter();

builder.Services.AddSingleton<ICatalogContext, CatalogContext>();

builder.Services.AddExceptionHandler<CustomExceptionHandler>();

var mongoConn = CatalogContext.GetConnectionString(builder.Configuration);
builder.Services.AddHealthChecks()
    .AddMongoDb(mongoConn);

var app = builder.Build();

// Run standalone seed script if requested via CLI
if (args.Any(a => a.Equals("--seed", StringComparison.OrdinalIgnoreCase) ||
                  a.Equals("--seed-data2", StringComparison.OrdinalIgnoreCase) ||
                  a.Equals("-s", StringComparison.OrdinalIgnoreCase)))
{
    var targetFile = args.FirstOrDefault(a => a.EndsWith(".json", StringComparison.OrdinalIgnoreCase)) ?? "data2.json";
    using var scope = app.Services.CreateScope();
    var catalogContext = scope.ServiceProvider.GetRequiredService<ICatalogContext>();
    Console.WriteLine($"==> Running Catalog Seeding Script (Target: {targetFile}) <==");
    await CatalogInitialData.SeedAsync(catalogContext, targetFileName: targetFile, force: true);
    Console.WriteLine("==> Seeding process completed successfully. Exiting. <==");
    return;
}

// Seed initial data in Development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var catalogContext = scope.ServiceProvider.GetRequiredService<ICatalogContext>();
    await CatalogInitialData.SeedAsync(catalogContext);
}

// Configure the HTTP request pipeline.
app.MapCarter();

app.UseExceptionHandler(options => { });

app.UseHealthChecks("/health",
    new HealthCheckOptions
    {
        ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
    });

app.Run();
