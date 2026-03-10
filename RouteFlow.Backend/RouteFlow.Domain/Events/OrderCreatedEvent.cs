using System;
using RouteFlow.Domain.Common;
using RouteFlow.Domain.Entities;

namespace RouteFlow.Domain.Events
{
    public class OrderCreatedEvent : BaseEvent
    {
        public Order Order { get; }

        public OrderCreatedEvent(Order order)
        {
            Order = order;
        }
    }
}
