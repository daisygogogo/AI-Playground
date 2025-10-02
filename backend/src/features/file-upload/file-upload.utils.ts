import { extname } from 'path';
import { Request } from 'express';

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  return cb(new Error('Only image files are allowed!'), false);
};

/**
 * get full URL
 * @param req Express Request
 * @param relativePath （eg. storage/xxx.png）
 */
export function getFullUrl(req: Request, relativePath: string): string {
  const host = req.protocol + '://' + req.get('host');
  const relPath = relativePath.replace(/\\/g, '/');
  return `${host}/${relPath}`;
}
