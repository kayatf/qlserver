const createHttpError = require('http-errors');
const { fromBuffer } = require('file-type');
const { POST_MAX_SIZE, PRINTER, LABEL_DIMENSIONS } = require('./env');
const { parse } = require('content-type');
const { exec } = require('child_process');
const tempWrite = require('temp-write');
const getRawBody = require('raw-body');
const { Router } = require('express');
const AdmZip = require('adm-zip');
const sharp = require('sharp');

const BASE_COMMAND = `brother_ql --backend pyusb --model ${PRINTER}`;

// reference: https://pypi.org/project/brother-ql/
const LABELS = {
    '17x54': [165, 566],
    '17x87': [165, 956],
    '23x23': [202, 202],
    '29x42': [306, 425],
    '29x90': [306, 991],
    '39x90': [314, 991],
    '52x29': [578, 271],
    '62x29': [696, 271],
    '62x100': [696, 1109],
    '102x51': [1164, 526],
    '102x152': [1164, 1660]
}

const router = Router({
    caseSensitive: true,
    strict: true
});

const bodyParser = (request, _response, next) => getRawBody(request, {
    length: request.headers['content-length'],
    encoding: parse(request).parameters.charset,
    limit: `${POST_MAX_SIZE}mb`
}, (error, buffer) => {
    if (error)
        return next(createHttpError(400, error));
    request.buffer = buffer;
    next();
});

const discoverPrinter = () => new Promise((resolve, reject) => exec(`${BASE_COMMAND} discover`, (error, stdout, stderr) => {
    if (error)
        reject(error);
    else if (stderr.length !== 0) {
        reject(new Error(stderr));
    } else {
        let address = stdout.split('\n').pop();
        if (address.includes('_'))
            address = address.split('_')[0];
        if (!address.startsWith('usb://'))
            reject(new Error('Could not find attached printer.'));
        else
            resolve(address);
    }
}));

const unzipImages = (zipFile) => new Promise(resolve => {
    const images = [];
    const entries = new AdmZip(zipFile).getEntries();
    entries.forEach((entry, index) => entry.getDataAsync(async buffer => {
        const type = await fromBuffer(buffer);
        if (type.mime === 'image/png')
            images.push(buffer);
        if (index === entries.length - 1)
            resolve(images);
    }));
});

const printImages = (images) => new Promise((resolve, reject) =>
    images.forEach(async buffer => {
        // todo make configurable
        const image = await tempWrite(await sharp(buffer).extract({
            width: 367,
            height: 136,
            left: 0,
            top: 0
        }).resize({
            fit: 'fill',
            height: LABELS[LABEL_DIMENSIONS][0],
            width: LABELS[LABEL_DIMENSIONS][1]
        }).toBuffer());
        const command = `${BASE_COMMAND} --printer usb://... print --label ${LABEL_DIMENSIONS} ${image}`;
    }));

router.all('/label', bodyParser, async (request, response, next) => {
    if (request.method !== 'POST')
        return next(createHttpError(405));
    const type = await fromBuffer(request.buffer);
    if (!type)
        return next(createHttpError(400, 'Missing request body (binary).'));
    switch (type.mime) {
        case 'application/zip':
            //await printImages(await unzipImages(request.buffer));
            //response.sendStatus(200);
            try {
                response.json(await discoverPrinter());
            } catch (error) {
                next(createHttpError(500, error.message));
            }
            break;
        case 'image/png':
            await printImages([request.buffer]);
            response.json({});
            break;
        default:
            return next(createHttpError(400, `Unsupported file enconding (${type.mime}).`));
    }
});

module.exports = router;