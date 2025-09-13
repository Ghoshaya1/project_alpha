import { useEffect, useState } from "react";
import { Container, Paper, Typography, Box, CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import api from "../utils/api";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/appointments/my");
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Paper elevation={6} sx={{ padding: 4, width: "100%", backgroundColor: "background.paper", borderRadius: 2 }}>
          <Typography variant="h4" textAlign="center" gutterBottom color="primary">
            My Appointments
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <ListItem key={appointment.id}>
                    <ListItemText
                      primary={`Appointment with Dr. ${appointment.doctor.name}`}
                      secondary={`Date: ${new Date(appointment.date).toLocaleString()} | Status: ${appointment.status}`}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography textAlign="center" color="text.secondary">
                  No appointments found.
                </Typography>
              )}
            </List>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Appointments;
