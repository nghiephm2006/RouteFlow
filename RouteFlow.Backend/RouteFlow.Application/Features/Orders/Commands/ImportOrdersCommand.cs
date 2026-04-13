using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RouteFlow.Application.Interfaces;
using RouteFlow.Domain.Entities;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Commands
{
    public class ImportOrdersCommand : IRequest<bool>
    {
        public required Stream ExcelStream { get; init; }
    }

    public class ImportOrdersCommandHandler : IRequestHandler<ImportOrdersCommand, bool>
    {
        private readonly IExcelImportService _excelImportService;
        private readonly IOrderRepository _repository;
        private readonly IOrderStatusHistoryRepository _orderStatusHistoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ImportOrdersCommandHandler(
            IExcelImportService excelImportService,
            IOrderRepository repository,
            IOrderStatusHistoryRepository orderStatusHistoryRepository,
            IUnitOfWork unitOfWork)
        {
            _excelImportService = excelImportService;
            _repository = repository;
            _orderStatusHistoryRepository = orderStatusHistoryRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(ImportOrdersCommand request, CancellationToken cancellationToken)
        {
            var parsedOrders = await _excelImportService.ParseExcelAsync(request.ExcelStream);
            
            await _repository.AddRangeAsync(parsedOrders);
            await _orderStatusHistoryRepository.AddRangeAsync(parsedOrders.Select(order =>
                OrderStatusHistory.Create(
                    order.Id,
                    null,
                    order.Status,
                    null,
                    "Order imported")));
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
