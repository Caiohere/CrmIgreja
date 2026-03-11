using Npgsql;
using CrmIgreja.api.Context;
using Microsoft.EntityFrameworkCore;
using CrmIgreja.api.DTO;
using CrmIgreja.api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration.UserSecrets;
using CrmIgreja.api.Extensions;

var builder = WebApplication.CreateBuilder(args);

// =====================================================================
// 1. SERVICES
// =====================================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Define a regra de segurança (O Cadeado)
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Insira o token JWT desta maneira: Bearer {seu token}"
    });

    // Aplica a regra para todas as rotas
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var stringdeConexao = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(stringdeConexao));

builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
    {

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))

        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// =====================================================================
// 2. MIDDLEWARE
// =====================================================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication(); // Lê JWT
app.UseAuthorization(); 

// =====================================================================
// 3. NOSSAS ROTAS
// =====================================================================

// Rota de Registro
app.MapPost("/auth/register", async (RegisterRequest req, ApplicationDbContext db) =>
{
    if ((req.senha.Length < 8) || (!req.senha.Any(char.IsDigit)) || (!req.senha.Any(char.IsPunctuation)))
    {
        return Results.BadRequest("A senha precisa ter 8 digitos, contendo ao menos um número e caracter especial");
    }
    using var transaction = await db.Database.BeginTransactionAsync();
        
    try
    {
        var novoMembro = new Membro
        {
            nome = req.nome,
            email = req.email,
        };
        db.Membros.Add(novoMembro);
        await db.SaveChangesAsync();

        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<Usuario>();
        
        var novoUsuario = new Usuario
        {
            membroId = novoMembro.id,
            isAdmin = false
        };

        novoUsuario.senhaHash = hasher.HashPassword(novoUsuario, req.senha);

        db.Usuarios.Add(novoUsuario);
        await db.SaveChangesAsync();

        await transaction.CommitAsync();

        return Results.Created($"/membros/{novoMembro.id}", new { novoMembro.id, novoMembro.nome, novoMembro.email });
    }
    catch (DbUpdateException ex)
    {
        await transaction.RollbackAsync();

        //Verifica se o erro foi de email duplicado
        if (ex.InnerException?.Message.Contains("23505") == true || ex.InnerException?.Message.Contains("Unique") == true)
        {
            return Results.Conflict(new { Erro = "Este email já está cadastrado no sistema." });
        }

        return Results.BadRequest(new { Erro = "Não foi possível registrar o usuário." });
    }
})
.WithName("RegisterUser");

app.MapPost("auth/login", async (LoginRequest req, ApplicationDbContext db, IConfiguration config) => {

    var membro = await db.Membros
    .Include(m => m.Usuario)
    .FirstOrDefaultAsync(m => m.email == req.email);

    if (membro == null || membro.Usuario == null)
        return Results.Unauthorized();

    var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<Usuario>();
    var resultado = hasher.VerifyHashedPassword(membro.Usuario, membro.Usuario.senhaHash, req.senha);

    if (resultado == Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed)
        return Results.Unauthorized();

    var tokenHandler = new JwtSecurityTokenHandler();
    var keyBytes = Encoding.UTF8.GetBytes(config["Jwt:Key"]!);

    var tokenDescriptor = new SecurityTokenDescriptor 
    { 
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, membro.id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, membro.email),
            new Claim(ClaimTypes.Role, membro.Usuario.isAdmin ? "Admin" : "User")
        }),
        Expires = DateTime.UtcNow.AddMinutes(15),
        Issuer = config["Jwt:Issuer"],
        Audience = config["Jwt:Audience"],
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
    };

    var token = tokenHandler.CreateToken(tokenDescriptor);
    var jwtString = tokenHandler.WriteToken(token);

    var randomNumber = new byte[32];
    using var rng = RandomNumberGenerator.Create();
    rng.GetBytes(randomNumber);
    var refreshTokenGerado = Convert.ToBase64String(randomNumber);

    membro.Usuario.refreshToken = refreshTokenGerado;
    membro.Usuario.refreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
    await db.SaveChangesAsync();

    return Results.Ok(new 
    {
        AccessToken = jwtString,
        RefreshToken = refreshTokenGerado
    });
})
.WithName("LoginUser");

app.MapPost("auth/refreshToken", async (RefreshRequest req, ApplicationDbContext db, IConfiguration config) => 
{
    var membro = await db.Membros
    .Include(m => m.Usuario)
    .FirstOrDefaultAsync(m => m.Usuario != null && m.Usuario.refreshToken == req.RefreshToken);

    if (membro == null || membro.Usuario!.refreshTokenExpiryTime < DateTime.UtcNow) 
    {
        return Results.Unauthorized();
    };

    var tokenHandler = new JwtSecurityTokenHandler();
    var keyBytes = Encoding.UTF8.GetBytes(config["Jwt:Key"]!);

    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, membro.id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, membro.email),
            new Claim(ClaimTypes.Role, membro.Usuario.isAdmin ? "Admin" : "User")
        }),
        Expires = DateTime.UtcNow.AddMinutes(15),
        Issuer = config["Jwt:Issuer"],
        Audience = config["Jwt:Audience"],
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
    };

    var token = tokenHandler.CreateToken(tokenDescriptor);
    var novoJwt = tokenHandler.WriteToken(token);

    var randomNumber = new byte[32];
    using var rng = RandomNumberGenerator.Create();
    rng.GetBytes(randomNumber);
    var novoRefreshToken = Convert.ToBase64String(randomNumber);

    membro.Usuario.refreshToken = novoRefreshToken;
    membro.Usuario.refreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        AccessToken = novoJwt,
        RefreshToken = novoRefreshToken
    });
})
.WithName("RefreshTokenUser");

app.MapPost("auth/logout", async (ClaimsPrincipal userLogado, ApplicationDbContext db) =>
{
    var userId = userLogado.GetUserId();

    var membro = await db.Membros
        .Include(m => m.Usuario)
        .FirstOrDefaultAsync(m => m.id == userId);

    if (membro == null)
    {
        return Results.Unauthorized();
    }

    membro.Usuario!.refreshToken = null;
    membro.Usuario.refreshTokenExpiryTime = null;
    await db.SaveChangesAsync();

    return Results.Ok(new { Mensagem = "Logout realizado com sucesso. Sessão encerrada! " });
})
.RequireAuthorization();



app.Run();