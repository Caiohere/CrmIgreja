namespace CrmIgreja.api.Models
{
    public class Membro
    {
        public int id { get; set; }
        public string nome { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;

        // (Um membro tem um Usuário)
        public Usuario? Usuario { get; set; }
    }
}
