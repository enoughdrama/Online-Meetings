// client/src/Profile.js
// Добавим список групп и возможность выбрать группу

import React, { useContext, useState, useEffect, forwardRef } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
  Box,
  Snackbar,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { motion } from 'framer-motion';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const groupsList = [
  '1ИСИП-1424', '1ИСИП-1024', '1ИСИП-1124', '1ИСИП-1224',
  '1ИСИП-124', '1ИСИП-1324', '1ИСИП-224', '1ИСИП-324',
  '1ИСИП-424', '1ИСИП-524', '1ИСИП-624', '1ИСИП-724',
  '1ИСИП-824', '1ИСИП-924', '1ОИБАС-1524', '1ОИБАС-1624',
  '1ОИБАС-1724', '1ОИБАС-1824', '1ОИБАС-1924', '1ОИБАС-2024',
  '2ИС-1523', '2ИСИП-1023', '2ИСИП-123', '2ИСИП-223',
  '2ИСИП-323', '2ИСИП-423', '2ИСИП-523', '2ИСИП-623',
  '2ИСИП-723', '2ИСИП-823', '2ИСИП-923', '2ОИБАС-1123',
  '2ОИБАС-1223', '2ОИБАС-1323', '2ОИБАС-1423', '3ИСИП-122',
  '3ИСИП-222', '3ИСИП-322', '3ИСИП-422', '3ИСИП-522',
  '3ИСИП-622', '3ИСИП-722', '3ИСИП-822', '3ОИБАС-1022',
  '3ОИБАС-1122', '3ОИБАС-1222', '3ОИБАС-1322', '3ОИБАС-922',
  '4ИСИП-121', '4ИСИП-221', '4ИСИП-321', '4ИСИП-421',
  '4ИСИП-521', '4ИСИП-621', '4ИСИП-721', '4ИСИП-821',
  '4ОИБАС-1021', '4ОИБАС-1121', '4ОИБАС-1221', '4ОИБАС-921'
];

function Profile() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [tempSecret, setTempSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:5009/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setEmail(res.data.email);
        setTwoFactorEnabled(!!res.data.twoFA?.enabled);
        if (res.data.group) {
          setSelectedGroup(res.data.group);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const updateEmail = () => {
    axios
      .patch(
        `http://localhost:5009/api/users/${user.id}/email`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setAlert({ open: true, message: 'Email обновлен', severity: 'success' });
      })
      .catch(() => {
        setAlert({ open: true, message: 'Ошибка обновления Email', severity: 'error' });
      });
  };

  const updatePassword = () => {
    if (newPassword.trim() === '') {
      setAlert({ open: true, message: 'Укажите новый пароль', severity: 'warning' });
      return;
    }

    axios
      .patch(
        `http://localhost:5009/api/users/${user.id}/password`,
        { current: currentPassword, new: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setAlert({ open: true, message: 'Пароль обновлен', severity: 'success' });
        setCurrentPassword('');
        setNewPassword('');
      })
      .catch(() => {
        setAlert({ open: true, message: 'Ошибка обновления пароля', severity: 'error' });
      });
  };

  const updateAvatar = () => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    axios
      .post(`http://localhost:5009/api/users/${user.id}/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setProfile({ ...profile, avatarUrl: res.data.avatarUrl });
        setAlert({ open: true, message: 'Аватар обновлен', severity: 'success' });
      })
      .catch(() => {
        setAlert({ open: true, message: 'Ошибка обновления аватара', severity: 'error' });
      });
  };

  const setup2FA = () => {
    axios
      .get(`http://localhost:5009/api/users/${user.id}/2fa/setup`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setQrCodeUrl(res.data.qrCode);
        setTempSecret(res.data.secret);
      })
      .catch(() => {
        setAlert({ open: true, message: 'Ошибка настройки 2FA', severity: 'error' });
      });
  };

  const verify2FA = () => {
    axios
      .post(
        `http://localhost:5009/api/users/${user.id}/2fa/verify`,
        { token: twoFactorToken, secret: tempSecret },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setAlert({ open: true, message: '2FA активирована', severity: 'success' });
        setTwoFactorEnabled(true);
        setQrCodeUrl('');
        setTwoFactorToken('');
      })
      .catch(() => {
        setAlert({ open: true, message: 'Ошибка активации 2FA', severity: 'error' });
      });
  };

  const disable2FA = () => {
    axios
      .post(
        `http://localhost:5009/api/users/${user.id}/2fa/disable`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setAlert({ open: true, message: '2FA отключена', severity: 'success' });
        setTwoFactorEnabled(false);
      })
      .catch(() => {
        setAlert({ open: true, message: 'Ошибка отключения 2FA', severity: 'error' });
      });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const updateGroup = () => {
    axios
      .patch(
        `http://localhost:5009/api/users/${user.id}`,
        { updateFields: { group: selectedGroup } },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setAlert({ open: true, message: 'Группа обновлена', severity: 'success' });
        setProfile(res.data.user);
      })
      .catch(() => {
        setAlert({ open: true, message: 'Ошибка обновления группы', severity: 'error' });
      });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return <Typography variant="h5">Загрузка профиля...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>

      <Paper elevation={4} sx={{ p: 4, borderRadius: '15px' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={`http://localhost:5009${profile.avatarUrl || '/static/default-avatar.png'}`}
                sx={{ width: 120, height: 120, margin: '0 auto' }}
              />
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                {profile.username}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<EditIcon />}
                sx={{ mt: 2 }}
              >
                Изменить аватар
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                />
              </Button>
              {avatarFile && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  sx={{ mt: 2 }}
                  onClick={updateAvatar}
                >
                  Сохранить аватар
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Email</Typography>
                <IconButton onClick={() => setEditingEmail(!editingEmail)}>
                  <EditIcon />
                </IconButton>
              </Box>
              {editingEmail ? (
                <>
                  <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={updateEmail}
                    startIcon={<SaveIcon />}
                  >
                    Сохранить Email
                  </Button>
                </>
              ) : (
                <Typography sx={{ mt: 2 }}>{email}</Typography>
              )}
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center">
                <VpnKeyIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Изменить пароль</Typography>
              </Box>
              <TextField
                label="Текущий пароль"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Новый пароль"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={updatePassword}
                startIcon={<SaveIcon />}
              >
                Обновить пароль
              </Button>
            </Paper>

            {/* Выбор группы */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6">Выбор Группы</Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="group-label">Группа</InputLabel>
                <Select
                  labelId="group-label"
                  label="Группа"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  {groupsList.map((group) => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                startIcon={<SaveIcon />}
                onClick={updateGroup}
              >
                Сохранить группу
              </Button>
            </Paper>

            {/* 2FA */}
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Двухфакторная аутентификация (2FA)</Typography>
              </Box>
              {!twoFactorEnabled ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={setup2FA}
                  >
                    Настроить 2FA
                  </Button>
                  {qrCodeUrl && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography sx={{ mt: 2 }}>
                        Сканируйте этот QR-код в приложении аутентификации
                      </Typography>
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        style={{
                          marginTop: '20px',
                          border: '5px solid #f1f1f1',
                          borderRadius: '10px',
                        }}
                      />
                      <TextField
                        label="Введите токен из приложения"
                        value={twoFactorToken}
                        onChange={(e) => setTwoFactorToken(e.target.value)}
                        fullWidth
                        sx={{ mt: 2 }}
                      />

                      <Typography sx={{ mt: 2 }}>
                        Или введите код: {tempSecret}
                      </Typography>

                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={verify2FA}
                      >
                        Активировать 2FA
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <Typography sx={{ mt: 2 }}>2FA уже активирована на вашем аккаунте.</Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ mt: 2 }}
                    onClick={disable2FA}
                  >
                    Отключить 2FA
                  </Button>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile;
