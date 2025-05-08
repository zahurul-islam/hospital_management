import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box, Divider, Container } from '@mui/material';
import { Menu as MenuIcon, Dashboard, Person, CalendarMonth, MedicalServices, People, Logout, Settings } from '@mui/icons-material';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Set menu items based on user role
    if (user.role === 'patient') {
      setMenuItems([
        { text: 'Dashboard', icon: <Dashboard />, path: '/patient/dashboard' },
        { text: 'Appointments', icon: <CalendarMonth />, path: '/patient/appointments' },
        { text: 'Medical Records', icon: <MedicalServices />, path: '/patient/medical-records' },
        { text: 'Profile', icon: <Person />, path: '/patient/profile' },
      ]);
    } else if (user.role === 'doctor') {
      setMenuItems([
        { text: 'Dashboard', icon: <Dashboard />, path: '/doctor/dashboard' },
        { text: 'Appointments', icon: <CalendarMonth />, path: '/doctor/appointments' },
        { text: 'Patients', icon: <People />, path: '/doctor/patients' },
        { text: 'Profile', icon: <Person />, path: '/doctor/profile' },
      ]);
    } else if (user.role === 'admin') {
      setMenuItems([
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
        { text: 'Users', icon: <People />, path: '/admin/users' },
        { text: 'Appointments', icon: <CalendarMonth />, path: '/admin/appointments' },
        { text: 'Medical Records', icon: <MedicalServices />, path: '/admin/medical-records' },
      ]);
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (!user) {
    return <Outlet />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hospital Management System
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user.name} ({user.role})
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                component={Link} 
                to={item.path}
                onClick={toggleDrawer}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
