using System;
using RouteFlow.Domain.Enums;

namespace RouteFlow.Application.DTOs
{
    public class OrderStatusHistoryDto
    {
        public Guid Id { get; set; }
        public OrderStatus? FromStatus { get; set; }
        public OrderStatus ToStatus { get; set; }
        public Guid? ChangedByUserId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
    }
}
