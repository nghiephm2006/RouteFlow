using System;
using System.Collections.Generic;
using RouteFlow.Application.DTOs;

namespace RouteFlow.Application.Interfaces
{
    public interface IClusterService
    {
        IEnumerable<ClusterDto> ClusterOrders(IEnumerable<OrderDto> orders, int numberOfClusters);
    }
}
