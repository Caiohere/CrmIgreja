using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrmIgreja.api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarTabelaCheckins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_checkIns",
                table: "checkIns");

            migrationBuilder.RenameTable(
                name: "checkIns",
                newName: "CheckIns");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CheckIns",
                table: "CheckIns",
                column: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_CheckIns",
                table: "CheckIns");

            migrationBuilder.RenameTable(
                name: "CheckIns",
                newName: "checkIns");

            migrationBuilder.AddPrimaryKey(
                name: "PK_checkIns",
                table: "checkIns",
                column: "id");
        }
    }
}
