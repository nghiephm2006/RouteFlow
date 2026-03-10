using System;
using System.Collections.Generic;

namespace RouteFlow.Application.DTOs
{
    public class ClusterDto
    {
        public int ClusterId { get; set; }
        public List<OrderDto> Orders { get; set; } = new();
    }
}
