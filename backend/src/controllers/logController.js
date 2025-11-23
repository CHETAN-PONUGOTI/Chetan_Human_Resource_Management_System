const db = require('../db');
const { Log, User } = db;

exports.listLogs = async (req, res) => {
    const orgId = req.user.orgId;
    
    const limit = parseInt(req.query.limit) || 100;

    try {
        const logs = await Log.findAll({ 
            where: { organisation_id: orgId },
            include: [{ model: User, attributes: ['email', 'name'] }],
            order: [['timestamp', 'DESC']],
            limit: limit
        });

        const safeLogs = logs.map(log => {
            const logData = log.toJSON();
            try {
                if (logData.meta && typeof logData.meta === 'string') {
                    logData.meta = JSON.parse(logData.meta);
                }
            } catch (e) {
                logData.meta = { error: "Failed to parse metadata" };
            }
            return logData;
        });

        return res.status(200).json(safeLogs);
    } catch (error) {
        console.error('Error listing logs:', error);
        return res.status(500).json({ message: 'Server error listing logs.' });
    }
};