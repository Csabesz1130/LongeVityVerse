import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

export async function createBackup(outputDir: string) {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.resolve(outputDir, `backup-${timestamp}`);
  fs.mkdirSync(dir, { recursive: true });

  for (const c of collections) {
    const data = await db.collection(c.name).find({}).toArray();
    fs.writeFileSync(path.join(dir, `${c.name}.json`), JSON.stringify(data, null, 2), 'utf8');
  }

  return dir;
}

export async function restoreBackup(fileOrDirPath: string) {
  const full = path.resolve(fileOrDirPath);
  const stat = fs.statSync(full);
  const db = mongoose.connection.db;

  if (stat.isDirectory()) {
    const files = fs.readdirSync(full).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const collectionName = path.basename(file, '.json');
      const data = JSON.parse(fs.readFileSync(path.join(full, file), 'utf8'));
      if (data.length > 0) {
        await db.collection(collectionName).deleteMany({});
        await db.collection(collectionName).insertMany(data);
      }
    }
  } else {
    const collectionName = path.basename(full, '.json');
    const data = JSON.parse(fs.readFileSync(full, 'utf8'));
    if (data.length > 0) {
      await db.collection(collectionName).deleteMany({});
      await db.collection(collectionName).insertMany(data);
    }
  }
}


