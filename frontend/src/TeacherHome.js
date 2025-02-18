// src/TeacherHome.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import {
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Box,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  Snackbar,
} from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function TeacherHome() {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [newMeetingName, setNewMeetingName] = useState('');
  const [maxUses, setMaxUses] = useState(1);
  const [inviteLink, setInviteLink] = useState('');
  const { user, token } = useContext(AuthContext);
  const [participants, setParticipants] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5009/api/meetings?creatorId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMeetings(res.data))
      .catch((err) => console.error('Error fetching meetings:', err));
  }, [user.id, token]);

  useEffect(() => {
    if (selectedMeeting && selectedMeeting.participants.length) {
      fetchParticipants(selectedMeeting.participants);
    }
  }, [selectedMeeting]);

  const fetchParticipants = (participantIds) => {
    Promise.all(
      participantIds.map((id) =>
        axios.get(`http://localhost:5009/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    )
      .then((responses) => {
        const participantsData = responses.map((res) => res.data);
        setParticipants(participantsData);
      })
      .catch((err) => {
        console.error('Error fetching participants:', err);
        showSnackbar('Произошла ошибка при загрузке участников.', 'error');
      });
  };

  const createMeeting = () => {
    if (!newMeetingName.trim()) {
      showSnackbar('Пожалуйста, введите название встречи.', 'warning');
      return;
    }
    axios
      .post(
        'http://localhost:5009/api/meetings',
        { name: newMeetingName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setMeetings([...meetings, res.data]);
        setNewMeetingName('');
        showSnackbar('Встреча создана успешно!', 'success');
      })
      .catch((err) => {
        console.error('Error creating meeting:', err);
        showSnackbar('Произошла ошибка при создании встречи.', 'error');
      });
  };

  const selectMeeting = (meetingId) => {
    axios
      .get(`http://localhost:5009/api/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSelectedMeeting(res.data);
        setInviteLink('');
        setMaxUses(1);
        setOpenDialog(true);
      })
      .catch((err) => {
        console.error('Error fetching meeting details:', err);
        showSnackbar('Не удалось загрузить детали встречи.', 'error');
      });
  };

  const createInvite = (meetingId) => {
    if (maxUses < 1) {
      showSnackbar('Максимальное количество использований должно быть минимум 1.', 'warning');
      return;
    }
    axios
      .post(
        'http://localhost:5009/api/invites',
        { meetingId: meetingId, maxUses: maxUses },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setInviteLink(res.data.inviteLink);
        showSnackbar('Ссылка для приглашения создана успешно!', 'success');
      })
      .catch((err) => {
        console.error('Error creating invite:', err);
        showSnackbar('Произошла ошибка при создании ссылки приглашения.', 'error');
      });
  };

  const removeParticipant = (meetingId, participantId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого участника?')) return;

    axios
      .delete(`http://localhost:5009/api/meetings/${meetingId}/participants/${participantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setParticipants((prev) => prev.filter((participant) => participant.id !== participantId));
        showSnackbar('Участник удален успешно.', 'success');
      })
      .catch((err) => {
        console.error('Error removing participant:', err);
        showSnackbar('Произошла ошибка при удалении участника.', 'error');
      });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedMeeting(null);
    setParticipants([]);
    setInviteLink('');
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          borderRadius: '8px',
          p: 3,
          mb: 4,
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        }}
      >
        <Avatar
          alt={user.username}
          src={`http://localhost:5009${user.avatarUrl}`}
          sx={{ width: 80, height: 80, margin: '0 auto', mb: 2 }}
        />
        <Typography variant="h4" gutterBottom>
          Добро пожаловать, {user.username}!
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Создать новую встречу
        </Typography>
        <Box display="flex" alignItems="center" mt={2}>
          <TextField
            label="Название встречи"
            value={newMeetingName}
            onChange={(e) => setNewMeetingName(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={createMeeting}
            sx={{ ml: 2 }}
          >
            Создать
          </Button>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Ваши встречи
      </Typography>

      {meetings.length > 0 ? (
        <Grid container spacing={4}>
          {meetings.map((meeting) => (
            <Grid item xs={12} sm={6} md={4} key={meeting.id}>
              <Card
                sx={{
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {meeting.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Участников: {meeting.participants.length}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`/meetings/${meeting.id}`}
                    startIcon={<MeetingRoomIcon />}
                    sx={{ borderRadius: '0' }}
                  >
                    Перейти
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={() => selectMeeting(meeting.id)}
                    startIcon={<PeopleIcon />}
                    sx={{ borderRadius: '0 0 4px 4px' }}
                  >
                    Управлять
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>У вас пока нет созданных встреч.</Typography>
      )}

      {selectedMeeting && (
        <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="md">
          <DialogTitle>Управление встречей: {selectedMeeting.name}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Создать ссылку приглашения
              </Typography>
              <Box display="flex" alignItems="center" mt={2}>
                <TextField
                  label="Макс. использований"
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                  variant="outlined"
                  size="small"
                  sx={{ width: '150px', mr: 2 }}
                  inputProps={{ min: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => createInvite(selectedMeeting.id)}
                >
                  Создать ссылку
                </Button>
              </Box>
              {inviteLink && (
                <Box mt={2} display="flex" alignItems="center">
                  <TextField
                    label="Ссылка приглашения"
                    value={inviteLink}
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Скопировать ссылку">
                            <IconButton
                              onClick={() => navigator.clipboard.writeText(inviteLink)}
                              edge="end"
                            >
                              <ContentCopyIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Участники
              </Typography>
              {participants.length > 0 ? (
                <Grid container spacing={2}>
                  {participants.map((participant) => (
                    <Grid item xs={12} sm={6} md={4} key={participant.id}>
                      <Paper
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <Avatar
                            alt={participant.username}
                            src={`http://localhost:5009${participant.avatarUrl}`}
                            sx={{ mr: 2 }}
                          />
                          <Typography>{participant.username}</Typography>
                        </Box>
                        <Tooltip title="Удалить участника">
                          <IconButton
                            color="error"
                            onClick={() => removeParticipant(selectedMeeting.id, participant.id)}
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        </Tooltip>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography>Участников нет.</Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TeacherHome;
