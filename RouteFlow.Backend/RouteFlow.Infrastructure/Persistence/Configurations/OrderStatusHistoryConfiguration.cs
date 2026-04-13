using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RouteFlow.Domain.Entities;

namespace RouteFlow.Infrastructure.Persistence.Configurations
{
    public class OrderStatusHistoryConfiguration : IEntityTypeConfiguration<OrderStatusHistory>
    {
        public void Configure(EntityTypeBuilder<OrderStatusHistory> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.ToStatus)
                .IsRequired();

            builder.Property(x => x.Reason)
                .HasMaxLength(500);

            builder.Property(x => x.ChangedAt)
                .IsRequired();

            builder.HasIndex(x => x.OrderId);
            builder.HasIndex(x => x.ChangedAt);
        }
    }
}
