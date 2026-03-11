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
        }
    }

}
