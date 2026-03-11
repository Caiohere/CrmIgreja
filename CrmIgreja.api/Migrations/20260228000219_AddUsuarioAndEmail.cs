using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CrmIgreja.api.Migrations
{
    /// <inheritdoc />
    public partial class AddUsuarioAndEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Nome",
                table: "Membros",
                newName: "nome");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Membros",
                newName: "id");

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "Membros",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    senhaHash = table.Column<string>(type: "text", nullable: false),
                    isAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    membroId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Membros_membroId",
                        column: x => x.membroId,
                        principalTable: "Membros",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Membros_email",
                table: "Membros",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_membroId",
                table: "Usuarios",
                column: "membroId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropIndex(
                name: "IX_Membros_email",
                table: "Membros");

            migrationBuilder.DropColumn(
                name: "email",
                table: "Membros");

            migrationBuilder.RenameColumn(
                name: "nome",
                table: "Membros",
                newName: "Nome");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Membros",
                newName: "Id");
        }
    }
}
