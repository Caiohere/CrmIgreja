namespace CrmIgreja.api.DTO
{
    public record CriarEventoRequest(string nome, string descricao, DateTimeOffset dataInicio, DateTimeOffset dataFim);
}
