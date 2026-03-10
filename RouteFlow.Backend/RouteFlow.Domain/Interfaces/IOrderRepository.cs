using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RouteFlow.Domain.Entities;

namespace RouteFlow.Domain.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order> GetByIdAsync(Guid id);
        Task<Order> GetByOrderCodeAsync(string orderCode);
        Task<IEnumerable<Order>> GetAllAsync();
        Task<IEnumerable<Order>> GetPendingOrdersAsync();
        Task AddAsync(Order order);
        Task AddRangeAsync(IEnumerable<Order> orders);
        void Update(Order order);
        void Delete(Order order);
        Task<int> GetTotalOrdersCountAsync();
        Task<int> GetOrdersCountByStatusAsync(Enums.OrderStatus status);
    }
}
