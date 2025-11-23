module.exports = (sequelize, DataTypes) => {
    const Log = sequelize.define('Log', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        organisation_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Organisations', key: 'id' } },
        user_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'Users', key: 'id' } },
        action: { type: DataTypes.STRING(255), allowNull: false },
        meta: { type: DataTypes.JSON, allowNull: true }, // MySQL JSON datatype
        timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    }, {
        tableName: 'logs',
        timestamps: false,
    });
    return Log;
};