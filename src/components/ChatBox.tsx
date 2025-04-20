import { Box, Typography, Paper, Button } from '@mui/material'
import { Message, MessageType } from '../types/message'
import StarIcon from '@mui/icons-material/Star'
import AddTaskIcon from '@mui/icons-material/AddTask'
import AssessmentIcon from '@mui/icons-material/Assessment'
import PsychologyIcon from '@mui/icons-material/Psychology'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ReactMarkdown from 'react-markdown'
import { useTranslation } from 'react-i18next'
import AgentInstance from '../services/agent'

interface ChatBoxProps {
  messages: Message[]
  enableSummarize: boolean
}

const MessageIcon = ({ type }: { type: MessageType }) => {
  switch (type) {
    case MessageType.TASK_ADDED:
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <AddTaskIcon sx={{ 
            color: '#ff9800',
            fontSize: 24,
            filter: 'drop-shadow(0 0 4px rgba(255, 152, 0, 0.5))'
          }} />
          <StarIcon sx={{ 
            color: '#ffd700',
            fontSize: 12,
            position: 'absolute',
            top: -4,
            right: -4,
            filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))'
          }} />
        </Box>
      )
    case MessageType.STARTING_TASK:
      return (
        <StarIcon sx={{ 
          color: '#ffd700',
          fontSize: 24,
          filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.5))',
          animation: 'spin 2s linear infinite',
          '@keyframes spin': {
            '0%': {
              transform: 'rotate(0deg)'
            },
            '100%': {
              transform: 'rotate(360deg)'
            }
          }
        }} />
      )
    case MessageType.GENERATED_REPORT:
      return (
        <AssessmentIcon sx={{ 
          color: '#5c6bc0',  // Indigo color
          fontSize: 24,
          filter: 'drop-shadow(0 0 4px rgba(92, 107, 192, 0.5))',
          animation: 'slideIn 0.5s ease-out',
          '@keyframes slideIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-10px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }} />
      )
    case MessageType.ANALYZING_TASK:
      return (
        <PsychologyIcon sx={{ 
          color: '#2196f3',
          filter: 'drop-shadow(0 0 4px rgba(33, 150, 243, 0.5))',
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)'
            },
            '50%': {
              transform: 'scale(1.1)'
            },
            '100%': {
              transform: 'scale(1)'
            }
          }
        }} />
      )
    case MessageType.EXECUTING_TASK:
      return (
        <CheckCircleIcon sx={{ 
          color: '#4caf50',
          filter: 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.5))',
          animation: 'checkmark 0.5s ease-in-out',
          '@keyframes checkmark': {
            '0%': {
              transform: 'scale(0)'
            },
            '50%': {
              transform: 'scale(1.2)'
            },
            '100%': {
              transform: 'scale(1)'
            }
          }
        }} />
      )
    default:
      return null
  }
}

const MessagePrefix = ({ type }: { type: MessageType }) => {
  switch (type) {
    case MessageType.TASK_ADDED:
      return <Typography component="span" sx={{ color: 'white', fontWeight: 600 }}>Task Added: </Typography>
    case MessageType.STARTING_TASK:
      return (
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="span" sx={{ color: 'white', fontWeight: 600 }}>Starting task: </Typography>
        </Box>
      )
    case MessageType.GENERATED_REPORT:
      return <Typography component="span" sx={{ color: 'white', fontWeight: 600 }}>Analysis Report: </Typography>
    case MessageType.ANALYZING_TASK:
      return <Typography component="span" sx={{ color: 'white', fontWeight: 600 }}>Analyze Task: </Typography>
    case MessageType.EXECUTING_TASK:
      return <Typography component="span" sx={{ color: 'white', fontWeight: 600 }}>Executed Task: </Typography>
    default:
      return null
  }
}

export const ChatBox = ({ messages, enableSummarize }: ChatBoxProps) => {
  const { t } = useTranslation()
  
  const getMessageStyle = (type: MessageType, role: string) => {
    if (role === 'user') {
      return {
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }
    }

    switch (type) {
      case MessageType.EXECUTING_TASK:
        return {
          bgcolor: '#333',
          border: '1px solid #4caf50',
          boxShadow: '0 0 10px rgba(76, 175, 80, 0.2)'
        }
      case MessageType.ANALYZING_TASK:
        return {
          bgcolor: '#333',
          border: '1px solid #2196f3',
          boxShadow: '0 0 10px rgba(33, 150, 243, 0.2)'
        }
      case MessageType.STARTING_TASK:
        return {
          bgcolor: '#333',
          border: '1px solid #ffd700',
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)'
        }
      case MessageType.TASK_ADDED:
        return {
          bgcolor: '#333',
          border: '1px solid #ff9800',
          boxShadow: '0 0 10px rgba(255, 152, 0, 0.2)'
        }
      case MessageType.GENERATED_REPORT:
        return {
          bgcolor: '#333',
          border: '1px solid #5c6bc0',
          boxShadow: '0 0 10px rgba(92, 107, 192, 0.2)'
        }
      default:
        return {
          bgcolor: '#333',
          border: '1px solid',
          borderColor: 'divider'
        }
    }
  }
  
  const renderMessageContent = (message: Message) => {
    if (message.type === MessageType.EXECUTING_TASK || message.type === MessageType.GENERATED_REPORT) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'white',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {message.text}
          </Typography>
          {message.detail != null && (
            <Box 
              sx={{ 
                mt: 1,
                p: 2,
                borderRadius: 1,
                bgcolor: message.type === MessageType.GENERATED_REPORT 
                  ? 'rgba(92, 107, 192, 0.1)' 
                  : 'transparent',
                border: message.type === MessageType.GENERATED_REPORT 
                  ? '1px solid rgba(92, 107, 192, 0.2)' 
                  : 'none'
              }}
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <Typography 
                      variant={message.type === MessageType.GENERATED_REPORT ? "body1" : "body2"}
                      sx={{ 
                        color: message.type === MessageType.GENERATED_REPORT 
                          ? 'white' 
                          : 'rgba(255, 255, 255, 0.7)',
                        mb: 1,
                        lineHeight: message.type === MessageType.GENERATED_REPORT ? 1.7 : 1.5
                      }}
                    >
                      {children}
                    </Typography>
                  ),
                  h1: ({ children }) => (
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 600,
                        mb: 2 
                      }}
                    >
                      {children}
                    </Typography>
                  ),
                  h2: ({ children }) => (
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 600,
                        mb: 1.5 
                      }}
                    >
                      {children}
                    </Typography>
                  ),
                  ul: ({ children }) => (
                    <Box 
                      component="ul" 
                      sx={{ 
                        pl: 2,
                        '& li': {
                          mb: 0.5,
                          color: message.type === MessageType.GENERATED_REPORT 
                            ? 'white' 
                            : 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    >
                      {children}
                    </Box>
                  )
                }}
              >
                {message.detail}
              </ReactMarkdown>
            </Box>
          )}
        </Box>
      )
    }

    return (
      <Typography 
        variant="body1" 
        sx={{ 
          color: message.role === 'user' ? 'text.primary' : 'white',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {message.text}
      </Typography>
    )
  }

  return (
    <Box 
      sx={{ 
        flex: 1, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mb: 2,
        position: 'relative'
      }}
    >
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            width: '100%',
            '@keyframes fadeIn': {
              from: {
                opacity: 0,
                transform: 'translateY(20px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            },
            animation: 'fadeIn 1s ease-out'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              maxWidth: '75%',
              ...getMessageStyle(message.type, message.role)
            }}
          >
            {message.role === 'assistant' && (
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <MessageIcon type={message.type} />
              </Box>
            )}
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {message.role === 'assistant' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MessagePrefix type={message.type} />
                </Box>
              )}
              
              {renderMessageContent(message)}

              {message.imageUrl && (
                <Box 
                  component="img"
                  src={message.imageUrl}
                  alt="Uploaded"
                  sx={{
                    mt: 2,
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 1
                  }}
                />
              )}
            </Box>
          </Paper>
        </Box>
      ))}

      {enableSummarize && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            py: 2,
            // background: 'linear-gradient(180deg, transparent 0%, rgba(18, 18, 18, 0.8) 20%)'
          }}
        >
          <Button
            variant="contained"
            sx={{
              bgcolor: '#4a76cf',
              '&:hover': {
                bgcolor: '#3d63b9'
              },
              borderRadius: 2,
              px: 4
            }}
            onClick={() => { AgentInstance.summarize() }}
          >
            <Typography variant="body1" sx={{ mr: 1 }}>
              Click here to summarize the conversation!
            </Typography>
            <Typography
              variant="button"
              sx={{
                bgcolor: '#2c4b8f',
                px: 2,
                py: 0.5,
                borderRadius: 1
              }}
            >
              Summarize
            </Typography>
          </Button>
        </Box>
      )}
    </Box>
  )
} 