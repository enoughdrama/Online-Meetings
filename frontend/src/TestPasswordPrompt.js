// src/TestPasswordPrompt.js

import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

function TestPasswordPrompt() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'error' });

  const handlePasswordSubmit = () => {
    setLoading(true);
    axios
      .post(
        `http://localhost:5009/api/tests/${id}/verify-password`,
        { password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        navigate(`/testing/attempt/${id}`, { state: { password } });
      })
      .catch((error) => {
        console.error('Incorrect password', error);
        setNotification({ open: true, message: 'Неверный пароль.', severity: 'error' });
        setLoading(false);
      });
  };

  const handleCloseSnackbar = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress size={80} />
        </Box>
      ) : (
        <>
          <Typography variant="h5" align="center" gutterBottom>
            Введите пароль для доступа к тесту
          </Typography>
          <TextField
            label="Пароль"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePasswordSubmit}
            fullWidth
            sx={{ mt: 2 }}
          >
            Продолжить
          </Button>
        </>
      )}
    </Container>
  );
}

export default TestPasswordPrompt;
