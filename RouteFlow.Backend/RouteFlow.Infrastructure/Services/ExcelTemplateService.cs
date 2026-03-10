using System.IO;
using OfficeOpenXml;
using RouteFlow.Application.Interfaces;

namespace RouteFlow.Infrastructure.Services
{
    public class ExcelTemplateService : IExcelTemplateService
    {
        public ExcelTemplateService()
        {
        }

        public byte[] GenerateTemplate()
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Orders");

            // Header Row
            worksheet.Cells[1, 1].Value = "CustomerName";
            worksheet.Cells[1, 2].Value = "Address";
            worksheet.Cells[1, 3].Value = "Latitude";
            worksheet.Cells[1, 4].Value = "Longitude";
            worksheet.Cells[1, 5].Value = "Note";

            // Make header bold
            using (var range = worksheet.Cells[1, 1, 1, 5])
            {
                range.Style.Font.Bold = true;
                range.AutoFitColumns();
            }

            // Example Row
            worksheet.Cells[2, 1].Value = "John Doe";
            worksheet.Cells[2, 2].Value = "Landmark 81, 720A Dien Bien Phu, Binh Thanh, Ho Chi Minh";
            worksheet.Cells[2, 3].Value = ""; // Leave blank so background geocoding will find it
            worksheet.Cells[2, 4].Value = "";
            worksheet.Cells[2, 5].Value = "Giao tai quay le tan";

            return package.GetAsByteArray();
        }
    }
}
