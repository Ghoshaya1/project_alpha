import { useEffect, useState } from "react";
import { Container, Paper, Typography, Box, CircularProgress, List, ListItem, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import api from "../utils/api";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", age: "", medicalHistory: "", insuranceDetails: "",  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/users/my-patients");
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    try {

  
      // 👇 Ensure age is sent as a number, not a string
      const payload = {
        ...newPatient,
        age: Number(newPatient.age),
      };
  
      await api.post("/patients", payload);
  
      alert("Patient added successfully!");
      setOpen(false);
      fetchPatients(); // Refresh list
    } catch (err) {
      console.error("❌ Error creating patient:", err.response?.data || err.message);
      alert("Error adding patient!");
    }
  };

  const handleEditPatient = async (id, currentName) => {
    const newName = prompt("Enter new name:", currentName);
    if (!newName) return;
    try {
      await api.put(`/patients/${id}`, { name: newName });
      alert("Patient updated!");
      fetchPatients(); // Refresh list
    } catch (err) {
      alert("Error updating patient!");
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await api.delete(`/patients/${id}`);
      alert("Patient deleted!");
      fetchPatients(); // Refresh list
    } catch (err) {
      alert("Error deleting patient!");
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Paper elevation={6} sx={{ padding: 4, width: "100%", backgroundColor: "background.paper", borderRadius: 2 }}>
          <Typography variant="h4" textAlign="center" gutterBottom color="primary">
            My Patients
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            Add New Patient
          </Button>
          {loading ? (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <ListItem key={patient.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <ListItemText
                      primary={patient.name}
                      secondary={`Age: ${patient.age} | Medical History: ${patient.medicalHistory} | Insurance Details: ${patient.insuranceDetails}`}
                    />
                    <Box>
                      <Button color="primary" onClick={() => handleEditPatient(patient.id, patient.name)}>
                        Edit
                      </Button>
                      <Button color="secondary" onClick={() => handleDeletePatient(patient.id)}>
                        Delete
                      </Button>
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Typography textAlign="center" color="text.secondary">
                  No patients found.
                </Typography>
              )}
            </List>
          )}
        </Paper>
      </Box>

      {/* Add Patient Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Patient</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={newPatient.name}
            onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Age"
            type="number"
            value={newPatient.age}
            onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Medical History"
            value={newPatient.medicalHistory}
            onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Insurance Details"
            value={newPatient.insuranceDetails}
            onChange={(e) => setNewPatient({ ...newPatient, insuranceDetails: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddPatient} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Patients;
