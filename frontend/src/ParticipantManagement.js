// src/ParticipantManagement.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function ParticipantManagement({ meetingId }) {
  const { token, user } = useContext(AuthContext);
  const [participants, setParticipants] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    axios
      .get(`http://localhost:5009/api/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setParticipants(res.data.participants);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [meetingId, token]);

  const removeParticipant = (participantId) => {
    axios
      .delete(`http://localhost:5009/api/meetings/${meetingId}/participants/${participantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setParticipants(participants.filter((id) => id !== participantId));
        setAlert({ open: true, message: 'Участник удален', severity: 'success' });
      })
      .catch(() => {
        setAlert({ open: true, message: 'Ошибка удаления участника', severity: 'error' });
      });
  };

  return (
    <Container>
      <Typography variant="h6" sx={{ mt: 4 }}>
        Управление участниками
      </Typography>
      <List>
        {participants.map((participantId) => (
          <ListItem key={participantId} secondaryAction={
            <IconButton edge="end" onClick={() => removeParticipant(participantId)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText primary={`Пользователь ID: ${participantId}`} />
          </ListItem>
        ))}
      </List>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ParticipantManagement;
