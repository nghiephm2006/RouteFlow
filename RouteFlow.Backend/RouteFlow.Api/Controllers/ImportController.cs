using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RouteFlow.Application.Features.Orders.Commands;
using RouteFlow.Application.Interfaces;

namespace RouteFlow.Api.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class ImportController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IExcelTemplateService _excelTemplateService;

        public ImportController(IMediator mediator, IExcelTemplateService excelTemplateService)
        {
            _mediator = mediator;
            _excelTemplateService = excelTemplateService;
        }

        [HttpPost("import")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ImportOrders(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty.");

            using var stream = file.OpenReadStream();
            var command = new ImportOrdersCommand { ExcelStream = stream };
            await _mediator.Send(command);

            return Ok(new { message = "Orders imported successfully." });
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            var fileBytes = _excelTemplateService.GenerateTemplate();
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "OrderTemplate.xlsx");
        }
    }
}
