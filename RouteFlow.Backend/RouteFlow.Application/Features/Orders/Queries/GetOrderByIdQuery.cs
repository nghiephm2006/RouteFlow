using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RouteFlow.Application.DTOs;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Queries
{
    public record GetOrderByIdQuery(Guid Id) : IRequest<OrderDto?>;

    public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?>
    {
        private readonly IOrderRepository _repository;
        private readonly IOrderStatusHistoryRepository _orderStatusHistoryRepository;

        public GetOrderByIdQueryHandler(
            IOrderRepository repository,
            IOrderStatusHistoryRepository orderStatusHistoryRepository)
        {
            _repository = repository;
            _orderStatusHistoryRepository = orderStatusHistoryRepository;
        }

        public async Task<OrderDto?> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
        {
            var order = await _repository.GetByIdAsync(request.Id);
            
            if (order == null) return null;

            var histories = await _orderStatusHistoryRepository.GetByOrderIdAsync(order.Id);

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
                CreatedAt = order.CreatedAt,
                StatusHistory = histories.Select(x => new OrderStatusHistoryDto
                {
                    Id = x.Id,
                    FromStatus = x.FromStatus,
                    ToStatus = x.ToStatus,
                    ChangedByUserId = x.ChangedByUserId,
                    Reason = x.Reason,
                    ChangedAt = x.ChangedAt
                }).ToList()
            };
        }
    }
}
