const db = require('../../db');
const { Log } = db;

/**
 * Creates an audit log entry.
 * @param {number} orgId - Organisation ID.
 * @param {number} userId - User ID performing the action.
 * @param {string} action - Descriptive action string.
 * @param {object} meta - Metadata object for JSONB column.
 */
const createLog = async (orgId, userId, action, meta) => {
    try {
        await Log.create({ 
            organisation_id: orgId, 
            user_id: userId, 
            action, 
            meta: JSON.stringify(meta) 
        });
    } catch (error) {
        console.error("Failed to create log entry:", error);
    }
};

module.exports = { createLog };