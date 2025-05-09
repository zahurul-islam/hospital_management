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
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(90deg, #388E3C 0%, #4CAF50 100%)',
          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)'
        }}
      >
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
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            Green University Hospital
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user.name} ({user.role})
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
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
          width: 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(76, 175, 80, 0.12)',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FFF9 100%)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <Box sx={{ p: 2, mb: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              Green University Hospital
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                onClick={toggleDrawer}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  mx: 1,
                  mb: 0.5,
                  '&:hover': {
                    bgcolor: 'rgba(76, 175, 80, 0.08)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <List>
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'error.main' }}><Logout /></ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#F9FFF9',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              p: 3
            }}
          >
            <Outlet />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
