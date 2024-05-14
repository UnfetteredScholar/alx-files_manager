import mongoDBCore from 'mongodb/lib/core';
import { tmpdir } from 'os';
import { join as joinPath } from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
// import {
//   mkdir, writeFile, stat, existsSync, realpath,
// } from 'fs';
import {
  mkdir, writeFile, realpath,
} from 'fs';
import dbClient from '../utils/db';

const DEFAULT_ROOT_FOLDER = 'files_manager';
const ROOT_FOLDER_ID = 0;
const acceptedTypes = { folder: 'folder', file: 'file', image: 'image' };
const VALID_FILE_TYPES = acceptedTypes;
const mkDirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);
// const statAsync = promisify(stat);
const realpathAsync = promisify(realpath);
const NULL_ID = Buffer.alloc(24, '0').toString('utf-8');
const isValidId = (id) => {
  const size = 24;
  let i = 0;
  const charRanges = [
    [48, 57], // 0 - 9
    [97, 102], // a - f
    [65, 70], // A - F
  ];
  if (typeof id !== 'string' || id.length !== size) {
    return false;
  }
  while (i < size) {
    const c = id[i];
    const code = c.charCodeAt(0);

    if (!charRanges.some((range) => code >= range[0] && code <= range[1])) {
      return false;
    }
    i += 1;
  }
  return true;
};

class FilesController {
  // static async postUpload(request, response) {
  //   const { user } = request;

  //   const name = request.body ? request.body.name : null;
  //   const type = request.body ? request.body.type : null;
  //   const parentId = request.body && request.body.parentId ? request.body.parentId : ROOT_FOLDER_ID;
  //   const isPublic = request.body && request.body.isPublic ? request.body.isPublic : false;
  //   const base64Data = request.body && request.body.data ? request.body.data : '';

  //   if (!name) {
  //     response.status(400).json({ error: 'Missing name' });
  //     return;
  //   }

  //   if (!type || !Object.values(acceptedTypes).includes(type)) {
  //     response.status(400).json({ error: 'Missing type' });
  //     return;
  //   }

  //   if (!request.body.data && type !== acceptedTypes.folder) {
  //     response.status(400).json({ error: 'Missing data' });
  //     return;
  //   }

  //   if ((parentId !== ROOT_FOLDER_ID) && (parentId !== ROOT_FOLDER_ID.toString())) {
  //     const file = await (await dbClient.filesCollection())
  //       .findOne({
  //         _id: new mongoDBCore.BSON.ObjectId(isValidId(parentId) ? parentId : NULL_ID),
  //       });

  //     if (!file) {
  //       response.status(400).json({ error: 'Parent not found' });
  //       return;
  //     }

  //     if (file.type !== acceptedTypes.folder) {
  //       response.status(400).json({ error: 'Parent is not a folder' });
  //     }
  //   }

  //   const userId = user._id.toString();
  //   const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0
  //     ? process.env.FOLDER_PATH.trim()
  //     : joinPath(tmpdir(), DEFAULT_ROOT_FOLDER);

  //   const newFile = {
  //     userId: new mongoDBCore.BSON.ObjectId(userId),
  //     name,
  //     type,
  //     isPublic,
  //     parentId: (parentId === ROOT_FOLDER_ID) || (parentId === ROOT_FOLDER_ID.toString())
  //       ? '0'
  //       : new mongoDBCore.BSON.ObjectId(parentId),
  //   };

  //   await mkDirAsync(baseDir, { recursive: true });
  //   if (type !== acceptedTypes.folder) {
  //     const localPath = joinPath(baseDir, uuidv4());
  //     await writeFileAsync(localPath, Buffer.from(base64Data, 'base64'));
  //     newFile.localPath = await realpathAsync(localPath);
  //   }

  //   const insertionInfo = await (await dbClient.filesCollection())
  //     .insertOne(newFile);
  //   const fileId = insertionInfo.insertedId.toString();

  //   response.status(201).json({
  //     id: fileId,
  //     userId,
  //     name,
  //     type,
  //     isPublic,
  //     parentId: (parentId === ROOT_FOLDER_ID) || (parentId === ROOT_FOLDER_ID.toString())
  //       ? 0
  //       : parentId,
  //   });
  // }
  static async postUpload(req, res) {
    const { user } = req;
    const name = req.body ? req.body.name : null;
    const type = req.body ? req.body.type : null;
    const parentId = req.body && req.body.parentId ? req.body.parentId : ROOT_FOLDER_ID;
    const isPublic = req.body && req.body.isPublic ? req.body.isPublic : false;
    const base64Data = req.body && req.body.data ? req.body.data : '';

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }
    if (!type || !Object.values(VALID_FILE_TYPES).includes(type)) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }
    if (!req.body.data && type !== VALID_FILE_TYPES.folder) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }
    if ((parentId !== ROOT_FOLDER_ID) && (parentId !== ROOT_FOLDER_ID.toString())) {
      const file = await (await dbClient.filesCollection())
        .findOne({
          _id: new mongoDBCore.BSON.ObjectId(isValidId(parentId) ? parentId : NULL_ID),
        });

      if (!file) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (file.type !== VALID_FILE_TYPES.folder) {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }
    const userId = user._id.toString();
    const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0
      ? process.env.FOLDER_PATH.trim()
      : joinPath(tmpdir(), DEFAULT_ROOT_FOLDER);
    // default baseDir == '/tmp/files_manager'
    // or (on Windows) '%USERPROFILE%/AppData/Local/Temp/files_manager';
    const newFile = {
      userId: new mongoDBCore.BSON.ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: (parentId === ROOT_FOLDER_ID) || (parentId === ROOT_FOLDER_ID.toString())
        ? '0'
        : new mongoDBCore.BSON.ObjectId(parentId),
    };
    await mkDirAsync(baseDir, { recursive: true });
    if (type !== VALID_FILE_TYPES.folder) {
      const localPath = joinPath(baseDir, uuidv4());
      await writeFileAsync(localPath, Buffer.from(base64Data, 'base64'));
      newFile.localPath = realpathAsync(localPath);
    }
    const insertionInfo = await (await dbClient.filesCollection())
      .insertOne(newFile);
    const fileId = insertionInfo.insertedId.toString();
    // start thumbnail generation worker
    // if (type === VALID_FILE_TYPES.image) {
    //   const jobName = `Image thumbnail [${userId}-${fileId}]`;
    //   fileQueue.add({ userId, fileId, name: jobName });
    // }
    res.status(201).json({
      id: fileId,
      userId,
      name,
      type,
      isPublic,
      parentId: (parentId === ROOT_FOLDER_ID) || (parentId === ROOT_FOLDER_ID.toString())
        ? 0
        : parentId,
    });
  }
}

module.exports = FilesController;
