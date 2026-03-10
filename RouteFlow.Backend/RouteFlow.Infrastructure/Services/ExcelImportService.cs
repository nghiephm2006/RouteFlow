using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using OfficeOpenXml;
using RouteFlow.Application.Interfaces;
using RouteFlow.Domain.Entities;

namespace RouteFlow.Infrastructure.Services
{
    public class ExcelImportService : IExcelImportService
    {
        public ExcelImportService()
        {
            // Requires EPPlus dependency LicenseContext.NonCommercial
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public async Task<IEnumerable<Order>> ParseExcelAsync(Stream excelStream)
        {
            var parsedOrders = new List<Order>();

            using var package = new ExcelPackage(excelStream);
            var worksheet = package.Workbook.Worksheets[0]; // Get first sheet
            if (worksheet == null) return parsedOrders;

            var rowCount = worksheet.Dimension.Rows;

            // Start from row 2 assuming row 1 is header
            for (int row = 2; row <= rowCount; row++)
            {
                var orderCode = worksheet.Cells[row, 1].Text;
                var customerName = worksheet.Cells[row, 2].Text;
                var address = worksheet.Cells[row, 3].Text;
                var latStr = worksheet.Cells[row, 4].Text;
                var lngStr = worksheet.Cells[row, 5].Text;
                var note = worksheet.Cells[row, 6].Text;

                if (string.IsNullOrWhiteSpace(orderCode)) continue;

                if (double.TryParse(latStr, out var latitude) && double.TryParse(lngStr, out var longitude))
                {
                    var order = Order.Create(orderCode, customerName, address, latitude, longitude, note);
                    parsedOrders.Add(order);
                }
            }

            return await Task.FromResult(parsedOrders);
        }
    }
}
