const sharp = require('sharp');
const TextToSVG = require('text-to-svg');
const path = require("path");

class ImageProcess {
    constructor() {}

    async addName(studentName, imagePath, location, textSize, textTransform) {
        if (!location || typeof location.x !== 'number' || typeof location.y !== 'number') {
            throw new Error('Invalid location coordinates');
        }
        if (!studentName || typeof studentName !== 'string') {
            throw new Error('Invalid student name');
        }
        if (!imagePath || typeof imagePath !== 'string') {
            throw new Error('Invalid image path');
        }

        switch (textTransform) {
            case 'uppercase':
                studentName = studentName.toUpperCase();
                break;
            case 'lowercase':
                studentName = studentName.toLowerCase();
                break;
            case 'capitalize':
                studentName = studentName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                break;
            default:
                studentName = studentName;
        }

        const fontFile = path.resolve('admin_panel_with_server','../resources/fonts/font-regular.ttf');
        const textToSvg = TextToSVG.loadSync(fontFile);
        const metrics = textToSvg.getMetrics(studentName, { fontSize: textSize });
        const textWidth = metrics.width;
        console.log(textWidth);

        const image = sharp(imagePath);

        const svgText = textToSvg.getSVG(studentName, {
            x: 0,
            y: 0,
            fontSize: textSize,
            anchor: 'top',
            attributes: { fill: 'black' }
        });

        const imageBuffer = await image
                                    .composite([{ input: Buffer.from(svgText), top: parseInt(location.y) + 8, left: parseInt(location.x - (textWidth/2)) }])
                                    .toBuffer();

        return imageBuffer;
    }
}

module.exports = ImageProcess;
