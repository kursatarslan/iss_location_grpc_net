using Microsoft.EntityFrameworkCore;
using SpaceDataServer.Models;
using ConnectionInfo = SpaceDataServer.Models.ConnectionInfo;

public class AppDbContext : DbContext
{
    public DbSet<ConnectionInfo> Connections { get; set; }
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
}