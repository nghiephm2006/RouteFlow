using System;
using RouteFlow.Domain.Common;
using RouteFlow.Domain.Enums;

namespace RouteFlow.Domain.Entities
{
    public class OrderStatusHistory : BaseEntity
    {
        public Guid Id { get; private set; }
        public Guid OrderId { get; private set; }
        public OrderStatus? FromStatus { get; private set; }
        public OrderStatus ToStatus { get; private set; }
        public Guid? ChangedByUserId { get; private set; }
        public string Reason { get; private set; }
        public DateTime ChangedAt { get; private set; }

        private OrderStatusHistory()
        {
            Reason = string.Empty;
        }

        public static OrderStatusHistory Create(
            Guid orderId,
            OrderStatus? fromStatus,
            OrderStatus toStatus,
            Guid? changedByUserId,
            string? reason = null)
        {
            return new OrderStatusHistory
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                FromStatus = fromStatus,
                ToStatus = toStatus,
                ChangedByUserId = changedByUserId,
                Reason = reason ?? string.Empty,
                ChangedAt = DateTime.UtcNow
            };
        }
    }
}
