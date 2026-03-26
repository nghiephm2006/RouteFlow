using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RouteFlow.Application.DTOs;
using RouteFlow.Application.Interfaces;
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
        private readonly IUnitOfWork _unitOfWork;

        public ImportOrdersCommandHandler(IExcelImportService excelImportService, IOrderRepository repository, IUnitOfWork unitOfWork)
        {
            _excelImportService = excelImportService;
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(ImportOrdersCommand request, CancellationToken cancellationToken)
        {
            var parsedOrders = await _excelImportService.ParseExcelAsync(request.ExcelStream);
            
            await _repository.AddRangeAsync(parsedOrders);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
