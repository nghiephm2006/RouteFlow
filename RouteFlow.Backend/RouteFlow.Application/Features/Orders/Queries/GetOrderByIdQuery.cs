using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RouteFlow.Application.DTOs;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Queries
{
    public record GetOrderByIdQuery(Guid Id) : IRequest<OrderDto>;

    public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto>
    {
        private readonly IOrderRepository _repository;

        public GetOrderByIdQueryHandler(IOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<OrderDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
        {
            var order = await _repository.GetByIdAsync(request.Id);
            
            if (order == null) return null;

            return new OrderDto
            {
                Id = order.Id,
                OrderCode = order.OrderCode,
                CustomerName = order.CustomerName,
                Phone = order.Phone,
                Email = order.Email,
                Address = order.Address,
                Latitude = order.Latitude,
                Longitude = order.Longitude,
                Note = order.Note,
                Status = order.Status,
                CreatedAt = order.CreatedAt
            };
        }
    }
}
