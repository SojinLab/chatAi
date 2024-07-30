export const chatApi = (role: string, content: string) => {
    return fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": `${SITE_URL}`,
            "X-Title": `${SITE_NAME}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": AI_MODEL,
            "messages": [
                { role, content }
            ],
        })
    }).then(res => {
        if (res.status === 200) {
            return res.json()
        } else if (res.status === 429) {
            return {
                "message": "API 此时间段调用次数频繁，请稍后再试。或当天已用完，请使用新账号更换OPENROUTER_API_KEY"
            }
        } else {
            throw new Error('Fetch failed with status ' + res.status);
        }
    })
}


const OPENROUTER_API_KEY = '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';
const SITE_URL = 'https://chat.qwen.ai';
const SITE_NAME = 'Chat AI';
const AI_MODEL = 'qwen/qwen-2-7b-instruct:free'; // free：每分钟将限制为20个请求和每天200个请求