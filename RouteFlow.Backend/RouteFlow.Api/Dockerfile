FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY RouteFlow.Backend/RouteFlow.Api/RouteFlow.Api.csproj RouteFlow.Backend/RouteFlow.Api/
COPY RouteFlow.Backend/RouteFlow.Application/RouteFlow.Application.csproj RouteFlow.Backend/RouteFlow.Application/
COPY RouteFlow.Backend/RouteFlow.Domain/RouteFlow.Domain.csproj RouteFlow.Backend/RouteFlow.Domain/
COPY RouteFlow.Backend/RouteFlow.Infrastructure/RouteFlow.Infrastructure.csproj RouteFlow.Backend/RouteFlow.Infrastructure/
RUN dotnet restore RouteFlow.Backend/RouteFlow.Api/RouteFlow.Api.csproj

COPY RouteFlow.Backend/ RouteFlow.Backend/
RUN dotnet publish RouteFlow.Backend/RouteFlow.Api/RouteFlow.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "RouteFlow.Api.dll"]
