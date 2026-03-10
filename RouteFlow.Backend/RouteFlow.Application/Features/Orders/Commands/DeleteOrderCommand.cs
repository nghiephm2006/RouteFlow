using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Commands
{
    public record DeleteOrderCommand(Guid Id) : IRequest<bool>;

    public class DeleteOrderCommandHandler : IRequestHandler<DeleteOrderCommand, bool>
    {
        private readonly IOrderRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteOrderCommandHandler(IOrderRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(DeleteOrderCommand request, CancellationToken cancellationToken)
        {
            var order = await _repository.GetByIdAsync(request.Id);
            if (order == null)
            {
                return false;
            }

            _repository.Delete(order);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
