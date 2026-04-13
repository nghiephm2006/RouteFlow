using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RouteFlow.Domain.Entities;

namespace RouteFlow.Domain.Interfaces
{
    public interface IOrderStatusHistoryRepository
    {
        Task AddAsync(OrderStatusHistory history);
        Task AddRangeAsync(IEnumerable<OrderStatusHistory> histories);
        Task<IEnumerable<OrderStatusHistory>> GetByOrderIdAsync(Guid orderId);
    }
}
