using Microsoft.EntityFrameworkCore;
using CrmIgreja.api.Models;

namespace CrmIgreja.api.Context
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) 
        { }
        public DbSet<Membro> Membros { get; set; }

        public DbSet<Usuario> Usuarios { get; set; }

        public DbSet<Evento> Evento { get; set; }

        public DbSet<EventoToken> EventoToken {get; set;}
        
        public DbSet<CheckIn> CheckIns { get; set; }

        //Constraints para as tabelas
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Membro)
                .WithOne(m => m.Usuario)
                .HasForeignKey<Usuario>(u => u.membroId);

            modelBuilder.Entity<Membro>()
                .HasIndex(m => m.email)
                .IsUnique();

            modelBuilder.Entity<Evento>()
                .HasIndex(e => e.dataInicio);

            modelBuilder.Entity<EventoToken>()
                .HasIndex(e => new { e.tokenHash, e.isRevogado });

        }
    }

}
