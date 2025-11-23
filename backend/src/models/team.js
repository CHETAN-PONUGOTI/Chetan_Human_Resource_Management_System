module.exports = (sequelize, DataTypes) => {
    const Team = sequelize.define('Team', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        organisation_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Organisations', key: 'id' } },
        name: { type: DataTypes.STRING(255), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    }, {
        tableName: 'teams',
        timestamps: false,
    });
    return Team;
};