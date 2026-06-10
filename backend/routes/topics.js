import express from 'express';
import { getAllTopics, getTopicById } from '../controllers/topicController.js';

const router = express.Router();

// GET all topics
router.get('/', getAllTopics);

// GET single topic by ID
router.get('/:id', getTopicById);

export default router;
