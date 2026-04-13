using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RouteFlow.Domain.Entities;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Commands
{
    public record CreateOrderCommand(
        string CustomerName,
        string Phone,
        string Email,
        string Address,
        double Latitude,
        double Longitude,
        string Note) : IRequest<Guid>;

    public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderCommandValidator()
        {
            RuleFor(x => x.CustomerName).NotEmpty().WithMessage("CustomerName is required.");
            RuleFor(x => x.Address).NotEmpty().WithMessage("Address is required.");
            RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).WithMessage("Invalid Latitude.");
            RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).WithMessage("Invalid Longitude.");
        }
    }

    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
    {
        private readonly IOrderRepository _repository;
        private readonly IOrderStatusHistoryRepository _orderStatusHistoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateOrderCommandHandler(
            IOrderRepository repository,
            IOrderStatusHistoryRepository orderStatusHistoryRepository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _orderStatusHistoryRepository = orderStatusHistoryRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            var order = Order.Create(
                request.CustomerName,
                request.Phone,
                request.Email,
                request.Address,
                request.Latitude,
                request.Longitude,
                request.Note
            );

            await _repository.AddAsync(order);
            await _orderStatusHistoryRepository.AddAsync(OrderStatusHistory.Create(
                order.Id,
                null,
                order.Status,
                null,
                "Order created"));
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return order.Id;
        }
    }
}
