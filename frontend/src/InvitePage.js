// src/InvitePage.js
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const GradientContainer = styled(Container)(({ theme }) => ({
  background: '#202020',
  borderRadius: '60px',
  minHeight: '100vh',
  paddingTop: theme.spacing(10),
  color: '#ffffff',
  textAlign: 'center',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
  color: '#ffffff',
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.5, 4),
  fontSize: '1.2rem',
  borderRadius: '50px',
  '&:hover': {
    background: 'linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%)',
  },
}));

const AnimatedBox = styled(motion.div)({
  display: 'inline-block',
});

function InvitePage() {
  const { inviteId } = useParams();
  const { token } = useContext(AuthContext);
  const [meeting, setMeeting] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  }, [inviteId]);

  const acceptInvite = () => {
    setLoading(true);
    axios
      .post(
        `http://localhost:5009/api/invites/${inviteId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setMeeting(res.data.meeting);
        setAlert({ open: true, message: 'Вы присоединились к встрече!', severity: 'success' });
        setTimeout(() => {
          navigate(`/meetings/${res.data.meeting.id}`);
        }, 2000);
      })
      .catch((err) => {
        setAlert({
          open: true,
          message: err.response?.data?.message || 'Ошибка принятия инвайта',
          severity: 'error',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <GradientContainer maxWidth="sm">
      <AnimatedBox
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 4 }}>
          Приглашение на встречу
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Вы получили приглашение присоединиться к встрече.
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Нажмите кнопку ниже, чтобы принять приглашение и присоединиться к нам!
        </Typography>
        <StyledButton
          variant="contained"
          onClick={acceptInvite}
          disabled={loading}
          endIcon={
            loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : null
          }
        >
          {loading ? 'Присоединение...' : 'Принять приглашение'}
        </StyledButton>
      </AnimatedBox>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </GradientContainer>
  );
}

export default InvitePage;
