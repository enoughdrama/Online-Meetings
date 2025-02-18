import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
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
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

import { FaVk, FaGoogle, FaDiscord } from 'react-icons/fa';
import { SiPatreon } from 'react-icons/si';

const sapphireColor = '#0F52BA';

const Root = styled('div')(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const LeftSide = styled('div')(({ theme }) => ({
  flex: '1 1 50%',
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundImage: 'url("https://wallpapers.com/images/file/samurai-x-kenshin-under-full-moon-t7cnxh4htyse481y.jpg")',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    height: '50%',
  },
  [theme.breakpoints.up('md')]: {
    width: '50%',
    height: '100%',
  },
}));

const Overlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0))',
}));

const RightSide = styled('div')(({ theme }) => ({
  flex: '1 1 50%',
  backgroundColor: '#000000',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  padding: '0 40px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    height: 'auto',
    padding: '20px',
  },
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

const LinkButton = styled(Button)(({ theme }) => ({
  color: '#aaa',
  textTransform: 'none',
  fontSize: '0.8rem',
  minWidth: 'auto',
  padding: 0,
  '&:hover': {
    color: '#fff',
  },
}));

const DividerWithText = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  color: '#aaa',
  margin: theme.spacing(2, 0),
  '&::before, &::after': {
    content: '""',
    flex: '1 1',
    borderBottom: '1px solid #555',
    margin: '0 8px',
  },
}));

const SocialIcons = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const SocialButton = styled(Button)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#222',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '40px',
  padding: 0,
  '&:hover': {
    backgroundColor: '#333',
  },
}));

const CookieMessage = styled('div')(({ theme }) => ({
  fontSize: '0.7rem',
  color: '#777',
  marginTop: theme.spacing(3),
  textAlign: 'center',
  maxWidth: '250px',
}));

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [require2FA, setRequire2FA] = useState(false);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [userIdFor2FA, setUserIdFor2FA] = useState(null);
  const [loading2FA, setLoading2FA] = useState(false);

  const [loadingSocial, setLoadingSocial] = useState({
    vk: false,
    patreon: false,
    google: false,
    discord: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingAuth) return;
    setLoadingAuth(true);
    try {
      const res = await axios.post('http://localhost:5009/api/login', { email, password });
      if (res.data.require2FA) {
        setRequire2FA(true);
        setUserIdFor2FA(res.data.userId);
        toast.info('Требуется двухфакторная аутентификация');
      } else {
        login(res.data.user, res.data.token);
        navigate('/');
        toast.success('Успешный вход!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Неверные учетные данные.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handle2FASubmit = async () => {
    if (!twoFAToken) {
      toast.warn('Пожалуйста, введите токен 2FA.');
      return;
    }
    setLoading2FA(true);
    try {
      const res = await axios.post('http://localhost:5009/api/login/2fa', {
        userId: userIdFor2FA,
        token: twoFAToken,
      });
      login(res.data.user, res.data.token);
      navigate('/');
      toast.success('Успешный вход!');
    } catch (err) {
      console.error(err);
      toast.error('Неверный токен 2FA.');
    } finally {
      setLoading2FA(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSocialAuth = async (type) => {
    if (loadingSocial[type]) return;
    setLoadingSocial((prev) => ({ ...prev, [type]: true }));
    try {
      await new Promise(res => setTimeout(res, 1500));
      // когда-нибудь...
    } catch (err) {
      console.error(err);
      toast.error(`Ошибка авторизации через ${type}.`);
    } finally {
      setLoadingSocial((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <Root>
      <LeftSide>
        <Overlay />
      </LeftSide>
      <RightSide>
        <FormContainer
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Авторизация
          </Typography>
          <Typography variant="body2" sx={{ color: '#aaa', textAlign: 'center', mb: 3, maxWidth: '220px' }}>
            Введите имя пользователя (email) и пароль, чтобы войти в свою учетную запись. Также можно авторизоваться через социальные сети.
          </Typography>

          {!require2FA ? (
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <StyledTextField
                fullWidth
                label="Email"
                placeholder="Ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <StyledTextField
                fullWidth
                label="Пароль"
                placeholder="Ваш пароль"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mt: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword}>
                        {showPassword ? <Visibility sx={{ color: '#aaa' }} /> : <VisibilityOff sx={{ color: '#aaa' }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <AuthButton type="submit" disabled={loadingAuth}>
                {loadingAuth ? <CircularProgress size={24} color="inherit" /> : 'Авторизация'}
              </AuthButton>
            </form>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Двухфакторная аутентификация
              </Typography>
              <StyledTextField
                fullWidth
                label="2FA токен"
                placeholder="Введите токен"
                value={twoFAToken}
                onChange={(e) => setTwoFAToken(e.target.value)}
              />
              <AuthButton sx={{ mt: 2 }} onClick={handle2FASubmit} disabled={loading2FA}>
                {loading2FA ? <CircularProgress size={24} color="inherit" /> : 'Подтвердить'}
              </AuthButton>
            </Box>
          )}

          {!require2FA && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
              <LinkButton onClick={() => navigate('/register')}>Регистрация</LinkButton>
              <Typography variant="body2" sx={{ color: '#aaa' }}>|</Typography>
              <LinkButton onClick={() => navigate('/reset-password')}>Восстановить пароль</LinkButton>
            </Box>
          )}

          {!require2FA && (
            <>
              <DividerWithText>или</DividerWithText>
              <SocialIcons>
                <SocialButton onClick={() => handleSocialAuth('vk')}>
                  {loadingSocial.vk ? <CircularProgress size={20} color="inherit" /> : <FaVk color="#fff" />}
                </SocialButton>
                <SocialButton onClick={() => handleSocialAuth('patreon')}>
                  {loadingSocial.patreon ? <CircularProgress size={20} color="inherit" /> : <SiPatreon color="#fff" />}
                </SocialButton>
                <SocialButton onClick={() => handleSocialAuth('google')}>
                  {loadingSocial.google ? <CircularProgress size={20} color="inherit" /> : <FaGoogle color="#fff" />}
                </SocialButton>
                <SocialButton onClick={() => handleSocialAuth('discord')}>
                  {loadingSocial.discord ? <CircularProgress size={20} color="inherit" /> : <FaDiscord color="#fff" />}
                </SocialButton>
              </SocialIcons>
            </>
          )}

          <CookieMessage>
            Мы используем файлы cookies для более комфортной работы пользователя. Продолжая просмотр, Вы соглашаетесь с использованием файлов cookies.
          </CookieMessage>
        </FormContainer>
      </RightSide>
    </Root>
  );
}

export default Login;
