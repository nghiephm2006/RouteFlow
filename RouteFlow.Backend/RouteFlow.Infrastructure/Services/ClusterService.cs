using System;
using System.Collections.Generic;
using System.Linq;
using RouteFlow.Application.DTOs;
using RouteFlow.Application.Interfaces;

namespace RouteFlow.Infrastructure.Services
{
    public class ClusterService : IClusterService
    {
        // A very simple implementation of clustering based on splitting list
        // In reality, this should be K-Means or DBSCAN focusing on Latitude/Longitude.
        public IEnumerable<ClusterDto> ClusterOrders(IEnumerable<OrderDto> orders, int numberOfClusters)
        {
            if (numberOfClusters <= 0) numberOfClusters = 1;
            
            var ordersList = orders.ToList();
            if (!ordersList.Any()) return new List<ClusterDto>();

            var clusters = new List<ClusterDto>();
            
            // Simplified logic: Just chunk them for now
            // To do geometric clustering: calculate distance between coords
            
            int itemsPerCluster = (int)Math.Ceiling((double)ordersList.Count / numberOfClusters);

            for (int i = 0; i < numberOfClusters; i++)
            {
                var chunk = ordersList.Skip(i * itemsPerCluster).Take(itemsPerCluster).ToList();
                if (chunk.Any())
                {
                    clusters.Add(new ClusterDto
                    {
                        ClusterId = i + 1,
                        Orders = chunk
                    });
                }
            }

            return clusters;
        }
    }
}
