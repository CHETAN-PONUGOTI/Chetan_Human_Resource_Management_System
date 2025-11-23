module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        organisation_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Organisations', key: 'id' } },
        email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        password_hash: { type: DataTypes.STRING(255), allowNull: false },
        name: { type: DataTypes.STRING(255), allowNull: true },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    }, {
        tableName: 'users',
        timestamps: false,
    });
    return User;
};