using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Commands
{
    public record UpdateOrderCommand(
        Guid Id,
        string CustomerName,
        string Address,
        double Latitude,
        double Longitude,
        string Note) : IRequest<bool>;

    public class UpdateOrderCommandValidator : AbstractValidator<UpdateOrderCommand>
    {
        public UpdateOrderCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("OrderId is required.");
            RuleFor(x => x.CustomerName).NotEmpty().WithMessage("CustomerName is required.");
            RuleFor(x => x.Address).NotEmpty().WithMessage("Address is required.");
            RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).WithMessage("Invalid Latitude.");
            RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).WithMessage("Invalid Longitude.");
        }
    }

    public class UpdateOrderCommandHandler : IRequestHandler<UpdateOrderCommand, bool>
    {
        private readonly IOrderRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateOrderCommandHandler(IOrderRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
        {
            var order = await _repository.GetByIdAsync(request.Id);
            
            if (order == null) return false;

            // Notice we do NOT update OrderCode
            // To update these we need to add a method on Order entity, or we can just bypass encaps for now, but best practice is:
            order.UpdateDetails(request.CustomerName, request.Address, request.Latitude, request.Longitude, request.Note);

            _repository.Update(order);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
