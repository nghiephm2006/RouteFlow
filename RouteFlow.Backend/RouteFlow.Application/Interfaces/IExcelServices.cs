using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using RouteFlow.Domain.Entities;

namespace RouteFlow.Application.Interfaces
{
    public interface IExcelImportService
    {
        Task<IEnumerable<Order>> ParseExcelAsync(Stream excelStream);
    }

    public interface IExcelTemplateService
    {
        byte[] GenerateTemplate();
    }
}
