// Content script for Color Picker Extension
// This script runs on all web pages and helps with color picking functionality

(function() {
    'use strict';
    
    // 避免重複注入
    if (window.colorPickerContentScript) {
        return;
    }
    window.colorPickerContentScript = true;
    
    // 創建顏色選擇器覆蓋層
    let colorPickerOverlay = null;
    let isPickingColor = false;
    
    // 監聽來自 popup 的訊息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'startColorPicking') {
            startColorPicking();
            sendResponse({success: true});
        } else if (request.action === 'stopColorPicking') {
            stopColorPicking();
            sendResponse({success: true});
        }
    });
    
    // 開始顏色選擇
    function startColorPicking() {
        if (isPickingColor) return;
        
        isPickingColor = true;
        document.body.style.cursor = 'crosshair';
        
        // 創建覆蓋層
        createOverlay();
        
        // 添加事件監聽器
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyDown);
    }
    
    // 停止顏色選擇
    function stopColorPicking() {
        if (!isPickingColor) return;
        
        isPickingColor = false;
        document.body.style.cursor = '';
        
        // 移除覆蓋層
        removeOverlay();
        
        // 移除事件監聽器
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleKeyDown);
    }
    
    // 創建覆蓋層
    function createOverlay() {
        if (colorPickerOverlay) return;
        
        colorPickerOverlay = document.createElement('div');
        colorPickerOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999999;
            pointer-events: none;
            background: rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(colorPickerOverlay);
    }
    
    // 移除覆蓋層
    function removeOverlay() {
        if (colorPickerOverlay) {
            colorPickerOverlay.remove();
            colorPickerOverlay = null;
        }
    }
    
    // 處理滑鼠移動
    function handleMouseMove(event) {
        if (!isPickingColor) return;
        
        // 更新游標樣式
        document.body.style.cursor = 'crosshair';
        
        // 可以在這裡添加顏色預覽功能
        updateColorPreview(event);
    }
    
    // 處理點擊事件
    function handleClick(event) {
        if (!isPickingColor) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        // 獲取點擊位置的顏色
        const color = getColorAtPosition(event.clientX, event.clientY);
        
        if (color) {
            // 發送顏色到 popup
            chrome.runtime.sendMessage({
                action: 'colorPicked',
                color: color
            });
        }
        
        stopColorPicking();
    }
    
    // 處理鍵盤事件
    function handleKeyDown(event) {
        if (!isPickingColor) return;
        
        // ESC 鍵取消顏色選擇
        if (event.key === 'Escape') {
            event.preventDefault();
            stopColorPicking();
            
            chrome.runtime.sendMessage({
                action: 'colorPickingCancelled'
            });
        }
    }
    
    // 更新顏色預覽
    function updateColorPreview(event) {
        // 這個功能可以用來顯示即時的顏色預覽
        // 目前先保留空白，可以後續擴展
    }
    
    // 獲取指定位置的顏色
    function getColorAtPosition(x, y) {
        try {
            // 暫時隱藏覆蓋層以獲取正確的元素
            if (colorPickerOverlay) {
                colorPickerOverlay.style.display = 'none';
            }
            
            const element = document.elementFromPoint(x, y);
            
            // 恢復覆蓋層
            if (colorPickerOverlay) {
                colorPickerOverlay.style.display = 'block';
            }
            
            if (!element) return null;
            
            // 獲取元素的計算樣式
            const style = window.getComputedStyle(element);
            let color = style.backgroundColor;
            
            // 如果背景色是透明的，嘗試獲取文字顏色
            if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
                color = style.color;
            }
            
            // 轉換為 HEX 格式
            return rgbToHex(color);
            
        } catch (error) {
            console.error('Error getting color at position:', error);
            return null;
        }
    }
    
    // RGB 轉 HEX
    function rgbToHex(rgb) {
        if (!rgb) return null;
        
        // 處理 rgb(r, g, b) 格式
        const rgbMatch = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        
        // 處理 rgba(r, g, b, a) 格式
        const rgbaMatch = rgb.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
        if (rgbaMatch) {
            const r = parseInt(rgbaMatch[1]);
            const g = parseInt(rgbaMatch[2]);
            const b = parseInt(rgbaMatch[3]);
            
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        
        // 如果已經是 HEX 格式
        if (rgb.startsWith('#')) {
            return rgb;
        }
        
        return null;
    }
    
    // 檢查是否支援 EyeDropper API
    function checkEyeDropperSupport() {
        return typeof window.EyeDropper !== 'undefined';
    }
    
    // 向 popup 發送支援狀態
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'checkEyeDropperSupport') {
            sendResponse({
                supported: checkEyeDropperSupport()
            });
        }
    });
    
})();