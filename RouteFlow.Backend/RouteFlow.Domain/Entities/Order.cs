using System;
using RouteFlow.Domain.Common;
using RouteFlow.Domain.Enums;
using RouteFlow.Domain.Events;

namespace RouteFlow.Domain.Entities
{
    public class Order : BaseEntity
    {
        public Guid Id { get; private set; }
        public string OrderCode { get; private set; }
        public string CustomerName { get; private set; }
        public string Address { get; private set; }
        public double Latitude { get; private set; }
        public double Longitude { get; private set; }
        public string Note { get; private set; }
        public OrderStatus Status { get; private set; }
        public DateTime CreatedAt { get; private set; }

        private Order() { } // EF Core

        public static Order Create(string customerName, string address, double latitude, double longitude, string note)
        {
            var shortId = Guid.NewGuid().ToString("N").Substring(0, 4).ToUpper();
            var timePrefix = DateTime.UtcNow.ToString("yyMMdd");
            var orderCode = $"ORD-{timePrefix}-{shortId}";

            var order = new Order
            {
                Id = Guid.NewGuid(),
                OrderCode = orderCode,
                CustomerName = customerName,
                Address = address,
                Latitude = latitude,
                Longitude = longitude,
                Note = note,
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            order.AddDomainEvent(new OrderCreatedEvent(order));

            return order;
        }

        public void Assign()
        {
            Status = OrderStatus.Assigned;
        }

        public void MarkAsDelivered()
        {
            Status = OrderStatus.Delivered;
        }

        public void UpdateLocation(double latitude, double longitude)
        {
            Latitude = latitude;
            Longitude = longitude;
        }

        public void UpdateDetails(string customerName, string address, double latitude, double longitude, string note)
        {
            CustomerName = customerName;
            Address = address;
            Latitude = latitude;
            Longitude = longitude;
            Note = note;
        }
    }
}
