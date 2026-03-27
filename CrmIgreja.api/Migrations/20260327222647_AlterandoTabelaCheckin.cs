using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrmIgreja.api.Migrations
{
    /// <inheritdoc />
    public partial class AlterandoTabelaCheckin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "membroId",
                table: "CheckIns",
                newName: "userId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "userId",
                table: "CheckIns",
                newName: "membroId");
        }
    }
}
