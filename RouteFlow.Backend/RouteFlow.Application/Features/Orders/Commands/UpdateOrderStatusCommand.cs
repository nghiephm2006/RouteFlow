using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RouteFlow.Application.Interfaces;
using RouteFlow.Domain.Entities;
using RouteFlow.Domain.Enums;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Commands
{
    public record UpdateOrderStatusCommand(
        Guid Id,
        OrderStatus NewStatus) : IRequest<bool>;

    public class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
    {
        public UpdateOrderStatusCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("OrderId is required.");
            RuleFor(x => x.NewStatus).IsInEnum().WithMessage("Invalid status value.");
        }
    }

    public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, bool>
    {
        private readonly IOrderRepository _repository;
        private readonly IOrderStatusHistoryRepository _orderStatusHistoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly ICurrentUserService _currentUserService;

        public UpdateOrderStatusCommandHandler(
            IOrderRepository repository,
            IOrderStatusHistoryRepository orderStatusHistoryRepository,
            IUnitOfWork unitOfWork,
            IEmailService emailService,
            ICurrentUserService currentUserService)
        {
            _repository = repository;
            _orderStatusHistoryRepository = orderStatusHistoryRepository;
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _currentUserService = currentUserService;
        }

        public async Task<bool> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            var order = await _repository.GetByIdAsync(request.Id);
            if (order == null) return false;

            var previousStatus = order.Status;
            order.UpdateStatus(request.NewStatus);

            _repository.Update(order);
            await _orderStatusHistoryRepository.AddAsync(OrderStatusHistory.Create(
                order.Id,
                previousStatus,
                request.NewStatus,
                _currentUserService.UserId,
                "Status updated via API"));
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Send email notification if customer has an email
            if (!string.IsNullOrWhiteSpace(order.Email))
            {
                var statusName = request.NewStatus switch
                {
                    OrderStatus.Pending => "Chờ xử lý",
                    OrderStatus.Routing => "Đang xếp tuyến",
                    OrderStatus.Assigned => "Đã giao tài xế - Đang giao hàng",
                    OrderStatus.Delivered => "Giao hàng thành công ✅",
                    _ => request.NewStatus.ToString()
                };

                // Fire-and-forget with try/catch to not block the main flow
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _emailService.SendOrderStatusChangedAsync(
                            order.Email,
                            order.CustomerName,
                            order.OrderCode,
                            statusName);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Email] Failed to send notification: {ex.Message}");
                    }
                }, cancellationToken);
            }

            return true;
        }
    }
}
