import phase1Data from './phase1';
import phase1bData from './phase1b';
import phase2Data from './phase2';
import phase2bData from './phase2b';
import phase3Data from './phase3';
import phase4Data from './phase4';
import phase5Data from './phase5';

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

// JavaScript roadmap phases
export const javascriptPhases = [phase1, phase2, phase3, phase4, phase5];

// Registry of all roadmap data keyed by slug
const roadmapData = {
  javascript: javascriptPhases,
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
