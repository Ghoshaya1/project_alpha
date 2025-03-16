import { Typography, Container, Paper, Box } from "@mui/material";

const Dashboard = () => {
  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Welcome to the Dashboard
          </Typography>
          <Typography textAlign="center">
            This is a protected area where you can manage appointments and patients.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
