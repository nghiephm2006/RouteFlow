using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RouteFlow.Application.DTOs;
using RouteFlow.Application.Interfaces;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Application.Features.Orders.Commands
{
    public record ClusterOrdersCommand(List<OrderDto> Orders, int NumberOfClusters) : IRequest<IEnumerable<ClusterDto>>;

    public class ClusterOrdersCommandHandler : IRequestHandler<ClusterOrdersCommand, IEnumerable<ClusterDto>>
    {
        private readonly IClusterService _clusterService;

        public ClusterOrdersCommandHandler(IClusterService clusterService)
        {
            _clusterService = clusterService;
        }

        public Task<IEnumerable<ClusterDto>> Handle(ClusterOrdersCommand request, CancellationToken cancellationToken)
        {
            var clusters = _clusterService.ClusterOrders(request.Orders, request.NumberOfClusters);
            return Task.FromResult(clusters);
        }
    }
}
