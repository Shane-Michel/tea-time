import esther from './esther.json'
import fasting from './fasting.json'
import matthew from './matthew.json'

/** @type {import('../models').StudyPlan[]} */
export const studyPlans = [matthew, esther, fasting]

export const getStudyPlan = (id) => studyPlans.find((plan) => plan.id === id)
