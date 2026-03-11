using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace CrmIgreja.api.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal userLogado)
        {
            var UserIdString = userLogado.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? userLogado.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (int.TryParse(UserIdString, out int userId))
            {
                return userId;
            }

            throw new UnauthorizedAccessException("O token não contém um ID de usuário válido.");
        }
    }
}
