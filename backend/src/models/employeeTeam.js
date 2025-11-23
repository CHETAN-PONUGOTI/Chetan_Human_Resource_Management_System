module.exports = (sequelize, DataTypes) => {
    const EmployeeTeam = sequelize.define('EmployeeTeam', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        employee_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Employees', key: 'id' } },
        team_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Teams', key: 'id' } },
        assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    }, {
        tableName: 'employee_teams',
        timestamps: false,
        indexes: [
            { unique: true, fields: ['employee_id', 'team_id'] } // Prevent duplicate assignments
        ]
    });
    return EmployeeTeam;
};