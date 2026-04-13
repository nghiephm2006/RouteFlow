using System;
using System.Collections.Generic;
using RouteFlow.Domain.Enums;

namespace RouteFlow.Application.DTOs
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Note { get; set; } = string.Empty;
        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderStatusHistoryDto> StatusHistory { get; set; } = [];
    }
}
