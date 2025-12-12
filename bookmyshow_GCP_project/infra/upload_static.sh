#!/bin/bash
# Upload static frontend assets to GCS and set cache-control metadata
BUCKET=gs://YOUR_BUCKET_NAME
gsutil -m cp -r user_code/frontend/* ${BUCKET}/
# Example: set long cache for fingerprinted assets
# gsutil -h "Cache-Control:public, max-age=31536000, immutable" cp app.abc123.js ${BUCKET}/
