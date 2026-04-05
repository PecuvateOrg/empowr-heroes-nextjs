// Central source of truth for all badge image URLs.
// Images are served from S3. To update a badge, upload the new PNG to S3
// and update the URL here — changes will apply everywhere automatically.

const BADGES = {
  seed:      'https://empowr-cic.s3.us-east-1.amazonaws.com/badges/seed-hero.png',
  momentum:  'https://empowr-cic.s3.us-east-1.amazonaws.com/badges/momentum-hero.png',
  community: 'https://empowr-cic.s3.us-east-1.amazonaws.com/badges/community-hero.png',
  champion:  'https://empowr-cic.s3.us-east-1.amazonaws.com/badges/champion-hero.png',
  legacy:    'https://empowr-cic.s3.us-east-1.amazonaws.com/badges/legacy-hero.png',
}

module.exports = { BADGES }
