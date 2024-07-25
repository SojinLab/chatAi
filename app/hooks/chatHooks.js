
import { useState, useEffect } from "react";

const useReadChat = (args) => {
    const { chat, chatStop, chatCease, chatState } = args;
    // 间隙读字
    const [readChat, setReadChat] = useState('');
    useEffect(() => {
        if (chatStop) { setReadChat('已取消生成'); return; }
        let index = 0;
        let interval = null;
        if (chatState) {
            setReadChat('');
        }
        interval = setInterval(() => {
            if (index >= chat[chat.length - 1].content.length || chatCease) {
                clearInterval(interval);
            } else {
                // 间隔读出
                const curIndex = index;
                setReadChat((prev) => prev + chat[chat.length - 1].content[curIndex]);
                index++;
            }
        }, 30);
        return () => clearInterval(interval);
    }, [chat, chatCease, chatState, chatStop]);

    return (
        { readChat }
    )
};

export {
    useReadChat
}