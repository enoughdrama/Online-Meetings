// src/AdminPanel.js
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  CircularProgress,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  InputLabel,
  FormControl,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { motion } from 'framer-motion';
import { Lightbulb, Search } from '@mui/icons-material';

// Кастомные стили
const GradientContainer = styled(Container)(({ theme }) => ({
  backgroundImage: 'linear-gradient(135deg, #121617 0%, #070a2d 100%)',
  minHeight: '100vh',
  paddingTop: theme.spacing(4),
  color: '#ffffff',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  color: '#ffffff',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#ffffff',
  borderColor: 'rgba(255, 255, 255, 0.2)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
  color: '#ffffff',
  '&:hover': {
    background: 'linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%)',
  },
}));

const AnimatedBox = styled(motion.div)({
  width: '100%',
});

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [meetingSearch, setMeetingSearch] = useState('');
  const { token } = useContext(AuthContext);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [inviteMaxUses, setInviteMaxUses] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, meetingsRes, invitesRes] = await Promise.all([
          axios.get('http://localhost:5009/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5009/api/meetings', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5009/api/invites', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data);
        setMeetings(meetingsRes.data);
        setFilteredMeetings(meetingsRes.data);
        setInvites(Array.isArray(invitesRes.data) ? invitesRes.data : []);
        setLoading(false);
      } catch (err) {
        setAlert({ open: true, message: 'Ошибка загрузки данных', severity: 'error' });
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const changeRole = async (id, role) => {
    try {
      await axios.patch(
        `http://localhost:5009/api/users/${id}`,
        { updateFields: { role } },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(users.map((user) => (user.id === id ? { ...user, role } : user)));
      setFilteredUsers(filteredUsers.map((user) => (user.id === id ? { ...user, role } : user)));
      setAlert({ open: true, message: 'Роль пользователя обновлена', severity: 'success' });
    } catch (err) {
      setAlert({ open: true, message: 'Ошибка обновления роли пользователя', severity: 'error' });
    }
  };

  const handleUserSearch = (e) => {
    setUserSearch(e.target.value);
    setFilteredUsers(
      users.filter(
        (user) =>
          user.username.toLowerCase().includes(e.target.value.toLowerCase()) ||
          user.email.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  const handleMeetingSearch = (e) => {
    setMeetingSearch(e.target.value);
    setFilteredMeetings(
      meetings.filter((meeting) =>
        meeting.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  const createInvite = async () => {
    if (!selectedMeetingId) {
      setAlert({ open: true, message: 'Пожалуйста, выберите встречу.', severity: 'warning' });
      return;
    }

    if (inviteMaxUses < 1) {
      setAlert({
        open: true,
        message: 'Максимальное количество использований должно быть минимум 1.',
        severity: 'warning',
      });
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5009/api/invites`,
        { meetingId: selectedMeetingId, maxUses: inviteMaxUses },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newInvite = res.data;
      setInvites([newInvite, ...invites]);
      setAlert({
        open: true,
        message: `Инвайт создан: ${newInvite.inviteLink}`,
        severity: 'success',
      });
      setSelectedMeetingId('');
      setInviteMaxUses(1);
    } catch (err) {
      setAlert({
        open: true,
        message: 'Ошибка создания инвайта',
        severity: 'error',
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleCopyInvite = (inviteLink) => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        setAlert({ open: true, message: 'Ссылка инвайта скопирована!', severity: 'success' });
      })
      .catch(() => {
        setAlert({ open: true, message: 'Не удалось скопировать ссылку.', severity: 'error' });
      });
  };

  if (loading) {
    return (
      <GradientContainer sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress size={80} thickness={5} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Загрузка данных...
        </Typography>
      </GradientContainer>
    );
  }

  return (
    <GradientContainer maxWidth="lg">
      <AnimatedBox
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
          <Lightbulb sx={{ fontSize: 40, verticalAlign: 'middle', mr: 2 }} />
          Админ Панель
        </Typography>

        <StyledPaper sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Пользователи
          </Typography>
          <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
            <Search sx={{ mr: 1 }} />
            <TextField
              label="Поиск по пользователям"
              variant="outlined"
              value={userSearch}
              onChange={handleUserSearch}
              fullWidth
              sx={{
                input: { color: '#ffffff' },
                label: { color: '#ffffff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ffffff' },
                  '&:hover fieldset': { borderColor: '#ff416c' },
                  '&.Mui-focused fieldset': { borderColor: '#ff416c' },
                },
              }}
            />
          </Box>
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Имя пользователя</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Роль</StyledTableCell>
                  <StyledTableCell>Изменить роль</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <StyledTableCell>{user.username}</StyledTableCell>
                    <StyledTableCell>{user.email}</StyledTableCell>
                    <StyledTableCell>{user.role}</StyledTableCell>
                    <StyledTableCell>
                      <Select
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        sx={{
                          color: '#fff',
                          '& .MuiSvgIcon-root': { color: '#fff' },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ff416c' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#ff416c',
                          },
                        }}
                      >
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="teacher">Teacher</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledPaper>

        <StyledPaper sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Встречи
          </Typography>
          <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
            <Search sx={{ mr: 1 }} />
            <TextField
              label="Поиск по встречам"
              variant="outlined"
              value={meetingSearch}
              onChange={handleMeetingSearch}
              fullWidth
              sx={{
                input: { color: '#ffffff' },
                label: { color: '#ffffff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ffffff' },
                  '&:hover fieldset': { borderColor: '#ff416c' },
                  '&.Mui-focused fieldset': { borderColor: '#ff416c' },
                },
              }}
            />
          </Box>
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Название встречи</StyledTableCell>
                  <StyledTableCell>Создатель</StyledTableCell>
                  <StyledTableCell>Количество участников</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMeetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <StyledTableCell>{meeting.name}</StyledTableCell>
                    <StyledTableCell>
                      {users.find((user) => user.id === meeting.creatorId)?.username ||
                        'Неизвестно'}
                    </StyledTableCell>
                    <StyledTableCell>{meeting.participants.length}</StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledPaper>

        <StyledPaper>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Инвайты
          </Typography>
          <Box display="flex" gap={2} mb={3} alignItems="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: '#ffffff' }}>Выберите встречу</InputLabel>
              <Select
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                displayEmpty
                sx={{
                  color: '#fff',
                  '& .MuiSvgIcon-root': { color: '#fff' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ff416c' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff416c' },
                }}
              >
                <MenuItem value="" disabled>
                  <em>-</em>
                </MenuItem>
                {meetings.map((meeting) => (
                  <MenuItem key={meeting.id} value={meeting.id}>
                    {meeting.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Максимум использований"
              type="number"
              value={inviteMaxUses}
              onChange={(e) => setInviteMaxUses(parseInt(e.target.value) || 1)}
              variant="outlined"
              size="small"
              sx={{
                width: '200px',
                input: { color: '#fff' },
                label: { color: '#fff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#fff' },
                  '&:hover fieldset': { borderColor: '#ff416c' },
                  '&.Mui-focused fieldset': { borderColor: '#ff416c' },
                },
              }}
              inputProps={{ min: 1 }}
            />
            <StyledButton
              variant="contained"
              onClick={createInvite}
              disabled={!selectedMeetingId}
              sx={{
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              Создать инвайт
            </StyledButton>
          </Box>
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Инвайт ID</StyledTableCell>
                  <StyledTableCell>ID встречи</StyledTableCell>
                  <StyledTableCell>Использования</StyledTableCell>
                  <StyledTableCell>Ссылка приглашения</StyledTableCell>
                  <StyledTableCell>Действия</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <StyledTableCell>{invite.id}</StyledTableCell>
                    <StyledTableCell>{invite.meetingId}</StyledTableCell>
                    <StyledTableCell>{`${invite.used} / ${invite.maxUses}`}</StyledTableCell>
                    <StyledTableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '150px',
                          }}
                        >
                          {invite.inviteLink}
                        </Typography>
                        <IconButton
                          color="primary"
                          onClick={() => handleCopyInvite(invite.inviteLink)}
                        >
                          <FileCopyIcon sx={{ color: '#ffffff' }} />
                        </IconButton>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          axios
                            .delete(`http://localhost:5009/api/invites/${invite.id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            })
                            .then(() => {
                              setInvites(invites.filter((i) => i.id !== invite.id));
                              setAlert({
                                open: true,
                                message: 'Инвайт удален',
                                severity: 'success',
                              });
                            })
                            .catch(() => {
                              setAlert({
                                open: true,
                                message: 'Ошибка удаления инвайта',
                                severity: 'error',
                              });
                            });
                        }}
                        sx={{
                          color: '#ff416c',
                          borderColor: '#ff416c',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 65, 108, 0.1)',
                            borderColor: '#ff416c',
                          },
                        }}
                      >
                        Удалить
                      </Button>
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledPaper>

        <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </AnimatedBox>
    </GradientContainer>
  );
}

export default AdminPanel;
