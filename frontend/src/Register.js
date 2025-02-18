// src/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  InputAdornment,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

const sapphireColor = '#0F52BA';

const Root = styled('div')(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column-reverse', // На мобильных устройствах картинка снизу, форма сверху
  },
}));

const LeftSide = styled('div')(({ theme }) => ({
  flex: '1 1 50%',
  backgroundColor: '#000',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  padding: '0 40px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: '20px',
  },
}));

const RightSide = styled('div')(({ theme }) => ({
  flex: '1 1 50%',
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundImage: 'url("https://img10.joyreactor.cc/pics/post/full/Anime-kokoro-gensou-no-idea-sakaki-maki-1347078.jpeg")',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    height: '50%',
  },
}));

const Overlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(to left, rgba(0,0,0,0.7), rgba(0,0,0,0))',
}));

const FormContainer = styled(motion.div)(({ theme }) => ({
  width: '100%',
  maxWidth: '500px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& .MuiInputBase-input': {
    color: '#ffffff',
  },
  '& .MuiInputLabel-root': {
    color: '#aaaaaa',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#555',
    },
    '&:hover fieldset': {
      borderColor: '#999',
    },
    '&.Mui-focused fieldset': {
      borderColor: sapphireColor,
    },
  },
}));

const AuthButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  width: '100%',
  height: '45px',
  backgroundColor: '#333',
  color: '#fff',
  borderRadius: '5px',
  '&:hover': {
    backgroundColor: '#444',
  },
}));

const PasswordStrengthBar = styled('div')(({ theme }) => ({
  width: '100%',
  backgroundColor: '#e0e0e0',
  height: '10px',
  borderRadius: '2px',
  marginTop: theme.spacing(1),
}));

const PasswordStrengthFill = styled('div')(({ theme, strength }) => ({
  width: `${(strength / 4) * 100}%`,
  backgroundColor:
    strength <= 1
      ? '#f44336'
      : strength === 2
      ? '#ff9800'
      : strength === 3
      ? '#ffc107'
      : '#4caf50',
  height: '10px',
  borderRadius: '2px',
  transition: 'width 0.3s ease',
}));

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-ZА-Я]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordStrength < 3) {
      toast.warn('Пароль слишком слабый. Пожалуйста, используйте более сложный пароль.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5009/api/register', { username, email, password });
      toast.success('Успешная регистрация! Пожалуйста, войдите в систему.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error('Ошибка при регистрации.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Root>
      <LeftSide>
        <FormContainer
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Регистрация
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <StyledTextField
              label="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <StyledTextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <StyledTextField
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                checkPasswordStrength(e.target.value);
              }}
              fullWidth
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end" aria-label="toggle password visibility">
                      {showPassword ? <VisibilityOff sx={{ color: '#aaa' }} /> : <Visibility sx={{ color: '#aaa' }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Сложность пароля:</Typography>
              <PasswordStrengthBar>
                <PasswordStrengthFill strength={passwordStrength} />
              </PasswordStrengthBar>
              <Typography variant="caption" sx={{ color: '#aaa' }}>
                {passwordStrength === 0 && 'Слабый'}
                {passwordStrength === 1 && 'Слабый'}
                {passwordStrength === 2 && 'Средний'}
                {passwordStrength === 3 && 'Хороший'}
                {passwordStrength === 4 && 'Отличный'}
              </Typography>
            </Box>

            <AuthButton
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Зарегистрироваться'}
            </AuthButton>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#aaa' }}>
              Уже есть аккаунт?{' '}
              <Button variant="text" sx={{ color: sapphireColor }} onClick={() => navigate('/login')}>
                Войти
              </Button>
            </Typography>
          </Box>
        </FormContainer>
      </LeftSide>
      <RightSide>
        <Overlay />
      </RightSide>
    </Root>
  );
}

export default Register;
