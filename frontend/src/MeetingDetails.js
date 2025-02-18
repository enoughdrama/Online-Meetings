// src/MeetingDetails.js
import React, { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';

function MeetingDetails({ meeting }) {
  const { token, user } = useContext(AuthContext);
  const [maxUses, setMaxUses] = useState(1);
  const [inviteLink, setInviteLink] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });

  const createInviteLink = () => {
    axios
      .post(
        `http://localhost:5009/api/meetings/${meeting.id}/invite`,
        { maxUses },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setInviteLink(res.data.inviteLink);
        setAlert({ open: true, message: 'Инвайт-ссылка создана', severity: 'success' });
      })
      .catch(() => {
        setAlert({ open: true, message: 'Ошибка создания инвайт-ссылки', severity: 'error' });
      });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Container>
      <Typography variant="h5">{meeting.name}</Typography>

      {['teacher', 'admin'].includes(user.role) && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Создать инвайт-ссылку</Typography>
          <TextField
            label="Количество использований"
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={createInviteLink}>
            Создать
          </Button>

          {inviteLink && (
            <Box sx={{ mt: 2 }}>
              <Typography>Ссылка для приглашения:</Typography>
              <TextField fullWidth value={inviteLink} InputProps={{ readOnly: true }} />
            </Box>
          )}
        </Box>
      )}

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default MeetingDetails;
