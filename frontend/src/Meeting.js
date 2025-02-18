import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  IconButton,
  Paper,
  CircularProgress,
  Box,
  Drawer,
  List,
  ListItem,
  TextField,
  Tooltip,
  LinearProgress,
  Avatar,
  Divider,
  Snackbar,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import './Meeting.css';

const customScrollbar = {
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#3f51b5',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#303f9f',
  },
};

function Meeting() {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [meeting, setMeeting] = useState(null);
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const [micOn, setMicOn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [peerSpeakingStates, setPeerSpeakingStates] = useState({});
  const [mediaReady, setMediaReady] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const notificationSound = new Audio('http://localhost:5009/static/notify.mp3');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        const res = await axios.get(`http://localhost:5009/api/meetings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeeting(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching meeting data', err);
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [id, token]);

  useEffect(() => {
    let isUnmounting = false;

    const initializeSocketAndMedia = async () => {
      try {
        if (socketRef.current) return;
        socketRef.current = io('http://localhost:5009/', {
          reconnectionAttempts: 5,
          transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
          if (isUnmounting) return;
          console.log('Socket connected:', socketRef.current.id);
        });

        socketRef.current.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (isUnmounting) return; 
        mediaStreamRef.current = mediaStream;

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(mediaStream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 2048;

        function detectSpeaking() {
          if (isUnmounting || !analyserRef.current) return;
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = dataArray.reduce((a,b) => a+b, 0);
          const average = sum / dataArray.length;
          const speakingThreshold = 2;
          setIsSpeaking(average > speakingThreshold);
          requestAnimationFrame(detectSpeaking);
        }

        detectSpeaking();

        socketRef.current.emit('join-room', id, {
          socketId: socketRef.current.id,
          userId: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          micOn: true,
        });

        socketRef.current.on('chat-history', (history) => {
          if (!isUnmounting) setMessages(history);
        });

        socketRef.current.on('receive-message', (message) => {
          if (isUnmounting) return;
          setMessages((prevMessages) => [...prevMessages, message]);
          const stateMessage = message.content.includes('/upload') ? "Вложение" : message.content;
          setNotificationMessage(`Новое сообщение от пользователя ${message.user}: ${stateMessage}`);
          setNotificationOpen(true);
          notificationSound.play();
          setTimeout(() => {
            setNotificationOpen(false);
          }, 3000);
        });

        socketRef.current.on('all-users', (users) => {
          if (isUnmounting) return;
          setPeers((prevPeers) => {
            // Удаляем пиров, которых больше нет в списке
            prevPeers.forEach((peerObj) => {
              if (!users.some((u) => u.socketId === peerObj.peerID)) {
                if (peerObj.peer) peerObj.peer.destroy();
              }
            });

            const updatedPeers = users
              .filter((userInfo) => userInfo.socketId !== socketRef.current.id)
              .map((userInfo) => {
                let existingPeer = prevPeers.find((p) => p.peerID === userInfo.socketId);
                if (!existingPeer) {
                  if (!mediaStreamRef.current || mediaStreamRef.current.getTracks().length === 0) {
                    console.warn("Media stream not available, skip peer creation");
                    return null;
                  }
                  const peer = createPeer(userInfo.socketId, mediaStreamRef.current);
                  return { peerID: userInfo.socketId, peer, info: userInfo, signalHistory: [], answered: false };
                } else {
                  return {
                    ...existingPeer,
                    info: userInfo,
                    signalHistory: existingPeer.signalHistory || [],
                    answered: existingPeer.answered || false
                  };
                }
              })
              .filter(Boolean);

            return updatedPeers;
          });
        });

        socketRef.current.on('signal', (data) => {
          const { from, signal } = data;
          setPeers((prevPeers) => {
            let peerObj = prevPeers.find((p) => p.peerID === from);
        
            if (!peerObj) {
              // Нет peerObj? Значит, мы получили сигнал от участника, для которого ещё не создали peer.
              // Если это ответ на наш оффер — мы инициатор, peer должен был уже быть создан.
              // Если это оффер от другого участника — мы должны создать peer как принимающая сторона.
              const peer = handlePeer(from, mediaStreamRef.current);
              peerObj = { peerID: from, peer, signalHistory: [], answered: false };
              prevPeers = [...prevPeers, peerObj];
            }
        
            // Если это answer и уже применён ранее, игнорируем повторный answer
            if (signal.type === 'answer' && peerObj.answered) {
              console.warn('Repeated answer ignored');
              return prevPeers;
            }
        
            if (signal.type === 'answer') {
              peerObj.answered = true;
            }
        
            try {
              peerObj.peer.signal(signal);
            } catch (err) {
              console.error('Error applying signal:', err);
            }
        
            return [...prevPeers];
          });
        });
        
        socketRef.current.on('update-settings', (updatedInfo) => {
          if (isUnmounting) return;
          setPeers((prevPeers) =>
            prevPeers.map((p) => (p.peerID === updatedInfo.socketId ? { ...p, info: updatedInfo } : p))
          );
        });

        setMediaReady(true);

      } catch (err) {
        console.error('Error initializing socket or media devices', err);
        setMediaError(true);
      }
    };

    initializeSocketAndMedia();

    const handleCleanUp = () => {
      isUnmounting = true;
      const stream = mediaStreamRef.current;

      peers.forEach((peerObj) => {
        if (peerObj.peer) {
          peerObj.peer.destroy();
        }
      });

      const remoteAudioElements = document.querySelectorAll('audio');
      remoteAudioElements.forEach((audioElement) => {
        audioElement.pause();
        audioElement.srcObject = null;
        audioElement.remove();
      });

      if (socketRef.current) {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setMicOn(false);
          socketRef.current.emit('update-settings', {
            socketId: socketRef.current.id,
            micOn: false,
          });
        }
        socketRef.current.emit('leave-room');
        socketRef.current.disconnect();
      }
    };

    // Вызываем очистку только при размонтировании компонента
    return () => {
      handleCleanUp();
    };
  }, [id, user, token]);

  function createPeer(userToSignal, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current.emit('signal', { to: userToSignal, signal });
    });

    peer.on('stream', (remoteStream) => {
      const peerID = userToSignal;
      const audioElement = document.createElement('audio');
      audioElement.srcObject = remoteStream;
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(remoteStream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 2048;

      function detectSpeaking() {
        if (!analyser) return;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        let sum = dataArray.reduce((a,b)=>a+b,0);
        const average = sum / dataArray.length;
        const speakingThreshold = 10;

        setPeerSpeakingStates((prevStates) => ({
          ...prevStates,
          [peerID]: average > speakingThreshold,
        }));

        requestAnimationFrame(detectSpeaking);
      }

      detectSpeaking();
    });

    return peer;
  }

  function handlePeer(from, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current.emit('signal', { to: from, signal });
    });

    peer.on('stream', (remoteStream) => {
      const peerID = from;
      const audioElement = document.createElement('audio');
      audioElement.srcObject = remoteStream;
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(remoteStream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 2048;

      function detectSpeaking() {
        if (!analyser) return;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        let sum = dataArray.reduce((a,b)=>a+b,0);
        const average = sum / dataArray.length;
        const speakingThreshold = 10;

        setPeerSpeakingStates((prevStates) => ({
          ...prevStates,
          [peerID]: average > speakingThreshold,
        }));

        requestAnimationFrame(detectSpeaking);
      }

      detectSpeaking();
    });

    return peer;
  }

  const toggleMic = () => {
    if (mediaStreamRef.current && mediaStreamRef.current.getAudioTracks().length > 0) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
      socketRef.current.emit('update-settings', {
        socketId: socketRef.current.id,
        micOn: audioTrack.enabled,
      });
    }
  };

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await axios.post('http://localhost:5009/api/upload', formData, {
          headers: { Authorization: `Bearer ${token}` },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        });

        const message = {
          user: user.username,
          content: res.data.fileUrl,
          attachment: true,
          attachmentName: file.name,
          timestamp: new Date().toISOString(),
        };

        socketRef.current.emit('send-message', message);
        setUploadProgress(0);
      } catch (err) {
        console.error('Error uploading attachment', err);
      } finally {
        setUploading(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const message = { user: user.username, content: newMessage, timestamp: new Date().toISOString() };
      socketRef.current.emit('send-message', message);
      setNewMessage('');
      scrollToBottom();
    }
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  if (loading || !mediaReady) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!meeting) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 5 }}>
          Встреча не найдена
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom sx={{ mt: 2, textAlign: 'center', color: '#333', marginBottom: '45px' }}>
        Встреча: {meeting.name}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={4}
            className="video-box"
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              width: '100%',
              height: 'auto',
            }}
          >
            <Box
              className="default-avatar"
              sx={{
                position: 'relative',
                borderRadius: '15px',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  borderRadius: '15px',
                  boxShadow: isSpeaking ? 'inset 0 0 0px 4px #6c75e6' : 'none',
                  transition: 'box-shadow 0.2s ease-out',
                },
              }}
            >
              <img
                src={`http://localhost:5009${user.avatarUrl || '/static/default-avatar.png'}`}
                alt="User Avatar"
                style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
              />
            </Box>

            <Typography
              align="center"
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '10px',
                padding: '4px 8px',
                color: 'white',
              }}
            >
              {user.username} (Вы)
            </Typography>

            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '10px',
                padding: '8px',
              }}
            >
              <IconButton onClick={toggleMic}>
                {micOn ? (
                  <MicIcon sx={{ color: 'white', fontSize: 24 }} />
                ) : (
                  <MicOffIcon sx={{ color: 'red', fontSize: 24 }} />
                )}
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        {peers.map(({ peerID, info }, index) => {
          const isPeerSpeaking = peerSpeakingStates[peerID];
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={4}
                className="video-box"
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '15px',
                  backdropFilter: 'blur(10px)',
                  width: '100%',
                  height: 'auto',
                }}
              >
                <Box
                  className="default-avatar"
                  sx={{
                    position: 'relative',
                    borderRadius: '15px',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      borderRadius: '15px',
                      boxShadow: isPeerSpeaking ? 'inset 0 0 0px 4px #6c75e6' : 'none',
                      transition: 'box-shadow 0.2s ease-out',
                    },
                  }}
                >
                  <img
                    src={`http://localhost:5009${info.avatarUrl || '/static/default-avatar.png'}`}
                    alt={`${info.username}'s Avatar`}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
                  />
                </Box>

                <Typography
                  align="center"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 16,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    padding: '4px 8px',
                    color: 'white',
                  }}
                >
                  {info.username}
                </Typography>

                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    padding: '4px',
                  }}
                >
                  <IconButton sx={{ pointerEvents: 'none' }}>
                    {info.micOn ? (
                      <MicIcon sx={{ color: 'white', fontSize: 18 }} />
                    ) : (
                      <MicOffIcon sx={{ color: 'red', fontSize: 18 }} />
                    )}
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <IconButton
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          backgroundColor: '#3f51b5',
          color: 'white',
          '&:hover': { backgroundColor: '#303f9f' },
        }}
      >
        <ChatIcon sx={{ fontSize: 30 }} />
      </IconButton>

      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={toggleChat}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 350 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 2,
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            ...customScrollbar,
          },
        }}
      >
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, ...customScrollbar }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: '#ffffff' }}>
            Group Chat
          </Typography>
          <Divider sx={{ backgroundColor: '#424242' }} />
          <List>
            {messages.map((message, index) => (
              <ListItem key={index} sx={{ display: 'block', marginTop: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: message.user === user.username ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    src={
                      message.user === user.username
                        ? `http://localhost:5009/api${user.avatarUrl}`
                        : ''
                    }
                    alt={message.user}
                    sx={{
                      width: 24,
                      height: 24,
                      mr: message.user === user.username ? 0 : 1,
                      ml: message.user === user.username ? 1 : 0,
                    }}
                  />
                  <Box
                    sx={{
                      backgroundColor: message.user === user.username ? '#3f51b5' : '#424242',
                      borderRadius: 2,
                      padding: 1,
                      maxWidth: '80%',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {message.user}
                    </Typography>
                    {message.attachment ? (
                      <a
                        href={message.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#81d4fa',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <AttachFileIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {message.attachmentName}
                      </a>
                    ) : (
                      <Typography variant="body2">{message.content}</Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', textAlign: 'right', color: '#b0bec5' }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Divider sx={{ marginBottom: 2, backgroundColor: '#424242' }} />

        {uploading && (
          <Box sx={{ width: '100%', mb: 1 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', mt: 0.5 }}>
              Загрузка: {uploadProgress}%
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="file"
            accept="image/*,video/*,application/pdf,application/msword"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleAttachmentUpload}
          />
          <Tooltip title="Прикрепить файл">
            <IconButton onClick={() => fileInputRef.current.click()} sx={{ color: '#ffffff' }}>
              <AttachFileIcon />
            </IconButton>
          </Tooltip>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            sx={{
              flexGrow: 1,
              backgroundColor: '#424242',
              borderRadius: '4px',
              mr: 1,
              input: { color: '#ffffff' },
            }}
          />
          <Tooltip title="Send">
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              sx={{
                backgroundColor: '#707070',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#808080' },
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Drawer>

      <Snackbar
        open={notificationOpen}
        autoHideDuration={3000}
        onClose={handleNotificationClose}
        message={notificationMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </Container>
  );
}

export default Meeting;
