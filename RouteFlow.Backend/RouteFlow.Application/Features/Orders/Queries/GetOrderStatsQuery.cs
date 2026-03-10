using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RouteFlow.Application.DTOs;
using RouteFlow.Domain.Enums;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Queries
{
    public record GetOrderStatsQuery() : IRequest<OrderStatsDto>;

    public class GetOrderStatsQueryHandler : IRequestHandler<GetOrderStatsQuery, OrderStatsDto>
    {
        private readonly IOrderRepository _repository;

        public GetOrderStatsQueryHandler(IOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<OrderStatsDto> Handle(GetOrderStatsQuery request, CancellationToken cancellationToken)
        {
            return new OrderStatsDto
            {
                TotalOrders = await _repository.GetTotalOrdersCountAsync(),
                PendingOrders = await _repository.GetOrdersCountByStatusAsync(OrderStatus.Pending),
                AssignedOrders = await _repository.GetOrdersCountByStatusAsync(OrderStatus.Assigned),
                DeliveredOrders = await _repository.GetOrdersCountByStatusAsync(OrderStatus.Delivered)
            };
        }
    }
}
