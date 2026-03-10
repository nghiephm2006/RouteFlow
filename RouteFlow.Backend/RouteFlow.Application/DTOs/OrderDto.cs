using System;
using RouteFlow.Domain.Enums;

namespace RouteFlow.Application.DTOs
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public string OrderCode { get; set; }
        public string CustomerName { get; set; }
        public string Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Note { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
