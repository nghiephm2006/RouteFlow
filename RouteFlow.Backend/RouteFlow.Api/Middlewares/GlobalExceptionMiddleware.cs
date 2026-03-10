using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ValidationException = RouteFlow.Application.Common.Exceptions.ValidationException;

namespace RouteFlow.Api.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            int statusCode;
            object responseBody;

            switch (exception)
            {
                case ValidationException validationEx:
                    statusCode = StatusCodes.Status400BadRequest;
                    responseBody = new
                    {
                        statusCode,
                        message = validationEx.Message,
                        errors = validationEx.Errors
                    };
                    break;
                case ApplicationException appEx:
                    statusCode = StatusCodes.Status400BadRequest;
                    responseBody = new { statusCode, message = appEx.Message };
                    break;
                default:
                    statusCode = StatusCodes.Status500InternalServerError;
                    responseBody = new { statusCode, message = "Unexpected error occurred." };
                    break;
            }

            context.Response.StatusCode = statusCode;

            var result = JsonSerializer.Serialize(responseBody);
            return context.Response.WriteAsync(result);
        }
    }
}
