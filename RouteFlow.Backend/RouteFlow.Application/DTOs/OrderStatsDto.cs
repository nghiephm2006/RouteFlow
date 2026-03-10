namespace RouteFlow.Application.DTOs
{
    public class OrderStatsDto
    {
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int AssignedOrders { get; set; }
        public int DeliveredOrders { get; set; }
    }
}
