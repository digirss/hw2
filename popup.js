document.addEventListener('DOMContentLoaded', function() {
    const pickColorBtn = document.getElementById('pickColor');
    const colorDisplay = document.getElementById('colorDisplay');
    const colorInfo = document.getElementById('colorInfo');
    const hexValue = document.getElementById('hexValue');
    const rgbValue = document.getElementById('rgbValue');
    const hslValue = document.getElementById('hslValue');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const status = document.getElementById('status');
    
    let currentColor = null;
    
    // 載入歷史記錄
    loadHistory();
    
    // 顏色選擇器按鈕事件
    pickColorBtn.addEventListener('click', async function() {
        try {
            if (!window.EyeDropper) {
                showStatus('EyeDropper API not supported. Please use Chrome 95+ with HTTPS', 'error');
                return;
            }
            
            pickColorBtn.disabled = true;
            pickColorBtn.textContent = 'Click on any color...';
            showStatus('Click on any color on the screen (ESC to cancel)');
            
            const eyeDropper = new EyeDropper();
            const result = await eyeDropper.open();
            
            if (result && result.sRGBHex) {
                currentColor = result.sRGBHex;
                displayColor(currentColor);
                saveToHistory(currentColor);
                showStatus('Color picked successfully!');
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                showStatus('Color picking cancelled');
            } else {
                console.error('Color picker error:', error);
                showStatus('Error: ' + error.message, 'error');
            }
        } finally {
            pickColorBtn.disabled = false;
            pickColorBtn.textContent = 'Pick Color from Screen';
        }
    });
    
    // 顯示顏色資訊
    function displayColor(hex) {
        colorDisplay.style.backgroundColor = hex;
        colorDisplay.textContent = hex;
        
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        hexValue.textContent = hex;
        rgbValue.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslValue.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        
        colorInfo.style.display = 'block';
    }
    
    // 複製到剪貼簿
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showStatus(`Copied: ${text}`);
        }).catch(err => {
            showStatus('Failed to copy to clipboard', 'error');
        });
    }
    
    // 格式值點擊事件
    hexValue.addEventListener('click', () => copyToClipboard(hexValue.textContent));
    rgbValue.addEventListener('click', () => copyToClipboard(rgbValue.textContent));
    hslValue.addEventListener('click', () => copyToClipboard(hslValue.textContent));
    
    // 保存到歷史記錄
    function saveToHistory(color) {
        chrome.storage.local.get(['colorHistory'], function(result) {
            let history = result.colorHistory || [];
            
            // 移除重複的顏色
            history = history.filter(item => item !== color);
            
            // 添加到開頭
            history.unshift(color);
            
            // 限制歷史記錄數量
            if (history.length > 10) {
                history = history.slice(0, 10);
            }
            
            chrome.storage.local.set({colorHistory: history}, function() {
                loadHistory();
            });
        });
    }
    
    // 載入歷史記錄
    function loadHistory() {
        chrome.storage.local.get(['colorHistory'], function(result) {
            const history = result.colorHistory || [];
            displayHistory(history);
        });
    }
    
    // 顯示歷史記錄
    function displayHistory(history) {
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<div style="text-align: center; color: #999; font-size: 12px;">No colors yet</div>';
            return;
        }
        
        history.forEach(color => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-color" style="background-color: ${color}"></div>
                <div class="history-hex">${color}</div>
            `;
            
            item.addEventListener('click', () => {
                currentColor = color;
                displayColor(color);
                copyToClipboard(color);
            });
            
            historyList.appendChild(item);
        });
    }
    
    // 清除歷史記錄
    clearHistoryBtn.addEventListener('click', function() {
        chrome.storage.local.set({colorHistory: []}, function() {
            loadHistory();
            showStatus('History cleared');
        });
    });
    
    // 顯示狀態訊息
    function showStatus(message, type = 'info') {
        status.textContent = message;
        status.style.color = type === 'error' ? '#f44336' : '#666';
        
        setTimeout(() => {
            status.textContent = '';
        }, 3000);
    }
    
    // 顏色轉換函數
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
});