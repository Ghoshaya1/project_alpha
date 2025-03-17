import { Typography, Container, Paper, Box } from "@mui/material";

const Dashboard = () => {
  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Paper elevation={6} sx={{ padding: 4, backgroundColor: "background.paper", borderRadius: 2 }}>
          <Typography variant="h4" textAlign="center" gutterBottom color="primary">
            Welcome to Your Dashboard
          </Typography>
          <Typography textAlign="center" color="text.secondary">
            Here you can manage appointments, patients, and your profile.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
