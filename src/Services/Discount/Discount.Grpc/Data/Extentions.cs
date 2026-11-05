using Discount.Grpc.Models;
using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Data;

public static class Extentions
{
    public static IApplicationBuilder UseMigration(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        using var dbContext = scope.ServiceProvider.GetRequiredService<DiscountContext>();
        
        try
        {
            dbContext.Database.Migrate();
        }
        catch
        {
            // Ignore if already created or migrated
        }

        EnsureColumnsExist(dbContext);

        return app;
    }

    private static void EnsureColumnsExist(DiscountContext dbContext)
    {
        try
        {
            var conn = dbContext.Database.GetDbConnection();
            conn.Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "PRAGMA table_info(Coupons);";
            using var reader = cmd.ExecuteReader();
            var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            bool isDescriptionNotNull = false;
            while (reader.Read())
            {
                var colName = reader.GetString(1);
                columns.Add(colName);
                if (string.Equals(colName, "Description", StringComparison.OrdinalIgnoreCase))
                {
                    isDescriptionNotNull = reader.GetInt32(3) == 1;
                }
            }
            reader.Close();

            if (!columns.Contains("StartDate"))
            {
                cmd.CommandText = "ALTER TABLE Coupons ADD COLUMN StartDate TEXT;";
                cmd.ExecuteNonQuery();
            }
            if (!columns.Contains("EndDate"))
            {
                cmd.CommandText = "ALTER TABLE Coupons ADD COLUMN EndDate TEXT;";
                cmd.ExecuteNonQuery();
            }
            if (!columns.Contains("CreatedAt"))
            {
                cmd.CommandText = "ALTER TABLE Coupons ADD COLUMN CreatedAt TEXT;";
                cmd.ExecuteNonQuery();
            }
            if (!columns.Contains("UpdatedAt"))
            {
                cmd.CommandText = "ALTER TABLE Coupons ADD COLUMN UpdatedAt TEXT;";
                cmd.ExecuteNonQuery();
            }

            if (isDescriptionNotNull)
            {
                cmd.CommandText = @"
                    PRAGMA foreign_keys = OFF;
                    CREATE TABLE Coupons_temp (
                        Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        ProductName TEXT NOT NULL,
                        Description TEXT,
                        Amount INTEGER NOT NULL,
                        StartDate TEXT,
                        EndDate TEXT,
                        CreatedAt TEXT,
                        UpdatedAt TEXT
                    );
                    INSERT INTO Coupons_temp (Id, ProductName, Description, Amount, StartDate, EndDate, CreatedAt, UpdatedAt)
                    SELECT Id, ProductName, Description, Amount, StartDate, EndDate, CreatedAt, UpdatedAt FROM Coupons;
                    DROP TABLE Coupons;
                    ALTER TABLE Coupons_temp RENAME TO Coupons;
                    PRAGMA foreign_keys = ON;
                ";
                cmd.ExecuteNonQuery();
            }

            // Fill default timestamps for legacy NULL rows
            cmd.CommandText = @"
                UPDATE Coupons SET CreatedAt = '2026-01-01T00:00:00.0000000+00:00' WHERE CreatedAt IS NULL;
                UPDATE Coupons SET UpdatedAt = '2026-01-01T00:00:00.0000000+00:00' WHERE UpdatedAt IS NULL;
                UPDATE Coupons SET StartDate = '2026-01-01T00:00:00.0000000+00:00' WHERE StartDate IS NULL;
                UPDATE Coupons SET EndDate = '2028-01-01T00:00:00.0000000+00:00' WHERE EndDate IS NULL;
            ";
            cmd.ExecuteNonQuery();
        }
        catch
        {
            // Fail-safe
        }
    }
}
