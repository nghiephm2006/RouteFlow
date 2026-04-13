namespace RouteFlow.Application.Common.Security
{
    public static class ApplicationRoles
    {
        public const string Admin = "Admin";
        public const string Dispatcher = "Dispatcher";
        public const string Shipper = "Shipper";

        public static readonly string[] All = [Admin, Dispatcher, Shipper];
    }
}
