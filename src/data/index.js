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

import androidPhase1Data from './android-phase1';
import androidPhase2Data from './android-phase2';
import androidPhase2bData from './android-phase2b';
import androidPhase3Data from './android-phase3';
import androidPhase4Data from './android-phase4';
import androidPhase5Data from './android-phase5';
import androidPhase6Data from './android-phase6';
import androidPhase7Data from './android-phase7';
import androidPhase8Data from './android-phase8';
import androidPhase9Data from './android-phase9';
import androidPhase10Data from './android-phase10';
import androidPhase11Data from './android-phase11';
import androidPhase12Data from './android-phase12';

import rnPhase1 from './rn-phase1';
import rnPhase2 from './rn-phase2';
import rnPhase3 from './rn-phase3';
import rnPhase4 from './rn-phase4';
import rnPhase5 from './rn-phase5';
import rnPhase6 from './rn-phase6';
import rnPhase7 from './rn-phase7';
import rnPhase8 from './rn-phase8';
import rnPhase9 from './rn-phase9';
import rnPhase10 from './rn-phase10';
import rnPhase11 from './rn-phase11';
import rnPhase12 from './rn-phase12';
import rnPhase13 from './rn-phase13';
import rnPhase14 from './rn-phase14';
import rnPhase15 from './rn-phase15';

import sfPhase1Data from './sf-phase1';
import sfPhase2Data from './sf-phase2';
import sfPhase3Data from './sf-phase3';
import sfPhase3bData from './sf-phase3b';
import sfPhase4Data from './sf-phase4';
import sfPhase5Data from './sf-phase5';
import sfPhase6Data from './sf-phase6';
import sfPhase7Data from './sf-phase7';
import sfPhase8Data from './sf-phase8';
import sfPhase9Data from './sf-phase9';
import sfPhase10Data from './sf-phase10';
import sfPhase11Data from './sf-phase11';
import sfPhase12Data from './sf-phase12';
import sfPhase13Data from './sf-phase13';
import sfPhase14Data from './sf-phase14';

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

// Combine Android phase2 + phase2b topics
const androidPhase2 = {
  ...androidPhase2Data,
  topics: [...androidPhase2Data.topics, ...androidPhase2bData]
};

// JavaScript roadmap phases
export const javascriptPhases = [phase1, phase2, phase3, phase4, phase5];

// TypeScript roadmap phases
export const typescriptPhases = [tsPhase1, tsPhase2, tsPhase3, tsPhase4];

// DSA roadmap phases
export const dsaPhases = [dsaPhase1, dsaPhase2, dsaPhase3, dsaPhase4, dsaPhase5];

// Android roadmap phases
export const androidPhases = [
  androidPhase1Data, androidPhase2, androidPhase3Data, androidPhase4Data,
  androidPhase5Data, androidPhase6Data, androidPhase7Data, androidPhase8Data,
  androidPhase9Data, androidPhase10Data, androidPhase11Data, androidPhase12Data,
];

// React Native roadmap phases
export const reactnativePhases = [
  rnPhase1, rnPhase2, rnPhase3, rnPhase4, rnPhase5,
  rnPhase6, rnPhase7, rnPhase8, rnPhase9, rnPhase10,
  rnPhase11, rnPhase12, rnPhase13, rnPhase14, rnPhase15,
];

// Combine Salesforce phase3 + phase3b topics
const sfPhase3 = {
  ...sfPhase3Data,
  topics: [...sfPhase3Data.topics, ...sfPhase3bData]
};

// Salesforce Developer roadmap phases
export const salesforcePhases = [
  sfPhase1Data, sfPhase2Data, sfPhase3, sfPhase4Data, sfPhase5Data,
  sfPhase6Data, sfPhase7Data, sfPhase8Data, sfPhase9Data, sfPhase10Data,
  sfPhase11Data, sfPhase12Data, sfPhase13Data, sfPhase14Data,
];

// Registry of all roadmap data keyed by slug
const roadmapData = {
  javascript: javascriptPhases,
  typescript: typescriptPhases,
  dsa: dsaPhases,
  'android-senior': androidPhases,
  'react-native-senior': reactnativePhases,
  'salesforce-developer': salesforcePhases,
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

