using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RouteFlow.Application.DTOs;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Queries
{
    public record GetOrdersQuery() : IRequest<IEnumerable<OrderDto>>;

    public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, IEnumerable<OrderDto>>
    {
        private readonly IOrderRepository _repository;
        private readonly IOrderStatusHistoryRepository _orderStatusHistoryRepository;

        public GetOrdersQueryHandler(
            IOrderRepository repository,
            IOrderStatusHistoryRepository orderStatusHistoryRepository)
        {
            _repository = repository;
            _orderStatusHistoryRepository = orderStatusHistoryRepository;
        }

        public async Task<IEnumerable<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
        {
            var orders = await _repository.GetAllAsync();
            var orderList = orders.ToList();
            var historyMap = await LoadHistoryMapAsync(orderList.Select(o => o.Id));

            return orderList.Select(o => new OrderDto
            {
                Id = o.Id,
                OrderCode = o.OrderCode,
                CustomerName = o.CustomerName,
                Phone = o.Phone,
                Email = o.Email,
                Address = o.Address,
                Latitude = o.Latitude,
                Longitude = o.Longitude,
                Note = o.Note,
                Status = o.Status,
                CreatedAt = o.CreatedAt,
                StatusHistory = historyMap.TryGetValue(o.Id, out var history)
                    ? history
                    : []
            });
        }

        private async Task<Dictionary<Guid, List<OrderStatusHistoryDto>>> LoadHistoryMapAsync(IEnumerable<Guid> orderIds)
        {
            var map = new Dictionary<Guid, List<OrderStatusHistoryDto>>();

            foreach (var orderId in orderIds)
            {
                var histories = await _orderStatusHistoryRepository.GetByOrderIdAsync(orderId);
                map[orderId] = histories.Select(x => new OrderStatusHistoryDto
                {
                    Id = x.Id,
                    FromStatus = x.FromStatus,
                    ToStatus = x.ToStatus,
                    ChangedByUserId = x.ChangedByUserId,
                    Reason = x.Reason,
                    ChangedAt = x.ChangedAt
                }).ToList();
            }

            return map;
        }
    }
}
