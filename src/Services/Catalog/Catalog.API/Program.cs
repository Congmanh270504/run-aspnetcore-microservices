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

var mongoConn = builder.Configuration.GetConnectionString("Database")
    ?? "mongodb://localhost:27017/CatalogDb";
builder.Services.AddHealthChecks()
    .AddMongoDb(mongoConn);

var app = builder.Build();

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
