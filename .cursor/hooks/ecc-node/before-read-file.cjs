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

    if (!profileAllows('before-read-file', ['minimal', 'standard', 'strict'])) {
      respond(out);
      return;
    }

    const filePath = extractFilePath(head);
    if (filePath && SENSITIVE.test(filePath)) {
      out.permission = 'deny';
      out.user_message = `Blocked read of sensitive path: ${filePath}. Use environment variables instead of loading secrets into the model.`;
      process.stderr.write(`[ecc] ${out.user_message}\n`);
    }

    respond(out);
  })
  .catch(() => {
    respond({ permission: 'allow' });
  });
