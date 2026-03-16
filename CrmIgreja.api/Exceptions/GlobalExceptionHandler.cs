using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace CrmIgreja.api.Exceptions
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            var statusCode = StatusCodes.Status500InternalServerError;
            var titulo = "Ocorreu um erro inesperado no servidor";
            var detalhe = exception.Message;

            if (exception is BadHttpRequestException || exception is ArgumentException)
            {
                statusCode = StatusCodes.Status400BadRequest;
                titulo = "Erro de validação";
            }
            else if (exception is UnauthorizedAccessException)
            {
                statusCode = StatusCodes.Status401Unauthorized;
                titulo = "Acesso não autorizado";
            }
            else if (exception is EmailDuplicadoException)
            {
                statusCode = StatusCodes.Status409Conflict;
                titulo = "Email já existente";
            }
            else if (exception is MembroNotFoundException)
            {
                statusCode = StatusCodes.Status404NotFound;
                titulo = "Membro não encontrado";
            }

            var problemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Title = titulo,
                    Detail = detalhe,
                    Instance = httpContext.Request.Path
                };


            httpContext.Response.StatusCode = statusCode;

            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;

        }
    }

    public class EmailDuplicadoException : Exception
    {
        public EmailDuplicadoException(string mensagem) : base(mensagem) { }
    }

    public class MembroNotFoundException : Exception
    {
        public MembroNotFoundException(string mensagem) : base(mensagem) { }
    }
}
