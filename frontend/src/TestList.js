// src/TestList.js
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  TextField,
  Pagination,
  Box,
  CardMedia,
  IconButton
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  PlayArrow as PlayArrowIcon,
  Add as AddIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Link as LinkIcon,
  Person as PersonIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const base64_xor = {
  xorByteArrays: (dataBytes, keyBytes) => {
    const result = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return result;
  },

  stringToByteArray: (str) => new TextEncoder().encode(str),
  byteArrayToString: (bytes) => new TextDecoder().decode(bytes),

  encode: (key, plaintext) => {
    const plaintextBytes = base64_xor.stringToByteArray(plaintext);
    const keyBytes = base64_xor.stringToByteArray(key);
    const xorResult = base64_xor.xorByteArrays(plaintextBytes, keyBytes);
    return btoa(String.fromCharCode.apply(null, xorResult));
  },

  decode: (key, encoded) => {
    const xorResult = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    const keyBytes = base64_xor.stringToByteArray(key);
    const decodedBytes = base64_xor.xorByteArrays(xorResult, keyBytes);
    return base64_xor.byteArrayToString(decodedBytes);
  }
};

function TestList() {
  const { user, token } = useContext(AuthContext);
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTests, setFilteredTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 6;

  useEffect(() => {
    fetchTests();
  }, [token]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, tests]);

  const fetchTests = () => {
    axios
      .get('http://localhost:5009/api/tests', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const decodedResponse = base64_xor.decode('asd', response.data);
        const parsedResponse = JSON.parse(decodedResponse);

        const visibleTests = parsedResponse.filter((test) => {
          const isCreator = test.creatorId === user.id;
          const visibility = test.visibility || 'public';

          if (user.role === 'student') {
            return (visibility === 'public' || visibility === 'password');
          } else if (user.role === 'teacher') {
            if (visibility === 'unlisted') return false;
            if (visibility === 'private' && !isCreator && user.role !== 'admin') return false;
            return true;
          } else if (user.role === 'admin') {
            if (visibility === 'unlisted') return false;
            return true;
          }
          return false;
        }).map((test) => ({
          ...test,
          visibility: test.visibility || 'public',
        }));

        setTests(visibleTests);
      })
      .catch((error) => {
        console.error('Ошибка при получении тестов', error);
        setNotification({ open: true, message: 'Ошибка при получении списка тестов', severity: 'error' });
      });
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredTests(tests);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = tests.filter(
        (test) =>
          test.title.toLowerCase().includes(lowercasedTerm) ||
          test.description.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredTests(filtered);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    setFilteredTests(tests);
  }, [tests]);

  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(filteredTests.length / testsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTest = (test) => {
    setTestToDelete(test);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTest = () => {
    axios
      .delete(`http://localhost:5009/api/tests/${testToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchTests();
        setDeleteDialogOpen(false);
        setTestToDelete(null);
        setNotification({ open: true, message: 'Тест успешно удалён', severity: 'success' });
      })
      .catch((error) => {
        console.error('Ошибка при удалении теста', error);
        setNotification({ open: true, message: 'Ошибка при удалении теста', severity: 'error' });
        setDeleteDialogOpen(false);
        setTestToDelete(null);
      });
  };

  const cancelDeleteTest = () => {
    setDeleteDialogOpen(false);
    setTestToDelete(null);
  };

  const handleEditTest = (test) => {
    navigate(`/testing/edit/${test.id}`);
  };

  const handleShowResults = (test) => {
    navigate(`/testing/result/${test.id}`);
  };

  const handleCopyLink = (testId) => {
    const link = `${window.location.origin}/testing/attempt/${testId}`;
    navigator.clipboard.writeText(link).then(() => {
      setNotification({ open: true, message: 'Ссылка скопирована в буфер обмена', severity: 'success' });
    });
  };

  const handleCloseSnackbar = () => {
    setNotification({ ...notification, open: false });
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public':
        return <PublicIcon color="action" />;
      case 'password':
        return <LockIcon color="action" />;
      case 'unlisted':
        return <LinkIcon color="action" />;
      case 'private':
        return <PersonIcon color="action" />;
      default:
        return <PublicIcon color="action" />;
    }
  };

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case 'public':
        return 'Публичный';
      case 'password':
        return 'Требуется пароль';
      case 'unlisted':
        return 'Доступ по ссылке';
      case 'private':
        return 'Приватный';
      default:
        return 'Публичный';
    }
  };

  const handleTestClick = (test) => {
    const visibility = test.visibility;
    if (user.role === 'student') {
      if (visibility === 'public') {
        navigate(`/testing/attempt/${test.id}`);
      } else if (visibility === 'password') {
        navigate(`/testing/password/${test.id}`);
      }
    } else {
      handleCopyLink(test.id);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
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

      <Typography variant="h3" gutterBottom align="center" color="primary">
        Тестирование Знаний
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <TextField
          variant="outlined"
          placeholder="Поиск тестов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{
            width: { xs: '100%', sm: '80%', md: '60%' },
          }}
        />
      </Box>

      {(user.role === 'teacher' || user.role === 'admin') && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/testing/edit/new')}
          >
            Создать Новый Тест
          </Button>
        </Box>
      )}

      <Grid container spacing={4}>
        {Array.isArray(currentTests) && currentTests.length > 0 ? (
          currentTests.map((test) => (
            <Grid item key={test.id} xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={
                      test.imageUrl ||
                      'https://avatars.mds.yandex.net/i?id=0cbf2a1a2e68207fc6e7bb67f5369376_l-5347001-images-thumbs&n=13'
                    }
                    alt={test.title}
                  />

                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Tooltip title={getVisibilityLabel(test.visibility)}>
                      {getVisibilityIcon(test.visibility)}
                    </Tooltip>
                  </Box>

                  <CardContent
                    onClick={() => handleTestClick(test)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography gutterBottom variant="h5" component="div" color="primary">
                      {test.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {test.description && test.description.length > 100
                        ? `${test.description.substring(0, 100)}...`
                        : test.description}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    {user.role === 'student' && test.visibility !== 'private' && (
                      <Tooltip title="Начать Тест">
                        <IconButton color="success" onClick={() => handleTestClick(test)}>
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {(user.role === 'teacher' || user.role === 'admin') && (
                      <>
                        <Tooltip title="Редактировать Тест">
                          <IconButton color="primary" onClick={() => handleEditTest(test)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Кнопка для копирования теста */}
                        <Tooltip title="Скопировать Тест (создать новый на основе этого)">
                          <IconButton 
                            color="warning"
                            onClick={() => navigate(`/testing/edit/new?copyFrom=${test.id}`)}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Просмотреть Результаты">
                          <IconButton color="info" onClick={() => handleShowResults(test)}>
                            <AssessmentIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Скопировать ссылку на тест">
                          <IconButton color="secondary" onClick={() => handleCopyLink(test.id)}>
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Удалить Тест">
                          <IconButton color="error" onClick={() => handleDeleteTest(test)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center" color="textSecondary">
              Нет доступных тестов
            </Typography>
          </Grid>
        )}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteTest}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Удаление Теста</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Вы уверены, что хотите удалить тест "{testToDelete?.title}"? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteTest} color="primary">
            Отмена
          </Button>
          <Button onClick={confirmDeleteTest} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TestList;
