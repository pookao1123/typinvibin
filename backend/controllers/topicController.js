import { topics } from '../models/Topic.js';

/**
 * Get all typing topics
 * GET /api/topics
 */
export const getAllTopics = (req, res) => {
  try {
    res.json({
      success: true,
      count: topics.length,
      data: topics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get single topic by ID (0-indexed)
 * GET /api/topics/:id
 */
export const getTopicById = (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Validate ID
    if (isNaN(id) || id < 0 || id >= topics.length) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found',
        message: `Topic ID must be between 0 and ${topics.length - 1}`
      });
    }

    const topic = topics[id];
    res.json({
      success: true,
      id,
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
