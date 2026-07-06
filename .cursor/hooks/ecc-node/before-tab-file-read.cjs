'use strict';

const { profileAllows } = require('./read-stdin.cjs');
const { readStdinHead, extractFilePath } = require('./read-stdin-head.cjs');

const SENSITIVE =
  /\.(env|key|pem)$|\.env\.|(^|[\\/])\.env([\\/]|$)|credentials|id_rsa|\.pem$/i;

function respond(out) {
  process.stdout.write(JSON.stringify(out));
}

readStdinHead()
  .then((head) => {
    const out = { permission: 'allow' };

    if (!profileAllows('before-tab-file-read', ['standard', 'strict'])) {
      respond(out);
      return;
    }

    const filePath = extractFilePath(head);
    if (filePath && SENSITIVE.test(filePath)) {
      out.permission = 'deny';
      out.user_message = `Tab read blocked for sensitive path: ${filePath}`;
      process.stderr.write(`[ecc] ${out.user_message}\n`);
    }

    respond(out);
  })
  .catch(() => {
    respond({ permission: 'allow' });
  });
