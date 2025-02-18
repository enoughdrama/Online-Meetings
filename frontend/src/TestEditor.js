// src/TestEditor.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Box,
  Alert,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

function TestEditor() {
  const { id } = useParams();
  const location = useLocation();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const copyFrom = searchParams.get('copyFrom');

  const [test, setTest] = useState({
    title: '',
    description: '',
    attemptsAllowed: 1,
    questions: [],
    visibility: 'public',
    password: '',
  });

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id !== 'new') {
      // Редактирование существующего теста
      axios
        .get(`http://localhost:5009/api/tests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const fetchedTest = response.data || {};
          const safeQuestions = Array.isArray(fetchedTest.questions) ? fetchedTest.questions : [];
          setTest({ ...fetchedTest, questions: safeQuestions });
        })
        .catch((error) => {
          console.error('Error fetching test', error);
          setError('Ошибка при получении теста.');
        });
    } else if (id === 'new' && copyFrom) {
      // Создание нового теста на основе существующего (копирование)
      axios
        .get(`http://localhost:5009/api/tests/${copyFrom}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const fetchedTest = response.data || {};
          const safeQuestions = Array.isArray(fetchedTest.questions) ? fetchedTest.questions : [];
          const { id: originalId, creatorId, ...rest } = fetchedTest;
          setTest({ ...rest, questions: safeQuestions });
        })
        .catch((error) => {
          console.error('Error fetching test for copy', error);
          setError('Ошибка при получении теста для копирования.');
        });
    }
  }, [id, token, copyFrom]);

  const handleSaveTest = () => {
    if (!test.title?.trim()) {
      setError('Название теста обязательно.');
      return;
    }
    if (!test.description?.trim()) {
      setError('Описание теста обязательно.');
      return;
    }
    if (test.visibility === 'password' && !test.password.trim()) {
      setError('Пароль обязателен для теста с видимостью по паролю.');
      return;
    }
    if (!test.questions || test.questions.length === 0) {
      setError('Тест должен содержать хотя бы один вопрос.');
      return;
    }

    if (id === 'new') {
      axios
        .post('http://localhost:5009/api/tests', test, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log('Test saved successfully', response.data);
          navigate('/testing');
        })
        .catch((error) => {
          console.error('Error saving test', error);
          setError('Ошибка при сохранении теста.');
        });
    } else {
      axios
        .put(`http://localhost:5009/api/tests/${id}`, test, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log('Test updated successfully', response.data);
          navigate('/testing');
        })
        .catch((error) => {
          console.error('Error updating test', error);
          setError('Ошибка при обновлении теста.');
        });
    }
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = Array.isArray(test.questions) ? [...test.questions] : [];
    updatedQuestions.splice(index, 1);
    setTest({ ...test, questions: updatedQuestions });
  };

  const openQuestionDialog = (question) => {
    setEditingQuestion(
      question || {
        id: uuidv4(),
        text: '',
        type: 'single',
        options: [{ text: '', isCorrect: false }],
        correctAnswer: '',
        imageUrl: '',
        timeLimit: 180,
      }
    );
    setQuestionDialogOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion?.text?.trim()) {
      setError('Текст вопроса обязателен.');
      return;
    }

    if (editingQuestion.type !== 'text') {
      if (!editingQuestion.options || editingQuestion.options.length === 0) {
        setError('Вопрос должен содержать хотя бы один вариант ответа.');
        return;
      }

      for (let option of editingQuestion.options) {
        if (!option.text.trim()) {
          setError('Все варианты ответов должны быть заполнены.');
          return;
        }
      }

      const correctOptions = editingQuestion.options.filter((opt) => opt.isCorrect);
      if (correctOptions.length === 0) {
        setError('Вопрос должен иметь хотя бы один правильный ответ.');
        return;
      }
    } else {
      if (!editingQuestion.correctAnswer.trim()) {
        setError('Правильный ответ обязателен для текстового вопроса.');
        return;
      }
    }

    if (!editingQuestion.timeLimit || editingQuestion.timeLimit <= 0) {
      setError('Таймер вопроса должен быть положительным числом.');
      return;
    }

    let updatedQuestions = Array.isArray(test.questions) ? [...test.questions] : [];
    const questionIndex = updatedQuestions.findIndex((q) => q.id === editingQuestion.id);
    if (questionIndex > -1) {
      updatedQuestions[questionIndex] = editingQuestion;
    } else {
      updatedQuestions.push(editingQuestion);
    }
    setTest({ ...test, questions: updatedQuestions });
    setQuestionDialogOpen(false);
    setError(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    axios
      .post('http://localhost:5009/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setEditingQuestion({ ...editingQuestion, imageUrl: response.data.fileUrl });
      })
      .catch((error) => {
        console.error('Image upload failed', error);
        setError('Ошибка при загрузке изображения.');
      });
  };

  const handleCorrectAnswerChange = (e) => {
    setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom align="center">
        {id === 'new' ? 'Создать тест' : 'Редактировать тест'}
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Название теста"
          value={test.title || ''}
          onChange={(e) => setTest({ ...test, title: e.target.value })}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Описание"
          value={test.description || ''}
          onChange={(e) => setTest({ ...test, description: e.target.value })}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />

        <TextField
          label="Количество попыток"
          type="number"
          value={test.attemptsAllowed || 1}
          onChange={(e) => setTest({ ...test, attemptsAllowed: parseInt(e.target.value) })}
          margin="normal"
          inputProps={{ min: 1 }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Настройки видимости
        </Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel id="visibility-label">Видимость теста</InputLabel>
          <Select
            labelId="visibility-label"
            label="Видимость теста"
            value={test.visibility || 'public'}
            onChange={(e) =>
              setTest({
                ...test,
                visibility: e.target.value,
                password: e.target.value !== 'password' ? '' : test.password,
              })
            }
          >
            <MenuItem value="public">Публичный</MenuItem>
            <MenuItem value="unlisted">По ссылке</MenuItem>
            <MenuItem value="password">По паролю</MenuItem>
            <MenuItem value="private">Приватный</MenuItem>
          </Select>
        </FormControl>

        {test.visibility === 'password' && (
          <TextField
            label="Пароль"
            type="password"
            value={test.password || ''}
            onChange={(e) => setTest({ ...test, password: e.target.value })}
            fullWidth
            margin="normal"
          />
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Вопросы
        </Typography>
        {!test.questions || test.questions.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            Нет добавленных вопросов.
          </Typography>
        ) : (
          <List>
            {test.questions.map((question, index) => (
              <ListItem
                key={question.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDeleteQuestion(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${index + 1}. ${question.text}`}
                  secondary={`Тип: ${
                    question.type === 'single'
                      ? 'Один вариант'
                      : question.type === 'multiple'
                      ? 'Несколько вариантов'
                      : 'Текстовый ввод'
                  }, Таймер: ${question.timeLimit || '30'} секунд`}
                  onClick={() => openQuestionDialog(question)}
                  sx={{ cursor: 'pointer' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Button variant="contained" color="primary" onClick={() => openQuestionDialog(null)}>
          Добавить вопрос
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Button variant="contained" color="success" onClick={handleSaveTest} sx={{ mr: 2 }}>
          {id === 'new' ? 'Создать тест' : 'Сохранить изменения'}
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/testing')}>
          Отмена
        </Button>
      </Box>

      <Dialog
        open={questionDialogOpen}
        onClose={() => setQuestionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingQuestion?.id && test.questions.find((q) => q.id === editingQuestion.id)
            ? 'Редактировать вопрос'
            : 'Добавить вопрос'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Текст вопроса"
              value={editingQuestion?.text || ''}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
              fullWidth
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="question-type-label">Тип вопроса</InputLabel>
              <Select
                labelId="question-type-label"
                label="Тип вопроса"
                value={editingQuestion?.type || 'single'}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    type: e.target.value,
                    options: e.target.value === 'text' ? [] : editingQuestion.options,
                  })
                }
              >
                <MenuItem value="single">Один вариант</MenuItem>
                <MenuItem value="multiple">Несколько вариантов</MenuItem>
                <MenuItem value="text">Текстовый ввод</MenuItem>
              </Select>
            </FormControl>

            {(editingQuestion?.type === 'single' || editingQuestion?.type === 'multiple') && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Варианты ответов
                </Typography>
                {editingQuestion?.options?.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      label={`Вариант ${index + 1}`}
                      value={option.text}
                      onChange={(e) => {
                        const updatedOptions = [...editingQuestion.options];
                        updatedOptions[index].text = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: updatedOptions });
                      }}
                      fullWidth
                      margin="normal"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={option.isCorrect}
                          onChange={(e) => {
                            const updatedOptions = [...editingQuestion.options];
                            updatedOptions[index].isCorrect = e.target.checked;
                            setEditingQuestion({ ...editingQuestion, options: updatedOptions });
                          }}
                        />
                      }
                      label="Правильный ответ"
                      sx={{ ml: 1 }}
                    />
                    <IconButton
                      onClick={() => {
                        const updatedOptions = [...editingQuestion.options];
                        updatedOptions.splice(index, 1);
                        setEditingQuestion({ ...editingQuestion, options: updatedOptions });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}

                <Button
                  onClick={() => {
                    setEditingQuestion({
                      ...editingQuestion,
                      options: [...(editingQuestion.options || []), { text: '', isCorrect: false }],
                    });
                  }}
                  sx={{ mt: 1 }}
                >
                  Добавить вариант
                </Button>
              </>
            )}

            {editingQuestion?.type === 'text' && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Правильный ответ"
                  value={editingQuestion?.correctAnswer || ''}
                  onChange={handleCorrectAnswerChange}
                  fullWidth
                  margin="normal"
                />
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Прикрепить изображение к вопросу
              </Typography>
              {editingQuestion?.imageUrl && (
                <Box sx={{ mb: 1 }}>
                  <img
                    src={`http://localhost:5009${editingQuestion.imageUrl}`}
                    alt="Attached"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                </Box>
              )}
              <Button variant="contained" component="label">
                Загрузить изображение
                <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
              </Button>
              {editingQuestion?.imageUrl && (
                <Button
                  variant="text"
                  color="error"
                  onClick={() => setEditingQuestion({ ...editingQuestion, imageUrl: '' })}
                >
                  Удалить изображение
                </Button>
              )}
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField
                label="Таймер вопроса (секунды)"
                type="number"
                value={editingQuestion?.timeLimit || 30}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, timeLimit: parseInt(e.target.value) })
                }
                fullWidth
                margin="normal"
                inputProps={{ min: 10, max: 600 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)} color="secondary">
            Отмена
          </Button>
          <Button onClick={handleSaveQuestion} color="primary" variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TestEditor;
