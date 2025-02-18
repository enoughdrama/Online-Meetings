// controllers/testingController.js
const { v4: uuidv4 } = require('uuid');
const base64 = require('base64-xor')

const { read, write } = require('../utils/database');

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

class TestingController {
    getTestingStatus(req, res) {
        const { testId, attemptId } = req.params;
        const db = read();

        const output = db.attempts.map(test => {
            const { answers, ...rest } = test;
            return rest;
        });

        const attempt = output.find(a => a.id === attemptId && a.testId === testId);

        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        res.json(attempt);
    }

    getTestingAttempts(req, res) {
        const { testId } = req.params;
        const db = read();

        const test = db.tests.find(t => t.id === testId);
        if (!test) {
          return res.status(404).json({ message: 'Тест не найден' });
        }

        const attempts = db.attempts.filter(a => a.testId === testId);
        res.json(attempts);
    }

    getTestingResults(req, res) {
        try {
            const { testId } = req.params;
            const db = read();

            const test = db.tests.find(t => t.id === testId);
            if (!test) {
                return res.status(404).json({ message: 'Тест не найден' });
            }

            const attempts = db.attempts.filter(a => a.testId === testId && a.userId === req.user.id && a.completed);
            if (attempts.length === 0) {
                return res.status(404).json({ message: 'Нет завершённых попыток для этого теста' });
            }

            const results = attempts.map(attempt => ({
                score: attempt.score,
                timestamp: attempt.timestamp
            }));

            res.json({ testId, testTitle: test.title, results });
        } catch (error) {
            console.error('Ошибка при получении результатов теста:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }

    getTestingUserResults(req, res) {
        try {
            const { testId } = req.params;
            const db = read();

            const test = db.tests.find(t => t.id === testId);
            if (!test) {
                return res.status(404).json({ message: 'Тест не найден' });
            }

            const attempts = db.attempts.filter(a => a.testId === testId && a.completed);
            if (attempts.length === 0) {
                return res.status(404).json({ message: 'Нет завершённых попыток для этого теста' });
            }

            const results = attempts.map(attempt => {
                const user = db.users.find(u => u.id === attempt.userId);
                return {
                    userId: attempt.userId,
                    username: user ? user.username : 'Неизвестный пользователь',
                    score: attempt.score,
                    timestamp: attempt.timestamp,
                    answers: attempt.answers,
                };
            });

            res.json({ testId, testTitle: test.title, results });
        } catch (error) {
            console.error('Ошибка при получении всех результатов теста:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }

    pushTestingList(req, res) {
        const { title, description, attemptsAllowed, questions, visibility, password } = req.body;
        const db = read();
    
        if (!db.tests) {
            db.tests = [];
        }
    
        const processedQuestions = questions.map(question => {
            if (question.type === 'text') {
                return {
                    ...question,
                    correctAnswer: question.correctAnswer || '',
                };
            }
            return question;
        });
    
        const newTest = {
            id: uuidv4(),
            title,
            description,
            attemptsAllowed,
            creatorId: req.user.id,
            visibility: visibility || 'public',
            password: visibility === 'password' ? password : '',
            questions: processedQuestions
        };
    
        db.tests.push(newTest);
        write(db);
    
        res.status(201).json(newTest);
    }

    getTestingList(req, res) {
        const db = read();
    
        const testsWithoutQuestions = db.tests.map(test => {
            const { questions, password, ...rest } = test;
            return rest;
        });
    
        const responseStr = JSON.stringify(testsWithoutQuestions)
        const encodedStr = base64_xor.encode('asd', responseStr)
    
        res.send(encodedStr);
    }

    markTestingComplete(req, res) {
        const { testId, attemptId } = req.params;
        const db = read();

        const attempt = db.attempts.find(a => a.id === attemptId && a.testId === testId);

        if (!attempt) {
            return res.status(404).json({ message: 'Попытка не найдена' });
        }

        if (attempt.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        if (attempt.completed) {
            return res.status(400).json({ message: 'Эта попытка уже завершена' });
        }

        const test = db.tests.find(t => t.id === testId);
        if (!test) {
            return res.status(404).json({ message: 'Тест не найден' });
        }

        let correctAnswers = 0;

        test.questions.forEach(question => {
            const userAnswer = attempt.answers.find(a => a.questionId === question.id);
            if (userAnswer) {
                if (question.type === 'single') {
                    const correctOption = question.options.find(o => o.isCorrect);
                    if (correctOption && correctOption.text === userAnswer.answer) {
                        correctAnswers++;
                    }
                } else if (question.type === 'multiple') {
                    const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.text).sort();
                    const userOptions = userAnswer.answer.sort();
                    if (JSON.stringify(correctOptions) === JSON.stringify(userOptions)) {
                        correctAnswers++;
                    }
                } else if (question.type === 'text') {
                    const correctAnswer = question.correctAnswer.trim().toLowerCase();
                    const userText = userAnswer.answer.trim().toLowerCase();
                    if (correctAnswer === userText) {
                        correctAnswers++;
                    }
                }
            }
        });

        const score = Math.round((correctAnswers / test.questions.length) * 100);

        attempt.score = score;
        attempt.completed = true;

        write(db);

        res.json({ score, attempt });
    }

    verifyTestingPassword(req, res) {
        const { id } = req.params;
        const { password } = req.body;
        const db = read();

        const test = db.tests.find((t) => t.id === id);
        if (!test) {
          return res.status(404).json({ message: 'Тест не найден' });
        }

        if (test.visibility !== 'password') {
          return res.status(400).json({ message: 'Тест не защищён паролем' });
        }

        if (test.password !== password) {
          return res.status(401).json({ message: 'Неверный пароль' });
        }

        res.json({ message: 'Пароль верный' });
    }

    getTestingAllResults(req, res) {
        const db = read();

        const { id } = req.params;
        const { password } = req.body;
        const test = db.tests.find(t => t.id === id);

        if (!test) {
          return res.status(404).json({ message: 'Тест не найден' });
        }

        if (test.visibility === 'private') {
          if (!(req.user.role === 'teacher' || req.user.role === 'admin')) {
            return res.status(403).json({ message: 'Доступ запрещён' });
          }
        }

        if (test.visibility === 'password') {
          if (password !== test.password) {
            return res.status(401).json({ message: 'Неверный пароль' });
          }
        }

        const newAttempt = {
          id: uuidv4(),
          userId: req.user.id,
          testId: id,
          answers: [],
          score: null,
          completed: false,
          timestamp: new Date(),
        };

        db.attempts.push(newAttempt);
        write(db);

        res.status(201).json(newAttempt);
    }

    getTestingAttemptStatus(req, res) {
        const { testId, attemptId } = req.params;
        const db = read();

        const test = db.tests.find(t => t.id === testId);
        if (!test) {
            return res.status(404).json({ message: 'Тест не найден' });
        }

        const attempt = db.attempts.find(a => a.id === attemptId && a.testId === testId);
        if (!attempt) {
            return res.status(404).json({ message: 'Попытка не найдена' });
        }

        if (attempt.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        const { answers, score, completed, timestamp } = req.body;

        if (answers) attempt.answers = answers;
        if (score !== undefined) attempt.score = score;
        if (completed !== undefined) attempt.completed = completed;
        if (timestamp) attempt.timestamp = timestamp;

        write(db);

        res.json({ message: 'Попытка обновлена', attempt });
    }

    getTestingObject(req, res) {
        const db = read();
        const test = db.tests.find((t) => t.id === req.params.id);
    
        if (!test) {
            return res.status(404).json({ message: 'Тест не найден' });
        }
    
        if (test.creatorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Вы не можете редактировать этот тест' });
        }
    
        const { title, description, attemptsAllowed, questions, visibility, password } = req.body;
    
        const processedQuestions = questions.map(question => {
            if (question.type === 'text') {
                return {
                    ...question,
                    correctAnswer: question.correctAnswer || '',
                };
            }
            return question;
        });
    
        test.title = title;
        test.description = description;
        test.attemptsAllowed = attemptsAllowed;
        test.questions = processedQuestions;
        test.visibility = visibility || 'public';
        test.password = visibility === 'password' ? (password || '') : '';
    
        write(db);
    
        res.json(test);
    }

    updateTestingAttempt(req, res) {
        const db = read();
        const attempt = db.attempts.find((a) => a.id === req.params.id);

        if (!attempt) {
            return res.status(404).json({ message: 'Попытка не найдена' });
        }

        if (attempt.userId !== req.user.id) {
            return res.status(403).json({ message: 'Вы не можете редактировать эту попытку' });
        }

        if (attempt.completed) {
            return res.status(400).json({ message: 'Эта попытка уже завершена' });
        }

        const { answers } = req.body;
        attempt.answers = answers;

        write(db);

        res.json(attempt);
    }

    getTestingData(req, res) {
        const db = read();
        const test = db.tests.find((t) => t.id === req.params.id);

        if (!test) {
            return res.status(404).json({ message: 'Тест не найден' });
        }

        if (req.user.role === 'student') {
            const testCopy = { ...test };
            testCopy.questions = testCopy.questions.map((q) => {
                const options = q.options.map((opt) => ({ text: opt.text }));
                if (q.type === 'text') {
                    delete q.correctAnswer;
                }
                return { ...q, options };
            });

            const responseStr = JSON.stringify(test)
            const encodedStr = base64_xor.encode('asd', responseStr)

            return res.send(encodedStr);
        }

        const responseStr = JSON.stringify(test)
        const encodedStr = base64_xor.encode('asd', responseStr)

        res.send(encodedStr);
    }

    removeTestingObject(req, res) {
        const db = read();
        const testIndex = db.tests.findIndex((t) => t.id === req.params.id);

        if (testIndex === -1) {
            return res.status(404).json({ message: 'Тест не найден' });
        }

        const test = db.tests[testIndex];

        if (test.creatorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Вы не можете удалить этот тест' });
        }

        db.tests.splice(testIndex, 1);
        write(db);

        res.json({ message: 'Тест удален' });
    }

    updateTestVisibility(req, res) {
        const { id } = req.params;
        const { visibility, password } = req.body;

        const db = read();
        const test = db.tests.find(test => test.id === id);

        if (!test) {
            return res.status(404).json({ message: 'Тест не найден' });
        }

        test.visibility = visibility;

        if (visibility === 'password') {
            test.password = password;
        }

        write(db);

        res.json({ message: 'Видимость теста обновлена', test });
    }
}

module.exports = new TestingController();
