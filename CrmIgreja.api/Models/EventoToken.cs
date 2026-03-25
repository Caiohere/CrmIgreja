using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CrmIgreja.api.Models
{
    public class EventoToken
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int eventoId { get; set; }
        public Evento evento { get; set; } = null!;

        public string tokenHash { get; set; } = string.Empty;

        public DateTimeOffset CriadoEm { get; set; }
        public DateTimeOffset ExpiraEm { get; set; }

        public bool isRevogado { get; set; }


    }
}
