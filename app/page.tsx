
'use client'

import React, { KeyboardEventHandler } from "react";
import { useState, useRef } from "react";

import { Container, Box, Stack, TextField, IconButton, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import PendingIcon from '@mui/icons-material/Pending';

import Chat from './components/chat';

import { chatApi } from "./api/openAi";

import type { ChatType, MessageState } from './ts/chat';
import type { OpenAiRes } from "./ts/openAiApi";

const ChatAi = () => {

  // 系统用户角色
  const role = 'user';

  // 默认聊天
  const defaultChat = [
    {
      role: 'ChatGPT',
      content: '你好啊,我能帮你做什么吗?'
    }]

  // 聊天记录
  const [chat, setChat] = useState<ChatType[]>(defaultChat);

  // 弹窗消息
  const [messageState, setMessageState] = useState<MessageState>({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message: '',
  })

  // 聊天状态
  const [chatState, setChatState] = useState<boolean>(false);

  // 取消生成
  const [chatStop, setChatStop] = useState<boolean>(false);

  // 弹窗配置
  const { open, vertical, horizontal, message } = messageState;
  const inputRef = useRef(null);

  // 当前用户发送聊天内容
  const [curContent, setCurContent] = useState(null);

  // 弹窗消息
  const handleClick = (newState: Pick<MessageState, 'horizontal' | 'vertical'>) => {
    setMessageState({ ...newState, open: true, message: '无内容，请输入' });
    setTimeout(() => {
      setMessageState({ ...messageState, open: false });
    }, 1000)
  };

  // 生成中
  const chatIng = async (role: string, content: string, reload?: boolean) => {
    setChatState(true);
    setChatStop(false);
    setChat((prevChat) => {
      const loadingChat = { role: 'ChatGPT', content: 'Loading...', loading: true, chatStop: false };
      if (reload) {
        prevChat[prevChat.length - 1] = loadingChat;
        return [...prevChat]
      }
      return [...prevChat, { role, content }, loadingChat];
    })
  }

  // 生成完成
  const chatAPiFun = async (role: string, content: string) => {
    if (chat[chat.length - 1].chatStop === true) return;
    const res: OpenAiRes = await chatApi(role, content);
    console.log(res);
    if (res) {
      console.log('')
      const resContent = res.choices ? res.choices[0].message.content : res.message;
      setChat((prevChat) => {
        if (!prevChat[prevChat.length - 1].chatStop) {
          prevChat[prevChat.length - 1] = {
            role: 'ChatGPT',
            content: resContent,
            chatStop: false,
          }
        }
        return [...prevChat];
      })
    }
  }

  // 提交交互数据，更新聊天
  const subMit = () => {
    const content = inputRef.current.value;
    if (content.trim() === '') return handleClick({ vertical: 'top', horizontal: 'center' });
    setCurContent(content);
    chatIng(role, content);
    chatAPiFun(role, content);
  }

  // 取消生成
  const stopMit = async () => {
    setChatStop(true);
    setChat((prev) => {
      prev[prev.length - 1] = {
        role: 'ChatGPT',
        content: '已取消生成',
        chatStop: true
      }
      return [
        ...prev,
      ]
    });
  }

  // 监听回车键
  const handleKeyDown = (event: { key: string; preventDefault: () => void; }) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      subMit();
    }
  };

  // 发送图标样式
  const ArrowUpwardIconBg = styled(ArrowUpwardIcon)({
    background: 'rgba(178, 176, 176, 0.6)',
    color: 'white',
    borderRadius: '10px',
    width: 32,
    height: 32
  });

  // 发送ing图标样式
  const PendingIconBg = styled(PendingIcon)({
    background: 'rgba(178, 176, 176, 0.6)',
    color: 'white',
    borderRadius: '10px',
    width: 32,
    height: 32
  });

  // 多文本框表单样式
  const CssTextField = styled(TextField)({
    '& div': {
      borderRadius: '20px',
      outline: 'none',
    },
    '& label': {
      lineHeight: '48px'
    }
  });


  return (
    <Container maxWidth="md">
      <Snackbar anchorOrigin={{ vertical, horizontal }}
        open={open}
        message={message}
        key={vertical + horizontal}
      />
      <Chat chat={chat} chatStop={chatStop} chatState={chatState} onCease={(val) => setChat((prev) => {
        setChatState(false);
        prev[prev.length - 1] = {
          role: 'ChatGPT',
          content: val,
        }
        return [
          ...prev,
        ]
      })} onReload={() => {
        if (chat.length === 1) {
          chatIng(role, curContent, true);
          setChat(defaultChat);
          return;
        };
        chatIng(role, curContent, true);
        chatAPiFun(role, curContent);
      }} />
      <Box>
        <CssTextField
          fullWidth
          id="outlined-multiline-flexible"
          label="Message ChatGPT... "
          InputLabelProps={{
            style: { textAlign: 'center' }
          }}
          multiline
          maxRows={3}
          inputRef={inputRef}
          onKeyDown={handleKeyDown}
          autoFocus={chat.length > 1 ? true : false}
          InputProps={{
            endAdornment: (
              <React.Fragment>
                {
                  chat[chat.length - 1].loading ?
                    <IconButton onClick={stopMit}>
                      <PendingIconBg />
                    </IconButton> :
                    <IconButton onClick={subMit}>
                      <ArrowUpwardIconBg />
                    </IconButton>
                }
              </React.Fragment>
            ),
          }}
        >
        </CssTextField>
      </Box>
    </Container >
  );
}

export default ChatAi;
