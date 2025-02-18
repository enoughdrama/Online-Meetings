// src/NotFound.js
import React from 'react';
import { Container, Typography, Box, Button, Tooltip } from '@mui/material';
import { keyframes } from '@emotion/react';
import { styled, useTheme } from '@mui/material/styles';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const AnimatedIcon = styled(SentimentVeryDissatisfiedIcon)(({ theme }) => ({
  fontSize: '8rem',
  color: theme.palette.error.main,
  animation: `${float} 3s ease-in-out infinite`,
}));

const RotatingCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '300px',
  height: '300px',
  backgroundColor: theme.palette.error.light,
  borderRadius: '50%',
  transform: 'translate(-50%, -50%)',
  animation: `${rotate} 10s linear infinite`,
  opacity: 0.2,
  [theme.breakpoints.down('sm')]: {
    width: '200px',
    height: '200px',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '20px',
  padding: '10px 30px',
  fontSize: '1rem',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.3)',
    backgroundColor: theme.palette.primary.dark,
  },
}));

const SupportButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '20px',
  padding: '10px 30px',
  fontSize: '1rem',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.3)',
    backgroundColor: theme.palette.secondary.dark,
  },
}));

function NotFound() {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleSupport = () => {
    navigate('/support');
  };

  return (
    <Container
      sx={{
        textAlign: 'center',
        mt: 10,
        position: 'relative',
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      <RotatingCircle />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <AnimatedIcon aria-label="Ошибка" />

        <Typography variant="h3" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
          404 - Страница не найдена
        </Typography>

        <Typography variant="body1" sx={{ maxWidth: 600, margin: '0 auto', mb: 4 }}>
          Извините, но страница, которую вы ищете, не существует. Возможно, вы ввели неправильный адрес или страница была удалена.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
          }}
        >
          <StyledButton
            onClick={handleGoHome}
            aria-label="Вернуться на главную"
          >
            Вернуться на главную
          </StyledButton>

          <Tooltip title="Связаться с поддержкой">
            <SupportButton
              onClick={handleSupport}
              aria-label="Связаться с поддержкой"
              startIcon={<SupportAgentIcon />}
            >
              Связаться с поддержкой
            </SupportButton>
          </Tooltip>
        </Box>
      </motion.div>
    </Container>
  );
}

export default NotFound;
