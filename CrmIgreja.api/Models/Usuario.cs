namespace CrmIgreja.api.Models
{
    public class Usuario
    {
        public int id { get; set; }
        public string senhaHash { get; set; } = string.Empty;
        public bool isAdmin { get; set; } = false;
        public string? refreshToken { get; set; }
        public DateTime? refreshTokenExpiryTime { get; set; }

        // Chave Estrangeira
        public int membroId { get; set; }
        public Membro Membro { get; set; } = null!;
    }
}
