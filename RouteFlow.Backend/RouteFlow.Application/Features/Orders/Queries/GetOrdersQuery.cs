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

        public GetOrdersQueryHandler(IOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
        {
            var orders = await _repository.GetAllAsync();
            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                OrderCode = o.OrderCode,
                CustomerName = o.CustomerName,
                Address = o.Address,
                Latitude = o.Latitude,
                Longitude = o.Longitude,
                Note = o.Note,
                Status = o.Status,
                CreatedAt = o.CreatedAt
            });
        }
    }
}
