import type { UploadApiResponse } from 'cloudinary';
import { onRequest } from 'firebase-functions/v2/https';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from './helpers/db';

const dateFields = ['created_at', 'uploaded_at'];
const convertDates = (key: string, date?: string) =>
  date
    ? {
      [key]: Timestamp.fromDate(new Date(date)),
    }
    : {};

export const cloudinaryWebhooks = onRequest(async (req, res) => {
  const data: UploadApiResponse = JSON.parse(
    req.rawBody.toString() || `${req.rawBody}`,
  );
  if (data.type === 'upload') {
    const media = {
      ...data,
      ...dateFields.reduce(
        (acc, key) => ({
          ...acc,
          ...convertDates(key, data[key]),
        }),
        {},
      ),
    };
    await db.collection('media').add(media);
  }
  res.send('Done');
});
