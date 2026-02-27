import phase1Data from './phase1';
import phase1bData from './phase1b';
import phase2Data from './phase2';
import phase2bData from './phase2b';
import phase3Data from './phase3';
import phase4Data from './phase4';
import phase5Data from './phase5';

import tsPhase1 from './ts-phase1';
import tsPhase2 from './ts-phase2';
import tsPhase3 from './ts-phase3';
import tsPhase4 from './ts-phase4';

import dsaPhase1Data from './dsa-phase1';
import dsaPhase1bData from './dsa-phase1b';
import dsaPhase2Data from './dsa-phase2';
import dsaPhase2bData from './dsa-phase2b';
import dsaPhase3Data from './dsa-phase3';
import dsaPhase3bData from './dsa-phase3b';
import dsaPhase4Data from './dsa-phase4';
import dsaPhase4bData from './dsa-phase4b';
import dsaPhase5Data from './dsa-phase5';

// Combine phase1 + phase1b topics
const phase1 = {
  ...phase1Data,
  topics: [...phase1Data.topics, ...phase1bData]
};

// Combine phase2 + phase2b topics
const phase2 = {
  ...phase2Data,
  topics: [...phase2Data.topics, ...phase2bData]
};

const phase3 = phase3Data;
const phase4 = phase4Data;
const phase5 = phase5Data;

// Combine DSA phase1 + phase1b topics
const dsaPhase1 = {
  ...dsaPhase1Data,
  topics: [...dsaPhase1Data.topics, ...dsaPhase1bData]
};

// Combine DSA phase2 + phase2b topics
const dsaPhase2 = {
  ...dsaPhase2Data,
  topics: [...dsaPhase2Data.topics, ...dsaPhase2bData]
};

// Combine DSA phase3 + phase3b topics
const dsaPhase3 = {
  ...dsaPhase3Data,
  topics: [...dsaPhase3Data.topics, ...dsaPhase3bData]
};

// Combine DSA phase4 + phase4b topics
const dsaPhase4 = {
  ...dsaPhase4Data,
  topics: [...dsaPhase4Data.topics, ...dsaPhase4bData]
};

const dsaPhase5 = dsaPhase5Data;

// JavaScript roadmap phases
export const javascriptPhases = [phase1, phase2, phase3, phase4, phase5];

// TypeScript roadmap phases
export const typescriptPhases = [tsPhase1, tsPhase2, tsPhase3, tsPhase4];

// DSA roadmap phases
export const dsaPhases = [dsaPhase1, dsaPhase2, dsaPhase3, dsaPhase4, dsaPhase5];

// Registry of all roadmap data keyed by slug
const roadmapData = {
  javascript: javascriptPhases,
  typescript: typescriptPhases,
  dsa: dsaPhases,
};

export function getRoadmapPhases(slug) {
  return roadmapData[slug] || null;
}

export function getPhaseById(slug, phaseId) {
  const phases = getRoadmapPhases(slug);
  return phases?.find((p) => p.id === phaseId) || null;
}

export function getTopicById(slug, phaseId, topicId) {
  const phase = getPhaseById(slug, phaseId);
  return phase?.topics.find((t) => t.id === topicId) || null;
}

// Legacy exports for backward compat
export const phases = javascriptPhases;
export default phases;

