const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        authPlugins: {
            mysql_native_password: () => Buffer.from(process.env.DB_PASS || '')
        }
    },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Organisation = require('./models/organisation')(sequelize, DataTypes);
db.User = require('./models/user')(sequelize, DataTypes);
db.Employee = require('./models/employee')(sequelize, DataTypes);
db.Team = require('./models/team')(sequelize, DataTypes);
db.EmployeeTeam = require('./models/employeeTeam')(sequelize, DataTypes);
db.Log = require('./models/log')(sequelize, DataTypes);

db.Organisation.hasMany(db.User, { foreignKey: 'organisation_id' });
db.User.belongsTo(db.Organisation, { foreignKey: 'organisation_id' });

db.Organisation.hasMany(db.Employee, { foreignKey: 'organisation_id' });
db.Employee.belongsTo(db.Organisation, { foreignKey: 'organisation_id' });

db.Organisation.hasMany(db.Team, { foreignKey: 'organisation_id' });
db.Team.belongsTo(db.Organisation, { foreignKey: 'organisation_id' });

db.Organisation.hasMany(db.Log, { foreignKey: 'organisation_id' });
db.Log.belongsTo(db.Organisation, { foreignKey: 'organisation_id' });
db.Log.belongsTo(db.User, { foreignKey: 'user_id' }); 

db.Employee.belongsToMany(db.Team, { through: db.EmployeeTeam, foreignKey: 'employee_id', as: 'Teams' });
db.Team.belongsToMany(db.Employee, { through: db.EmployeeTeam, foreignKey: 'team_id', as: 'Employees' });

db.EmployeeTeam.belongsTo(db.Employee, { foreignKey: 'employee_id' });
db.EmployeeTeam.belongsTo(db.Team, { foreignKey: 'team_id' });

db.sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced successfully.');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

module.exports = db;