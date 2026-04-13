using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RouteFlow.Domain.Entities;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Infrastructure.Persistence.Repositories
{
    public class OrderStatusHistoryRepository : IOrderStatusHistoryRepository
    {
        private readonly AppDbContext _context;

        public OrderStatusHistoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(OrderStatusHistory history)
        {
            await _context.OrderStatusHistories.AddAsync(history);
        }

        public async Task AddRangeAsync(IEnumerable<OrderStatusHistory> histories)
        {
            await _context.OrderStatusHistories.AddRangeAsync(histories);
        }

        public async Task<IEnumerable<OrderStatusHistory>> GetByOrderIdAsync(Guid orderId)
        {
            return await _context.OrderStatusHistories
                .Where(x => x.OrderId == orderId)
                .OrderByDescending(x => x.ChangedAt)
                .ToListAsync();
        }
    }
}
