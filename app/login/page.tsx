import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { login } from "@/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 360, p: 3.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.1, mb: 2.5 }}>
          <Box sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, fontSize: 13, color: "#fff" }}>L</Typography>
          </Box>
          <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 15.5 }}>L.whispers</Typography>
        </Box>

        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>Digite a senha pra entrar.</Typography>

        <Box component="form" action={login} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <TextField name="password" type="password" size="small" placeholder="Senha" autoFocus fullWidth />
          {error && <Typography sx={{ fontSize: 12.5, color: "error.main" }}>Senha incorreta.</Typography>}
          <Button type="submit" fullWidth>
            Entrar
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
