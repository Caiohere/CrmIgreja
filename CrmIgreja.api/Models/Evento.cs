namespace CrmIgreja.api.Models
{
    public class Evento
    {
        public int id { get; set; }
        public string nome { get; set; } = string.Empty;
        public string descricao { get; set; } = string.Empty;


        public DateTimeOffset dataInicio { get; set; }
        public DateTimeOffset dataFim { get; set; }
    }
}
