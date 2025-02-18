// src/Navbar.js
import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, NavLink } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { motion } from 'framer-motion';

const sapphireColor = '#0F52BA';
const linkBorderRadius = 5;

const StyledNavLink = styled(({ isActive, ...props }) => <NavLink {...props} />)(
  ({ theme }) => ({
    color: '#fff',
    textDecoration: 'none',
    marginLeft: theme.spacing(2),
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    borderRadius: linkBorderRadius,
    transition: 'all 0.3s ease',
    backgroundColor: 'transparent',
    '&.active': {
      backgroundColor: sapphireColor,
      color: '#fff',
    },
    '&:hover': {
      backgroundColor: sapphireColor,
      color: '#fff',
      transform: 'scale(1.05)',
    },
  })
);

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const theme = useTheme();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleUserMenuOpen = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleUserMenuClose();
  };

  const getNavLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'student':
        return [
          { title: 'Домой', path: '/student', icon: <HomeIcon /> },
          { title: 'Тесты', path: '/testing', icon: <AssessmentIcon /> },
        ];
      case 'teacher':
        return [
          { title: 'Ваши встречи', path: '/meetings', icon: <SchoolIcon /> },
          { title: 'Преподаватель', path: '/teacher', icon: <SchoolIcon /> },
          { title: 'Тесты', path: '/testing', icon: <AssessmentIcon /> },
        ];
      case 'admin':
        return [
          { title: 'Админ', path: '/admin', icon: <AdminPanelSettingsIcon /> },
          { title: 'Панель преподаватель', path: '/teacher', icon: <SchoolIcon /> },
          { title: 'Панель студента', path: '/student', icon: <HomeIcon /> },
          { title: 'Тесты', path: '/testing', icon: <AssessmentIcon /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundImage: 'linear-gradient(75deg, #000000 0%, #070a2d 100%)',
          color: '#fff',
          paddingY: '8px',
        }}
        elevation={4}
      >
        <Toolbar sx={{ minHeight: '64px', display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, borderRadius: linkBorderRadius }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component={NavLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              textDecoration: 'none',
              color: '#fff',
            }}
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120 }}
            >
              <Avatar sx={{ bgcolor: sapphireColor, mr: 1 }}>QA</Avatar>
            </motion.div>
            <Typography
              variant="h6"
              component={motion.div}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120 }}
              sx={{
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                color: '#fff',
                '&:hover': {
                  color: sapphireColor,
                },
              }}
            >
              Qalyn
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {navLinks.map((link) => (
              <StyledNavLink key={link.title} to={link.path}>
                {link.icon}
                <Typography sx={{ ml: 0.5 }}>{link.title}</Typography>
              </StyledNavLink>
            ))}

            <Tooltip title="Уведомления">
              <IconButton size="large" color="inherit" sx={{ ml: 2, borderRadius: linkBorderRadius }}>
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {user && (
              <Tooltip title="Настройки">
                <IconButton onClick={handleUserMenuOpen} sx={{ ml: 2, borderRadius: linkBorderRadius }}>
                  <Avatar
                    alt={user?.username || 'Пользователь'}
                    src={user?.avatarUrl ? `http://localhost:5009${user.avatarUrl}` : '/static/default-avatar.png'}
                    sx={{ bgcolor: sapphireColor }}
                  />
                </IconButton>
              </Tooltip>
            )}

            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleUserMenuClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                Профиль
              </MenuItem>
              <MenuItem onClick={handleLogout}>Выйти</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            backgroundColor: '#000',
            color: '#fff',
          },
        }}
      >
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ color: '#fff' }}>Меню</Typography>
        </Box>
        <Divider sx={{ backgroundColor: '#333' }} />
        <List>
          {navLinks.map((link) => (
            <ListItem button key={link.title} component={NavLink} to={link.path} onClick={handleDrawerToggle}
              sx={{
                borderRadius: linkBorderRadius,
                '&:hover': {
                  backgroundColor: sapphireColor,
                  color: '#fff',
                },
                '&.active': {
                  backgroundColor: sapphireColor,
                  color: '#fff',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.title} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ backgroundColor: '#333' }} />
        {user && (
          <List>
            <ListItem
              button
              onClick={() => { navigate('/profile'); handleDrawerToggle(); }}
              sx={{
                borderRadius: linkBorderRadius,
                '&:hover': {
                  backgroundColor: sapphireColor,
                  color: '#fff',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Профиль" />
            </ListItem>
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                borderRadius: linkBorderRadius,
                '&:hover': {
                  backgroundColor: sapphireColor,
                  color: '#fff',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Выйти" />
            </ListItem>
          </List>
        )}
      </Drawer>
    </>
  );
}

export default Navbar;
