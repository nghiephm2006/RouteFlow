using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RouteFlow.Domain.Entities;

namespace RouteFlow.Infrastructure.Persistence.Configurations
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.HasKey(o => o.Id);

            builder.Property(o => o.OrderCode)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(o => o.OrderCode)
                .IsUnique();

            builder.Property(o => o.CustomerName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(o => o.Address)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(o => o.Note)
                .HasMaxLength(1000);

            builder.Property(o => o.Status)
                .IsRequired();
                
            builder.Property(o => o.CreatedAt)
                .IsRequired();
        }
    }
}
