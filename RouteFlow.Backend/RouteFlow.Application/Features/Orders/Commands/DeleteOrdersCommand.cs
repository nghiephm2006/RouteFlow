using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Commands
{
    public record DeleteOrdersCommand(IEnumerable<Guid> Ids) : IRequest<bool>;

    public class DeleteOrdersCommandHandler : IRequestHandler<DeleteOrdersCommand, bool>
    {
        private readonly IOrderRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteOrdersCommandHandler(IOrderRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(DeleteOrdersCommand request, CancellationToken cancellationToken)
        {
            if (request.Ids == null || !request.Ids.Any())
            {
                return false;
            }

            var orders = await _repository.GetByIdsAsync(request.Ids);
            var orderList = orders.ToList();
            if (!orderList.Any())
            {
                return false;
            }

            _repository.DeleteRange(orderList);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
