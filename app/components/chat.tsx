import React, { useEffect, useState, useRef, useCallback } from "react";
import AccountCircle from '@mui/icons-material/AccountCircle';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { useReadChat } from "../hooks/chatHooks";
import { Box, Stack, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CachedIcon from '@mui/icons-material/Cached';
import type { ChatType } from "../ts/chat";

interface ChatProps {
    chat: ChatType[];
    chatStop: boolean;
    chatState: boolean;
    onCease: (readChat: string) => void;
    onReload: () => void;
}
const Chat = (props: ChatProps) => {
    const { chat, chatStop, chatState, onCease, onReload } = props;
    const boxShowRef = useRef(null);

    // 停止生成状态
    const [chatCease, setChatCease] = useState(false);

    // 间隙读字
    const { readChat } = useReadChat({ chat, chatStop, chatCease, chatState });

    useEffect(() => {
        // 滚动条到最底部
        boxShowRef.current.scrollTop = boxShowRef.current.scrollHeight - boxShowRef.current.clientHeight;
        if (chatState) {
            setChatCease(false);
        }
    }, [readChat, chatState]);

    // 角色样式
    const Role = styled('h4')`
    font-family: ${({ theme }) => theme.typography.subtitle2};
    `;

    // 内容样式
    const Content = styled('span')`
    color: ${({ theme }) => theme.palette.text.secondary};
    font-family: ${({ theme }) => theme.typography.body2};
    `

    // 停止生成样式
    const Cease = styled(StopCircleIcon)({
        color: '#007bf3',
        width: 32,
        height: 32
    });

    // 重新生成样式
    const Reload = styled(CachedIcon)({
        color: '#007bf3',
        width: 32,
        height: 32
    });

    // 停止生成触发
    const cease = useCallback(() => {
        setChatCease(true);
        onCease(readChat);
    }, [onCease, readChat])

    // 重新生成触发
    const reload = () => {
        onReload();
    }

    // 暂停生成
    // 继续生成

    return (
        <Box ref={boxShowRef} display="flex" flexDirection="column" overflow="auto" height={'80vh'} marginBottom={'10px'}>
            {
                chat.map((item, index) => {
                    return (
                        <Stack key={index} direction="row" spacing={1} marginBottom={'20px'}>
                            {
                                item.role === 'ChatGPT' ? <Image width={24}
                                    alt="ChatGPT Icon"
                                    height={24} src="https://cdn.oaistatic.com/_next/static/media/favicon-32x32.630a2b99.png" /> :
                                    <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                            }
                            <Stack spacing={1}>
                                <Role>{item.role}</Role>
                                <Content><ReactMarkdown>{item.role === 'ChatGPT' && index === chat.length - 1 ? readChat : item.content}</ReactMarkdown></Content>
                                {
                                    index === chat.length - 1 && readChat.length > 0 && !chat[chat.length - 1].loading ?
                                        readChat.length !== chat[chat.length - 1].content.length ?
                                            <Stack direction="row" spacing={1}>
                                                <span style={{ color: "#007bf3" }}>
                                                    停止生成
                                                    <IconButton onClick={cease}>
                                                        <Cease />
                                                    </IconButton>
                                                </span>
                                            </Stack>
                                            : <span style={{ color: "#007bf3" }}>
                                                重新生成
                                                <IconButton onClick={reload}>
                                                    <Reload />
                                                </IconButton>
                                            </span>
                                        : null
                                }
                            </Stack>
                        </Stack>
                    )
                })
            }
        </Box>
    )
};

export default React.memo(Chat);