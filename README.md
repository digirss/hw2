# Chrome Color Picker Extension

A simple and intuitive color picker extension for Chrome that allows you to pick colors from anywhere on your screen.

## Features

- 🎨 **Screen Color Picking**: Use the EyeDropper API to pick colors from any part of your screen
- 📋 **Multiple Formats**: View colors in HEX, RGB, and HSL formats
- 📱 **One-Click Copy**: Click any color format to copy it to your clipboard
- 📚 **Color History**: Automatically saves your last 10 picked colors
- 🔄 **Quick Reuse**: Click on any color in history to reselect it

## Installation

### From Source
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The Color Picker icon will appear in your toolbar

## Usage

1. Click the Color Picker icon in your Chrome toolbar
2. Click "Pick Color from Screen" button
3. Click anywhere on your screen to pick a color
4. The color will be displayed with HEX, RGB, and HSL values
5. Click any format value to copy it to your clipboard
6. Access your color history in the bottom panel

## Requirements

- Chrome 95+ (for EyeDropper API support)
- HTTPS websites recommended for best performance

## Browser Support

This extension uses the modern EyeDropper API which is supported in:
- Chrome 95+
- Edge 95+

## Files Structure

```
├── manifest.json       # Extension configuration
├── popup.html         # Main interface
├── popup.js           # Core functionality
├── content.js         # Web page interaction
├── icon16.png         # 16x16 icon
├── icon48.png         # 48x48 icon
├── icon128.png        # 128x128 icon
└── README.md          # This file
```

## Permissions

- `activeTab`: Access current tab for color picking
- `scripting`: Inject scripts for enhanced functionality
- `storage`: Save color history locally

## Development

To modify or extend this extension:

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Color Picker extension
4. Test your changes

## License

MIT License - feel free to use, modify, and distribute.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.