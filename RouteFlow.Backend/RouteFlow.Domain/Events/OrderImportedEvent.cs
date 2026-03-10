using System.Collections.Generic;
using RouteFlow.Domain.Common;
using RouteFlow.Domain.Entities;

namespace RouteFlow.Domain.Events
{
    public class OrderImportedEvent : BaseEvent
    {
        public IEnumerable<Order> Orders { get; }

        public OrderImportedEvent(IEnumerable<Order> orders)
        {
            Orders = orders;
        }
    }
}
