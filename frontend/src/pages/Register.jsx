import { useState } from "react";
import { Container, TextField, Button, Typography, Box, Paper, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "patient" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      navigate("/");
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Typography variant="h5" textAlign="center" gutterBottom>
            Register
          </Typography>
          <form onSubmit={handleRegister}>
            <TextField 
              fullWidth margin="normal" label="Name" variant="outlined"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField 
              fullWidth margin="normal" label="Email" variant="outlined"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField 
              fullWidth margin="normal" label="Password" type="password" variant="outlined"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </Select>
            </FormControl>
            <Button fullWidth variant="contained" color="primary" type="submit">
              Register
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
