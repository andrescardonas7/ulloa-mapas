/**
 * Pinned NVIDIA SkillSpector install for hub CI and local deep scan.
 * Bump intentionally after reviewing upstream release notes.
 * @see https://github.com/NVIDIA/SkillSpector
 */

/** @type {`${number}.${number}.${number}`} */
export const SKILLSPECTOR_VERSION = '2.1.3';

/** Full git SHA for reproducible pip installs (matches SKILLSPECTOR_VERSION). */
export const SKILLSPECTOR_GIT_SHA = '1a7bf026a3cf0ecfd957b6c173244d51b3141baf';

/** pip install spec — keep in sync with .github/workflows/hub-skills-audit.yml */
export const SKILLSPECTOR_PIP_SPEC =
  `git+https://github.com/NVIDIA/skillspector.git@${SKILLSPECTOR_GIT_SHA}`;
