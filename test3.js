async function fetchWalletAndExtract() {
    try {
        // 第一步：获取 /wallet
        const walletResponse = await fetch('/wallet', {
            method: 'GET',
            headers: {
                'Cache-Control': 'max-age=0',
                'Sec-Ch-Ua': '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Priority': 'u=0, i'
            },
            credentials: 'include'
        });

        const walletHtml = await walletResponse.text();
        
        // 提取所有 href="/transfers/xxxxx"
        const transferPattern = /href="(\/transfers\/\d+)"/g;
        const transferMatches = [...walletHtml.matchAll(transferPattern)];
        const transferUrls = [...new Set(transferMatches.map(match => match[1]))];

        const allProfileUrls = new Set();

        // 第二步：遍历每个 transfer URL
        for (const transferUrl of transferUrls) {
            try {
                const transferResponse = await fetch(transferUrl, {
                    method: 'GET',
                    headers: {
                        'Sec-Ch-Ua-Platform': '"Windows"',
                        'X-Sec-Purpose': 'prefetch',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
                        'Accept': 'text/html, application/xhtml+xml',
                        'Sec-Ch-Ua': '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
                        'X-Turbo-Request-Id': generateUUID(),
                        'Sec-Ch-Ua-Mobile': '?0',
                        'Sec-Fetch-Site': 'same-origin',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Dest': 'empty',
                        'Referer': 'https://app.saltlabs.com/wallet',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'zh-CN,zh;q=0.9',
                        'Priority': 'i'
                    },
                    credentials: 'include'
                });

                const transferHtml = await transferResponse.text();
                
                // 提取所有 /profiles/xxxxx
                const profilePattern = /\/profiles\/[a-zA-Z0-9_-]+/g;
                const profileMatches = transferHtml.match(profilePattern);
                
                if (profileMatches) {
                    profileMatches.forEach(url => allProfileUrls.add(url));
                }

            } catch (error) {
                // 静默处理错误
            }
        }

        // 去重后的结果
        const uniqueProfiles = [...allProfileUrls];
        
        // 只用 alert 显示结果
        const alertMessage = `Transfer URLs (${transferUrls.length}):\n${transferUrls.join('\n')}\n\nProfile URLs (${uniqueProfiles.length}):\n${uniqueProfiles.join('\n')}`;
        alert(alertMessage);

    } catch (error) {
        alert('执行出错: ' + error.message);
    }
}

// 生成 UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 执行函数
fetchWalletAndExtract();
