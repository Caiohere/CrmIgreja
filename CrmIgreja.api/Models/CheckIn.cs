namespace CrmIgreja.api.Models
{
    public class CheckIn
    {
        public int id { get; set; }
        public int eventId { get; set; }
        public int userId { get; set; }
        public DateTimeOffset dataHora { get; set; }

    }
}
