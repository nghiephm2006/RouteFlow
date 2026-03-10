using System.IO;
using OfficeOpenXml;
using RouteFlow.Application.Interfaces;

namespace RouteFlow.Infrastructure.Services
{
    public class ExcelTemplateService : IExcelTemplateService
    {
        public ExcelTemplateService()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public byte[] GenerateTemplate()
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Orders");

            // Header Row
            worksheet.Cells[1, 1].Value = "OrderCode";
            worksheet.Cells[1, 2].Value = "CustomerName";
            worksheet.Cells[1, 3].Value = "Address";
            worksheet.Cells[1, 4].Value = "Latitude";
            worksheet.Cells[1, 5].Value = "Longitude";
            worksheet.Cells[1, 6].Value = "Note";

            // Make header bold
            using (var range = worksheet.Cells[1, 1, 1, 6])
            {
                range.Style.Font.Bold = true;
                range.AutoFitColumns();
            }

            // Example Row
            worksheet.Cells[2, 1].Value = "ORD-001";
            worksheet.Cells[2, 2].Value = "John Doe";
            worksheet.Cells[2, 3].Value = "Hoan Kiem, Hanoi";
            worksheet.Cells[2, 4].Value = 21.0285;
            worksheet.Cells[2, 5].Value = 105.8048;
            worksheet.Cells[2, 6].Value = "Deliver before 5 PM";

            return package.GetAsByteArray();
        }
    }
}
