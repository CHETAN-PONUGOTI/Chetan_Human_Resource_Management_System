module.exports = (sequelize, DataTypes) => {
    const Organisation = sequelize.define('Organisation', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(255), allowNull: false },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    }, {
        tableName: 'organisations',
        timestamps: false,
    });
    return Organisation;
};