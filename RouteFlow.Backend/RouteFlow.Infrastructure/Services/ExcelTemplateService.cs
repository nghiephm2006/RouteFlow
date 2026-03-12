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

            // 5 sample rows - real HCMC addresses with accurate coordinates
            var samples = new[]
            {
                new { Name = "Nguyễn Văn An",   Address = "Landmark 81, 720A Điện Biên Phủ, Bình Thạnh, TP.HCM",          Lat = 10.7951,  Lng = 106.7220, Note = "Giao tại quầy lễ tân tầng 1" },
                new { Name = "Trần Thị Bình",   Address = "Bến Thành Market, 1 Lê Lợi, Quận 1, TP.HCM",                   Lat = 10.7727,  Lng = 106.6980, Note = "Gọi điện trước khi giao" },
                new { Name = "Lê Minh Cường",   Address = "Vincom Center Đồng Khởi, 72 Lê Thánh Tôn, Quận 1, TP.HCM",    Lat = 10.7769,  Lng = 106.7031, Note = "Giao giờ hành chính" },
                new { Name = "Phạm Thu Hà",     Address = "Crescent Mall, 101 Tôn Dật Tiên, Phú Mỹ Hưng, Quận 7, TP.HCM",Lat = 10.7290,  Lng = 106.7218, Note = "Để tại bảo vệ" },
                new { Name = "Hoàng Quốc Tuấn", Address = "Aeon Mall Tân Phú, 30 Bờ Bao Tân Thắng, Tân Phú, TP.HCM",     Lat = 10.7960,  Lng = 106.6223, Note = "Tầng B1 cổng chính" },
            };

            for (int i = 0; i < samples.Length; i++)
            {
                int row = i + 2;
                worksheet.Cells[row, 1].Value = samples[i].Name;
                worksheet.Cells[row, 2].Value = samples[i].Address;
                worksheet.Cells[row, 3].Value = samples[i].Lat;
                worksheet.Cells[row, 4].Value = samples[i].Lng;
                worksheet.Cells[row, 5].Value = samples[i].Note;
            }

            worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

            return package.GetAsByteArray();
        }
    }
}
