// src/TestResult.js

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

function TestResult() {
  const { testId } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // For students: fetch profile to get their group
  const [profile, setProfile] = useState(null);

  // Function to close Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError(null);
  };

  useEffect(() => {
    // Fetch profile for students
    if (user.role === 'student') {
      axios
        .get(`http://localhost:5009/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => {
          console.error('Error fetching profile', err);
          // Optionally handle profile fetch error
        });
    }

    // Determine the endpoint based on user role
    const endpoint = user.role === 'student'
      ? `http://localhost:5009/api/tests/${testId}/results`
      : `http://localhost:5009/api/tests/${testId}/userResults`;

    axios
      .get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setResult(response.data);
        setFilteredResults(response.data.results);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка при получении результата теста', error);
        setError(error.response?.data?.message || 'Не удалось получить результаты теста.');
        setOpenSnackbar(true);
        setLoading(false);
      });
  }, [testId, token, user.role]);

  // Handle search query changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query === '') {
      setFilteredResults(result.results);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = result.results.filter((attempt) => {
        if (user.role === 'student') {
          // Students can search by score and date
          return (
            attempt.score.toString().includes(lowerQuery) ||
            new Date(attempt.timestamp).toLocaleString().toLowerCase().includes(lowerQuery)
          );
        } else {
          // Teachers and admins can search by username, score, date, and group
          return (
            (attempt.username && attempt.username.toLowerCase().includes(lowerQuery)) ||
            attempt.score.toString().includes(lowerQuery) ||
            new Date(attempt.timestamp).toLocaleString().toLowerCase().includes(lowerQuery) ||
            (attempt.group && attempt.group.toLowerCase().includes(lowerQuery))
          );
        }
      });
      setFilteredResults(filtered);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress size={80} />
        </Box>
      </Container>
    );
  }

  if (!result) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 10 }}>
          Результаты теста не найдены.
        </Typography>
      </Container>
    );
  }

  // Define columns for DataGrid
  const columns = user.role === 'student'
    ? [
        { field: 'id', headerName: 'Попытка', width: 100 },
        { field: 'score', headerName: 'Баллы (%)', width: 150 },
        { field: 'timestamp', headerName: 'Дата прохождения', width: 250 },
      ]
    : [
        { field: 'id', headerName: 'Попытка', width: 100 },
        { field: 'username', headerName: 'Пользователь', width: 200 },
        { field: 'group', headerName: 'Группа', width: 150 }, // New Group column
        { field: 'score', headerName: 'Баллы (%)', width: 150 },
        { field: 'timestamp', headerName: 'Дата прохождения', width: 250 },
      ];

  // Prepare data for DataGrid
  const rows = filteredResults.map((attempt, index) => ({
    id: index + 1,
    username: user.role !== 'student' ? attempt.username : undefined,
    group: user.role !== 'student' ? attempt.group || 'Не указана' : profile?.group || 'Не указана', // Display group
    score: attempt.score,
    timestamp: new Date(attempt.timestamp).toLocaleString(),
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Результаты Теста: {result.testTitle}
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center">
          {result.testDescription}
        </Typography>

        {/* For students: Display their group */}
        {user.role === 'student' && profile?.group && (
          <Typography variant="subtitle1" align="center" sx={{ mt: 1 }}>
            <strong>Группа:</strong> {profile.group}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          variant="outlined"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <Card>
        <CardContent>
          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
                border: 'none',
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/testing')}>
          Вернуться к Тестам
        </Button>
      </Box>
    </Container>
  );
}

export default TestResult;
