using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using RouteFlow.Application.DTOs;
using RouteFlow.Application.Features.Orders.Commands;
using RouteFlow.Application.Features.Orders.Queries;

namespace RouteFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoutesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RoutesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetRouteOrders()
        {
            // Same as GetPendingOrders, but specifically formatted for Frontend Map Route algo
            var result = await _mediator.Send(new GetPendingOrdersQuery());
            return Ok(result);
        }

        [HttpPost("cluster")]
        public async Task<IActionResult> ClusterOrders([FromBody] ClusterRequest request)
        {
            var command = new ClusterOrdersCommand(request.Orders, request.NumberOfClusters);
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }

    public class ClusterRequest
    {
        public List<OrderDto> Orders { get; set; } = new List<OrderDto>();
        public int NumberOfClusters { get; set; } = 1;
    }
}
