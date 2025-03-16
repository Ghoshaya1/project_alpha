import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Patient Management System
        </Typography>
        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
        <Button color="inherit" component={Link} to="/patients">Patients</Button>
        <Button color="inherit" component={Link} to="/appointments">Appointments</Button>
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
