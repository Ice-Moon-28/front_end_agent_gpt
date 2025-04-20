import { useState } from 'react'
import { 
  Container, 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import ImageIcon from '@mui/icons-material/Image'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { ChatBox } from './components/ChatBox'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import AgentInstance from './services/agent'
import { actions, state } from './services/store'

// 创建深色主题
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa'
    },
    background: {
      default: '#1a1b1e',
      paper: '#27272a'
    }
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(63, 63, 70, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(63, 63, 70, 0.7)',
            },
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
})

function App() {
  const { t, i18n } = useTranslation()
  const snap = useSnapshot(state)
  const [inputText, setInputText] = useState('')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

   

    // 更新 TaskState 中的 goal 和 messages
    setInputText('')
    setIsLoading(true)

    try {
      if (snap.goal == '') {
        await AgentInstance.start_task(inputText)
      } else {
        await AgentInstance.chat(inputText)
      }

    } catch (error) {
      console.error(t('message.sendError'), error)
    } finally {
      setIsLoading(false)
      actions.setEnableSummariz(true)
    }
  }

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value)
  }

  const handleImageUpload = () => {
    setIsUploadDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsUploadDialogOpen(false)
    setIsDragging(false)
    setUploadProgress(0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t('uploadImage.error.format'))
      return
    }

    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    try {
      AgentInstance.uploadImage(file)
      handleCloseDialog()
    } catch (error) {
      console.error(t('uploadImage.error.upload'), error)
      alert(t('uploadImage.error.upload'))
    } finally {
      clearInterval(interval)
      setUploadProgress(0)
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            bgcolor: 'background.default', 
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {t('appTitle')}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={i18n.language}
                onChange={handleLanguageChange}
                variant="outlined"
                sx={{
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider'
                  }
                }}
              >
                <MenuItem value="en">{t('language.en')}</MenuItem>
                <MenuItem value="zh">{t('language.zh')}</MenuItem>
              </Select>
            </FormControl>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ flex: 1, py: 3, display: 'flex', flexDirection: 'column' }}>
          <ChatBox messages={[...snap.message]} enableSummarize={!isLoading && snap.enableSummarize} />

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={handleImageUpload} 
                disabled={isLoading}
                sx={{ 
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(59, 130, 246, 0.2)'
                  }
                }}
              >
                <ImageIcon />
              </IconButton>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('inputPlaceholder')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <IconButton 
                onClick={handleSend}
                disabled={isLoading}
                sx={{ 
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Box>
          </Paper>
        </Container>

        <Dialog 
          open={isUploadDialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              backgroundImage: 'none'
            }
          }}
        >
          <DialogTitle>{t('uploadImage.title')}</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(59, 130, 246, 0.1)'
                }
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                type="file"
                id="file-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t('uploadImage.dragText')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('uploadImage.supportText')}
              </Typography>
              {uploadProgress > 0 && (
                <Box sx={{ mt: 2 }}>
                  <CircularProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {t('uploadImage.progress', { progress: uploadProgress })}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main'
                }
              }}
            >
              {t('uploadImage.cancel')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}

export default App
