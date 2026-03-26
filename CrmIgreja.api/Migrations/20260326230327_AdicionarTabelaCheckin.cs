using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrmIgreja.api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarTabelaCheckin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EventoToken",
                columns: table => new
                {
                    eventoId = table.Column<int>(type: "integer", nullable: false),
                    eventoid = table.Column<int>(type: "integer", nullable: false),
                    tokenHash = table.Column<string>(type: "text", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExpiraEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    isRevogado = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventoToken", x => x.eventoId);
                    table.ForeignKey(
                        name: "FK_EventoToken_Evento_eventoid",
                        column: x => x.eventoid,
                        principalTable: "Evento",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventoToken_eventoid",
                table: "EventoToken",
                column: "eventoid");

            migrationBuilder.CreateIndex(
                name: "IX_EventoToken_tokenHash_isRevogado",
                table: "EventoToken",
                columns: new[] { "tokenHash", "isRevogado" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventoToken");
        }
    }
}
