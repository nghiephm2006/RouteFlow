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

            // 5 sample rows - Distributed across HCMC ~10km apart for routing testing
            var samples = new[]
            {
                new { Name = "Cửa hàng Quận 1",    Address = "Chợ Bến Thành, Quận 1, TP.HCM",                   Lat = 10.7719, Lng = 106.6983, Note = "Điểm xuất phát trung tâm" },
                new { Name = "Kho Thủ Đức",       Address = "Chùa Huê Nghiêm, Lương Định Của, TP. Thủ Đức",    Lat = 10.8245, Lng = 106.7644, Note = "Khu vực phía Đông (~10km)" },
                new { Name = "Trạm Quận 12",      Address = "UBND Quận 12, Lê Thị Riêng, Quận 12, TP.HCM",     Lat = 10.8672, Lng = 106.6639, Note = "Khu vực phía Bắc (~11km)" },
                new { Name = "Chi nhánh Bình Tân", Address = "AEON Mall Bình Tân, Quận Bình Tân, TP.HCM",       Lat = 10.7437, Lng = 106.6121, Note = "Khu vực phía Tây (~10km)" },
                new { Name = "Bưu cục Nhà Bè",    Address = "Cầu Phước Lộc, Đào Sư Tích, Nhà Bè, TP.HCM",      Lat = 10.6961, Lng = 106.7029, Note = "Khu vực phía Nam (~9km)" },
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
