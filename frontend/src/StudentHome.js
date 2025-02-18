// src/StudentHome.js
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

function StudentHome() {
  const { user, token } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:5009/api/meetings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const joinedMeetings = res.data.filter((meeting) =>
          meeting.participants.includes(user.id)
        );
        setMeetings(joinedMeetings);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке встреч:', err);
        setLoading(false);
      });
  }, [token, user.id]);

  const handleJoinMeeting = (meetingId) => {
    navigate(`/meetings/${meetingId}`);
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Загрузка встреч...</Typography>
      </Container>
    );
  }

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

      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
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
                    Организатор: {meeting.creatorName}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<MeetingRoomIcon />}
                    onClick={() => handleJoinMeeting(meeting.id)}
                    sx={{ borderRadius: '0 0 4px 4px' }}
                  >
                    Присоединиться
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{ textAlign: 'center', mt: 4 }}>
          У вас пока нет встреч.
        </Typography>
      )}
    </Container>
  );
}

export default StudentHome;
