using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RouteFlow.Application.Features.Orders.Commands;
using RouteFlow.Application.Features.Orders.Queries;

namespace RouteFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OrdersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
        {
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetOrders), new { id = result }, result);
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var result = await _mediator.Send(new GetOrdersQuery());
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            var result = await _mediator.Send(new GetOrderByIdQuery(id));
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingOrders()
        {
            var result = await _mediator.Send(new GetPendingOrdersQuery());
            return Ok(result);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetOrderStats()
        {
            var result = await _mediator.Send(new GetOrderStatsQuery());
            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrder(Guid id, [FromBody] UpdateOrderCommand command)
        {
            if (id != command.Id) return BadRequest("Id mismatch.");
            
            var result = await _mediator.Send(command);
            if (!result) return NotFound();
            
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOrder(Guid id)
        {
            var result = await _mediator.Send(new DeleteOrderCommand(id));
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("batch")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteOrders([FromBody] List<Guid> ids)
        {
            if (ids == null || ids.Count == 0) return BadRequest("No order IDs provided.");
            var result = await _mediator.Send(new DeleteOrdersCommand(ids));
            if (!result) return BadRequest("Could not delete orders. They might have been already deleted.");
            return NoContent();
        }

        [HttpPatch("{id:guid}/status")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusCommand command)
        {
            if (id != command.Id) return BadRequest("Id mismatch.");
            var result = await _mediator.Send(command);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
