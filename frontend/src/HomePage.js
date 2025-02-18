// src/HomePage.js
import React, { useRef } from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Avatar } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import ComputerIcon from '@mui/icons-material/Computer';

function HomePage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ container: ref });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#070a2d',
        color: '#fff',
        py: 8,
        perspective: '1000px',
      }}
    >
      <Box
        component={motion.div}
        style={{ y: y1 }}
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-20%',
          width: '140%',
          height: '140%',
          background: 'radial-gradient(circle at center, rgba(15,82,186,0.3) 0%, transparent 60%)',
          filter: 'blur(200px)',
          zIndex: 0,
        }}
      />
      <Box
        component={motion.div}
        style={{ y: y2 }}
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-20%',
          width: '140%',
          height: '140%',
          background: 'radial-gradient(circle at center, rgba(15,82,186,0.5) 0%, transparent 60%)',
          filter: 'blur(300px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component={motion.div}
            initial={{ y: -50, opacity: 0, rotateX: 30 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ duration: 1 }}
            sx={{ fontWeight: 'bold', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}
          >
            Добро пожаловать на Qalyn
          </Typography>
          <Typography
            variant="h6"
            component={motion.div}
            initial={{ y: 50, opacity: 0, rotateX: -30 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            sx={{ mt: 2, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}
          >
            Новое измерение онлайн-образования
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              component={motion.div}
              initial={{ scale: 0.9, opacity: 0, rotateY: -20 }}
              whileInView={{ scale: 1, opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 10 }}
              transition={{ duration: 0.5 }}
              sx={{
                p: 4,
                borderRadius: 4,
                textAlign: 'center',
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <ComputerIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Платформа Qalyn
              </Typography>
              <Typography>
                Удобный сервис для проведения онлайн-лекций, вебинаров и мастер-классов. Интуитивный интерфейс, гибкая настройка расписаний и простота в использовании.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              component={motion.div}
              initial={{ scale: 0.9, opacity: 0, rotateY: -20 }}
              whileInView={{ scale: 1, opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 10 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              sx={{
                p: 4,
                borderRadius: 4,
                textAlign: 'center',
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Для преподавателей
              </Typography>
              <Typography>
                Создавайте курсы, добавляйте тестовые задания с автоматической проверкой, загружайте видеоуроки и презентации. Интерактивный чат и доска для совместной работы позволяют вовлечь студентов в процесс.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              component={motion.div}
              initial={{ scale: 0.9, opacity: 0, rotateY: -20 }}
              whileInView={{ scale: 1, opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 10 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{
                p: 4,
                borderRadius: 4,
                textAlign: 'center',
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                transformStyle: 'preserve-3d',
              }}
            >
              <GroupIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Для студентов
              </Typography>
              <Typography>
                Участвуйте в интерактивных семинарах, пройдите тестирование для закрепления знаний, просматривайте записи и пользуйтесь обширной библиотекой материалов. Создавайте учебные группы и делитесь конспектами.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/register"
            sx={{
              mr: 2,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: '30px',
              boxShadow: '0 0 15px rgba(0,0,0,0.3)',
              transform: 'translateZ(0)',
            }}
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            Присоединиться
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            component={Link}
            to="/login"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              color: '#fff',
              borderColor: '#fff',
              borderRadius: '30px',
              boxShadow: '0 0 15px rgba(255,255,255,0.2)',
              transform: 'translateZ(0)',
            }}
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            Войти
          </Button>
        </Box>

        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 4, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            Расширенные возможности
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: 'Интерактивные опросы',
                desc: 'Моментальные опросы прямо во время лекции, результат отображается всем участникам для мгновенной обратной связи.'
              },
              {
                title: 'Автоматическое тестирование',
                desc: 'Простая настройка тестов, автоматическая проверка и статистика успехов для анализа прогресса студентов.'
              },
              {
                title: 'Аналитика посещаемости',
                desc: 'Отслеживайте вовлечённость, присутствие на лекциях и активность студентов в реальном времени.'
              },
              {
                title: 'AR/VR-симуляции',
                desc: 'Создавайте виртуальные лаборатории, используйте дополненную реальность для максимального погружения.'
              },
              {
                title: 'Коллаборативная доска',
                desc: 'Работайте над проектами сообща, комментируйте идеи однокурсников и создавайте общие документы.'
              },
              {
                title: 'Геймификация обучения',
                desc: 'Собирайте достижения, получайте баллы за выполнение заданий и участвуйте в рейтингах.'
              }
            ].map((feature, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 50, rotateX: -30 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    color: '#fff',
                    minHeight: '200px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ textShadow: '0 0 5px rgba(255,255,255,0.2)' }}>
                    {feature.title}
                  </Typography>
                  <Typography>
                    {feature.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 4, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            Примеры успешного использования
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: 'Университет нового поколения',
                desc: 'Ведущий технический университет использует Qalyn для проведения гибридных лекций, управляя дистанционным и очным обучением в единой экосистеме.'
              },
              {
                title: 'Языковая школа онлайн',
                desc: 'Преподаватели языков создают интерактивные занятия, тесты и используют AR-карты для погружения студентов в культуру носителей языка.'
              },
              {
                title: 'Бизнес-тренинги',
                desc: 'Корпоративные тренеры проводят вебинары, тестируют знания сотрудников и анализируют эффективность обучения на основе детальных метрик.'
              }
            ].map((useCase, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box
                  component={motion.div}
                  initial={{ scale: 0.9, opacity: 0, rotateY: -20 }}
                  whileInView={{ scale: 1, opacity: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.3 }}
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    color: '#fff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ textShadow: '0 0 5px rgba(255,255,255,0.2)' }}>
                    {useCase.title}
                  </Typography>
                  <Typography>
                    {useCase.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 4, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            Отзывы пользователей
          </Typography>
          <Grid container spacing={4}>
            {[
              'Qalyn полностью изменила мой подход к преподаванию! Теперь уроки интерактивны, а обратная связь мгновенна.',
              'Как студент, я ценю возможность пересматривать лекции и участвовать в дискуссиях в удобное мне время.',
              'Геймификация реально мотивирует! Я стремлюсь набирать очки и осваивать новые темы быстрее.'
            ].map((quote, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box
                  component={motion.div}
                  initial={{ rotateX: -90, opacity: 0 }}
                  whileInView={{ rotateX: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.3 }}
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    color: '#fff',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}
                  >
                    U{i + 1}
                  </Avatar>
                  <Typography variant="body1">
                    "{quote}"
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 2, opacity: 0.7 }}>
                    Пользователь {i + 1}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 4, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            Дополнительные ресурсы
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Обширная медиа-библиотека с презентациями, научными статьями, подкастами и видеоуроками, доступная 24/7.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Инструменты для создания собственных модулей, курсов и интерактивных заданий без навыков программирования.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Лёгкая интеграция с популярными системами управления обучением и календарями, доступ с любых устройств.
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/register"
            sx={{
              mr: 2,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: '30px',
              boxShadow: '0 0 15px rgba(0,0,0,0.3)',
            }}
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            Начать обучение
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            component={Link}
            to="/login"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              color: '#fff',
              borderColor: '#fff',
              borderRadius: '30px',
              boxShadow: '0 0 15px rgba(255,255,255,0.2)',
            }}
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            Уже с нами?
          </Button>
        </Box>

        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 4, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            Миссия и ценности
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Мы стремимся расширить возможности обучения, сделать знания доступными и увлекательными для всех.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Ценим инновации, общение и постоянное совершенствование методов образования.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Присоединяйтесь к нам и откройте новые горизонты познания!
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;
