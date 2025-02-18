// src/TestAttempt.js

import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Alert,
  Snackbar,
  TextField,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
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

function TestAttempt() {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);

  const timerRef = useRef(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [testPassword] = useState(location.state?.password || '');

  const saveProgress = () => {
    if (attempt) {
      const progress = {
        attemptId: attempt.id,
        currentQuestionIndex,
        answers,
      };
      //localStorage.setItem(`test-progress-${id}-${user.id}`, JSON.stringify(progress));
    }
  };

  const loadProgress = () => {
    const savedProgress = localStorage.getItem(`test-progress-${id}-${user.id}`);
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
    return null;
  };

  useEffect(() => {
    const fetchTest = () => {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {},
      };

      if (testPassword) {
        config.params.password = testPassword;
      }

      axios
        .get(`http://localhost:5009/api/tests/${id}`, config)
        .then((response) => {
          const decodedStr = base64_xor.decode('asd', response.data)
          const fetchedTest = JSON.parse(decodedStr)

          fetchedTest.visibility = fetchedTest.visibility || 'public';

          if (fetchedTest.visibility === 'private') {
            if (!(user.role === 'teacher' || user.role === 'admin')) {
              setError('У вас нет доступа к этому тесту.');
              setOpenSnackbar(true);
              setLoading(false);
              return;
            }
          }

          if (fetchedTest.visibility === 'password' && !testPassword) {
            navigate(`/testing/password/${id}`);
            return;
          }

          setTest(fetchedTest);

          initiateOrLoadAttempt(fetchedTest);
        })
        .catch((error) => {
          console.error('Ошибка при получении теста', error);

          if (error.response) {
            if (error.response.status === 401) {
              navigate(`/testing/password/${id}`);
            } else if (error.response.status === 401) {
              setError('Неверный пароль или доступ запрещён.');
            } else if (error.response.status === 404) {
              setError('Тест не найден.');
            } else {
              setError('Ошибка при получении теста.');
            }
          } else {
            setError('Ошибка при получении теста.');
          }

          setOpenSnackbar(true);
          setLoading(false);
        });
    };

    fetchTest();
  }, [id, token, testPassword]);

  const initiateOrLoadAttempt = (fetchedTest) => {
    const savedProgress = loadProgress();
    if (savedProgress) {

      setAttempt({ id: savedProgress.attemptId });
      setCurrentQuestionIndex(savedProgress.currentQuestionIndex);
      setAnswers(savedProgress.answers);
      setLoading(false);
    } else {
      axios
        .get(`http://localhost:5009/api/tests/${id}/attempts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const userAttempts = response.data.filter((att) => att.userId === user.id);
          const allowedAttempts = fetchedTest.attemptsAllowed;
          if (userAttempts.length >= allowedAttempts) {
            setError('Вы исчерпали все попытки для этого теста.');
            setOpenSnackbar(true);
            setLoading(false);
          } else {
            const attemptData = {
              ...(fetchedTest.visibility === 'password' && { password: testPassword }),
            };

            axios
              .post(`http://localhost:5009/api/tests/${id}/attempts`, attemptData, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then((response) => {
                setAttempt(response.data);
                setAnswers([]);
                setLoading(false);
              })
              .catch((error) => {
                console.error('Ошибка при создании попытки', error);
                setError('Ошибка при создании попытки прохождения теста');
                setOpenSnackbar(true);
                setLoading(false);
              });
          }
        })
        .catch((error) => {
          console.error('Ошибка при проверке попыток', error);
          setError('Ошибка при проверке попыток');
          setOpenSnackbar(true);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (test && test.questions.length > 0 && !loading) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const currentQuestion = test.questions[currentQuestionIndex];
      setTimeLeft(currentQuestion.timeLimit || 180);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [currentQuestionIndex, test, loading]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleBeforeUnload);
      saveProgress();
    };
  }, [attempt, currentQuestionIndex, answers]);

  const handleSingleAnswerChange = (questionId, value) => {
    setAnswers((prev) => {
      const updatedAnswers = prev.filter((a) => a.questionId !== questionId);
      updatedAnswers.push({ questionId, answer: value });
      return updatedAnswers;
    });
  };

  const handleMultipleAnswerChange = (questionId, optionText) => {
    setAnswers((prev) => {
      const existingAnswer = prev.find((a) => a.questionId === questionId);
      if (existingAnswer) {
        if (existingAnswer.answer.includes(optionText)) {
          // Remove option
          return prev.map((a) =>
            a.questionId === questionId
              ? { ...a, answer: a.answer.filter((opt) => opt !== optionText) }
              : a
          );
        } else {
          // Add option
          return prev.map((a) =>
            a.questionId === questionId
              ? { ...a, answer: [...a.answer, optionText] }
              : a
          );
        }
      } else {
        // Create new answer
        return [...prev, { questionId, answer: [optionText] }];
      }
    });
  };

  // Handle text input answers
  const handleTextAnswerChange = (questionId, text) => {
    setAnswers((prev) => {
      const updatedAnswers = prev.filter((a) => a.questionId !== questionId);
      updatedAnswers.push({ questionId, answer: text });
      return updatedAnswers;
    });
  };

  // Handle navigation to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // If this is the last question, open the confirmation dialog
      setConfirmDialogOpen(true);
    }
  };

  // Submit answers
  const handleSubmit = () => {
    setSubmitting(true);
    axios
      .put(
        `http://localhost:5009/api/tests/${id}/attempts/${attempt.id}`,
        { answers },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        axios
          .post(
            `http://localhost:5009/api/tests/${id}/attempts/${attempt.id}/complete`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then(() => {
            localStorage.removeItem(`test-progress-${id}-${user.id}`);
            setSuccess('Тест успешно завершён!');
            setOpenSnackbar(true);
            setSubmitting(false);
            setTimeout(() => {
              navigate(`/testing/result/${id}`);
            }, 1500);
          })
          .catch((error) => {
            console.error('Ошибка при завершении попытки', error);
            setError('Ошибка при завершении попытки прохождения теста');
            setOpenSnackbar(true);
            setSubmitting(false);
            endAttemptDueToError();
          });
      })
      .catch((error) => {
        console.error('Ошибка при сохранении ответов', error);
        setError('Ошибка при сохранении ответов');
        setOpenSnackbar(true);
        setSubmitting(false);
        endAttemptDueToError();
      });
  };

  const endAttemptDueToError = () => {
    axios
      .post(
        `http://localhost:5009/api/tests/${id}/attempts/${attempt.id}/complete`,
        { error: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        localStorage.removeItem(`test-progress-${id}-${user.id}`);
        navigate(`/testing/result/${id}`);
      })
      .catch((error) => {
        console.error('Ошибка при экстренном завершении попытки', error);
        localStorage.removeItem(`test-progress-${id}-${user.id}`);
        navigate(`/testing/result/${id}`);
      });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    if (test && attempt) {
      axios
        .get(`http://localhost:5009/api/tests/${id}/attempts/${attempt.id}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data.completed) {
            localStorage.removeItem(`test-progress-${id}-${user.id}`);
            navigate(`/testing/result/${id}`);
          }
        })
        .catch((error) => {
          console.error('Ошибка при проверке статуса попытки', error);
        });
    }
  }, [test, attempt]);

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress size={80} />
        </Box>
      </Container>
    );
  }

  if (!attempt && test && (test.visibility === 'private' || test.visibility === 'public' || test.visibility === 'unlisted' || test.visibility === 'password')) {
    return (
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '20vh',
          }}
        >
          <Typography variant="h5" align="center" sx={{ mb: 5 }}>
            Вы больше не можете пройти данный тест.
          </Typography>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<CheckCircleIcon />}
            onClick={() => {
              navigate(`/testing/result/${id}`);
            }}
          >
            Просмотреть ваши ответы
          </Button>
        </Box>
      </Container>
    );
  }

  if (!test) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 10 }}>
          Ошибка загрузки теста.
        </Typography>
      </Container>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const totalQuestions = test.questions.length;

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>
          {error || success}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Завершение Теста</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Вы уверены, что хотите завершить тест? Ваши ответы будут сохранены.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleSubmit} color="error" variant="contained">
            Завершить
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h4" gutterBottom align="center" color="primary">
        {test.title}
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center" color="textSecondary">
        {test.description}
      </Typography>

      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={((currentQuestionIndex + 1) / totalQuestions) * 100}
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="body2" color="textSecondary" align="right">
          Вопрос {currentQuestionIndex + 1} из {totalQuestions}
        </Typography>
      </Box>

      <Typography
        variant="h6"
        color={timeLeft <= 5 ? 'error' : 'textPrimary'}
        sx={{ mt: 2, textAlign: 'right' }}
      >
        Время: {timeLeft} секунд
      </Typography>

      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mt: 2, p: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              {currentQuestionIndex + 1}. {currentQuestion.text}
            </Typography>

            {currentQuestion.imageUrl && (
              <Box sx={{ mb: 2 }}>
                <img src={`http://localhost:5009${currentQuestion.imageUrl}`} alt="Question" style={{ maxWidth: '100%', maxHeight: '300px' }} />
              </Box>
            )}

            {currentQuestion.type === 'single' && (
              <RadioGroup
                value={
                  answers.find((a) => a.questionId === currentQuestion.id)?.answer || ''
                }
                onChange={(e) =>
                  handleSingleAnswerChange(currentQuestion.id, e.target.value)
                }
              >
                {currentQuestion.options.map((option, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={option.text}
                    control={<Radio color="primary" />}
                    label={option.text}
                  />
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'multiple' && (
              <FormGroup>
                {currentQuestion.options.map((option, idx) => (
                  <FormControlLabel
                    key={idx}
                    control={
                      <Checkbox
                        color="primary"
                        checked={
                          answers.find((a) => a.questionId === currentQuestion.id)?.answer.includes(
                            option.text
                          ) || false
                        }
                        onChange={() =>
                          handleMultipleAnswerChange(currentQuestion.id, option.text)
                        }
                      />
                    }
                    label={option.text}
                  />
                ))}
              </FormGroup>
            )}

            {currentQuestion.type === 'text' && (
              <TextField
                label="Ваш ответ"
                value={
                  answers.find((a) => a.questionId === currentQuestion.id)?.answer || ''
                }
                onChange={(e) =>
                  handleTextAnswerChange(currentQuestion.id, e.target.value)
                }
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                margin="normal"
              />
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Stack direction="row" spacing={2}>

              <Tooltip
                title={
                  currentQuestionIndex < totalQuestions - 1
                    ? 'Перейти к следующему вопросу'
                    : 'Завершить тест'
                }
              >
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={
                      currentQuestionIndex < totalQuestions - 1 ? (
                        <NavigateNextIcon />
                      ) : (
                        <CheckCircleIcon />
                      )
                    }
                    onClick={handleNextQuestion}
                    disabled={submitting}
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? 'Далее' : 'Завершить тест'}
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </CardActions>
        </Card>
      </motion.div>
    </Container>
  );
}

export default TestAttempt;
